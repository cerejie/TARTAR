-- ============================================================================
-- Auto reference numbers (2026-09-29)
--
--   Purchases, receivables, payables and payments are numbered by the database
--   on insert: <KIND>-<branch prefix>-<YYMM>-<0001>, e.g. PUR-FRM-2609-0001.
--   One gapless counter per kind + branch + month.
--
--     PUR  purchase transactions   month of txn_date (the invoice date)
--     RCV  receivables             month of the insert
--     PAY  payables                month of the insert
--     PMT  payments                month of paid_at, branch of the first
--                                  record the payment is allocated to
--
--   A row that already carries a reference keeps it, so existing numbers and
--   the voucher number a voucher-approved payable inherits are untouched.
--   Nothing is dropped or renamed.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Counters
-- ----------------------------------------------------------------------------
-- No client policies: only the SECURITY DEFINER function below touches it.
create table if not exists public.reference_counters (
  kind    text not null,
  branch  text not null references public.branches (slug),
  period  text not null check (period ~ '^[0-9]{4}$'),
  last_no int  not null,
  primary key (kind, branch, period)
);

alter table public.reference_counters enable row level security;

-- The upsert's row lock serialises concurrent inserts, as in next_voucher_no.
create or replace function app.next_reference_no(
  p_kind text,
  p_branch text,
  p_date date
) returns text
language plpgsql security definer set search_path = public, app as $$
declare
  v_period text := to_char(coalesce(p_date, current_date), 'YYMM');
  v_prefix text;
  v_no int;
begin
  select voucher_prefix into v_prefix from public.branches where slug = p_branch;
  insert into public.reference_counters as c (kind, branch, period, last_no)
  values (p_kind, p_branch, v_period, 1)
  on conflict (kind, branch, period)
  do update set last_no = c.last_no + 1
  returning last_no into v_no;
  return format('%s-%s-%s-%s', p_kind, coalesce(v_prefix, 'TTR'), v_period, lpad(v_no::text, 4, '0'));
end;
$$;

-- ----------------------------------------------------------------------------
-- 2. Purchases, receivables, payables: numbered before insert
-- ----------------------------------------------------------------------------
create or replace function app.assign_purchase_reference() returns trigger
language plpgsql security definer set search_path = public, app as $$
begin
  if new.type = 'purchase' and nullif(trim(new.reference_number), '') is null then
    new.reference_number := app.next_reference_no('PUR', new.branch, new.txn_date);
  end if;
  return new;
end;
$$;

create trigger transactions_assign_reference before insert on public.transactions
  for each row execute function app.assign_purchase_reference();

-- TG_ARGV[0] is the kind code, so one function serves both ledgers.
create or replace function app.assign_ledger_reference() returns trigger
language plpgsql security definer set search_path = public, app as $$
begin
  if nullif(trim(new.reference_number), '') is null then
    new.reference_number := app.next_reference_no(tg_argv[0], new.branch, current_date);
  end if;
  return new;
end;
$$;

create trigger receivables_assign_reference before insert on public.receivables
  for each row execute function app.assign_ledger_reference('RCV');

create trigger payables_assign_reference before insert on public.payables
  for each row execute function app.assign_ledger_reference('PAY');

-- ----------------------------------------------------------------------------
-- 3. Payments: numbered on their first allocation
-- ----------------------------------------------------------------------------
-- payments has no branch column; the branch is known only once an allocation
-- names the receivable or payable being paid.
create or replace function app.assign_payment_reference() returns trigger
language plpgsql security definer set search_path = public, app as $$
declare
  v_branch text;
  v_paid_at date;
begin
  select paid_at into v_paid_at
  from public.payments
  where id = new.payment_id and nullif(trim(reference_number), '') is null
  for update;
  if not found then
    return new;
  end if;

  if new.receivable_id is not null then
    select branch into v_branch from public.receivables where id = new.receivable_id;
  else
    select branch into v_branch from public.payables where id = new.payable_id;
  end if;
  if v_branch is null then
    return new;
  end if;

  update public.payments
  set reference_number = app.next_reference_no('PMT', v_branch, v_paid_at)
  where id = new.payment_id;
  return new;
end;
$$;

create trigger payment_allocations_assign_reference after insert on public.payment_allocations
  for each row execute function app.assign_payment_reference();

-- ----------------------------------------------------------------------------
-- 4. update_transaction_with_voucher — never rewrites the reference
-- ----------------------------------------------------------------------------
-- Same signature as 20260929000011, so queued offline calls still resolve;
-- p_reference_number is accepted and ignored.
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
  p_bank_account_id uuid default null
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
      description      = p_description,
      supplier_id      = p_supplier_id,
      cash_account     = p_cash_account,
      bank_account_id  = p_bank_account_id,
      expense_type     = p_expense_type,
      due_date         = p_due_date
  where id = p_transaction_id;
end;
$$;
