-- ============================================================================
-- Accountant branch access + transactions realtime (2026-09-29)
--
--   1. Accountants are limited to the branches assigned to them (users.
--      branch_access, carried in the JWT). app.branch_access() now returns
--      NULL ("all branches") for superadmin and admin only, so every
--      app.can_see_branch() check and RPC also applies to accountants. An
--      accountant with no branches assigned sees no branch data.
--   2. The accountant read policies on transactions, receivables, payables
--      and vouchers gain the branch check.
--   3. public.transactions joins the supabase_realtime publication so the
--      admin clients refresh live when a transaction changes.
--   Nothing is dropped or renamed.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. app.branch_access
-- ----------------------------------------------------------------------------
create or replace function app.branch_access() returns text[]
language sql stable as $$
  select case
    when app.user_role() in ('superadmin', 'admin') then null
    else coalesce(
      array(select jsonb_array_elements_text(app.jwt() -> 'branch_access')),
      '{}'::text[]
    )
  end;
$$;

-- ----------------------------------------------------------------------------
-- 2. Accountant read policies
-- ----------------------------------------------------------------------------
drop policy if exists tx_accountant_read on public.transactions;
create policy tx_accountant_read on public.transactions
  for select to authenticated
  using (app.user_role() = 'accountant' and app.can_see_branch(branch));

drop policy if exists rcv_accountant_read on public.receivables;
create policy rcv_accountant_read on public.receivables
  for select to authenticated
  using (app.user_role() = 'accountant' and app.can_see_branch(branch));

drop policy if exists pay_accountant_read on public.payables;
create policy pay_accountant_read on public.payables
  for select to authenticated
  using (app.user_role() = 'accountant' and app.can_see_branch(branch));

drop policy if exists vch_accountant_read on public.vouchers;
create policy vch_accountant_read on public.vouchers
  for select to authenticated
  using (app.user_role() = 'accountant' and app.can_see_branch(branch));

-- ----------------------------------------------------------------------------
-- 3. Realtime on transactions
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'transactions'
  ) then
    alter publication supabase_realtime add table public.transactions;
  end if;
end;
$$;
