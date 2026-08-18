\set dbpass `echo "$POSTGRES_PASSWORD"`

CREATE ROLE postgres NOLOGIN SUPERUSER;
CREATE ROLE anon NOLOGIN NOINHERIT;
CREATE ROLE authenticated NOLOGIN NOINHERIT;
CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
ALTER ROLE anon SET search_path TO storage, public;
ALTER ROLE authenticated SET search_path TO storage, public;
ALTER ROLE service_role SET search_path TO storage, public;

CREATE ROLE authenticator LOGIN NOINHERIT PASSWORD :'dbpass';
GRANT anon, authenticated, service_role TO authenticator;

CREATE ROLE supabase_storage_admin LOGIN NOINHERIT CREATEROLE PASSWORD :'dbpass';
ALTER ROLE supabase_storage_admin SET search_path TO storage, public;
GRANT CREATE, CONNECT, TEMPORARY ON DATABASE postgres TO supabase_storage_admin;
GRANT anon, authenticated, service_role TO supabase_storage_admin;
