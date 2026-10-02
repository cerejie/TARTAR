-- ============================================================================
-- 29. Voucher VAT, admin auto-approve, own-edit, pending requests (2026-10-01)
--     — apply after 28
--
--   1. vouchers.vatable (default true: every existing voucher was computed
--      with VAT). A non-VAT voucher withholds on (invoice - return) with no
--      /1.12. app.voucher_ewt and both voucher RPCs take p_vatable.
--   2. A voucher inserted by a manager of its branch is saved Approved
--      (approved_by = the caller); anyone else's is saved Pending. The server
--      decides — the client's status is never trusted.
--   3. A manager may edit their OWN approved voucher (and its expense /
--      purchase) until it is printed. It stays approved, no re-approval, no
--      push. Deleting an approved voucher stays blocked.
--   4. Payables: an approved insert opens its payable at once. An own-edit
--      syncs the payable (amount, due date, supplier, branch) while it has no
--      payment; once a payment exists, or if the due date is removed, the
--      edit is refused. An own-edit that adds a due date opens one.
--   5. Notification requests ("Voucher needs approval", "Payment needs
--      verification", and the new "Sale needs verification") are saved with
--      pending = true and deleted for every manager once the request is
--      resolved (approved, rejected, verified or deleted).
--   Nothing is dropped or renamed except function signatures, recreated here.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. vatable + withholding
-- ----------------------------------------------------------------------------
alter table public.vouchers
  add column if not exists vatable boolean not null default true;

drop function if exists app.voucher_ewt(numeric, numeric, numeric);

create or replace function app.voucher_ewt(
  p_invoice numeric,
  p_less_return numeric,
  p_rate numeric,
  p_vatable boolean default true
) returns numeric
language sql immutable as $$
  select round(
    round((p_invoice - p_less_return) / case when coalesce(p_vatable, true) then 1.12 else 1 end, 2)
    * p_rate,
    2
  );
$$;

-- ----------------------------------------------------------------------------
-- 2. Own approved voucher, still editable
-- ----------------------------------------------------------------------------
create or replace function app.is_own_open_voucher(p_voucher public.vouchers) returns boolean
language sql stable as $$
  select p_voucher.status = 'approved'
     and not p_voucher.printed
     and p_voucher.created_by is not null
     and p_voucher.created_by = coalesce(app.user_id(), auth.uid())
     and app.manages_branch(p_voucher.branch);
$$;

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
    if app.is_own_open_voucher(old) then
      if new.status <> 'approved'
         or new.voucher_no is distinct from old.voucher_no
         or new.approved_by is distinct from old.approved_by
         or new.approved_at is distinct from old.approved_at
         or new.created_by is distinct from old.created_by
         or new.transaction_id is distinct from old.transaction_id
         or new.payable_id is distinct from old.payable_id
      then
        raise exception 'Only the details of your own approved voucher can be edited';
      end if;
    elsif to_jsonb(new) - 'printed' is distinct from to_jsonb(old) - 'printed' then
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

create or replace function app.guard_tx_change() returns trigger
language plpgsql security definer set search_path = public, app as $$
begin
  if exists (
    select 1 from public.vouchers v
    where v.transaction_id = old.id
      and (v.status <> 'pending' or v.printed)
      and not (tg_op = 'UPDATE' and app.is_own_open_voucher(v))
  ) then
    raise exception 'This transaction is locked: its voucher has been approved or printed';
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

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
  where v.transaction_id = new.id
    and ((v.status = 'pending' and not v.printed) or app.is_own_open_voucher(v));
  return new;
end;
$$;

drop function if exists app.set_voucher_breakdown(
  uuid, numeric, numeric, numeric, numeric, text
);

create or replace function app.set_voucher_breakdown(
  p_transaction_id uuid,
  p_invoice numeric,
  p_ewt_rate numeric,
  p_ewt_amount numeric,
  p_less_return numeric,
  p_particulars text,
  p_vatable boolean
) returns void
language plpgsql security definer set search_path = public, app as $$
declare
  v_voucher public.vouchers%rowtype;
begin
  select * into v_voucher from public.vouchers
  where transaction_id = p_transaction_id for update;
  if not found then
    return;
  end if;
  if not (app.manages_branch(v_voucher.branch)
          or (app.user_role() = 'employee' and app.can_see_branch(v_voucher.branch))) then
    raise exception 'You are not allowed to edit this voucher';
  end if;
  if (v_voucher.status <> 'pending' or v_voucher.printed)
     and not app.is_own_open_voucher(v_voucher) then
    raise exception 'This transaction is locked: its voucher has been approved or printed';
  end if;

  update public.vouchers
  set gross_amount = p_invoice,
      ewt_rate     = p_ewt_rate,
      ewt_amount   = p_ewt_amount,
      less_return  = p_less_return,
      amount       = p_invoice - p_ewt_amount - p_less_return,
      particulars  = nullif(trim(p_particulars), ''),
      vatable      = coalesce(p_vatable, vatable)
  where id = v_voucher.id;
end;
$$;

revoke execute on function app.set_voucher_breakdown(
  uuid, numeric, numeric, numeric, numeric, text, boolean
) from public;
grant execute on function app.set_voucher_breakdown(
  uuid, numeric, numeric, numeric, numeric, text, boolean
) to authenticated;

-- ----------------------------------------------------------------------------
-- 3. create_transaction_with_voucher — with p_vatable
-- ----------------------------------------------------------------------------
-- Dropped rather than replaced: a new parameter changes the function identity.
-- p_vatable defaults to true, so queued offline calls still resolve.
drop function if exists public.create_transaction_with_voucher(
  uuid, app.transaction_type, text, date, numeric, text, text, text, uuid,
  app.cash_account, text, text, app.voucher_type, uuid, date, numeric,
  numeric, numeric, text, uuid
);
drop function if exists public.create_transaction_with_voucher(
  app.transaction_type, text, date, numeric, text, text, text, uuid,
  app.cash_account, text, text, app.voucher_type, uuid, date,
  numeric, numeric, numeric, text, uuid
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
  p_vatable boolean default true
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
     particulars, gross_amount, ewt_rate, ewt_amount, less_return, check_bank, vatable)
  values
    (v_vtype, p_branch, v_payee, v_invoice - v_ewt - v_return, p_description, 'pending', false,
     p_created_by, v_tx_id, p_supplier_id, app.voucher_category(p_type, p_expense_type),
     p_due_date,
     nullif(trim(p_particulars), ''), v_invoice, v_rate, v_ewt, v_return,
     case when v_vtype = 'check' then app.bank_account_label(p_bank_account_id) end,
     v_vatable);

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
  p_vatable boolean default true
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
    p_vatable => p_vatable
  );
end;
$$;

grant execute on function public.create_transaction_with_voucher(
  app.transaction_type, text, date, numeric, text, text, text, uuid,
  app.cash_account, text, text, app.voucher_type, uuid, date,
  numeric, numeric, numeric, text, uuid, boolean
) to authenticated;
grant execute on function public.create_transaction_with_voucher(
  uuid, app.transaction_type, text, date, numeric, text, text, text, uuid,
  app.cash_account, text, text, app.voucher_type, uuid, date, numeric,
  numeric, numeric, text, uuid, boolean
) to authenticated;

-- ----------------------------------------------------------------------------
-- 4. update_transaction_with_voucher — with p_vatable
-- ----------------------------------------------------------------------------
-- p_vatable null (a call queued before this migration) keeps the stored flag.
drop function if exists public.update_transaction_with_voucher(
  integer, app.voucher_status, uuid, text, date, numeric, text, text, text,
  uuid, app.cash_account, text, date, numeric, numeric, numeric, text, uuid
);
drop function if exists public.update_transaction_with_voucher(
  uuid, text, date, numeric, text, text, text, uuid,
  app.cash_account, text, date, numeric, numeric, numeric, text, uuid
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
  p_vatable boolean default null
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
  p_vatable boolean default null
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
    p_vatable => p_vatable
  );
end;
$$;

grant execute on function public.update_transaction_with_voucher(
  uuid, text, date, numeric, text, text, text, uuid,
  app.cash_account, text, date, numeric, numeric, numeric, text, uuid, boolean
) to authenticated;
grant execute on function public.update_transaction_with_voucher(
  integer, app.voucher_status, uuid, text, date, numeric, text, text, text,
  uuid, app.cash_account, text, date, numeric, numeric, numeric, text, uuid, boolean
) to authenticated;

-- ----------------------------------------------------------------------------
-- 5. Auto-approve on insert
-- ----------------------------------------------------------------------------
-- Runs after vouchers_assign_no and before vouchers_zz_approval_payable
-- (BEFORE triggers fire in name order).
create or replace function app.voucher_auto_approve() returns trigger
language plpgsql as $$
begin
  if app.manages_branch(new.branch) then
    new.status      := 'approved';
    new.approved_by := coalesce(app.user_id(), auth.uid());
    new.approved_at := now();
  else
    new.status      := 'pending';
    new.approved_by := null;
    new.approved_at := null;
  end if;
  new.rejection_reason := null;
  return new;
end;
$$;

drop trigger if exists vouchers_auto_approve on public.vouchers;
create trigger vouchers_auto_approve before insert on public.vouchers
  for each row execute function app.voucher_auto_approve();

-- ----------------------------------------------------------------------------
-- 6. Payables: open on approved insert, sync on own-edit
-- ----------------------------------------------------------------------------
create or replace function app.sync_voucher_payable(p_voucher public.vouchers) returns void
language plpgsql security definer set search_path = public, app as $$
declare
  v_payable public.payables%rowtype;
begin
  if p_voucher.due_date is null then
    raise exception 'This voucher already opened a payable, so its due date cannot be removed';
  end if;

  select * into v_payable from public.payables
  where id = p_voucher.payable_id for update;
  if not found then
    return;
  end if;

  if v_payable.paid_amount > 0
     or v_payable.status <> 'open'
     or exists (
       select 1
       from public.payment_allocations a
       join public.payments p on p.id = a.payment_id
       where a.payable_id = v_payable.id and p.status <> 'rejected'
     )
  then
    raise exception 'Its payable already has a payment, so this voucher can no longer be changed';
  end if;

  update public.payables
  set branch        = p_voucher.branch,
      supplier_id   = p_voucher.supplier_id,
      supplier_name = p_voucher.payee,
      amount        = p_voucher.amount,
      due_date      = p_voucher.due_date
  where id = v_payable.id;
end;
$$;

revoke execute on function app.sync_voucher_payable(public.vouchers) from public;

create or replace function app.voucher_approval_payable() returns trigger
language plpgsql security definer set search_path = public, app as $$
declare
  v_payable_id uuid;
  v_is_expense boolean := false;
begin
  if new.status <> 'approved' then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if old.status = 'approved' then
      if new.payable_id is not null then
        if (new.amount, new.due_date, new.supplier_id, new.payee, new.branch)
           is distinct from (old.amount, old.due_date, old.supplier_id, old.payee, old.branch)
        then
          perform app.sync_voucher_payable(new);
        end if;
        return new;
      end if;
      if new.due_date is not distinct from old.due_date then
        return new;
      end if;
    end if;
  end if;

  if new.payable_id is not null then
    return new;
  end if;

  if new.transaction_id is not null then
    select t.type = 'expense' into v_is_expense
    from public.transactions t
    where t.id = new.transaction_id;
  end if;

  if new.category is distinct from 'PUR' and not coalesce(v_is_expense, false) then
    return new;
  end if;

  if new.due_date is null then
    if new.category = 'PUR' and new.transaction_id is null then
      raise exception 'This purchase voucher has no due date, so no payable can be opened';
    end if;
    return new;
  end if;

  insert into public.payables
    (branch, supplier_id, supplier_name, amount, due_date, reference_number, created_by)
  values
    (new.branch, new.supplier_id, new.payee, new.amount, new.due_date, new.voucher_no,
     new.created_by)
  returning id into v_payable_id;

  new.payable_id := v_payable_id;
  return new;
end;
$$;

drop trigger if exists vouchers_zz_approval_payable on public.vouchers;
create trigger vouchers_zz_approval_payable before insert or update on public.vouchers
  for each row execute function app.voucher_approval_payable();

-- ----------------------------------------------------------------------------
-- 7. Pending notification requests
-- ----------------------------------------------------------------------------
alter table public.notifications
  add column if not exists pending boolean not null default false;
create index if not exists notifications_pending_tag_idx
  on public.notifications (tag) where pending;

drop function if exists app.notify(uuid[], text, text, text, text);

create or replace function app.notify(
  p_user_ids uuid[],
  p_title    text,
  p_body     text,
  p_url      text,
  p_tag      text,
  p_pending  boolean default false
) returns void
language plpgsql security definer set search_path = public, app as $$
begin
  insert into public.notifications (user_id, title, body, url, tag, pending)
  select distinct recipient, p_title, coalesce(p_body, ''), coalesce(p_url, '/'), p_tag,
         coalesce(p_pending, false)
  from unnest(p_user_ids) as recipient
  where recipient is not null
    and recipient is distinct from app.user_id();

  perform app.send_push(p_user_ids, p_title, p_body, p_url, p_tag);
end;
$$;

revoke execute on function app.notify(uuid[], text, text, text, text, boolean) from public;

create or replace function app.resolve_notifications(p_tag text) returns void
language sql security definer set search_path = public, app as $$
  delete from public.notifications where tag = p_tag and pending;
$$;

revoke execute on function app.resolve_notifications(text) from public;

create or replace function app.push_voucher_event() returns trigger
language plpgsql security definer set search_path = public, app as $$
declare
  v_voucher public.vouchers;
  v_label text;
begin
  select * into v_voucher from public.vouchers where id = new.id;
  if not found or v_voucher.status is distinct from new.status then
    return null;
  end if;
  if tg_op = 'UPDATE' and old.status is not distinct from new.status then
    return null;
  end if;

  v_label := concat_ws(' · ', v_voucher.voucher_no, v_voucher.payee, app.peso(v_voucher.amount));

  if v_voucher.status = 'pending' then
    perform app.notify(
      app.push_managers(v_voucher.branch),
      'Voucher needs approval',
      v_label,
      '/vouchers',
      'voucher-' || v_voucher.id,
      true
    );
  elsif tg_op = 'UPDATE' then
    perform app.resolve_notifications('voucher-' || v_voucher.id);
    if v_voucher.created_by is not null then
      perform app.notify(
        array[v_voucher.created_by],
        case v_voucher.status when 'approved' then 'Voucher approved' else 'Voucher rejected' end,
        v_label,
        '/vouchers',
        'voucher-' || v_voucher.id
      );
    end if;
  end if;
  return null;
end;
$$;

create or replace function app.push_payment_event() returns trigger
language plpgsql security definer set search_path = public, app as $$
declare
  v_payment public.payments;
begin
  select * into v_payment from public.payments where id = new.id;
  if not found or v_payment.status is distinct from new.status then
    return null;
  end if;

  if tg_op = 'UPDATE' then
    if old.status = 'pending' and new.status <> 'pending' then
      perform app.resolve_notifications('payment-' || v_payment.id);
    end if;
    return null;
  end if;

  if v_payment.status <> 'pending' or v_payment.branch is null then
    return null;
  end if;

  perform app.notify(
    app.push_managers(v_payment.branch),
    'Payment needs verification',
    concat_ws(' · ', v_payment.party_name, app.peso(v_payment.amount)),
    case v_payment.kind when 'receivable' then '/receivables' else '/payables' end,
    'payment-' || v_payment.id,
    true
  );
  return null;
end;
$$;

drop trigger if exists payments_push on public.payments;
create constraint trigger payments_push
  after insert or update of status on public.payments
  deferrable initially deferred
  for each row execute function app.push_payment_event();

create or replace function app.push_sale_event() returns trigger
language plpgsql security definer set search_path = public, app as $$
declare
  v_sale public.transactions;
begin
  if new.type <> 'sale' or old.sale_status is not distinct from new.sale_status then
    return null;
  end if;

  select * into v_sale from public.transactions where id = new.id;
  if not found or v_sale.sale_status is distinct from new.sale_status then
    return null;
  end if;

  if old.sale_status = 'deposited' then
    perform app.resolve_notifications('sale-' || v_sale.id);
  end if;

  if v_sale.sale_status = 'deposited' then
    perform app.notify(
      app.push_managers(v_sale.branch),
      'Sale needs verification',
      concat_ws(' · ', v_sale.reference_number, app.peso(v_sale.amount)),
      '/sales',
      'sale-' || v_sale.id,
      true
    );
    return null;
  end if;

  if v_sale.sale_status not in ('verified', 'rejected') or v_sale.created_by is null then
    return null;
  end if;

  perform app.notify(
    array[v_sale.created_by],
    case v_sale.sale_status when 'verified' then 'Sale verified' else 'Sale rejected' end,
    concat_ws(' · ', v_sale.reference_number, app.peso(v_sale.amount),
      case when v_sale.sale_status = 'rejected' then v_sale.rejection_reason end),
    '/sales',
    'sale-' || v_sale.id
  );
  return null;
end;
$$;

create or replace function app.resolve_deleted_request() returns trigger
language plpgsql security definer set search_path = public, app as $$
begin
  perform app.resolve_notifications(tg_argv[0] || '-' || old.id);
  return null;
end;
$$;

drop trigger if exists vouchers_resolve_notifications on public.vouchers;
create trigger vouchers_resolve_notifications after delete on public.vouchers
  for each row execute function app.resolve_deleted_request('voucher');

drop trigger if exists payments_resolve_notifications on public.payments;
create trigger payments_resolve_notifications after delete on public.payments
  for each row execute function app.resolve_deleted_request('payment');

drop trigger if exists transactions_resolve_notifications on public.transactions;
create trigger transactions_resolve_notifications after delete on public.transactions
  for each row when (old.type = 'sale')
  execute function app.resolve_deleted_request('sale');

-- Retention: read rows older than 30 days, never an unresolved request.
select cron.schedule(
  'tartar-notification-cleanup',
  '30 16 * * *',
  $$delete from public.notifications where read_at < now() - interval '30 days' and not pending$$
);

notify pgrst, 'reload schema';
