-- ============================================================================
-- Accountant read access to vouchers (2026-09-26)
-- ----------------------------------------------------------------------------
--   Accountants open Purchases and Expenses, which show each row's voucher and
--   filter by voucher status through an inner join on public.vouchers. With no
--   SELECT policy for the role that join returned nothing. Accountants see every
--   branch (app.branch_access() is NULL for them), so the policy mirrors
--   tx_accountant_read. Read-only: create and approve stay as they were.
-- ============================================================================

drop policy if exists vch_accountant_read on public.vouchers;
create policy vch_accountant_read on public.vouchers
  for select to authenticated using (app.user_role() = 'accountant');
