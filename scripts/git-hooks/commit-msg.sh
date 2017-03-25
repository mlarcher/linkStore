#!/usr/bin/env bash

COMMIT_MSG=`cat $1 | sed -n 1p`
LENGTH=`echo "${COMMIT_MSG}" | wc -c`

if [[ ${LENGTH} -gt 80 ]]; then
    echo -e "\nInvalid commit message (too long).\n" >&2;
    exit 1;
fi;

commit_regex='^(feat|fix|docs|style|refactor|perf|test|chore|revert)\(.*\): (.*)$'

if ! grep -iqE "$commit_regex" "$1"; then
    echo -e "\nInvalid commit message (malformed).\n" >&2
    exit 1
fi
