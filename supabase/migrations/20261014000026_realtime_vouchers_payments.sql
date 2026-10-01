-- ============================================================================
-- 26. Vouchers + payments realtime (2026-10-01)
--
--   public.vouchers and public.payments join the supabase_realtime
--   publication, so open pages refresh live when a voucher is approved or
--   rejected, or a payment is verified or rejected, by another user. Every
--   signed-in role now subscribes; row-level security still decides which
--   rows each client receives. Nothing is dropped or renamed.
-- ============================================================================

do $$
declare
  live_table text;
begin
  foreach live_table in array array['vouchers', 'payments'] loop
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
