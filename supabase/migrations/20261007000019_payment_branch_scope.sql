-- ============================================================================
-- Payment branch scope (2026-09-30)
--
--   1. public.payments gains a branch, backfilled from the receivable or
--      payable each payment settles. A payment belongs to exactly one branch.
--   2. record_ledger_payment stamps that branch and refuses allocations that
--      span branches; mark_payable_paid stamps the payable's branch.
--   3. Payments and their allocations are readable by managers, and by
--      accountants and employees only within app.can_see_branch().
--   Nothing is dropped or renamed.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. payments.branch
-- ----------------------------------------------------------------------------
alter table public.payments
  add column if not exists branch text references public.branches (slug);

update public.payments p
set branch = settled.branch
from (
  select a.payment_id, min(coalesce(r.branch, pb.branch)) as branch
  from public.payment_allocations a
  left join public.receivables r on r.id = a.receivable_id
  left join public.payables pb on pb.id = a.payable_id
  group by a.payment_id
) settled
where settled.payment_id = p.id
  and p.branch is null;

create index if not exists payments_branch_kind_idx
  on public.payments (branch, kind, paid_at);

-- ----------------------------------------------------------------------------
-- 2. record_ledger_payment + mark_payable_paid
-- ----------------------------------------------------------------------------
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
  v_branch text;
  v_branch_count integer;
begin
  if p_allocations is null or jsonb_array_length(p_allocations) = 0 then
    raise exception 'Select at least one record to pay';
  end if;

  if p_kind = 'receivable' then
    select count(distinct r.branch), min(r.branch) into v_branch_count, v_branch
    from jsonb_array_elements(p_allocations) a
    join public.receivables r on r.id = (a->>'ledger_id')::uuid;
  else
    select count(distinct pb.branch), min(pb.branch) into v_branch_count, v_branch
    from jsonb_array_elements(p_allocations) a
    join public.payables pb on pb.id = (a->>'ledger_id')::uuid;
  end if;

  if v_branch_count = 0 then
    raise exception 'Record not found (or not accessible)';
  end if;
  if v_branch_count > 1 then
    raise exception 'Pay one branch at a time';
  end if;

  insert into public.payments
    (kind, customer_id, supplier_id, party_name, amount, paid_at, reference_number,
     status, verified_by, verified_at, created_by, branch)
  values
    (p_kind,
     case when p_kind = 'receivable' then p_party_id end,
     case when p_kind = 'payable' then p_party_id end,
     p_party_name, p_amount, p_paid_at, p_reference_number,
     case when v_self_verify then 'verified'::app.payment_status else 'pending' end,
     case when v_self_verify then coalesce(app.user_id(), auth.uid()) end,
     case when v_self_verify then now() end,
     p_created_by,
     v_branch)
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
     verified_at, created_by, cash_account, bank_account_id, branch)
  values
    ('payable', v_payable.supplier_id, v_payable.supplier_name, v_balance,
     coalesce(p_paid_at, current_date), 'verified',
     coalesce(app.user_id(), auth.uid()), now(), p_created_by, p_cash_account,
     case when p_cash_account = 'bank_account' then p_bank_account_id end,
     v_payable.branch)
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
-- 3. Branch-scoped read policies
-- ----------------------------------------------------------------------------
drop policy if exists pmt_read on public.payments;
create policy pmt_read on public.payments
  for select to authenticated
  using (app.is_manager() or app.can_see_branch(branch));

drop policy if exists pmt_insert on public.payments;
create policy pmt_insert on public.payments
  for insert to authenticated
  with check (
    app.is_manager()
    or (
      app.user_role() = 'employee'
      and status = 'pending'
      and app.can_see_branch(branch)
    )
  );

drop policy if exists alloc_read on public.payment_allocations;
create policy alloc_read on public.payment_allocations
  for select to authenticated
  using (exists (select 1 from public.payments p where p.id = payment_id));
