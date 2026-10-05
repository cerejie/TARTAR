-- ============================================================================
-- PROPOSAL — migration 34: optional check number on a purchase
-- Status: NOT APPLIED. Lives outside supabase/migrations/ so `db push` cannot
-- pick it up. Copy into supabase/migrations/<timestamp>_purchase_check_number.sql
-- once approved.
-- ----------------------------------------------------------------------------
-- Rule (user, 2026-10-06): the check number belongs to purchase vouchers
-- (category 'PUR') whatever "Paid from" is, and stays optional. Manual check
-- vouchers keep their check number as before. Other cash vouchers (expenses,
-- manual cash) still never carry check details.
--
-- Why the RPCs take it: a purchase and its voucher are written by one RPC,
-- queued offline as one runWrite. A second client write to vouchers would not
-- be atomic and cannot be queued (the voucher id is unknown offline).
--
-- Signatures: every create / update overload gains p_check_number text
-- default null as its last parameter. The old signatures are dropped first so
-- PostgREST never sees two overloads that both match a named-argument call.
-- Calls queued offline before this migration (no p_check_number) still
-- resolve. On update, p_check_number null keeps the stored value, '' clears
-- it, any other text replaces it.
--
-- Also fixed: app.sync_voucher_from_tx kept check_bank when a purchase moved
-- from the bank account to cash, so the voucher became type 'cash' with
-- check_bank set and the constraint rejected the edit.
--
-- Bodies are migration 29's (create, update) and migration 31's (idempotent
-- update wrapper), unchanged apart from the check number.
-- No data is changed or dropped.
-- ----------------------------------------------------------------------------

begin;

-- 1. Constraint: a check number may also sit on a purchase cash voucher -------
alter table public.vouchers
  drop constraint if exists vouchers_check_details_require_check;

alter table public.vouchers
  add constraint vouchers_check_details_require_check check (
    type = 'check'
    or (
      check_bank is null
      and check_due_date is null
      and (check_number is null or category = 'PUR')
    )
  ) not valid;

alter table public.vouchers
  validate constraint vouchers_check_details_require_check;

-- 2. Sync trigger -------------------------------------------------------------
create or replace function app.sync_voucher_from_tx() returns trigger
language plpgsql security definer set search_path = public, app as $$
declare
  v_pays_by_bank boolean := new.cash_account = 'bank_account';
begin
  update public.vouchers v
  set amount         = case when v.gross_amount is null then new.amount
                            else new.amount - v.ewt_amount - v.less_return end,
      gross_amount   = case when v.gross_amount is null then null else new.amount end,
      branch         = new.branch,
      purpose        = new.description,
      due_date       = new.due_date,
      type           = case new.cash_account
                         when 'bank_account' then 'check'::app.voucher_type
                         when 'cash_drawer'  then 'cash'::app.voucher_type
                         when 'petty_cash'   then 'cash'::app.voucher_type
                         else v.type
                       end,
      check_bank     = case when coalesce(v_pays_by_bank, v.type = 'check')
                            then coalesce(app.bank_account_label(new.bank_account_id), v.check_bank)
                       end,
      check_number   = case when coalesce(v_pays_by_bank, v.type = 'check')
                              or new.type = 'purchase'
                            then v.check_number end,
      check_due_date = case when coalesce(v_pays_by_bank, v.type = 'check')
                            then v.check_due_date end,
      category       = app.voucher_category(new.type, new.expense_type)
  where v.transaction_id = new.id
    and ((v.status = 'pending' and not v.printed) or app.is_own_open_voucher(v));
  return new;
end;
$$;

-- 3. create_transaction_with_voucher -----------------------------------------
drop function if exists public.create_transaction_with_voucher(
  uuid, app.transaction_type, text, date, numeric, text, text, text, uuid,
  app.cash_account, text, text, app.voucher_type, uuid, date, numeric,
  numeric, numeric, text, uuid, boolean
);
drop function if exists public.create_transaction_with_voucher(
  app.transaction_type, text, date, numeric, text, text, text, uuid,
  app.cash_account, text, text, app.voucher_type, uuid, date,
  numeric, numeric, numeric, text, uuid, boolean
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
  p_particulars text default null,
  p_bank_account_id uuid default null,
  p_vatable boolean default true,
  p_check_number text default null
) returns uuid
language plpgsql as $$
declare
  v_tx_id uuid;
  v_payee text;
  v_vtype app.voucher_type;
  v_invoice numeric := round(p_amount, 2);
  v_rate numeric := coalesce(p_ewt_rate, 0);
  v_return numeric := round(coalesce(p_less_return, 0), 2);
  v_vatable boolean := coalesce(p_vatable, true);
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
      when 'petty_cash'   then 'cash'::app.voucher_type
    end
  );
  if v_vtype is null then
    raise exception 'Select check or cash for the voucher (no payment account chosen)';
  end if;

  v_ewt := round(coalesce(p_ewt_amount, app.voucher_ewt(v_invoice, v_return, v_rate, v_vatable)), 2);
  if v_invoice - v_ewt - v_return < 0 then
    raise exception 'Withholding and return cannot exceed the invoice amount';
  end if;

  insert into public.transactions
    (type, branch, farm_section, txn_date, amount, reference_number, description,
     supplier_id, cash_account, bank_account_id, expense_type, due_date, created_by)
  values
    (p_type, p_branch, p_farm_section, p_txn_date, v_invoice, p_reference_number, p_description,
     p_supplier_id, p_cash_account, p_bank_account_id, p_expense_type, p_due_date, p_created_by)
  returning id into v_tx_id;

  insert into public.vouchers
    (type, branch, payee, amount, purpose, status, printed,
     created_by, transaction_id, supplier_id, category, due_date,
     particulars, gross_amount, ewt_rate, ewt_amount, less_return, check_bank, vatable,
     check_number)
  values
    (v_vtype, p_branch, v_payee, v_invoice - v_ewt - v_return, p_description, 'pending', false,
     p_created_by, v_tx_id, p_supplier_id, app.voucher_category(p_type, p_expense_type),
     p_due_date,
     nullif(trim(p_particulars), ''), v_invoice, v_rate, v_ewt, v_return,
     case when v_vtype = 'check' then app.bank_account_label(p_bank_account_id) end,
     v_vatable,
     case when v_vtype = 'check' or p_type = 'purchase'
          then nullif(trim(p_check_number), '') end);

  return v_tx_id;
end;
$$;

create or replace function public.create_transaction_with_voucher(
  p_idempotency_key uuid,
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
  p_particulars text default null,
  p_bank_account_id uuid default null,
  p_vatable boolean default true,
  p_check_number text default null
) returns uuid
language plpgsql as $$
begin
  if not app.claim_write(p_idempotency_key, 'create_transaction_with_voucher') then
    return null;
  end if;

  return public.create_transaction_with_voucher(
    p_type => p_type,
    p_branch => p_branch,
    p_txn_date => p_txn_date,
    p_amount => p_amount,
    p_farm_section => p_farm_section,
    p_reference_number => p_reference_number,
    p_description => p_description,
    p_supplier_id => p_supplier_id,
    p_cash_account => p_cash_account,
    p_expense_type => p_expense_type,
    p_payee => p_payee,
    p_voucher_type => p_voucher_type,
    p_created_by => p_created_by,
    p_due_date => p_due_date,
    p_ewt_rate => p_ewt_rate,
    p_ewt_amount => p_ewt_amount,
    p_less_return => p_less_return,
    p_particulars => p_particulars,
    p_bank_account_id => p_bank_account_id,
    p_vatable => p_vatable,
    p_check_number => p_check_number
  );
end;
$$;

-- 4. update_transaction_with_voucher -----------------------------------------
drop function if exists public.update_transaction_with_voucher(
  uuid, integer, app.voucher_status, uuid, text, date, numeric, text, text, text,
  uuid, app.cash_account, text, date, numeric, numeric, numeric, text, uuid, boolean
);
drop function if exists public.update_transaction_with_voucher(
  integer, app.voucher_status, uuid, text, date, numeric, text, text, text,
  uuid, app.cash_account, text, date, numeric, numeric, numeric, text, uuid, boolean
);
drop function if exists public.update_transaction_with_voucher(
  uuid, text, date, numeric, text, text, text, uuid,
  app.cash_account, text, date, numeric, numeric, numeric, text, uuid, boolean
);

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
  p_particulars text default null,
  p_bank_account_id uuid default null,
  p_vatable boolean default null,
  p_check_number text default null
) returns void
language plpgsql as $$
declare
  v_invoice numeric := round(p_amount, 2);
  v_rate numeric := coalesce(p_ewt_rate, 0);
  v_return numeric := round(coalesce(p_less_return, 0), 2);
  v_vatable boolean;
  v_ewt numeric;
begin
  perform 1 from public.transactions
  where id = p_transaction_id and type in ('purchase', 'expense')
  for update;
  if not found then
    raise exception 'Transaction not found';
  end if;

  v_vatable := coalesce(
    p_vatable,
    (select v.vatable from public.vouchers v where v.transaction_id = p_transaction_id),
    true
  );
  v_ewt := round(coalesce(p_ewt_amount, app.voucher_ewt(v_invoice, v_return, v_rate, v_vatable)), 2);
  if v_invoice - v_ewt - v_return < 0 then
    raise exception 'Withholding and return cannot exceed the invoice amount';
  end if;

  perform app.reopen_rejected_voucher(p_transaction_id);

  perform app.set_voucher_breakdown(
    p_transaction_id, v_invoice, v_rate, v_ewt, v_return, p_particulars, v_vatable
  );

  update public.transactions
  set branch           = p_branch,
      farm_section     = p_farm_section,
      txn_date         = p_txn_date,
      amount           = v_invoice,
      description      = p_description,
      supplier_id      = p_supplier_id,
      cash_account     = p_cash_account,
      bank_account_id  = p_bank_account_id,
      expense_type     = p_expense_type,
      due_date         = p_due_date
  where id = p_transaction_id;

  if p_check_number is not null then
    update public.vouchers v
    set check_number = nullif(trim(p_check_number), '')
    where v.transaction_id = p_transaction_id
      and (v.type = 'check' or v.category = 'PUR')
      and ((v.status = 'pending' and not v.printed) or app.is_own_open_voucher(v));
  end if;
end;
$$;

create or replace function public.update_transaction_with_voucher(
  p_expected_version integer,
  p_expected_voucher_status app.voucher_status,
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
  p_particulars text default null,
  p_bank_account_id uuid default null,
  p_vatable boolean default null,
  p_check_number text default null
) returns void
language plpgsql as $$
declare
  v_version integer;
  v_voucher_status app.voucher_status;
begin
  select t.version into v_version
  from public.transactions t
  where t.id = p_transaction_id and t.type in ('purchase', 'expense')
  for update;
  if not found then
    raise exception 'Transaction not found';
  end if;

  select v.status into v_voucher_status
  from public.vouchers v
  where v.transaction_id = p_transaction_id;

  if v_version <> p_expected_version
     or v_voucher_status is distinct from p_expected_voucher_status then
    raise exception 'This record was changed by someone else after you opened it — reopen it and edit again';
  end if;

  perform public.update_transaction_with_voucher(
    p_transaction_id => p_transaction_id,
    p_branch => p_branch,
    p_txn_date => p_txn_date,
    p_amount => p_amount,
    p_farm_section => p_farm_section,
    p_reference_number => p_reference_number,
    p_description => p_description,
    p_supplier_id => p_supplier_id,
    p_cash_account => p_cash_account,
    p_expense_type => p_expense_type,
    p_due_date => p_due_date,
    p_ewt_rate => p_ewt_rate,
    p_ewt_amount => p_ewt_amount,
    p_less_return => p_less_return,
    p_particulars => p_particulars,
    p_bank_account_id => p_bank_account_id,
    p_vatable => p_vatable,
    p_check_number => p_check_number
  );
end;
$$;

create or replace function public.update_transaction_with_voucher(
  p_idempotency_key uuid,
  p_expected_version integer,
  p_expected_voucher_status app.voucher_status,
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
  p_particulars text default null,
  p_bank_account_id uuid default null,
  p_vatable boolean default null,
  p_check_number text default null
) returns void
language plpgsql as $$
begin
  if not app.claim_write(p_idempotency_key, 'update_transaction_with_voucher') then
    return;
  end if;

  perform public.update_transaction_with_voucher(
    p_expected_version => p_expected_version,
    p_expected_voucher_status => p_expected_voucher_status,
    p_transaction_id => p_transaction_id,
    p_branch => p_branch,
    p_txn_date => p_txn_date,
    p_amount => p_amount,
    p_farm_section => p_farm_section,
    p_reference_number => p_reference_number,
    p_description => p_description,
    p_supplier_id => p_supplier_id,
    p_cash_account => p_cash_account,
    p_expense_type => p_expense_type,
    p_due_date => p_due_date,
    p_ewt_rate => p_ewt_rate,
    p_ewt_amount => p_ewt_amount,
    p_less_return => p_less_return,
    p_particulars => p_particulars,
    p_bank_account_id => p_bank_account_id,
    p_vatable => p_vatable,
    p_check_number => p_check_number
  );
end;
$$;

-- 5. Grants -------------------------------------------------------------------
grant execute on function public.create_transaction_with_voucher(
  app.transaction_type, text, date, numeric, text, text, text, uuid,
  app.cash_account, text, text, app.voucher_type, uuid, date,
  numeric, numeric, numeric, text, uuid, boolean, text
) to authenticated;
grant execute on function public.create_transaction_with_voucher(
  uuid, app.transaction_type, text, date, numeric, text, text, text, uuid,
  app.cash_account, text, text, app.voucher_type, uuid, date, numeric,
  numeric, numeric, text, uuid, boolean, text
) to authenticated;
grant execute on function public.update_transaction_with_voucher(
  uuid, text, date, numeric, text, text, text, uuid,
  app.cash_account, text, date, numeric, numeric, numeric, text, uuid, boolean, text
) to authenticated;
grant execute on function public.update_transaction_with_voucher(
  integer, app.voucher_status, uuid, text, date, numeric, text, text, text,
  uuid, app.cash_account, text, date, numeric, numeric, numeric, text, uuid, boolean, text
) to authenticated;
grant execute on function public.update_transaction_with_voucher(
  uuid, integer, app.voucher_status, uuid, text, date, numeric, text, text, text,
  uuid, app.cash_account, text, date, numeric, numeric, numeric, text, uuid, boolean, text
) to authenticated;

notify pgrst, 'reload schema';

commit;
