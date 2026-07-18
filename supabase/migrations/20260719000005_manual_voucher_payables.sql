-- ============================================================================
-- Manual vouchers: purpose is a choice, and approved purchases become payables
-- (client decisions, 2026-07-19)
-- ----------------------------------------------------------------------------
--   1. A manual voucher no longer carries a free-text purpose. The creator
--      picks expense or purchase; that choice is stored in the existing
--      `category` code (EXP / PUR) so numbering and reporting stay uniform with
--      the auto-generated vouchers.
--   2. Approving a manual PURCHASE voucher opens a payable for the supplier.
--      Rejected and pending vouchers create nothing; a voucher can only ever
--      produce one payable (`payable_id` guards re-entry).
-- ============================================================================

alter table public.vouchers
  add column if not exists due_date date,
  add column if not exists payable_id uuid references public.payables (id);

-- A manual purchase voucher must carry the due date its payable will inherit.
-- Auto-generated vouchers (transaction_id not null) are exempt: their credit
-- terms live on the source transaction's own ledger row.
alter table public.vouchers
  add constraint vouchers_purchase_due_date check (
    transaction_id is not null
    or category <> 'PUR'
    or due_date is not null
  ) not valid;

-- ----------------------------------------------------------------------------
-- Approval → payable
-- ----------------------------------------------------------------------------
-- BEFORE UPDATE (not AFTER) on purpose: writing `payable_id` back through a
-- second UPDATE would hit app.guard_voucher_change(), which freezes a row the
-- moment it reads `approved`. Setting NEW in place keeps it to one write.
-- The trigger name sorts after `vouchers_guard` so the guard still vets the
-- change first (Postgres fires per-row triggers in name order).
--
-- SECURITY DEFINER: payables RLS is branch-scoped per role, and the approver is
-- always a manager whose own policy would allow this insert anyway — the
-- definer rights just keep the trigger independent of the caller's policies.
create or replace function app.voucher_approval_payable() returns trigger
language plpgsql security definer set search_path = public, app as $$
declare
  v_payable_id uuid;
begin
  if new.status = 'approved'
     and old.status is distinct from 'approved'
     and new.category = 'PUR'
     and new.transaction_id is null   -- manual vouchers only; purchases made in
                                      -- the Purchases module keep their own row
     and new.payable_id is null
  then
    if new.due_date is null then
      raise exception 'This purchase voucher has no due date, so no payable can be opened';
    end if;

    insert into public.payables
      (branch, supplier_id, supplier_name, amount, due_date, reference_number, created_by)
    values
      (new.branch, new.supplier_id, new.payee, new.amount, new.due_date, new.voucher_no,
       new.created_by)
    returning id into v_payable_id;

    new.payable_id := v_payable_id;
  end if;
  return new;
end;
$$;

create trigger vouchers_zz_approval_payable before update on public.vouchers
  for each row execute function app.voucher_approval_payable();
