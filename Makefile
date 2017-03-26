.PHONY: deploy-stack build dist
.DEFAULT_GOAL := help

############## Vars that can be edited ##############
NODE_IMAGE          ?= node:6
DOCKER_SYNC_VERSION ?= 0.0.2


############## Vars that shouldn't be edited ##############
NODE_MODULES           ?= "./node_modules"
NODE_MODULES_BIN       ?= "${NODE_MODULES}/.bin"
MAKE_COMMAND           ?= help
DOCKER_COMPOSE         ?= export NODE_IMAGE=${NODE_IMAGE} DOCKER_SYNC_VERSION=${DOCKER_SYNC_VERSION}; docker-compose

OS                  := $(shell uname)

RELEASE_VERSION=local_dev

############## HELP ##############

#COLORS
RED    := $(shell tput -Txterm setaf 1)
GREEN  := $(shell tput -Txterm setaf 2)
WHITE  := $(shell tput -Txterm setaf 7)
YELLOW := $(shell tput -Txterm setaf 3)
RESET  := $(shell tput -Txterm sgr0)

# Add the following 'help' target to your Makefile
# And add help text after each target name starting with '\#\#'
# A category can be added with @category
HELP_HELPER = \
    %help; \
    while(<>) { push @{$$help{$$2 // 'options'}}, [$$1, $$3] if /^([a-zA-Z\-\%]+)\s*:.*\#\#(?:@([a-zA-Z\-\%]+))?\s(.*)$$/ }; \
    print "usage: make [target]\n\n"; \
    for (sort keys %help) { \
    print "${WHITE}$$_:${RESET}\n"; \
    for (@{$$help{$$_}}) { \
    $$sep = " " x (32 - length $$_->[0]); \
    print "  ${YELLOW}$$_->[0]${RESET}$$sep${GREEN}$$_->[1]${RESET}\n"; \
    }; \
    print "\n"; }

help: ##prints help
	@perl -e '$(HELP_HELPER)' $(MAKEFILE_LIST)

############## CONTROL ##############

bash: _api-should-be-up ##@control Get a bash in api docker image
	@${DOCKER_COMPOSE} exec api /bin/bash

start-%: ##@control start % container
	@-make revision
	@-make sync-storage
	@${DOCKER_COMPOSE} start $(shell echo $@ | cut -f 2 -d '-')

start: ##@control start all containers
	@-make revision
	@-make sync-storage
	@${DOCKER_COMPOSE} start

restart-%: ##@control restart % container
	@-make revision
	@-make sync-storage
    ifdef QUICK_RESTART
		@${DOCKER_COMPOSE} restart -t 0 $(shell echo $@ | cut -f 2 -d '-')
    else
		@${DOCKER_COMPOSE} restart $(shell echo $@ | cut -f 2 -d '-')
    endif

restart: ##@control restart % container
	@-make revision
	@-make sync-storage
    ifdef QUICK_RESTART
		@${DOCKER_COMPOSE} restart -t 0
    else
		@${DOCKER_COMPOSE} restart
    endif

stop: ##@control stop all containers
	@${DOCKER_COMPOSE} stop

stop-%: ##@control stop % container
	@${DOCKER_COMPOSE} stop $(shell echo $@ | cut -f 2 -d '-')

dev: _api-should-be-up ##@control Start in dev mode. Watch for files changes
	@./bin/modd

log-%: ##@control Get stdout of running server (log-api, log-mocks, log-mysql)
	@${DOCKER_COMPOSE} logs --tail=$${TAIL_LENGTH:-50} -f $(shell echo $@ | cut -f 2 -d '-')

log: ##@control Print stdout of all servers
	@${DOCKER_COMPOSE} logs -f --tail=$${TAIL_LENGTH:-50}

reset: ##@control Clean db, sync storage, sync stack, make install, restart stack (Recommended on branch change)
	@make db-reset
	@-make revision
	@make sync-storage
	@make sync-docker-stack
	@make install
	@make QUICK_RESTART=1 restart

sync-storage: _data-should-be-up ##@control sync docker containers data content with local path
    ifdef NO_DOCKER
    else
		@./bin/unison -auto -batch -silent -prefer . -ignore "Path .git" -ignore "Path .idea" . socket://localhost:9010/
    endif

############## SETUP ##############
install: ##@setup Install node modules
	@make make-in-node MAKE_RULE=_install

_install: ##@setup install node modules
	@echo "${YELLOW}installing node modules${RESET}"
	@npm install --depth 0
	# TOIMPROVE: a second npm install is needed as a workaround for npm screw up. Requires investigation.
	@npm install --depth 0
	@npm update --depth 0
	# TOIMPROVE: npm prune is needed after the install to fix a problem with shrinkwrap
	@npm prune

setup: ##@setup Setup watcher + docker compose + install
	@make download-modd
	@make download-unison

	@${DOCKER_COMPOSE} up -d node data > /dev/null
	@make install

	@echo "${YELLOW}Create docker-compose environment${RESET}"
	@${DOCKER_COMPOSE} up -d > /dev/null

	@${DOCKER_COMPOSE} start
	@${DOCKER_COMPOSE} exec api ./scripts/wait-mysql-up.js
	@make db-migrate

sync-docker-stack: ##@setup Do a docker compose up -d
	@${DOCKER_COMPOSE} up  --remove-orphans -d

clean: ##@setup Remove all components
	@echo "${YELLOW}Stop and remove docker-compose${RESET}"
	@${DOCKER_COMPOSE} stop
	@${DOCKER_COMPOSE} rm -f


############## HELPER ##############
_%-should-be-up: ##@helper make sure % container is up
	@/bin/bash -c ' \
	    CONTAINER=$(shell echo $@ | cut -f 2 -d "_" | cut -f 1 -d "-"); \
	    IS_UP=`${DOCKER_COMPOSE} ps $${CONTAINER} | grep Up`; \
	    if [ -z "$${IS_UP}" ] ; \
	        then echo "${RED}$${CONTAINER} is down. You should start stack through make start${RESET}"; exit -1; \
	    fi \
	'
run-in-%: ##@helper Run a make command in % container
    ifdef NO_DOCKER
		@${COMMAND}
    else
		@-make revision
		@make sync-storage
		@CONTAINER=$(shell echo $@ | cut -f 2 -d '_' | cut -f 3 -d '-'); make _$${CONTAINER}-should-be-up
		@export CONTAINER=$(shell echo $@ | cut -f 2 -d '_' | cut -f 3 -d '-'); \
         ${DOCKER_COMPOSE} exec -T $${CONTAINER} /bin/bash -c "${COMMAND}"
		@make sync-storage
    endif

make-in-%: ##@helper Run a make command in % container
	@CONTAINER=$(shell echo $@ | cut -f 2 -d '_' | cut -f 3 -d '-'); make run-in-$${CONTAINER} COMMAND="${ENV} make ${MAKE_RULE} args='${args}'"

download-modd: ##@helper Download modd watcher
	@mkdir -p ./bin
    ifeq ("$(wildcard ./bin/modd)","")
		@echo "${YELLOW}Downloading modd watcher${RESET}"
        ifeq ($(OS), Darwin)
			@curl -L https://github.com/cortesi/modd/releases/download/v0.4/modd-0.4-osx64.tgz | tar xvf - --strip-components=1 -C ./bin
        endif
        ifeq ($(OS), Linux)
			@curl -L https://github.com/cortesi/modd/releases/download/v0.4/modd-0.4-linux64.tgz | tar xvf - --strip-components=1 -C ./bin
        endif
    endif

download-unison: ##@helper Download unison file sync
	@mkdir -p ./bin
    ifeq ("$(wildcard ./bin/unison)","")
		@echo "${YELLOW}Downloading unison file sync${RESET}"
        ifeq ($(OS), Darwin)
			@curl -L https://github.com/mlarcher/docker-sync/releases/download/${DOCKER_SYNC_VERSION}/unison-${DOCKER_SYNC_VERSION}-osx64.tar.gz | tar xvf - --strip-components=1 -C ./bin
        endif
    endif

############## DB ##############

db-init: ##@db create linkstore database
	@echo "${YELLOW}Creating linkstore database${RESET}"
	@${DOCKER_COMPOSE} exec mysql /bin/bash -c 'mysql -u root -plinkstore -h mysql -e "create database linkstore"'
	@make db-migrate

db-drop: ##@db destroy linkstore database
	@echo "${YELLOW}Dropping linkstore database${RESET}"
	@-${DOCKER_COMPOSE} exec mysql /bin/bash -c 'mysql -u root -plinkstore -h mysql -e "drop database linkstore"'

knex-migration-files: ##@db make db knex schema files from sql files
	@make make-in-node MAKE_RULE=_knex-migration-files

_knex-migration-files: ##@db make db knex schema files from sql files
	@echo "${YELLOW}Converting sql migration files for knex${RESET}"
	@mkdir -p migrations/knex
	@node scripts/migration/make_migration_files.js

db-migrate: ##@db Migrate db schema to db
	@make make-in-api MAKE_RULE=_db-migrate

_db-migrate: _knex-migration-files ##@db Migrate db schema to db
	@echo "${YELLOW}Migrating database schema${RESET}"
	@${NODE_MODULES_BIN}/knex --env=development migrate:latest

db-rollback: ##@db Rollback all db migration
	@make make-in-api MAKE_RULE=_db-rollback

_db-rollback: _knex-migration-files ##@db Rollback all db migration
	@echo "${YELLOW}Rollback last db migration${RESET}"
	@${NODE_MODULES_BIN}/knex --env=development migrate:rollback

db-reset: db-drop db-init ##@db destroy and recreate linkstore database with db schema

db-load: ##@db load seeds
	@make make-in-api MAKE_RULE='_db-load target=${target} truncate=${truncate}'

_db-load: ##@db load seeds
	@echo "${YELLOW}Loading seeds in db${RESET}"
	@scripts/db-load.js

############## GIT HOOKS ##############

install-git-hooks: ##@git-hooks Install git hooks
	@ln -sf ../../scripts/git-hooks/pre-commit.sh .git/hooks/pre-commit
	@ln -sf ../../scripts/git-hooks/commit-msg.sh .git/hooks/commit-msg
	@ln -sf ../../scripts/git-hooks/pre-push.sh .git/hooks/pre-push

############## TEST ##############

test: lint test-unit-cover test-func ##@test run all test suite

check-migration-files: ##@test Check that new migration are posterior and have an up and down file
	@make make-in-node MAKE_RULE=_check-migration-files

_check-migration-files: ##@test Check that new migration are posterior and have an up and down file
	@scripts/migration/check-migration-files.js

lint: ##@test run eslint
	@make make-in-node MAKE_RULE=_lint

_lint: ##@test run eslint
	@echo "${YELLOW}Running eslint${RESET}"
	@${NODE_MODULES_BIN}/eslint src conf features mocks scripts tests ./*.js --quiet

test-unit: ##@test run unit tests
	@make make-in-api MAKE_RULE=_test-unit

_test-unit: ##@test run unit tests
	@echo "${YELLOW}Running unit tests${RESET}"
	@TEST_MODE=unitTest ${NODE_MODULES_BIN}/mocha tests/unit --colors --opts tests/unit/mocha.opts

test-unit-cover: ##@test run unit test with code coverage output
	@make make-in-api MAKE_RULE=_test-unit-cover

_test-unit-cover: ##@test run unit test with code coverage output
	@${NODE_MODULES_BIN}/nyc make _test-unit

test-unit-cover-report: ##@test run unit test with code coverage report
	@make make-in-api MAKE_RULE=_test-unit-cover-report

_test-unit-cover-report: ##@test run unit test with code coverage report
	@${NODE_MODULES_BIN}/nyc --reporter=lcov make _test-unit


test-func-cover: ##@test run functional test with code coverage report
	@make make-in-api MAKE_RULE=_test-func-cover

_test-func-cover: ##@test run functional test with code coverage report
	@${NODE_MODULES_BIN}/nyc --reporter=lcov make _test-func

test-func: ##@test run functional test. To add args to cucumber, use args env var. 'args="--tags @tag1 --tags @tag2" make test-func'
	@make make-in-api MAKE_RULE=_test-func

_test-func: ##@test run functional test. To add args to cucumber, use args env var. 'args="--tags @tag1 --tags @tag2" make _test-func'
	@echo "${YELLOW}Running functional tests${RESET}"
	@${NODE_MODULES_BIN}/cucumber-js --require tests/func/helpers ${args} tests/func/features


############## PACKAGE ##############
revision: ##@package make revision file
	@GIT_COMMIT_SHA1=`git rev-parse HEAD`; \
	 GIT_COMMIT_MSG=`printf "%s" "${shell git log -1 --pretty=%B}"`; \
	 GIT_COMMIT_DATE=`git show -s --format=%ci`; \
	 BUILD_DATE=`date +%Y-%m-%dT%H:%M:%S%z`; \
     echo "{ \"version\": \"${RELEASE_VERSION}\", \"sha1\": \"$${GIT_COMMIT_SHA1}\", \"msg\": \"$${GIT_COMMIT_MSG}\", \"commitDate\": \"$${GIT_COMMIT_DATE}\", \"buildDate\": \"$${BUILD_DATE}\" }" > "revision.json"

build-assets: ##@package build static assets
	@make make-in-node MAKE_RULE=_build-assets

_build-assets: ##@package build static assets
	@echo "${YELLOW}building assets${RESET}"
	@rm -rf public
	@npm build

############## RELEASE ##############

doc: ##@release make documentation
	@make make-in-node MAKE_RULE=_doc

_doc: ##@release make documentation
	@rm -rf docs
	@${NODE_MODULES_BIN}/jsdoc src --configure .jsdoc.json

changelog: ##@release generates changelog
	@make send-git-to-node
	@make make-in-node MAKE_RULE=_changelog
	@make remove-git-from-node

_changelog: ##@release generates changelog
	@echo "${YELLOW}generating changelog${RESET}"
	@echo source tag: $(shell git tag -l --sort=-v:refname | grep -v "^v${RELEASE_VERSION}$$" | head -n 1)
	@"${NODE_MODULES_BIN}/git-changelog" -t $(shell git tag -l --sort=-v:refname | grep -v "^v${RELEASE_VERSION}$$" | head -n 1)

send-git-to-%:
	@CONTAINER=$(shell echo $@ | cut -f 4 -d '-'); make remove-git-from-$${CONTAINER}
	@docker cp .git "$(shell ${DOCKER_COMPOSE} ps -q $(shell echo $@ | cut -f 4 -d '-'))":/data/.git;

remove-git-from-%:
	@docker exec "$(shell ${DOCKER_COMPOSE} ps -q $(shell echo $@ | cut -f 4 -d '-'))" rm -rf /data/.git;

shrinkwrap: ##@release Make shrinkwrap file
	@make make-in-node MAKE_RULE=_shrinkwrap ENV="NO_REINSTALL=${NO_REINSTALL}"

_shrinkwrap: ##@release Make shrinkwrap file
	@echo "${YELLOW}generating shrinkwrap.json${RESET}"
    ifndef NO_REINSTALL
		@-rm -R node_modules
		@make _install
    endif
	@npm shrinkwrap --dev

update-package-version: ##@release updates version in package.json
	@echo "${YELLOW}updating package.json version${RESET}"
	@npm version --silent --no-git-tag-version "${RELEASE_VERSION}"
