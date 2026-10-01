-- ============================================================================
-- 25. Optimistic concurrency for transaction edits
-- ----------------------------------------------------------------------------
-- A stale edit (queued offline, or made on a page opened before someone else
-- changed the row) must never overwrite newer data. Every transaction carries
-- a version that rises on each change; edits name the version they saw and
-- are refused when it moved. Disbursement edits also name the voucher status
-- they saw, because rejecting a voucher does not touch the transaction row.
-- Nothing is dropped or renamed; the original RPC stays as it is.
-- ============================================================================

alter table public.transactions
  add column if not exists version integer not null default 1;

-- ----------------------------------------------------------------------------
-- 1. Bump the version on every real change. The zz prefix orders it after the
--    guard triggers, so they never see the bumped value.
-- ----------------------------------------------------------------------------
create or replace function app.bump_tx_version() returns trigger
language plpgsql as $$
begin
  if to_jsonb(new) - 'version' is distinct from to_jsonb(old) - 'version' then
    new.version := old.version + 1;
  else
    new.version := old.version;
  end if;
  return new;
end;
$$;

drop trigger if exists transactions_zz_version on public.transactions;
create trigger transactions_zz_version before update on public.transactions
  for each row execute function app.bump_tx_version();

-- ----------------------------------------------------------------------------
-- 2. Keep the edit history free of version bumps
-- ----------------------------------------------------------------------------
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
    and o.key not in ('created_at', 'version');
  if v_changes is not null then
    insert into public.transaction_audit (transaction_id, edited_by, changes)
    values (old.id, coalesce(app.user_id(), auth.uid()), v_changes);
  end if;
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- 3. update_transaction_with_voucher — version-checked overload
-- ----------------------------------------------------------------------------
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
  p_bank_account_id uuid default null
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
    p_bank_account_id => p_bank_account_id
  );
end;
$$;

grant execute on function public.update_transaction_with_voucher(
  integer, app.voucher_status, uuid, text, date, numeric, text, text, text,
  uuid, app.cash_account, text, date, numeric, numeric, numeric, text, uuid
) to authenticated;

notify pgrst, 'reload schema';
