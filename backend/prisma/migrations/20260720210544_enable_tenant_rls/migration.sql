-- Tenant isolation via PostgreSQL Row Level Security.
-- Run by the migration role (superuser). The runtime app connects as the
-- non-superuser `talyra_app` role created below, which CANNOT bypass RLS.

-- 1. Application role. Idempotent so `migrate reset` and fresh clones both work.
--    NOTE: the dev password lives here for convenience; in production the role
--    is created out-of-band and this block is skipped (role already exists).
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'talyra_app') THEN
    CREATE ROLE talyra_app WITH LOGIN PASSWORD 'talyra_app' NOSUPERUSER NOBYPASSRLS;
  END IF;
END
$$;

-- 2. Grant the app role DML only — never DDL. It reads/writes rows, never
--    changes the schema. Default privileges cover tables created later.
GRANT USAGE ON SCHEMA public TO talyra_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO talyra_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO talyra_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO talyra_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO talyra_app;

-- 3. Enable + FORCE RLS and install the isolation policy on every business
--    table. Auth/control-plane tables (user, session, account, verification,
--    tenant, membership) are intentionally excluded: they are queried by
--    userId BEFORE any tenant context exists (tenant resolution).
--
--    current_setting('app.tenant_id', true): the `true` makes it return NULL
--    (instead of erroring) when the variable is not set. With NULL, the
--    predicate is never true -> zero rows. The system FAILS CLOSED: forget to
--    set the tenant and you see nothing, never everything.
DO $$
DECLARE
  t text;
  business_tables text[] := ARRAY[
    'contact', 'lead', 'calendar_resource', 'prestation', 'booking_slot',
    'option_hold', 'catalog_item', 'quote', 'quote_line', 'contract',
    'signature_proof', 'payment_schedule', 'payment_installment', 'payment',
    'invoice', 'portal_token', 'activity_log', 'outbox_event'
  ];
BEGIN
  FOREACH t IN ARRAY business_tables LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I;', t);
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %I '
      'USING (tenant_id = current_setting(''app.tenant_id'', true)) '
      'WITH CHECK (tenant_id = current_setting(''app.tenant_id'', true));',
      t
    );
  END LOOP;
END
$$;
