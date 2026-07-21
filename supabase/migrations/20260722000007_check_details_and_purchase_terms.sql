-- ============================================================================
-- Check details + purchase credit terms (client decisions, 2026-07-22)
-- ----------------------------------------------------------------------------
--   1. A check voucher records the check itself: issuing bank (free text),
--      check number, and the date the check falls due. These describe the
--      instrument, so they are distinct from `vouchers.due_date`, which is the
--      credit term a payable inherits.
--   2. A purchase can carry a payment due date (60-day checks, on-credit
--      suppliers). It lives on the transaction — the source row owns its credit
--      term, so edits flow through the existing sync trigger — and approving the
--      purchase's voucher opens the payable, exactly as a manual purchase
--      voucher already does. Without a due date nothing is opened: the purchase
--      was settled on the spot.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Check details
-- ----------------------------------------------------------------------------
alter table public.vouchers
  add column if not exists check_bank     text,
  add column if not exists check_number   text,
  add column if not exists check_due_date date;

-- Cash vouchers have no check to describe. NOT VALID: existing rows are all
-- null here anyway, but this keeps the migration non-blocking on large tables.
alter table public.vouchers
  add constraint vouchers_check_details_require_check check (
    type = 'check'
    or (check_bank is null and check_number is null and check_due_date is null)
  ) not valid;

-- ----------------------------------------------------------------------------
-- 2. Purchase credit terms
-- ----------------------------------------------------------------------------
-- Nullable and unconstrained by type: only purchases collect it today, but an
-- on-credit expense would use the same column rather than a parallel one.
alter table public.transactions
  add column if not exists due_date date;

-- Keep the pending voucher's due date in step when the purchase is edited (the
-- rest of the body is unchanged from 20260721000006).
create or replace function app.sync_voucher_from_tx() returns trigger
language plpgsql security definer set search_path = public, app as $$
begin
  update public.vouchers v
  set amount   = new.amount,
      branch   = new.branch,
      purpose  = new.description,
      due_date = new.due_date,
      type     = case new.cash_account
                   when 'bank_account' then 'check'::app.voucher_type
                   when 'cash_drawer'  then 'cash'::app.voucher_type
                   else v.type
                 end,
      category = app.voucher_category(new.type, new.expense_type)
  where v.transaction_id = new.id and v.status = 'pending' and not v.printed;
  return new;
end;
$$;

-- Approval → payable, now for module purchases too. A voucher opens a payable
-- when it carries a due date; a manual purchase voucher still must have one
-- (its payable is the only record of the debt), while a module purchase without
-- one was paid outright and has nothing to carry over.
create or replace function app.voucher_approval_payable() returns trigger
language plpgsql security definer set search_path = public, app as $$
declare
  v_payable_id uuid;
begin
  if new.status = 'approved'
     and old.status is distinct from 'approved'
     and new.category = 'PUR'
     and new.payable_id is null
  then
    if new.due_date is null then
      if new.transaction_id is null then
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

-- ----------------------------------------------------------------------------
-- 3. create_transaction_with_voucher — carries the due date onto both rows
-- ----------------------------------------------------------------------------
-- Dropped rather than replaced: the new parameter changes the function's
-- identity, so `create or replace` would leave a second, ambiguous overload.
drop function if exists public.create_transaction_with_voucher(
  app.transaction_type, text, date, numeric, text, text, text, uuid,
  app.cash_account, text, text, app.voucher_type, uuid
);

create or replace function public.create_transaction_with_voucher(
  p_type app.transaction_type,
  p_branch text,
  p_txn_date date,
  p_amount numeric,
  p_farm_section text default null,
  p_reference_number text default null,
  p_description text default null,
  p_supplier_id uuid default null,
  p_cash_account app.cash_account default null,
  p_expense_type text default null,
  p_payee text default null,
  p_voucher_type app.voucher_type default null,
  p_created_by uuid default null,
  p_due_date date default null
) returns uuid
language plpgsql as $$
declare
  v_tx_id uuid;
  v_payee text;
  v_vtype app.voucher_type;
begin
  if p_type not in ('purchase', 'expense') then
    raise exception 'Only purchases and expenses generate vouchers';
  end if;

  v_payee := coalesce(
    nullif(trim(p_payee), ''),
    (select name from public.suppliers where id = p_supplier_id)
  );
  if v_payee is null then
    raise exception 'A payee (or supplier) is required for the voucher';
  end if;

  -- Type follows the payment account; credit purchases pick it manually.
  v_vtype := coalesce(
    p_voucher_type,
    case p_cash_account
      when 'bank_account' then 'check'::app.voucher_type
      when 'cash_drawer'  then 'cash'::app.voucher_type
    end
  );
  if v_vtype is null then
    raise exception 'Select check or cash for the voucher (no payment account chosen)';
  end if;

  insert into public.transactions
    (type, branch, farm_section, txn_date, amount, reference_number, description,
     supplier_id, cash_account, expense_type, due_date, created_by)
  values
    (p_type, p_branch, p_farm_section, p_txn_date, p_amount, p_reference_number, p_description,
     p_supplier_id, p_cash_account, p_expense_type, p_due_date, p_created_by)
  returning id into v_tx_id;

  insert into public.vouchers
    (type, branch, payee, amount, purpose, status, printed,
     created_by, transaction_id, supplier_id, category, due_date)
  values
    (v_vtype, p_branch, v_payee, p_amount, p_description, 'pending', false,
     p_created_by, v_tx_id, p_supplier_id, app.voucher_category(p_type, p_expense_type),
     p_due_date);

  return v_tx_id;
end;
$$;

grant execute on function public.create_transaction_with_voucher(
  app.transaction_type, text, date, numeric, text, text, text, uuid,
  app.cash_account, text, text, app.voucher_type, uuid, date
) to authenticated;
