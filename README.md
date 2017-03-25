# ConvargoTest by Matthieu Larcher


## brief

Créer une application fullstack en NodeJS et ReactJS style “Hacker News”.
Fonctionnalités​ minimales :

1. Intégrer une page avec un formulaire dans lequel l’utilisateur saisit
l’URL d’un site.
2. Cette URL est stockée en base avec le titre de la page récupérer
automatiquement depuis le site.
3. Afficher sur une autre page la liste des liens (URL et titre).
4. Permettre à l’utilisateur de “upvote” un lien (c’est-à-dire
d'incrémenter de 1 le nombre de vote sur le lien)
5. Trier la liste en fonction du nombre de vote.

Bonus​ :

* Avoir la possibilité de commenter chaque lien.
* Avoir la possibilité de “downvote”.
* … ou ce que vous voulez

Conditions​ :

* Front en React JS
* Backend en NodeJS
* API en GraphQL
* Base de données de son choix
* Compatible dernière version de Chrome
* Code source hébergé sur un répertoire Git

A noter

* La partie UX/UI est très secondaire par rapport à la qualité du code.
Nous voulons du code production-ready avec vos meilleures pratiques de
développement.
* Côté librairie GraphQL frontend, nous déconseillons l’utilisation de
Relay qui est très compliqué à mettre en oeuvre.
Le mieux est de partir soit sur Apollo Data soit sur du natif via fetch
ou ajax.
* Pour le livrable, un email à yoann.gotthilf@convargo.com avec un lien
vers le répertoire Git, les explications d’installation, le nombre
d’heures passés dessus, et la liste des problèmes/points bloquants
rencontrés.

## setup

install docker
    Mac : https://docs.docker.com/docker-for-mac/
    Linux : https://docs.docker.com/engine/installation/
(you may want to increase the ram available to docker in the settings)

make install-git-hooks
make setup
make install
make start

## most useful command

See ```make help```

## Setup

### Increase available ram

Click on the docker menu bar icon and choose Preferences (or hit Cmd-,)
and in the general pane, increase memory limit to 4Gb.
Then Apply & Restart and you’re good to go.

### Setup docker stack

To setup, run ```make setup```
This will create a docker compose stack with :
 - mysql
 - wiremock
 - api
 - a node image

## Common controls

Usefull commands are :
```make start```: Start docker compose stack after a stop
```make stop```: Stop docker compose stack but don't delete it
```make restart-api```: Manually restart api container
```make dev```: Start a watcher that reloads containers on files changes and output api log in console
```make test```: Run tests

## Services address
 * api : http://localhost:8080
 * mysql : localhost:3307/linkstore
    * login: linkstore
    * pass : linkstore
 * wiremock : http://localhost:8081
