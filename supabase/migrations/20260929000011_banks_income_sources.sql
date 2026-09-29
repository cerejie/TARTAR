-- ============================================================================
-- Banks, income sources and petty cash (2026-09-29)
--
--   1. Banks master data: one global list of banks, each owning many accounts
--      (account name + number). A transaction paid from / deposited to a bank
--      records WHICH account through transactions.bank_account_id.
--   2. Income sources become DATA instead of the `app.income_source` enum,
--      exactly as expense categories did in 20260721000006.
--   3. Petty Cash joins Cash Drawer and Bank Account as a cash account. It
--      issues a cash voucher, like the drawer.
--   4. The disbursement RPCs take the bank account and stamp its label on the
--      voucher's check_bank so the printed check names the issuing account.
--
-- Nothing is dropped or renamed except the income_source enum type, whose
-- values survive verbatim as the seeded slugs.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Banks and bank accounts
-- ----------------------------------------------------------------------------
create table if not exists public.banks (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists banks_name_key on public.banks (lower(name));

create table if not exists public.bank_accounts (
  id             uuid primary key default gen_random_uuid(),
  bank_id        uuid not null references public.banks (id),
  account_name   text not null,
  account_number text not null,
  sort           int  not null default 0,
  -- false = archived: hidden from every payment picker, kept for history.
  active         boolean not null default true,
  created_at     timestamptz not null default now(),
  unique (bank_id, account_number)
);

create index if not exists bank_accounts_bank_idx on public.bank_accounts (bank_id);

alter table public.banks enable row level security;
alter table public.bank_accounts enable row level security;

create policy ref_read_banks on public.banks
  for select to authenticated using (true);
create policy ref_write_banks on public.banks
  for all to authenticated using (app.is_manager()) with check (app.is_manager());

create policy ref_read_bank_accounts on public.bank_accounts
  for select to authenticated using (true);
create policy ref_write_bank_accounts on public.bank_accounts
  for all to authenticated using (app.is_manager()) with check (app.is_manager());

create or replace function app.bank_account_label(p_bank_account_id uuid)
returns text
language sql stable security definer set search_path = public, app as $$
  select b.name || ' · ' || a.account_name || ' · ' || a.account_number
  from public.bank_accounts a
  join public.banks b on b.id = a.bank_id
  where a.id = p_bank_account_id;
$$;

-- ----------------------------------------------------------------------------
-- 2. Income sources table + transactions.income_source: enum -> FK
-- ----------------------------------------------------------------------------
create table if not exists public.income_sources (
  slug       text primary key check (slug ~ '^[a-z0-9_]+$'),
  name       text not null,
  sort       int  not null default 0,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.income_sources (slug, name, sort) values
  ('product_sales', 'Product Sales', 1),
  ('rental_income', 'Rental Income', 2)
on conflict (slug) do nothing;

alter table public.income_sources enable row level security;

create policy ref_read_income_sources on public.income_sources
  for select to authenticated using (true);
create policy ref_write_income_sources on public.income_sources
  for all to authenticated using (app.is_manager()) with check (app.is_manager());

alter table public.transactions
  alter column income_source type text using income_source::text;

alter table public.transactions
  add constraint transactions_income_source_fkey
  foreign key (income_source) references public.income_sources (slug);

drop type if exists app.income_source;

-- ----------------------------------------------------------------------------
-- 3. Petty cash + the bank account a transaction hit
-- ----------------------------------------------------------------------------
alter type app.cash_account add value if not exists 'petty_cash';

alter table public.transactions
  add column if not exists bank_account_id uuid references public.bank_accounts (id);

create index if not exists transactions_bank_account_idx
  on public.transactions (bank_account_id);

-- Every existing row has a null bank_account_id, so this validates instantly.
alter table public.transactions
  add constraint transactions_bank_account_requires_bank check (
    bank_account_id is null or cash_account = 'bank_account'
  );

-- ----------------------------------------------------------------------------
-- 4. Voucher sync: petty cash -> cash voucher, bank account -> check_bank
-- ----------------------------------------------------------------------------
-- A bank_account_id implies cash_account = 'bank_account' (constraint above),
-- which makes the voucher a check, so check_bank is always allowed here.
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
                       when 'petty_cash'   then 'cash'::app.voucher_type
                       else v.type
                     end,
      check_bank   = coalesce(app.bank_account_label(new.bank_account_id), v.check_bank),
      category     = app.voucher_category(new.type, new.expense_type)
  where v.transaction_id = new.id and v.status = 'pending' and not v.printed;
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- 5. create_transaction_with_voucher — with the bank account
-- ----------------------------------------------------------------------------
-- Dropped rather than replaced: a new parameter changes the function identity.
-- p_bank_account_id defaults to null, so queued offline calls still resolve.
drop function if exists public.create_transaction_with_voucher(
  app.transaction_type, text, date, numeric, text, text, text, uuid,
  app.cash_account, text, text, app.voucher_type, uuid, date,
  numeric, numeric, numeric, text
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
  p_bank_account_id uuid default null
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
      when 'petty_cash'   then 'cash'::app.voucher_type
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
     supplier_id, cash_account, bank_account_id, expense_type, due_date, created_by)
  values
    (p_type, p_branch, p_farm_section, p_txn_date, v_invoice, p_reference_number, p_description,
     p_supplier_id, p_cash_account, p_bank_account_id, p_expense_type, p_due_date, p_created_by)
  returning id into v_tx_id;

  insert into public.vouchers
    (type, branch, payee, amount, purpose, status, printed,
     created_by, transaction_id, supplier_id, category, due_date,
     particulars, gross_amount, ewt_rate, ewt_amount, less_return, check_bank)
  values
    (v_vtype, p_branch, v_payee, v_invoice - v_ewt - v_return, p_description, 'pending', false,
     p_created_by, v_tx_id, p_supplier_id, app.voucher_category(p_type, p_expense_type),
     p_due_date,
     nullif(trim(p_particulars), ''), v_invoice, v_rate, v_ewt, v_return,
     case when v_vtype = 'check' then app.bank_account_label(p_bank_account_id) end);

  return v_tx_id;
end;
$$;

grant execute on function public.create_transaction_with_voucher(
  app.transaction_type, text, date, numeric, text, text, text, uuid,
  app.cash_account, text, text, app.voucher_type, uuid, date,
  numeric, numeric, numeric, text, uuid
) to authenticated;

-- ----------------------------------------------------------------------------
-- 6. update_transaction_with_voucher — with the bank account
-- ----------------------------------------------------------------------------
drop function if exists public.update_transaction_with_voucher(
  uuid, text, date, numeric, text, text, text, uuid,
  app.cash_account, text, date, numeric, numeric, numeric, text
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
      reference_number = p_reference_number,
      description      = p_description,
      supplier_id      = p_supplier_id,
      cash_account     = p_cash_account,
      bank_account_id  = p_bank_account_id,
      expense_type     = p_expense_type,
      due_date         = p_due_date
  where id = p_transaction_id;
end;
$$;

grant execute on function public.update_transaction_with_voucher(
  uuid, text, date, numeric, text, text, text, uuid,
  app.cash_account, text, date, numeric, numeric, numeric, text, uuid
) to authenticated;
