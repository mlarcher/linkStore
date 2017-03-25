#!/usr/bin/env bash

# setup 'strict mode'
set -euo pipefail
IFS=$'\n\t'

# check if functional tests have stray @only tags
set +e
grep -Eirn "^(\s+@\w+)*\s*@only\d*" --include=\*.feature ./test/func/features
if [[ "$?" -eq 0 ]]; then
    echo "ERROR: Some feature files contain a forbidden tag"
    exit 1
fi
set -e

make test
