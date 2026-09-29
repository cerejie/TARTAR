-- ============================================================================
-- Payables: Mark paid + expense payables (2026-09-29)
--
--   1. payments records where a payment was paid from (cash account, and the
--      bank account when paid through a bank).
--   2. mark_payable_paid settles the whole balance of one payable at once. No
--      partial payments, no approval step: the payment is written verified.
--      Admins and employees only, and only on a branch the caller can see.
--   3. An approved expense voucher that carries a due date now opens a payable,
--      exactly like a purchase voucher does.
--   Nothing is dropped or renamed.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Paid from on payments
-- ----------------------------------------------------------------------------
alter table public.payments
  add column if not exists cash_account app.cash_account,
  add column if not exists bank_account_id uuid references public.bank_accounts (id);

alter table public.payments
  drop constraint if exists payments_bank_account_scope;
alter table public.payments
  add constraint payments_bank_account_scope check (
    bank_account_id is null or cash_account = 'bank_account'
  );

create index if not exists payments_bank_account_idx
  on public.payments (bank_account_id);

-- ----------------------------------------------------------------------------
-- 2. mark_payable_paid
-- ----------------------------------------------------------------------------
-- SECURITY DEFINER because an employee's payment is written verified, which
-- the pmt_insert policy reserves for managers. Access is validated inside.
create or replace function public.mark_payable_paid(
  p_payable_id uuid,
  p_paid_at date,
  p_cash_account app.cash_account,
  p_bank_account_id uuid default null,
  p_created_by uuid default null
) returns uuid
language plpgsql security definer set search_path = public, app as $$
declare
  v_payable public.payables%rowtype;
  v_balance numeric;
  v_payment_id uuid;
begin
  if not (app.is_manager() or app.user_role() = 'employee') then
    raise exception 'Not allowed to mark payables paid';
  end if;
  if p_cash_account is null then
    raise exception 'Choose where the payment was paid from';
  end if;
  if p_cash_account = 'bank_account' and p_bank_account_id is null then
    raise exception 'Select the bank account';
  end if;

  select * into v_payable from public.payables where id = p_payable_id for update;
  if not found or not app.can_see_branch(v_payable.branch) then
    raise exception 'Payable not found (or not accessible)';
  end if;

  v_balance := v_payable.amount - v_payable.paid_amount;
  if v_balance <= 0 then
    raise exception 'This payable is already paid';
  end if;

  insert into public.payments
    (kind, supplier_id, party_name, amount, paid_at, status, verified_by,
     verified_at, created_by, cash_account, bank_account_id)
  values
    ('payable', v_payable.supplier_id, v_payable.supplier_name, v_balance,
     coalesce(p_paid_at, current_date), 'verified',
     coalesce(app.user_id(), auth.uid()), now(), p_created_by, p_cash_account,
     case when p_cash_account = 'bank_account' then p_bank_account_id end)
  returning id into v_payment_id;

  insert into public.payment_allocations (payment_id, payable_id, amount)
  values (v_payment_id, p_payable_id, v_balance);

  update public.payables
  set paid_amount = amount,
      status = 'paid'::app.ledger_status
  where id = p_payable_id;

  return v_payment_id;
end;
$$;

revoke execute on function public.mark_payable_paid(
  uuid, date, app.cash_account, uuid, uuid
) from public;
grant execute on function public.mark_payable_paid(
  uuid, date, app.cash_account, uuid, uuid
) to authenticated;

-- ----------------------------------------------------------------------------
-- 3. Approval -> payable, now for expenses with a due date too
-- ----------------------------------------------------------------------------
-- Same body as 20260722000007 plus the expense branch. A manual purchase
-- voucher still must carry a due date; an expense without one was paid
-- outright and opens nothing.
create or replace function app.voucher_approval_payable() returns trigger
language plpgsql security definer set search_path = public, app as $$
declare
  v_payable_id uuid;
  v_is_expense boolean := false;
begin
  if new.status = 'approved'
     and old.status is distinct from 'approved'
     and new.payable_id is null
  then
    if new.transaction_id is not null then
      select t.type = 'expense' into v_is_expense
      from public.transactions t
      where t.id = new.transaction_id;
    end if;

    if new.category is distinct from 'PUR' and not coalesce(v_is_expense, false) then
      return new;
    end if;

    if new.due_date is null then
      if new.category = 'PUR' and new.transaction_id is null then
        raise exception 'This purchase voucher has no due date, so no payable can be opened';
      end if;
      return new;
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
