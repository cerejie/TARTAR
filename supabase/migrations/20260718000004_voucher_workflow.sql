-- ============================================================================
-- Voucher workflow (client decisions, 2026-07-18)
-- ----------------------------------------------------------------------------
--   1. Purchases/Expenses auto-generate a pending voucher (one RPC, atomic).
--   2. Voucher numbering: [branch prefix]-[category]-[year]-[8 digits], with
--      per-(branch, category, year) counters. Prefix is configurable per branch;
--      changing it never rewrites stored voucher numbers.
--   3. Category codes: PUR (purchase), one code per expense type (ELC, WTR,
--      INT, SAL, OFS, RPM, TAX), GEN for manual vouchers.
--   4. Transactions with a pending voucher stay editable (employees included,
--      with a full edit audit trail); approved/printed vouchers lock the
--      transaction for EVERYONE (managers included) via triggers.
--   5. Customer payments: one payment allocated across selected receivables
--      (payments + receivable_payments + record_customer_payment RPC).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Branch voucher prefix (3 uppercase letters, configurable in settings)
-- ----------------------------------------------------------------------------
alter table public.branches
  add column if not exists voucher_prefix text not null default 'TTR'
  check (voucher_prefix ~ '^[A-Z]{3}$');

update public.branches set voucher_prefix = 'LGC' where slug = 'hardware';
update public.branches set voucher_prefix = 'LGR' where slug = 'rental';
update public.branches set voucher_prefix = 'AFC' where slug = 'woodworks';
update public.branches set voucher_prefix = 'FRM' where slug = 'farm';

-- ----------------------------------------------------------------------------
-- 2. Voucher ↔ transaction linkage + category + optional supplier
-- ----------------------------------------------------------------------------
alter table public.vouchers
  add column if not exists transaction_id uuid unique
    references public.transactions (id) on delete cascade,
  add column if not exists supplier_id uuid references public.suppliers (id),
  add column if not exists category text not null default 'GEN'
    check (category ~ '^[A-Z]{3}$');

-- ----------------------------------------------------------------------------
-- 3. Voucher numbering
-- ----------------------------------------------------------------------------
create table public.voucher_counters (
  branch   text not null references public.branches (slug),
  category text not null,
  year     int  not null,
  last_no  bigint not null default 0,
  primary key (branch, category, year)
);
alter table public.voucher_counters enable row level security;
-- Only touched from within the numbering function (security definer); no
-- direct client access.

create or replace function app.voucher_category(
  p_type app.transaction_type,
  p_expense_type app.expense_type
) returns text
language sql immutable as $$
  select case
    when p_type = 'purchase' then 'PUR'
    when p_type = 'expense' then case p_expense_type
      when 'electricity'         then 'ELC'
      when 'water'               then 'WTR'
      when 'internet'            then 'INT'
      when 'salaries'            then 'SAL'
      when 'office_supplies'     then 'OFS'
      when 'repairs_maintenance' then 'RPM'
      when 'taxes'               then 'TAX'
      else 'EXP'
    end
    else 'GEN'
  end;
$$;

-- Atomic per-(branch, category, year) increment. SECURITY DEFINER because the
-- counters table has no client policies; the row lock taken by the upsert
-- serialises concurrent inserts so numbers are gapless and unique.
create or replace function app.next_voucher_no(
  p_branch text,
  p_category text,
  p_date date
) returns text
language plpgsql security definer set search_path = public, app as $$
declare
  v_year int := extract(year from coalesce(p_date, current_date))::int;
  v_no bigint;
  v_prefix text;
begin
  select voucher_prefix into v_prefix from public.branches where slug = p_branch;
  insert into public.voucher_counters as c (branch, category, year, last_no)
  values (p_branch, p_category, v_year, 1)
  on conflict (branch, category, year)
  do update set last_no = c.last_no + 1
  returning last_no into v_no;
  return format('%s-%s-%s-%s', coalesce(v_prefix, 'TTR'), p_category, v_year, lpad(v_no::text, 8, '0'));
end;
$$;

-- Assign the number on insert (year taken from the source transaction's date
-- so backdated purchases number into their own year).
create or replace function app.assign_voucher_no() returns trigger
language plpgsql security definer set search_path = public, app as $$
declare
  v_date date;
begin
  if new.voucher_no is null then
    select txn_date into v_date from public.transactions where id = new.transaction_id;
    new.voucher_no := app.next_voucher_no(new.branch, new.category, coalesce(v_date, current_date));
  end if;
  return new;
end;
$$;

create trigger vouchers_assign_no before insert on public.vouchers
  for each row execute function app.assign_voucher_no();

-- ----------------------------------------------------------------------------
-- 4. Locking: approved/printed vouchers freeze themselves and their transaction
-- ----------------------------------------------------------------------------
-- Vouchers: pending rows are freely editable (approval flips them); approved
-- rows may ONLY change `printed`; rejected rows are immutable. Deleting is
-- only possible while pending (the transaction cascade goes through the same
-- gate because the transaction itself locks below).
create or replace function app.guard_voucher_change() returns trigger
language plpgsql as $$
begin
  if tg_op = 'DELETE' then
    if old.status <> 'pending' or old.printed then
      raise exception 'This voucher is % and can no longer be deleted', old.status;
    end if;
    return old;
  end if;
  if old.status = 'approved' then
    if to_jsonb(new) - 'printed' is distinct from to_jsonb(old) - 'printed' then
      raise exception 'An approved voucher can only be marked printed';
    end if;
  elsif old.status = 'rejected' then
    raise exception 'A rejected voucher can no longer be changed';
  end if;
  return new;
end;
$$;

create trigger vouchers_guard before update or delete on public.vouchers
  for each row execute function app.guard_voucher_change();

-- Transactions: locked (even for managers) once their voucher left `pending`
-- or was printed — preserves the accounting record.
create or replace function app.guard_tx_change() returns trigger
language plpgsql security definer set search_path = public, app as $$
begin
  if exists (
    select 1 from public.vouchers v
    where v.transaction_id = old.id and (v.status <> 'pending' or v.printed)
  ) then
    raise exception 'This transaction is locked: its voucher has been approved or printed';
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create trigger transactions_guard before update or delete on public.transactions
  for each row execute function app.guard_tx_change();

-- ----------------------------------------------------------------------------
-- 5. Edit history (audit trail) for transactions
-- ----------------------------------------------------------------------------
create table public.transaction_audit (
  id             uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.transactions (id) on delete cascade,
  edited_by      uuid,
  edited_at      timestamptz not null default now(),
  -- { column: { old: …, new: … } } for every changed column.
  changes        jsonb not null
);
create index transaction_audit_tx_idx on public.transaction_audit (transaction_id, edited_at);
alter table public.transaction_audit enable row level security;

-- Readable wherever the underlying transaction is readable (the subquery runs
-- under the caller's own RLS on transactions). Writes happen only via trigger.
create policy tx_audit_read on public.transaction_audit
  for select to authenticated
  using (exists (select 1 from public.transactions t where t.id = transaction_id));

create or replace function app.audit_tx_update() returns trigger
language plpgsql security definer set search_path = public, app as $$
declare
  v_changes jsonb;
begin
  select jsonb_object_agg(o.key, jsonb_build_object('old', o.value, 'new', n.value))
    into v_changes
  from jsonb_each(to_jsonb(old)) o
  join jsonb_each(to_jsonb(new)) n on n.key = o.key
  where o.value is distinct from n.value
    and o.key not in ('created_at');
  if v_changes is not null then
    insert into public.transaction_audit (transaction_id, edited_by, changes)
    values (old.id, coalesce(app.user_id(), auth.uid()), v_changes);
  end if;
  return new;
end;
$$;

create trigger transactions_audit after update on public.transactions
  for each row execute function app.audit_tx_update();

-- Employees may now edit transactions in their branches (pending-voucher rows
-- only in practice — the lock trigger blocks the rest).
create policy tx_employee_update on public.transactions
  for update to authenticated
  using (app.user_role() = 'employee' and app.can_see_branch(branch))
  with check (app.user_role() = 'employee' and app.can_see_branch(branch));

-- Keep the linked pending voucher in step with its transaction after edits
-- (amount/purpose/branch/type). SECURITY DEFINER so employee edits sync the
-- voucher even though employees have no voucher UPDATE policy of their own.
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

create trigger transactions_sync_voucher after update on public.transactions
  for each row execute function app.sync_voucher_from_tx();

-- ----------------------------------------------------------------------------
-- 6. Create purchase/expense + its pending voucher atomically
-- ----------------------------------------------------------------------------
-- SECURITY INVOKER (default): the caller's RLS still applies to both inserts,
-- so employees stay branch-scoped and vouchers start pending/unprinted.
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
  p_expense_type app.expense_type default null,
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
  app.cash_account, app.expense_type, text, app.voucher_type, uuid
) to authenticated;

-- ----------------------------------------------------------------------------
-- 7. Ledger payments (receivable + payable) with verification
-- ----------------------------------------------------------------------------
-- Client decisions 2026-07: an employee-recorded payment applies to the ledger
-- balance IMMEDIATELY but stays "pending" until a manager confirms it
-- (terminology: receivables are *verified*, payables are *approved* — same
-- machinery, different label in the UI). A manager's own payments confirm
-- themselves. Rejection reverses the balances but keeps the row for audit.
create type app.payment_kind   as enum ('receivable', 'payable');
create type app.payment_status as enum ('pending', 'verified', 'rejected');

create table public.payments (
  id               uuid primary key default gen_random_uuid(),
  kind             app.payment_kind not null,
  customer_id      uuid references public.customers (id),
  supplier_id      uuid references public.suppliers (id),
  party_name       text not null,
  amount           numeric(14,2) not null check (amount > 0),
  paid_at          date not null default current_date,
  reference_number text,
  status           app.payment_status not null default 'pending',
  verified_by      uuid,
  verified_at      timestamptz,
  created_by       uuid,
  created_at       timestamptz not null default now(),
  constraint payments_party_scope check (
    (kind = 'receivable' and supplier_id is null) or
    (kind = 'payable' and customer_id is null)
  )
);
create index payments_kind_status_idx on public.payments (kind, status, paid_at);
create index payments_customer_idx on public.payments (customer_id, paid_at);
create index payments_supplier_idx on public.payments (supplier_id, paid_at);

create table public.payment_allocations (
  id            uuid primary key default gen_random_uuid(),
  payment_id    uuid not null references public.payments (id) on delete cascade,
  receivable_id uuid references public.receivables (id),
  payable_id    uuid references public.payables (id),
  amount        numeric(14,2) not null check (amount > 0),
  -- exactly one side per allocation row
  constraint allocation_one_target check ((receivable_id is null) <> (payable_id is null))
);
create index payment_allocations_rcv_idx on public.payment_allocations (receivable_id);
create index payment_allocations_pay_idx on public.payment_allocations (payable_id);

alter table public.payments enable row level security;
alter table public.payment_allocations enable row level security;

-- All staff read payment history. Employees may only insert PENDING payments
-- (managers may insert any status — their own payments self-verify). Updates
-- (verify) and deletes are manager-only; rejection goes through its RPC.
create policy pmt_read on public.payments
  for select to authenticated using (true);
create policy pmt_insert on public.payments
  for insert to authenticated
  with check (
    app.is_manager()
    or (app.user_role() = 'employee' and status = 'pending')
  );
create policy pmt_manager_update on public.payments
  for update to authenticated using (app.is_manager()) with check (app.is_manager());
create policy pmt_manager_delete on public.payments
  for delete to authenticated using (app.is_manager());

create policy alloc_read on public.payment_allocations
  for select to authenticated using (true);
create policy alloc_insert on public.payment_allocations
  for insert to authenticated
  with check (app.is_manager() or app.user_role() = 'employee');
create policy alloc_manager_delete on public.payment_allocations
  for delete to authenticated using (app.is_manager());

-- One payment settling several receivables/payables, atomically. SECURITY
-- INVOKER: the ledger updates run under the caller's own branch-scoped RLS.
-- p_allocations: [{ "ledger_id": uuid, "amount": number }, …]
create or replace function public.record_ledger_payment(
  p_kind app.payment_kind,
  p_party_id uuid,
  p_party_name text,
  p_amount numeric,
  p_paid_at date,
  p_reference_number text,
  p_allocations jsonb,
  p_created_by uuid default null
) returns uuid
language plpgsql as $$
declare
  v_payment_id uuid;
  v_alloc record;
  v_total numeric := 0;
  v_amount numeric;
  v_paid numeric;
  v_new_paid numeric;
  v_self_verify boolean := app.is_manager();
begin
  if p_allocations is null or jsonb_array_length(p_allocations) = 0 then
    raise exception 'Select at least one record to pay';
  end if;

  insert into public.payments
    (kind, customer_id, supplier_id, party_name, amount, paid_at, reference_number,
     status, verified_by, verified_at, created_by)
  values
    (p_kind,
     case when p_kind = 'receivable' then p_party_id end,
     case when p_kind = 'payable' then p_party_id end,
     p_party_name, p_amount, p_paid_at, p_reference_number,
     case when v_self_verify then 'verified'::app.payment_status else 'pending' end,
     case when v_self_verify then coalesce(app.user_id(), auth.uid()) end,
     case when v_self_verify then now() end,
     p_created_by)
  returning id into v_payment_id;

  for v_alloc in
    select (a->>'ledger_id')::uuid as ledger_id, (a->>'amount')::numeric as amount
    from jsonb_array_elements(p_allocations) a
  loop
    if v_alloc.amount is null or v_alloc.amount <= 0 then
      raise exception 'Allocation amounts must be greater than zero';
    end if;

    if p_kind = 'receivable' then
      select amount, paid_amount into v_amount, v_paid
        from public.receivables where id = v_alloc.ledger_id for update;
    else
      select amount, paid_amount into v_amount, v_paid
        from public.payables where id = v_alloc.ledger_id for update;
    end if;
    if not found then
      raise exception 'Record not found (or not accessible)';
    end if;
    if v_alloc.amount > v_amount - v_paid then
      raise exception 'Allocation exceeds the remaining balance of a record';
    end if;

    v_new_paid := v_paid + v_alloc.amount;
    if p_kind = 'receivable' then
      update public.receivables
      set paid_amount = v_new_paid,
          status = case when v_new_paid >= amount then 'paid'::app.ledger_status
                        else 'partial'::app.ledger_status end
      where id = v_alloc.ledger_id;
      insert into public.payment_allocations (payment_id, receivable_id, amount)
      values (v_payment_id, v_alloc.ledger_id, v_alloc.amount);
    else
      update public.payables
      set paid_amount = v_new_paid,
          status = case when v_new_paid >= amount then 'paid'::app.ledger_status
                        else 'partial'::app.ledger_status end
      where id = v_alloc.ledger_id;
      insert into public.payment_allocations (payment_id, payable_id, amount)
      values (v_payment_id, v_alloc.ledger_id, v_alloc.amount);
    end if;

    v_total := v_total + v_alloc.amount;
  end loop;

  if v_total <> p_amount then
    raise exception 'Allocations (%) must add up to the payment amount (%)', v_total, p_amount;
  end if;

  return v_payment_id;
end;
$$;

grant execute on function public.record_ledger_payment(
  app.payment_kind, uuid, text, numeric, date, text, jsonb, uuid
) to authenticated;

-- Reject a payment: reverse every allocation on the ledger rows, keep the
-- payment as an audit record. Manager-only in effect — SECURITY INVOKER means
-- the status update hits the manager-only pmt_manager_update policy.
create or replace function public.reject_payment(p_payment_id uuid) returns void
language plpgsql as $$
declare
  v_payment public.payments%rowtype;
  v_alloc record;
  v_new_paid numeric;
begin
  select * into v_payment from public.payments where id = p_payment_id for update;
  if not found then
    raise exception 'Payment not found';
  end if;
  if v_payment.status = 'rejected' then
    raise exception 'This payment is already rejected';
  end if;

  for v_alloc in
    select receivable_id, payable_id, amount
    from public.payment_allocations where payment_id = p_payment_id
  loop
    if v_alloc.receivable_id is not null then
      update public.receivables
      set paid_amount = greatest(paid_amount - v_alloc.amount, 0),
          status = case
            when greatest(paid_amount - v_alloc.amount, 0) >= amount then 'paid'::app.ledger_status
            when greatest(paid_amount - v_alloc.amount, 0) > 0 then 'partial'::app.ledger_status
            else 'open'::app.ledger_status
          end
      where id = v_alloc.receivable_id
      returning paid_amount into v_new_paid;
    else
      update public.payables
      set paid_amount = greatest(paid_amount - v_alloc.amount, 0),
          status = case
            when greatest(paid_amount - v_alloc.amount, 0) >= amount then 'paid'::app.ledger_status
            when greatest(paid_amount - v_alloc.amount, 0) > 0 then 'partial'::app.ledger_status
            else 'open'::app.ledger_status
          end
      where id = v_alloc.payable_id
      returning paid_amount into v_new_paid;
    end if;
  end loop;

  update public.payments
  set status = 'rejected',
      verified_by = coalesce(app.user_id(), auth.uid()),
      verified_at = now()
  where id = p_payment_id;
end;
$$;

grant execute on function public.reject_payment(uuid) to authenticated;
