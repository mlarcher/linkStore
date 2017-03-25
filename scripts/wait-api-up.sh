#!/usr/bin/env bash
MAX_ATTEMPTS=20

SUCCESS=1
ATTEMPT=0
while [ "$SUCCESS" != "0"  ]; do
  curl -s localhost:3000 > /dev/null
  SUCCESS=$?

  ATTEMPT=$((ATTEMPT+1))

  if [[ "$SUCCESS" == "0" ]]; then
    echo Started API after $ATTEMPT attempts
    exit 0
  fi

  if [[ $ATTEMPT -gt $MAX_ATTEMPTS ]]; then
    echo Failed to start api
    exit -1
  fi

  sleep 1
done
