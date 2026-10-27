#!/usr/bin/env bash
# Runs the PIKADON OS migration + security tests against a scratch
# PostgreSQL database. Usage: PGHOST=... PGPORT=... supabase/tests/run.sh
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
db="pikadon_test_$$"
createdb -U postgres "$db"
trap 'dropdb -U postgres "$db"' EXIT
psql -U postgres -d "$db" -q -v ON_ERROR_STOP=1 -f "$here/supabase-shim.sql"
for f in "$here"/../migrations/*.sql; do psql -U postgres -d "$db" -q -v ON_ERROR_STOP=1 -f "$f"; done
psql -U postgres -d "$db" -q -t -A -o /dev/null -v ON_ERROR_STOP=1 -f "$here/security.test.sql" 2>&1 | sed 's/^psql:[^ ]* NOTICE:  /  /'
