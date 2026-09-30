create table if not exists public.write_receipts (
  key        uuid primary key,
  fn         text not null,
  created_at timestamptz not null default now()
);

alter table public.write_receipts enable row level security;
revoke all on public.write_receipts from anon, authenticated;

create or replace function app.claim_write(p_key uuid, p_fn text)
returns boolean
language plpgsql security definer set search_path = public, app as $$
begin
  insert into public.write_receipts (key, fn)
  values (p_key, p_fn)
  on conflict (key) do nothing;
  return found;
end;
$$;

revoke all on function app.claim_write(uuid, text) from public;
grant execute on function app.claim_write(uuid, text) to authenticated;

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
  p_bank_account_id uuid default null
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
    p_bank_account_id => p_bank_account_id
  );
end;
$$;

create or replace function public.record_ledger_payment(
  p_idempotency_key uuid,
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
begin
  if not app.claim_write(p_idempotency_key, 'record_ledger_payment') then
    return null;
  end if;

  return public.record_ledger_payment(
    p_kind => p_kind,
    p_party_id => p_party_id,
    p_party_name => p_party_name,
    p_amount => p_amount,
    p_paid_at => p_paid_at,
    p_reference_number => p_reference_number,
    p_allocations => p_allocations,
    p_created_by => p_created_by
  );
end;
$$;

create or replace function public.mark_payable_paid(
  p_idempotency_key uuid,
  p_payable_id uuid,
  p_paid_at date,
  p_cash_account app.cash_account,
  p_bank_account_id uuid default null,
  p_created_by uuid default null
) returns uuid
language plpgsql as $$
begin
  if not app.claim_write(p_idempotency_key, 'mark_payable_paid') then
    return null;
  end if;

  return public.mark_payable_paid(
    p_payable_id => p_payable_id,
    p_paid_at => p_paid_at,
    p_cash_account => p_cash_account,
    p_bank_account_id => p_bank_account_id,
    p_created_by => p_created_by
  );
end;
$$;

create or replace function public.mark_sale_deposited(
  p_idempotency_key uuid,
  p_transaction_id uuid,
  p_deposit_date date
) returns void
language plpgsql as $$
begin
  if not app.claim_write(p_idempotency_key, 'mark_sale_deposited') then
    return;
  end if;

  perform public.mark_sale_deposited(
    p_transaction_id => p_transaction_id,
    p_deposit_date => p_deposit_date
  );
end;
$$;

create or replace function public.verify_sale(
  p_idempotency_key uuid,
  p_transaction_id uuid
) returns void
language plpgsql as $$
begin
  if not app.claim_write(p_idempotency_key, 'verify_sale') then
    return;
  end if;

  perform public.verify_sale(p_transaction_id => p_transaction_id);
end;
$$;

create or replace function public.reject_sale(
  p_idempotency_key uuid,
  p_transaction_id uuid,
  p_reason text
) returns void
language plpgsql as $$
begin
  if not app.claim_write(p_idempotency_key, 'reject_sale') then
    return;
  end if;

  perform public.reject_sale(
    p_transaction_id => p_transaction_id,
    p_reason => p_reason
  );
end;
$$;

create or replace function public.verify_payment(
  p_idempotency_key uuid,
  p_payment_id uuid
) returns void
language plpgsql as $$
begin
  if not app.claim_write(p_idempotency_key, 'verify_payment') then
    return;
  end if;

  perform public.verify_payment(p_payment_id => p_payment_id);
end;
$$;

create or replace function public.reject_payment(
  p_idempotency_key uuid,
  p_payment_id uuid
) returns void
language plpgsql as $$
begin
  if not app.claim_write(p_idempotency_key, 'reject_payment') then
    return;
  end if;

  perform public.reject_payment(p_payment_id => p_payment_id);
end;
$$;

grant execute on function public.create_transaction_with_voucher(
  uuid, app.transaction_type, text, date, numeric, text, text, text, uuid,
  app.cash_account, text, text, app.voucher_type, uuid, date, numeric,
  numeric, numeric, text, uuid
) to authenticated;
grant execute on function public.record_ledger_payment(
  uuid, app.payment_kind, uuid, text, numeric, date, text, jsonb, uuid
) to authenticated;
grant execute on function public.mark_payable_paid(
  uuid, uuid, date, app.cash_account, uuid, uuid
) to authenticated;
grant execute on function public.mark_sale_deposited(uuid, uuid, date) to authenticated;
grant execute on function public.verify_sale(uuid, uuid) to authenticated;
grant execute on function public.reject_sale(uuid, uuid, text) to authenticated;
grant execute on function public.verify_payment(uuid, uuid) to authenticated;
grant execute on function public.reject_payment(uuid, uuid) to authenticated;

notify pgrst, 'reload schema';
