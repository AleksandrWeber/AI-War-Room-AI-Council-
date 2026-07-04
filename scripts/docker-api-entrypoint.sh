#!/bin/sh
set -eu

node apps/api/dist/db/migrate.js
exec node apps/api/dist/main.js
