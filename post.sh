#!/usr/bin/env bash

DATE=$(date +%Y-%m-%d)
FILENAME="_posts/${DATE}-${1}.md"

if [ -e "$FILENAME" ]; then
  echo "File ${FILENAME} already exists"
  exit 1
fi;


cat <<EOL > "${FILENAME}"
---
title:
layout: post
---
EOL

exec ${EDITOR} "${FILENAME}"
