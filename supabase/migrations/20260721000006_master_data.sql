-- ============================================================================
-- Master Data (2026-07-21)
--
--   1. Suppliers gain the fields the master-data screen manages
--      (contact person, address) on top of name/contact.
--   2. Expense categories become DATA instead of the `app.expense_type` enum,
--      so managers can create/rename/archive them at runtime. Each category
--      owns its 3-letter voucher category code (ELC, WTR, SAL, …) — the code
--      that `app.next_voucher_no` counts against — so the code moves out of the
--      hardcoded CASE in `app.voucher_category` and into the table.
--
-- The seven seeded categories keep their existing slugs AND codes, so every
-- historical transaction and every voucher number issued so far stays valid.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Suppliers: complete master record
-- ----------------------------------------------------------------------------
alter table public.suppliers
  add column if not exists contact_person text,
  add column if not exists address text;

-- ----------------------------------------------------------------------------
-- 2. Expense categories table
-- ----------------------------------------------------------------------------
create table if not exists public.expense_categories (
  slug       text primary key check (slug ~ '^[a-z0-9_]+$'),
  name       text not null,
  -- Voucher numbering category. Unique because voucher_counters is keyed on
  -- (branch, category, year) — two categories sharing a code would share a
  -- sequence and hand out colliding voucher numbers.
  code       text not null unique check (code ~ '^[A-Z]{3}$'),
  sort       int  not null default 0,
  -- false = archived: hidden from the expense form, kept for historical rows.
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.expense_categories (slug, name, code, sort) values
  ('electricity',         'Electricity',           'ELC', 1),
  ('water',               'Water',                 'WTR', 2),
  ('internet',            'Internet',              'INT', 3),
  ('salaries',            'Salaries',              'SAL', 4),
  ('office_supplies',     'Office Supplies',       'OFS', 5),
  ('repairs_maintenance', 'Repairs & Maintenance', 'RPM', 6),
  ('taxes',               'Taxes',                 'TAX', 7)
on conflict (slug) do nothing;

alter table public.expense_categories enable row level security;

create policy ref_read_expense_categories on public.expense_categories
  for select to authenticated using (true);
create policy ref_write_expense_categories on public.expense_categories
  for all to authenticated using (app.is_manager()) with check (app.is_manager());

-- ----------------------------------------------------------------------------
-- 3. transactions.expense_type: enum -> FK to expense_categories
-- ----------------------------------------------------------------------------
-- The two functions below take `app.expense_type` in their signatures, so they
-- must be dropped before the type can go (argument types are part of a
-- function's identity — `create or replace` cannot change them).
drop function if exists public.create_transaction_with_voucher(
  app.transaction_type, text, date, numeric, text, text, text, uuid,
  app.cash_account, app.expense_type, text, app.voucher_type, uuid
);
drop function if exists app.voucher_category(app.transaction_type, app.expense_type);

alter table public.transactions
  alter column expense_type type text using expense_type::text;

alter table public.transactions
  add constraint transactions_expense_type_fkey
  foreign key (expense_type) references public.expense_categories (slug);

drop type if exists app.expense_type;

-- ----------------------------------------------------------------------------
-- 4. Voucher category lookup, now table-driven
-- ----------------------------------------------------------------------------
-- STABLE (not IMMUTABLE): it reads a table now. 'EXP' remains the fallback for
-- an expense whose category was somehow not found, matching the old CASE.
create or replace function app.voucher_category(
  p_type app.transaction_type,
  p_expense_type text
) returns text
language sql stable as $$
  select case
    when p_type = 'purchase' then 'PUR'
    when p_type = 'expense' then coalesce(
      (select code from public.expense_categories where slug = p_expense_type),
      'EXP'
    )
    else 'GEN'
  end;
$$;

-- Recreated only so it binds to the new text-argument overload explicitly; the
-- body is unchanged from 20260718000004.
create or replace function app.sync_voucher_from_tx() returns trigger
language plpgsql security definer set search_path = public, app as $$
begin
  update public.vouchers v
  set amount  = new.amount,
      branch  = new.branch,
      purpose = new.description,
      type    = case new.cash_account
                  when 'bank_account' then 'check'::app.voucher_type
                  when 'cash_drawer'  then 'cash'::app.voucher_type
                  else v.type
                end,
      category = app.voucher_category(new.type, new.expense_type)
  where v.transaction_id = new.id and v.status = 'pending' and not v.printed;
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- 5. create_transaction_with_voucher — same body, p_expense_type is now text
-- ----------------------------------------------------------------------------
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
  p_created_by uuid default null
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
     supplier_id, cash_account, expense_type, created_by)
  values
    (p_type, p_branch, p_farm_section, p_txn_date, p_amount, p_reference_number, p_description,
     p_supplier_id, p_cash_account, p_expense_type, p_created_by)
  returning id into v_tx_id;

  insert into public.vouchers
    (type, branch, payee, amount, purpose, status, printed,
     created_by, transaction_id, supplier_id, category)
  values
    (v_vtype, p_branch, v_payee, p_amount, p_description, 'pending', false,
     p_created_by, v_tx_id, p_supplier_id, app.voucher_category(p_type, p_expense_type));

  return v_tx_id;
end;
$$;

grant execute on function public.create_transaction_with_voucher(
  app.transaction_type, text, date, numeric, text, text, text, uuid,
  app.cash_account, text, text, app.voucher_type, uuid
) to authenticated;
