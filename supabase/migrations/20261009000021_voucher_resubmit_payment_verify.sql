-- ============================================================================
-- Voucher resubmit + payment verification (2026-09-30)
--
--   1. vouchers.rejection_reason: a rejected voucher carries the reviewer's
--      reason (NOT VALID, so vouchers rejected before today keep a null one).
--   2. A rejected voucher may move back to pending, and nowhere else.
--      update_transaction_with_voucher reopens the rejected voucher of the
--      expense or purchase it edits (employee in the branch, or a manager),
--      clearing the approver and the reason, so a correction is resubmitted
--      for approval like a rejected sale.
--   3. A pending payment no longer reduces the receivable or payable balance.
--      record_ledger_payment applies only self-verified (manager) payments and
--      counts pending allocations against the remaining balance;
--      verify_payment applies a pending payment; reject_payment reverses a
--      payment only if it had been verified.
--   4. Backfill: allocations of payments still pending are taken back out of
--      paid_amount, and the ledger status is recomputed.
--   Nothing is dropped or renamed.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. vouchers.rejection_reason
-- ----------------------------------------------------------------------------
alter table public.vouchers
  add column if not exists rejection_reason text;

alter table public.vouchers
  add constraint vouchers_rejection_reason
    check (status <> 'rejected' or rejection_reason is not null) not valid;

-- ----------------------------------------------------------------------------
-- 2. Resubmitting a rejected voucher
-- ----------------------------------------------------------------------------
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
    if new.status <> 'pending' or new.printed then
      raise exception 'A rejected voucher can only be resubmitted';
    end if;
  end if;
  return new;
end;
$$;

create or replace function app.reopen_rejected_voucher(p_transaction_id uuid)
returns void
language plpgsql security definer set search_path = public, app as $$
declare
  v_voucher public.vouchers%rowtype;
begin
  select * into v_voucher from public.vouchers
  where transaction_id = p_transaction_id for update;
  if not found or v_voucher.status <> 'rejected' then
    return;
  end if;
  if not (app.is_manager()
          or (app.user_role() = 'employee' and app.can_see_branch(v_voucher.branch))) then
    raise exception 'You are not allowed to resubmit this voucher';
  end if;

  update public.vouchers
  set status           = 'pending',
      approved_by      = null,
      approved_at      = null,
      rejection_reason = null
  where id = v_voucher.id;
end;
$$;

revoke execute on function app.reopen_rejected_voucher(uuid) from public;
grant execute on function app.reopen_rejected_voucher(uuid) to authenticated;

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

  perform app.reopen_rejected_voucher(p_transaction_id);

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

-- ----------------------------------------------------------------------------
-- 3. Payments reduce the balance only once verified
-- ----------------------------------------------------------------------------
create or replace function app.pending_allocated(p_ledger_id uuid) returns numeric
language sql stable as $$
  select coalesce(sum(a.amount), 0)
  from public.payment_allocations a
  join public.payments p on p.id = a.payment_id
  where p.status = 'pending'
    and (a.receivable_id = p_ledger_id or a.payable_id = p_ledger_id);
$$;

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
    if v_alloc.amount > v_amount - v_paid - app.pending_allocated(v_alloc.ledger_id) then
      raise exception 'Allocation exceeds the remaining balance of a record (pending payments included)';
    end if;

    v_new_paid := v_paid + v_alloc.amount;
    if p_kind = 'receivable' then
      if v_self_verify then
        update public.receivables
        set paid_amount = v_new_paid,
            status = case when v_new_paid >= amount then 'paid'::app.ledger_status
                          else 'partial'::app.ledger_status end
        where id = v_alloc.ledger_id;
      end if;
      insert into public.payment_allocations (payment_id, receivable_id, amount)
      values (v_payment_id, v_alloc.ledger_id, v_alloc.amount);
    else
      if v_self_verify then
        update public.payables
        set paid_amount = v_new_paid,
            status = case when v_new_paid >= amount then 'paid'::app.ledger_status
                          else 'partial'::app.ledger_status end
        where id = v_alloc.ledger_id;
      end if;
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

create or replace function public.verify_payment(p_payment_id uuid) returns void
language plpgsql as $$
declare
  v_payment public.payments%rowtype;
  v_alloc record;
  v_amount numeric;
  v_paid numeric;
  v_new_paid numeric;
begin
  if not app.is_manager() then
    raise exception 'Only an admin can verify payments';
  end if;

  select * into v_payment from public.payments where id = p_payment_id for update;
  if not found then
    raise exception 'Payment not found';
  end if;
  if v_payment.status <> 'pending' then
    raise exception 'This payment is already %', v_payment.status;
  end if;

  for v_alloc in
    select receivable_id, payable_id, amount
    from public.payment_allocations where payment_id = p_payment_id
  loop
    if v_alloc.receivable_id is not null then
      select amount, paid_amount into v_amount, v_paid
        from public.receivables where id = v_alloc.receivable_id for update;
    else
      select amount, paid_amount into v_amount, v_paid
        from public.payables where id = v_alloc.payable_id for update;
    end if;
    if v_alloc.amount > v_amount - v_paid then
      raise exception 'This payment exceeds the remaining balance of a record';
    end if;

    v_new_paid := v_paid + v_alloc.amount;
    if v_alloc.receivable_id is not null then
      update public.receivables
      set paid_amount = v_new_paid,
          status = case when v_new_paid >= amount then 'paid'::app.ledger_status
                        else 'partial'::app.ledger_status end
      where id = v_alloc.receivable_id;
    else
      update public.payables
      set paid_amount = v_new_paid,
          status = case when v_new_paid >= amount then 'paid'::app.ledger_status
                        else 'partial'::app.ledger_status end
      where id = v_alloc.payable_id;
    end if;
  end loop;

  update public.payments
  set status = 'verified',
      verified_by = coalesce(app.user_id(), auth.uid()),
      verified_at = now()
  where id = p_payment_id;
end;
$$;

revoke execute on function public.verify_payment(uuid) from public;
grant execute on function public.verify_payment(uuid) to authenticated;

create or replace function public.reject_payment(p_payment_id uuid) returns void
language plpgsql as $$
declare
  v_payment public.payments%rowtype;
  v_alloc record;
begin
  select * into v_payment from public.payments where id = p_payment_id for update;
  if not found then
    raise exception 'Payment not found';
  end if;
  if v_payment.status = 'rejected' then
    raise exception 'This payment is already rejected';
  end if;

  if v_payment.status = 'verified' then
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
        where id = v_alloc.receivable_id;
      else
        update public.payables
        set paid_amount = greatest(paid_amount - v_alloc.amount, 0),
            status = case
              when greatest(paid_amount - v_alloc.amount, 0) >= amount then 'paid'::app.ledger_status
              when greatest(paid_amount - v_alloc.amount, 0) > 0 then 'partial'::app.ledger_status
              else 'open'::app.ledger_status
            end
        where id = v_alloc.payable_id;
      end if;
    end loop;
  end if;

  update public.payments
  set status = 'rejected',
      verified_by = coalesce(app.user_id(), auth.uid()),
      verified_at = now()
  where id = p_payment_id;
end;
$$;

-- ----------------------------------------------------------------------------
-- 4. Backfill: pending payments leave the balances
-- ----------------------------------------------------------------------------
update public.receivables r
set paid_amount = greatest(r.paid_amount - pending.amount, 0),
    status = case
      when greatest(r.paid_amount - pending.amount, 0) >= r.amount then 'paid'::app.ledger_status
      when greatest(r.paid_amount - pending.amount, 0) > 0 then 'partial'::app.ledger_status
      else 'open'::app.ledger_status
    end
from (
  select a.receivable_id, sum(a.amount) as amount
  from public.payment_allocations a
  join public.payments p on p.id = a.payment_id
  where p.status = 'pending' and a.receivable_id is not null
  group by a.receivable_id
) pending
where pending.receivable_id = r.id;

update public.payables pb
set paid_amount = greatest(pb.paid_amount - pending.amount, 0),
    status = case
      when greatest(pb.paid_amount - pending.amount, 0) >= pb.amount then 'paid'::app.ledger_status
      when greatest(pb.paid_amount - pending.amount, 0) > 0 then 'partial'::app.ledger_status
      else 'open'::app.ledger_status
    end
from (
  select a.payable_id, sum(a.amount) as amount
  from public.payment_allocations a
  join public.payments p on p.id = a.payment_id
  where p.status = 'pending' and a.payable_id is not null
  group by a.payable_id
) pending
where pending.payable_id = pb.id;
