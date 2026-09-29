-- ============================================================================
-- Voucher signatories + purchases paid in a period (2026-09-29)
--
--   1. voucher_signatories returns the full name of the user who prepared and
--      the user who approved each voucher, for the voucher print. Employees
--      and accountants cannot read public.users, so this is SECURITY DEFINER
--      and only answers for vouchers on a branch the caller can see.
--   2. purchase_ids_paid_between lists the purchases paid within a date range:
--      a purchase whose payable is fully paid, dated by its last payment, or a
--      purchase with no due date (paid outright), dated by its invoice date.
--      SECURITY INVOKER, so the caller's RLS still applies.
--   Nothing is dropped or renamed.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. voucher_signatories
-- ----------------------------------------------------------------------------
create or replace function public.voucher_signatories(p_voucher_ids uuid[])
returns table (voucher_id uuid, prepared_by text, approved_by text)
language sql stable security definer set search_path = public, app as $$
  select
    v.id,
    coalesce(nullif(trim(creator.full_name), ''), creator.username),
    coalesce(nullif(trim(approver.full_name), ''), approver.username)
  from public.vouchers v
  left join public.users creator on creator.id = v.created_by
  left join public.users approver on approver.id = v.approved_by
  where v.id = any (p_voucher_ids)
    and app.can_see_branch(v.branch);
$$;

revoke execute on function public.voucher_signatories(uuid[]) from public;
grant execute on function public.voucher_signatories(uuid[]) to authenticated;

-- ----------------------------------------------------------------------------
-- 2. purchase_ids_paid_between
-- ----------------------------------------------------------------------------
create or replace function public.purchase_ids_paid_between(
  p_from date default null,
  p_to date default null
) returns setof uuid
language sql stable security invoker set search_path = public, app as $$
  with paid_on as (
    select t.id, t.txn_date as paid_date
    from public.transactions t
    where t.type = 'purchase'
      and t.due_date is null
    union all
    select t.id, max(pm.paid_at) as paid_date
    from public.transactions t
    join public.vouchers v on v.transaction_id = t.id
    join public.payables pb on pb.id = v.payable_id
    join public.payment_allocations pa on pa.payable_id = pb.id
    join public.payments pm on pm.id = pa.payment_id
    where t.type = 'purchase'
      and pb.status = 'paid'
    group by t.id
  )
  select id
  from paid_on
  where (p_from is null or paid_date >= p_from)
    and (p_to is null or paid_date <= p_to);
$$;

revoke execute on function public.purchase_ids_paid_between(date, date) from public;
grant execute on function public.purchase_ids_paid_between(date, date) to authenticated;
