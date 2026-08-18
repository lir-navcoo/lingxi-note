#!/bin/sh
set -eu

export PGPASSWORD="${POSTGRES_PASSWORD}"

until psql -h supabase-db -U supabase_admin -d postgres -c 'select 1' >/dev/null 2>&1; do
  sleep 2
done

until psql -h supabase-db -U supabase_admin -d postgres -Atc "select to_regclass('storage.buckets')" | grep -q 'storage.buckets'; do
  sleep 2
done

psql -h supabase-db -U supabase_admin -d postgres <<'SQL'
GRANT USAGE ON SCHEMA storage TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA storage TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA storage TO service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_storage_admin IN SCHEMA storage
  GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_storage_admin IN SCHEMA storage
  GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_storage_admin IN SCHEMA storage
  GRANT EXECUTE ON FUNCTIONS TO service_role;
SQL
