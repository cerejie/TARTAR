-- ============================================================================
-- 31. Auth hardening + idempotent transaction edit   (ADDITIVE — safe to run now)
--
--   1. Failed-login lockout: 5 wrong passwords in a row lock the account for
--      15 minutes. New function public.login_account; it RETURNS its outcome
--      instead of raising, because a raised exception would roll back the
--      failed-attempt counter.
--   2. Password reset no longer carries a password chosen by an anonymous
--      caller. public.request_password_help only flags the account; a manager
--      then sets a temporary password (admin_set_password) or dismisses the
--      request (public.dismiss_password_reset).
--   3. admin_set_password also clears a lockout.
--   4. update_transaction_with_voucher gains an idempotency-key overload, so a
--      queued offline edit whose response was lost is not replayed as a conflict.
--
-- Nothing here is removed or renamed. The old functions (login_email,
-- request_password_reset, account_email_exists, decide_password_reset) keep
-- working for clients that have not updated yet; migration 32 closes them.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Lockout columns
-- ----------------------------------------------------------------------------
alter table public.users
  add column if not exists failed_login_count integer not null default 0,
  add column if not exists locked_until       timestamptz;

-- ----------------------------------------------------------------------------
-- 2. login_account
--    status: ok | invalid | locked | pending | rejected
-- ----------------------------------------------------------------------------
create or replace function public.login_account(
  p_email    text,
  p_password text
) returns jsonb
language plpgsql security definer
set search_path = public, app, extensions
as $$
declare
  v_user         public.users;
  v_now          int := extract(epoch from now())::int;
  v_claims       jsonb;
  v_failures     int;
  v_locked_until timestamptz;
  c_max_failures constant int      := 5;
  c_lock_for     constant interval := interval '15 minutes';
begin
  select * into v_user
  from public.users
  where lower(email) = lower(trim(p_email))
  for update;

  if not found then
    return jsonb_build_object('status', 'invalid');
  end if;

  if v_user.locked_until is not null and v_user.locked_until > now() then
    return jsonb_build_object('status', 'locked', 'retry_at', v_user.locked_until);
  end if;

  if v_user.password_hash <> extensions.crypt(p_password, v_user.password_hash) then
    v_failures := v_user.failed_login_count + 1;

    if v_failures >= c_max_failures then
      v_locked_until := now() + c_lock_for;
      update public.users
         set failed_login_count = 0,
             locked_until       = v_locked_until
       where id = v_user.id;
      return jsonb_build_object('status', 'locked', 'retry_at', v_locked_until);
    end if;

    update public.users
       set failed_login_count = v_failures,
           locked_until       = null
     where id = v_user.id;
    return jsonb_build_object('status', 'invalid');
  end if;

  if v_user.failed_login_count <> 0 or v_user.locked_until is not null then
    update public.users
       set failed_login_count = 0,
           locked_until       = null
     where id = v_user.id;
  end if;

  if v_user.approval_status <> 'approved' then
    return jsonb_build_object('status', v_user.approval_status::text);
  end if;

  v_claims := jsonb_build_object(
    'role',           'authenticated',
    'aud',            'authenticated',
    'sub',            v_user.id::text,
    'iat',            v_now,
    'exp',            v_now + 60 * 60 * 8,
    'is_custom_user', true,
    'email',          v_user.email,
    'username',       v_user.username,
    'user_role',      v_user.role,
    'branch_access',  to_jsonb(v_user.branch_access),
    'access_flags',   v_user.access_flags
  );

  return jsonb_build_object(
    'status', 'ok',
    'token',  app.sign_jwt(v_claims),
    'user',   jsonb_build_object(
      'id',            v_user.id,
      'email',         v_user.email,
      'username',      v_user.username,
      'full_name',     v_user.full_name,
      'role',          v_user.role,
      'access_flags',  v_user.access_flags,
      'branch_access', v_user.branch_access
    )
  );
end;
$$;

-- ----------------------------------------------------------------------------
-- 3. Password reset: flag only, never a caller-chosen password
--    Returns nothing either way, so it does not reveal which emails exist.
-- ----------------------------------------------------------------------------
create or replace function public.request_password_help(p_email text)
returns void
language plpgsql security definer set search_path = public, app as $$
begin
  update public.users
     set password_reset_requested_at = now()
   where lower(email) = lower(trim(p_email))
     and approval_status = 'approved';
end;
$$;

create or replace function public.dismiss_password_reset(p_user_id uuid)
returns void
language plpgsql security definer set search_path = public, app as $$
declare v_role text;
begin
  select role::text into v_role from public.users where id = p_user_id for update;
  if not found or not app.can_manage_role(v_role) then
    raise exception 'not authorized to dismiss this password reset'
      using errcode = '42501';
  end if;

  update public.users
     set pending_password_hash       = null,
         password_reset_requested_at = null
   where id = p_user_id;
end;
$$;

-- ----------------------------------------------------------------------------
-- 4. admin_set_password also clears a lockout (body otherwise as in migration 22)
-- ----------------------------------------------------------------------------
create or replace function public.admin_set_password(
  p_user_id  uuid,
  p_password text
) returns void
language plpgsql security definer
set search_path = public, app, extensions
as $$
declare v_role text;
begin
  select role::text into v_role from public.users where id = p_user_id;
  if not found then
    raise exception 'user not found';
  end if;

  if not app.can_manage_role(v_role) then
    raise exception 'not authorized to reset this user''s password'
      using errcode = '42501';
  end if;
  if length(coalesce(p_password, '')) < 6 then
    raise exception 'Password must be at least 6 characters';
  end if;

  update public.users
     set password_hash               = extensions.crypt(p_password, extensions.gen_salt('bf')),
         pending_password_hash       = null,
         password_reset_requested_at = null,
         failed_login_count          = 0,
         locked_until                = null
   where id = p_user_id;
end;
$$;

-- ----------------------------------------------------------------------------
-- 5. Idempotent edit (same wrapper shape as migration 24)
-- ----------------------------------------------------------------------------
create or replace function public.update_transaction_with_voucher(
  p_idempotency_key uuid,
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
begin
  if not app.claim_write(p_idempotency_key, 'update_transaction_with_voucher') then
    return;
  end if;

  perform public.update_transaction_with_voucher(
    p_expected_version => p_expected_version,
    p_expected_voucher_status => p_expected_voucher_status,
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

-- ----------------------------------------------------------------------------
-- 6. Grants
-- ----------------------------------------------------------------------------
revoke execute on function public.login_account(text, text) from public;
revoke execute on function public.request_password_help(text) from public;
revoke execute on function public.dismiss_password_reset(uuid) from public, anon;

grant execute on function public.login_account(text, text) to anon, authenticated;
grant execute on function public.request_password_help(text) to anon, authenticated;
grant execute on function public.dismiss_password_reset(uuid) to authenticated;

grant execute on function public.update_transaction_with_voucher(
  uuid, integer, app.voucher_status, uuid, text, date, numeric, text, text, text,
  uuid, app.cash_account, text, date, numeric, numeric, numeric, text, uuid, boolean
) to authenticated;

notify pgrst, 'reload schema';
