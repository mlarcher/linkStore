#!/bin/bash

#make ensure-unedited-pre-commit-sql-files

## Check that there are migration files edited
MODIFICATIONS=`git diff-index HEAD migrations/sql | cut -d" "  -f5`

IFS=$'\n'
for MODIFICATION in ${MODIFICATIONS}
do
    TYPE=`echo ${MODIFICATION} | cut -d$'\t'  -f1`
    FILE=`echo ${MODIFICATION} | cut -d$'\t'  -f2`

    if [ ${TYPE} == "M" ]; then
        error_msg="Modification is forbidden on ${FILE}";
        echo -e "$error_msg" >&2
        exit 1
    fi;
done


## Check migration files
make check-migration-files
