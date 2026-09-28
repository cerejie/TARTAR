-- ============================================================================
-- Sales verification + voucher breakdown (client decisions, 2026-09-28)
-- ----------------------------------------------------------------------------
--   1. A sale carries a deposit/verify status. An employee's sale starts
--      `undeposited`, the employee marks it `deposited` (deposit date only), a
--      manager `verified` it once the money reached the bank, or `rejected` it
--      with a reason. A rejected sale goes back to the employee: editable again
--      and re-markable as deposited. Verify/Reject only from `deposited`.
--      A manager's own sale is saved `verified` straight away.
--   2. A verified sale is locked (no edit, no delete) for everyone. Status only
--      moves through the three RPCs; every move lands in transaction_audit via
--      the existing audit trigger.
--   3. Existing sales are back-filled `verified` so historical totals hold.
--   4. Vouchers carry the check-voucher breakdown: invoice (gross), withholding
--      rate + amount (amount stored as entered, never recomputed server-side
--      once given), less return, free-text particulars.
--      amount (what is paid) = gross - withholding - less return.
--      The purchase/expense transaction keeps the invoice amount (the cost).
--   5. Branches gain a legal name + address for the voucher letterhead.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Sale status columns
-- ----------------------------------------------------------------------------
create type app.sale_status as enum ('undeposited', 'deposited', 'verified', 'rejected');

alter table public.transactions
  add column if not exists sale_status      app.sale_status,
  add column if not exists deposit_date     date,
  add column if not exists deposited_by     uuid,
  add column if not exists deposited_at     timestamptz,
  add column if not exists verified_by      uuid,
  add column if not exists verified_at      timestamptz,
  add column if not exists rejection_reason text;

-- Back-fill before any sale trigger exists. The audit trigger is paused so the
-- back-fill does not write one edit-history row per historical sale.
alter table public.transactions disable trigger transactions_audit;
update public.transactions
set sale_status = 'verified',
    verified_at = created_at
where type = 'sale' and sale_status is null;
alter table public.transactions enable trigger transactions_audit;

alter table public.transactions
  add constraint transactions_sale_status_scope
    check ((type = 'sale') = (sale_status is not null)),
  add constraint transactions_sale_deposit_date
    check (sale_status is distinct from 'deposited' or deposit_date is not null),
  add constraint transactions_sale_rejection_reason
    check (sale_status is distinct from 'rejected' or rejection_reason is not null);

-- Partial: every sales metric filters type = 'sale'.
create index if not exists transactions_sale_status_idx
  on public.transactions (branch, sale_status, txn_date)
  where type = 'sale';

-- ----------------------------------------------------------------------------
-- 2. Initial status on insert — the client never chooses it
-- ----------------------------------------------------------------------------
create or replace function app.init_sale_status() returns trigger
language plpgsql as $$
begin
  new.deposit_date     := null;
  new.deposited_by     := null;
  new.deposited_at     := null;
  new.rejection_reason := null;
  new.verified_by      := null;
  new.verified_at      := null;

  if new.type <> 'sale' then
    new.sale_status := null;
    return new;
  end if;

  if app.is_manager() then
    new.sale_status := 'verified';
    new.verified_by := coalesce(app.user_id(), auth.uid());
    new.verified_at := now();
  else
    new.sale_status := 'undeposited';
  end if;
  return new;
end;
$$;

create trigger transactions_sale_init before insert on public.transactions
  for each row execute function app.init_sale_status();

-- ----------------------------------------------------------------------------
-- 3. Sale lock + status only through the RPCs
-- ----------------------------------------------------------------------------
-- The RPCs below raise the transaction-local flag `app.sale_workflow`; any
-- other update that touches a workflow column is refused. PostgREST cannot
-- call set_config, so clients cannot raise the flag themselves.
create or replace function app.guard_sale_change() returns trigger
language plpgsql as $$
begin
  if tg_op = 'DELETE' then
    if old.sale_status = 'verified' then
      raise exception 'A verified sale can no longer be deleted';
    end if;
    return old;
  end if;

  if (old.type = 'sale') <> (new.type = 'sale') then
    raise exception 'A sale cannot be changed into another transaction type, or the reverse';
  end if;
  if old.type <> 'sale' then
    return new;
  end if;

  if old.sale_status = 'verified' then
    raise exception 'A verified sale is locked and can no longer be changed';
  end if;

  if coalesce(current_setting('app.sale_workflow', true), '') <> 'on'
     and (new.sale_status, new.deposit_date, new.deposited_by, new.deposited_at,
          new.verified_by, new.verified_at, new.rejection_reason)
         is distinct from
         (old.sale_status, old.deposit_date, old.deposited_by, old.deposited_at,
          old.verified_by, old.verified_at, old.rejection_reason)
  then
    raise exception 'A sale''s status only changes through Mark deposited, Verify or Reject';
  end if;
  return new;
end;
$$;

create trigger transactions_sale_guard before update or delete on public.transactions
  for each row execute function app.guard_sale_change();

-- ----------------------------------------------------------------------------
-- 4. Workflow RPCs
-- ----------------------------------------------------------------------------
-- SECURITY DEFINER so an employee can write the workflow columns; branch
-- access and role are therefore checked here, not by RLS. `for update` locks
-- the row so two reviewers cannot act on the same sale at once.
create or replace function public.mark_sale_deposited(
  p_transaction_id uuid,
  p_deposit_date date
) returns void
language plpgsql security definer set search_path = public, app as $$
declare
  v_sale public.transactions%rowtype;
begin
  if not (app.is_manager() or app.user_role() = 'employee') then
    raise exception 'You are not allowed to mark sales as deposited';
  end if;

  select * into v_sale from public.transactions
  where id = p_transaction_id for update;
  if not found or v_sale.type <> 'sale' or not app.can_see_branch(v_sale.branch) then
    raise exception 'Sale not found';
  end if;
  if v_sale.sale_status not in ('undeposited', 'rejected') then
    raise exception 'This sale is already %', v_sale.sale_status;
  end if;
  if p_deposit_date is null then
    raise exception 'Enter the deposit date';
  end if;
  if p_deposit_date < v_sale.txn_date then
    raise exception 'The deposit date cannot be before the sale date';
  end if;
  if p_deposit_date > current_date then
    raise exception 'The deposit date cannot be in the future';
  end if;

  perform set_config('app.sale_workflow', 'on', true);
  update public.transactions
  set sale_status      = 'deposited',
      deposit_date     = p_deposit_date,
      deposited_by     = coalesce(app.user_id(), auth.uid()),
      deposited_at     = now(),
      verified_by      = null,
      verified_at      = null,
      rejection_reason = null
  where id = p_transaction_id;
  perform set_config('app.sale_workflow', '', true);
end;
$$;

create or replace function public.verify_sale(p_transaction_id uuid) returns void
language plpgsql security definer set search_path = public, app as $$
declare
  v_sale public.transactions%rowtype;
begin
  if not app.is_manager() then
    raise exception 'Only an admin can verify sales';
  end if;

  select * into v_sale from public.transactions
  where id = p_transaction_id for update;
  if not found or v_sale.type <> 'sale' then
    raise exception 'Sale not found';
  end if;
  if v_sale.sale_status <> 'deposited' then
    raise exception 'Only a deposited sale can be verified (this one is %)', v_sale.sale_status;
  end if;

  perform set_config('app.sale_workflow', 'on', true);
  update public.transactions
  set sale_status = 'verified',
      verified_by = coalesce(app.user_id(), auth.uid()),
      verified_at = now()
  where id = p_transaction_id;
  perform set_config('app.sale_workflow', '', true);
end;
$$;

-- verified_by/at record the reviewer on a rejection too, as payments do.
create or replace function public.reject_sale(
  p_transaction_id uuid,
  p_reason text
) returns void
language plpgsql security definer set search_path = public, app as $$
declare
  v_sale public.transactions%rowtype;
  v_reason text := nullif(trim(p_reason), '');
begin
  if not app.is_manager() then
    raise exception 'Only an admin can reject sales';
  end if;
  if v_reason is null then
    raise exception 'Enter the reason for rejecting this sale';
  end if;

  select * into v_sale from public.transactions
  where id = p_transaction_id for update;
  if not found or v_sale.type <> 'sale' then
    raise exception 'Sale not found';
  end if;
  if v_sale.sale_status <> 'deposited' then
    raise exception 'Only a deposited sale can be rejected (this one is %)', v_sale.sale_status;
  end if;

  perform set_config('app.sale_workflow', 'on', true);
  update public.transactions
  set sale_status      = 'rejected',
      rejection_reason = v_reason,
      verified_by      = coalesce(app.user_id(), auth.uid()),
      verified_at      = now()
  where id = p_transaction_id;
  perform set_config('app.sale_workflow', '', true);
end;
$$;

revoke execute on function public.mark_sale_deposited(uuid, date) from public;
revoke execute on function public.verify_sale(uuid) from public;
revoke execute on function public.reject_sale(uuid, text) from public;
grant execute on function public.mark_sale_deposited(uuid, date) to authenticated;
grant execute on function public.verify_sale(uuid) to authenticated;
grant execute on function public.reject_sale(uuid, text) to authenticated;

-- ----------------------------------------------------------------------------
-- 5. Voucher breakdown
-- ----------------------------------------------------------------------------
-- gross_amount NULL = a voucher from before the breakdown (amount typed as-is);
-- such a voucher carries no withholding or return.
alter table public.vouchers
  add column if not exists particulars  text,
  add column if not exists gross_amount numeric(14,2) check (gross_amount >= 0),
  add column if not exists ewt_rate     numeric(4,3) not null default 0
    check (ewt_rate in (0, 0.01, 0.02)),
  add column if not exists ewt_amount   numeric(14,2) not null default 0
    check (ewt_amount >= 0),
  add column if not exists less_return  numeric(14,2) not null default 0
    check (less_return >= 0);

alter table public.vouchers
  add constraint vouchers_breakdown_total check (
    case
      when gross_amount is null then ewt_amount = 0 and less_return = 0
      else amount = gross_amount - ewt_amount - less_return
    end
  );

-- Auto withholding: base = (invoice - return) / 1.12 rounded to centavos,
-- withholding = base x rate rounded to centavos. Used only when the caller
-- sends no withholding amount of its own.
create or replace function app.voucher_ewt(
  p_invoice numeric,
  p_less_return numeric,
  p_rate numeric
) returns numeric
language sql immutable as $$
  select round(round((p_invoice - p_less_return) / 1.12, 2) * p_rate, 2);
$$;

-- A transaction edit keeps the stored withholding and return and re-derives
-- what is paid from the new invoice amount.
create or replace function app.sync_voucher_from_tx() returns trigger
language plpgsql security definer set search_path = public, app as $$
begin
  update public.vouchers v
  set amount       = case when v.gross_amount is null then new.amount
                          else new.amount - v.ewt_amount - v.less_return end,
      gross_amount = case when v.gross_amount is null then null else new.amount end,
      branch       = new.branch,
      purpose      = new.description,
      due_date     = new.due_date,
      type         = case new.cash_account
                       when 'bank_account' then 'check'::app.voucher_type
                       when 'cash_drawer'  then 'cash'::app.voucher_type
                       else v.type
                     end,
      category     = app.voucher_category(new.type, new.expense_type)
  where v.transaction_id = new.id and v.status = 'pending' and not v.printed;
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- 6. create_transaction_with_voucher — with the breakdown
-- ----------------------------------------------------------------------------
-- Dropped rather than replaced: new parameters change the function identity.
-- Every new parameter has a default, so queued offline calls still resolve.
drop function if exists public.create_transaction_with_voucher(
  app.transaction_type, text, date, numeric, text, text, text, uuid,
  app.cash_account, text, text, app.voucher_type, uuid, date
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
  p_due_date date default null,
  p_ewt_rate numeric default 0,
  p_ewt_amount numeric default null,
  p_less_return numeric default 0,
  p_particulars text default null
) returns uuid
language plpgsql as $$
declare
  v_tx_id uuid;
  v_payee text;
  v_vtype app.voucher_type;
  v_invoice numeric := round(p_amount, 2);
  v_rate numeric := coalesce(p_ewt_rate, 0);
  v_return numeric := round(coalesce(p_less_return, 0), 2);
  v_ewt numeric;
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

  v_ewt := round(coalesce(p_ewt_amount, app.voucher_ewt(v_invoice, v_return, v_rate)), 2);
  if v_invoice - v_ewt - v_return < 0 then
    raise exception 'Withholding and return cannot exceed the invoice amount';
  end if;

  insert into public.transactions
    (type, branch, farm_section, txn_date, amount, reference_number, description,
     supplier_id, cash_account, expense_type, due_date, created_by)
  values
    (p_type, p_branch, p_farm_section, p_txn_date, v_invoice, p_reference_number, p_description,
     p_supplier_id, p_cash_account, p_expense_type, p_due_date, p_created_by)
  returning id into v_tx_id;

  insert into public.vouchers
    (type, branch, payee, amount, purpose, status, printed,
     created_by, transaction_id, supplier_id, category, due_date,
     particulars, gross_amount, ewt_rate, ewt_amount, less_return)
  values
    (v_vtype, p_branch, v_payee, v_invoice - v_ewt - v_return, p_description, 'pending', false,
     p_created_by, v_tx_id, p_supplier_id, app.voucher_category(p_type, p_expense_type),
     p_due_date,
     nullif(trim(p_particulars), ''), v_invoice, v_rate, v_ewt, v_return);

  return v_tx_id;
end;
$$;

grant execute on function public.create_transaction_with_voucher(
  app.transaction_type, text, date, numeric, text, text, text, uuid,
  app.cash_account, text, text, app.voucher_type, uuid, date,
  numeric, numeric, numeric, text
) to authenticated;

-- ----------------------------------------------------------------------------
-- 7. update_transaction_with_voucher — one atomic edit of both rows
-- ----------------------------------------------------------------------------
-- Employees have no voucher UPDATE policy, so the breakdown is written by a
-- definer helper that re-checks role and branch itself. The breakdown is set
-- BEFORE the transaction update: the sync trigger then re-derives the same
-- amount, so the voucher never passes through an inconsistent total.
create or replace function app.set_voucher_breakdown(
  p_transaction_id uuid,
  p_invoice numeric,
  p_ewt_rate numeric,
  p_ewt_amount numeric,
  p_less_return numeric,
  p_particulars text
) returns void
language plpgsql security definer set search_path = public, app as $$
declare
  v_voucher public.vouchers%rowtype;
begin
  select * into v_voucher from public.vouchers
  where transaction_id = p_transaction_id for update;
  if not found then
    return;
  end if;
  if not (app.is_manager()
          or (app.user_role() = 'employee' and app.can_see_branch(v_voucher.branch))) then
    raise exception 'You are not allowed to edit this voucher';
  end if;
  if v_voucher.status <> 'pending' or v_voucher.printed then
    raise exception 'This transaction is locked: its voucher has been approved or printed';
  end if;

  update public.vouchers
  set gross_amount = p_invoice,
      ewt_rate     = p_ewt_rate,
      ewt_amount   = p_ewt_amount,
      less_return  = p_less_return,
      amount       = p_invoice - p_ewt_amount - p_less_return,
      particulars  = nullif(trim(p_particulars), '')
  where id = v_voucher.id;
end;
$$;

revoke execute on function app.set_voucher_breakdown(
  uuid, numeric, numeric, numeric, numeric, text
) from public;
grant execute on function app.set_voucher_breakdown(
  uuid, numeric, numeric, numeric, numeric, text
) to authenticated;

-- SECURITY INVOKER: the `for update` read and the transaction update both run
-- under the caller's own RLS, so accountants and other branches are refused.
create or replace function public.update_transaction_with_voucher(
  p_transaction_id uuid,
  p_branch text,
  p_txn_date date,
  p_amount numeric,
  p_farm_section text default null,
  p_reference_number text default null,
  p_description text default null,
  p_supplier_id uuid default null,
  p_cash_account app.cash_account default null,
  p_expense_type text default null,
  p_due_date date default null,
  p_ewt_rate numeric default 0,
  p_ewt_amount numeric default null,
  p_less_return numeric default 0,
  p_particulars text default null
) returns void
language plpgsql as $$
declare
  v_invoice numeric := round(p_amount, 2);
  v_rate numeric := coalesce(p_ewt_rate, 0);
  v_return numeric := round(coalesce(p_less_return, 0), 2);
  v_ewt numeric := round(coalesce(p_ewt_amount, app.voucher_ewt(v_invoice, v_return, v_rate)), 2);
begin
  perform 1 from public.transactions
  where id = p_transaction_id and type in ('purchase', 'expense')
  for update;
  if not found then
    raise exception 'Transaction not found';
  end if;
  if v_invoice - v_ewt - v_return < 0 then
    raise exception 'Withholding and return cannot exceed the invoice amount';
  end if;

  perform app.set_voucher_breakdown(
    p_transaction_id, v_invoice, v_rate, v_ewt, v_return, p_particulars
  );

  update public.transactions
  set branch           = p_branch,
      farm_section     = p_farm_section,
      txn_date         = p_txn_date,
      amount           = v_invoice,
      reference_number = p_reference_number,
      description      = p_description,
      supplier_id      = p_supplier_id,
      cash_account     = p_cash_account,
      expense_type     = p_expense_type,
      due_date         = p_due_date
  where id = p_transaction_id;
end;
$$;

grant execute on function public.update_transaction_with_voucher(
  uuid, text, date, numeric, text, text, text, uuid,
  app.cash_account, text, date, numeric, numeric, numeric, text
) to authenticated;

-- ----------------------------------------------------------------------------
-- 8. Branch letterhead
-- ----------------------------------------------------------------------------
alter table public.branches
  add column if not exists legal_name text,
  add column if not exists address    text;
