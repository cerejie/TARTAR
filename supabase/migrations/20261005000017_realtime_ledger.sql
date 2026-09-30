-- ============================================================================
-- Receivables + payables realtime (2026-09-29)
--
--   public.receivables and public.payables join the supabase_realtime
--   publication, so the admin clients refresh notifications, ledgers and
--   dashboards live when an employee records a receivable or marks a payable
--   paid. Row-level security still decides which rows each client receives.
--   Nothing is dropped or renamed.
-- ============================================================================

do $$
declare
  live_table text;
begin
  foreach live_table in array array['receivables', 'payables'] loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = live_table
    ) then
      execute format(
        'alter publication supabase_realtime add table public.%I',
        live_table
      );
    end if;
  end loop;
end;
$$;
