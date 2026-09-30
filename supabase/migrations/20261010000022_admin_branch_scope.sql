-- ============================================================================
-- Admin branch scope + email accounts + role hierarchy (2026-09-30)
--
--   0. Roles: developer > superadmin > admin > accountant / employee.
--      The developer is the only Supabase Auth account (app.authorities).
--      Superadmin is a stored role in public.users; many are allowed.
--      A table user's role and branch access are read LIVE from
--      public.users (approved rows only), so a demotion, a branch change or
--      a deletion applies without signing in again.
--      'superadmin' is a new enum value, unusable until this transaction
--      commits, so every comparison in this file uses role::text.
--   1. Admins are limited to the branches assigned to them. app.branch_access()
--      returns NULL ("all branches") for the developer and superadmins only.
--      An admin with no branches sees no branch data.
--   2. app.manages_branch(branch) = manager AND the branch is in access. Every
--      manager policy on transactions, vouchers, receivables, payables and
--      payments uses it; allocations follow their payment.
--   3. Manager RPCs on branch data check the branch: verify_sale, reject_sale,
--      set_voucher_breakdown, reopen_rejected_voucher.
--   4. An admin who creates a branch is granted it.
--   5. Backfill: every existing admin gets every branch.
--   6. app.can_manage_role: developer -> superadmin, admin, accountant,
--      employee; superadmin -> admin, accountant, employee; admin ->
--      accountant, employee. The users policies are built on it. Admins also
--      read other admins. Nobody deletes their own row.
--   7. Email-only accounts: login_email, register_email,
--      admin_create_user_email (username derived from the email, never
--      shown), password reset requests decided by someone above, and
--      change_own_password. The username-based login, register and
--      admin_create_user are no longer callable.
--   Users, branches and master data stay global for admins.
--   Nothing is dropped or renamed.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. Roles, user email columns, authorities
-- ----------------------------------------------------------------------------
alter type app.user_role add value if not exists 'superadmin' before 'admin';

alter table public.users
  add column if not exists email                       text,
  add column if not exists pending_password_hash       text,
  add column if not exists password_reset_requested_at timestamptz;

create unique index if not exists users_email_key on public.users (lower(email));

create table if not exists app.authorities (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  role       text not null unique check (role = 'developer'),
  created_at timestamptz not null default now()
);
alter table app.authorities enable row level security;
revoke all on app.authorities from public, anon, authenticated;

insert into app.authorities (user_id, role)
select u.id, 'developer'
from auth.users u
where lower(u.email) = 'cerejie1342@gmail.com'
on conflict do nothing;

do $$
begin
  if not exists (select 1 from app.authorities) then
    raise warning 'app.authorities has no developer: create the Supabase Auth account, then insert its row';
  end if;
end;
$$;

create or replace function app.authority_role() returns text
language sql stable security definer set search_path = public, app as $$
  select a.role
  from app.authorities a
  where auth.role() = 'authenticated'
    and coalesce((app.jwt() ->> 'is_custom_user')::boolean, false) = false
    and a.user_id = auth.uid();
$$;

create or replace function app.user_role() returns text
language sql stable security definer set search_path = public, app as $$
  select coalesce(
    app.authority_role(),
    (select u.role::text
     from public.users u
     where coalesce((app.jwt() ->> 'is_custom_user')::boolean, false)
       and u.id = app.user_id()
       and u.approval_status = 'approved')
  );
$$;

create or replace function app.is_developer() returns boolean
language sql stable as $$
  select coalesce(app.user_role() = 'developer', false);
$$;

create or replace function app.is_superadmin() returns boolean
language sql stable as $$
  select coalesce(app.user_role() in ('developer', 'superadmin'), false);
$$;

create or replace function public.my_authority_role() returns text
language sql stable as $$
  select app.authority_role();
$$;

revoke execute on function public.my_authority_role() from public;
grant execute on function public.my_authority_role() to authenticated;

-- ----------------------------------------------------------------------------
-- 1. app.branch_access
-- ----------------------------------------------------------------------------
create or replace function app.branch_access() returns text[]
language sql stable security definer set search_path = public, app as $$
  select case
    when app.is_superadmin() then null
    else coalesce(
      (select u.branch_access
       from public.users u
       where u.id = app.user_id()
         and u.approval_status = 'approved'),
      '{}'::text[]
    )
  end;
$$;

-- ----------------------------------------------------------------------------
-- 2. Manager policies gain the branch check
-- ----------------------------------------------------------------------------
create or replace function app.manages_branch(p_branch text) returns boolean
language sql stable as $$
  select app.is_manager() and app.can_see_branch(p_branch);
$$;

drop policy if exists tx_manager_all on public.transactions;
create policy tx_manager_all on public.transactions
  for all to authenticated
  using (app.manages_branch(branch)) with check (app.manages_branch(branch));

drop policy if exists rcv_manager_all on public.receivables;
create policy rcv_manager_all on public.receivables
  for all to authenticated
  using (app.manages_branch(branch)) with check (app.manages_branch(branch));

drop policy if exists pay_manager_read on public.payables;
create policy pay_manager_read on public.payables
  for select to authenticated using (app.manages_branch(branch));
drop policy if exists pay_manager_write on public.payables;
create policy pay_manager_write on public.payables
  for insert to authenticated with check (app.manages_branch(branch));
drop policy if exists pay_manager_update on public.payables;
create policy pay_manager_update on public.payables
  for update to authenticated
  using (app.manages_branch(branch)) with check (app.manages_branch(branch));

drop policy if exists vch_manager_all on public.vouchers;
create policy vch_manager_all on public.vouchers
  for all to authenticated
  using (app.manages_branch(branch)) with check (app.manages_branch(branch));

drop policy if exists pmt_read on public.payments;
create policy pmt_read on public.payments
  for select to authenticated using (app.can_see_branch(branch));

drop policy if exists pmt_insert on public.payments;
create policy pmt_insert on public.payments
  for insert to authenticated
  with check (
    app.manages_branch(branch)
    or (
      app.user_role() = 'employee'
      and status = 'pending'
      and app.can_see_branch(branch)
    )
  );

drop policy if exists pmt_manager_update on public.payments;
create policy pmt_manager_update on public.payments
  for update to authenticated
  using (app.manages_branch(branch)) with check (app.manages_branch(branch));

drop policy if exists pmt_manager_delete on public.payments;
create policy pmt_manager_delete on public.payments
  for delete to authenticated using (app.manages_branch(branch));

drop policy if exists alloc_insert on public.payment_allocations;
create policy alloc_insert on public.payment_allocations
  for insert to authenticated
  with check (
    (app.is_manager() or app.user_role() = 'employee')
    and exists (select 1 from public.payments p where p.id = payment_id)
  );

drop policy if exists alloc_manager_delete on public.payment_allocations;
create policy alloc_manager_delete on public.payment_allocations
  for delete to authenticated
  using (
    app.is_manager()
    and exists (select 1 from public.payments p where p.id = payment_id)
  );

-- ----------------------------------------------------------------------------
-- 3. Manager RPCs check the branch
-- ----------------------------------------------------------------------------
create or replace function public.verify_sale(p_transaction_id uuid) returns void
language plpgsql security definer set search_path = public, app as $$
declare
  v_sale public.transactions%rowtype;
begin
  if not app.is_manager() then
    raise exception 'Only an admin can verify sales';
  end if;

  select * into v_sale from public.transactions
  where id = p_transaction_id for update;
  if not found or v_sale.type <> 'sale' or not app.can_see_branch(v_sale.branch) then
    raise exception 'Sale not found';
  end if;
  if v_sale.sale_status <> 'deposited' then
    raise exception 'Only a deposited sale can be verified (this one is %)', v_sale.sale_status;
  end if;

  perform set_config('app.sale_workflow', 'on', true);
  update public.transactions
  set sale_status = 'verified',
      verified_by = coalesce(app.user_id(), auth.uid()),
      verified_at = now()
  where id = p_transaction_id;
  perform set_config('app.sale_workflow', '', true);
end;
$$;

create or replace function public.reject_sale(
  p_transaction_id uuid,
  p_reason text
) returns void
language plpgsql security definer set search_path = public, app as $$
declare
  v_sale public.transactions%rowtype;
  v_reason text := nullif(trim(p_reason), '');
begin
  if not app.is_manager() then
    raise exception 'Only an admin can reject sales';
  end if;
  if v_reason is null then
    raise exception 'Enter the reason for rejecting this sale';
  end if;

  select * into v_sale from public.transactions
  where id = p_transaction_id for update;
  if not found or v_sale.type <> 'sale' or not app.can_see_branch(v_sale.branch) then
    raise exception 'Sale not found';
  end if;
  if v_sale.sale_status <> 'deposited' then
    raise exception 'Only a deposited sale can be rejected (this one is %)', v_sale.sale_status;
  end if;

  perform set_config('app.sale_workflow', 'on', true);
  update public.transactions
  set sale_status      = 'rejected',
      rejection_reason = v_reason,
      verified_by      = coalesce(app.user_id(), auth.uid()),
      verified_at      = now()
  where id = p_transaction_id;
  perform set_config('app.sale_workflow', '', true);
end;
$$;

create or replace function app.set_voucher_breakdown(
  p_transaction_id uuid,
  p_invoice numeric,
  p_ewt_rate numeric,
  p_ewt_amount numeric,
  p_less_return numeric,
  p_particulars text
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
  if v_voucher.status <> 'pending' or v_voucher.printed then
    raise exception 'This transaction is locked: its voucher has been approved or printed';
  end if;

  update public.vouchers
  set gross_amount = p_invoice,
      ewt_rate     = p_ewt_rate,
      ewt_amount   = p_ewt_amount,
      less_return  = p_less_return,
      amount       = p_invoice - p_ewt_amount - p_less_return,
      particulars  = nullif(trim(p_particulars), '')
  where id = v_voucher.id;
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
  if not (app.manages_branch(v_voucher.branch)
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

-- ----------------------------------------------------------------------------
-- 4. A new branch is granted to the admin who creates it
-- ----------------------------------------------------------------------------
create or replace function app.grant_branch_to_creator() returns trigger
language plpgsql security definer set search_path = public, app as $$
begin
  if app.is_admin() then
    update public.users
    set branch_access = array_append(branch_access, new.slug)
    where id = app.user_id()
      and not (new.slug = any (branch_access));
  end if;
  return new;
end;
$$;

drop trigger if exists branches_grant_creator on public.branches;
create trigger branches_grant_creator after insert on public.branches
  for each row execute function app.grant_branch_to_creator();

-- ----------------------------------------------------------------------------
-- 5. Backfill: existing admins keep every branch
-- ----------------------------------------------------------------------------
update public.users
set branch_access = array(select b.slug from public.branches b order by b.sort, b.slug)
where role = 'admin';

-- ----------------------------------------------------------------------------
-- 6. Who manages whom
-- ----------------------------------------------------------------------------
create or replace function app.can_manage_role(p_role text) returns boolean
language sql stable as $$
  select coalesce(
    case app.user_role()
      when 'developer'  then p_role in ('superadmin', 'admin', 'accountant', 'employee')
      when 'superadmin' then p_role in ('admin', 'accountant', 'employee')
      when 'admin'      then p_role in ('accountant', 'employee')
    end,
    false
  );
$$;

drop policy if exists users_superadmin_all on public.users;
drop policy if exists users_admin_read     on public.users;
drop policy if exists users_admin_insert   on public.users;
drop policy if exists users_admin_update   on public.users;
drop policy if exists users_admin_delete   on public.users;

drop policy if exists users_manage_read on public.users;
create policy users_manage_read on public.users
  for select to authenticated
  using (
    app.can_manage_role(role::text)
    or (app.user_role() = 'admin' and role::text = 'admin')
  );

drop policy if exists users_manage_insert on public.users;
create policy users_manage_insert on public.users
  for insert to authenticated
  with check (app.can_manage_role(role::text));

drop policy if exists users_manage_update on public.users;
create policy users_manage_update on public.users
  for update to authenticated
  using (app.can_manage_role(role::text))
  with check (app.can_manage_role(role::text));

drop policy if exists users_manage_delete on public.users;
create policy users_manage_delete on public.users
  for delete to authenticated
  using (app.can_manage_role(role::text) and id <> app.user_id());

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
         password_reset_requested_at = null
   where id = p_user_id;
end;
$$;

create or replace function public.user_display_names()
returns table (id uuid, name text)
language sql stable security definer set search_path = public, app as $$
  select
    u.id,
    coalesce(nullif(trim(u.full_name), ''), u.username)
  from public.users u
  where app.branch_access() is null
    or u.id = app.user_id()
    or u.role::text in ('superadmin', 'admin')
    or u.branch_access && app.branch_access();
$$;

-- ----------------------------------------------------------------------------
-- 7. Email accounts
-- ----------------------------------------------------------------------------
create or replace function app.username_from_email(p_email text) returns text
language plpgsql stable security definer set search_path = public, app as $$
declare
  v_base   text := left(regexp_replace(split_part(lower(p_email), '@', 1), '[^a-z0-9]', '', 'g'), 32);
  v_name   text;
  v_suffix int  := 1;
begin
  if length(v_base) < 3 then
    v_base := v_base || 'acct';
  end if;

  v_name := v_base;
  while exists (select 1 from public.users u where u.username = v_name) loop
    v_suffix := v_suffix + 1;
    v_name   := v_base || v_suffix;
  end loop;

  return v_name;
end;
$$;

create or replace function app.assert_new_account(
  p_email     text,
  p_full_name text,
  p_password  text
) returns void
language plpgsql stable security definer set search_path = public, app as $$
begin
  if coalesce(p_email, '') !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Enter a valid email address';
  end if;
  if nullif(trim(p_full_name), '') is null then
    raise exception 'Enter the full name';
  end if;
  if length(coalesce(p_password, '')) < 6 then
    raise exception 'Password must be at least 6 characters';
  end if;
  if exists (select 1 from public.users u where lower(u.email) = p_email)
     or exists (
       select 1
       from app.authorities a
       join auth.users au on au.id = a.user_id
       where lower(au.email) = p_email
     ) then
    raise exception 'An account with this email already exists';
  end if;
end;
$$;

create or replace function public.register_email(
  p_email     text,
  p_full_name text,
  p_password  text
) returns void
language plpgsql security definer
set search_path = public, app, extensions
as $$
declare v_email text := lower(trim(p_email));
begin
  perform app.assert_new_account(v_email, p_full_name, p_password);

  insert into public.users
    (username, email, password_hash, full_name, role, approval_status)
  values
    (app.username_from_email(v_email),
     v_email,
     extensions.crypt(p_password, extensions.gen_salt('bf')),
     trim(p_full_name),
     'employee',
     'pending');
end;
$$;

create or replace function public.admin_create_user_email(
  p_email         text,
  p_password      text,
  p_full_name     text,
  p_role          text,
  p_branch_access text[] default '{}',
  p_access_flags  jsonb  default '{}'::jsonb
) returns uuid
language plpgsql security definer
set search_path = public, app, extensions
as $$
declare
  v_email text := lower(trim(p_email));
  v_id    uuid;
begin
  if not app.can_manage_role(p_role) then
    raise exception 'not authorized to create a user with role %', p_role
      using errcode = '42501';
  end if;
  perform app.assert_new_account(v_email, p_full_name, p_password);

  insert into public.users
    (username, email, password_hash, full_name, role, branch_access,
     access_flags, approval_status)
  values
    (app.username_from_email(v_email),
     v_email,
     extensions.crypt(p_password, extensions.gen_salt('bf')),
     trim(p_full_name),
     p_role::app.user_role,
     coalesce(p_branch_access, '{}'),
     coalesce(p_access_flags, '{}'::jsonb),
     'approved')
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.login_email(
  p_email    text,
  p_password text
) returns jsonb
language plpgsql security definer
set search_path = public, app, extensions
as $$
declare
  v_user   public.users;
  v_now    int := extract(epoch from now())::int;
  v_claims jsonb;
begin
  select * into v_user
  from public.users
  where lower(email) = lower(trim(p_email));

  if not found
     or v_user.password_hash <> extensions.crypt(p_password, v_user.password_hash) then
    raise exception 'invalid email or password' using errcode = '28P01';
  end if;

  if v_user.approval_status <> 'approved' then
    raise exception 'account is %', v_user.approval_status using errcode = '28000';
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
    'token', app.sign_jwt(v_claims),
    'user',  jsonb_build_object(
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

create or replace function public.account_email_exists(p_email text)
returns boolean
language sql stable security definer set search_path = public, app as $$
  select exists (
    select 1
    from public.users u
    where lower(u.email) = lower(trim(p_email))
      and u.approval_status = 'approved'
  );
$$;

create or replace function public.request_password_reset(
  p_email    text,
  p_password text
) returns void
language plpgsql security definer
set search_path = public, app, extensions
as $$
declare v_id uuid;
begin
  if length(coalesce(p_password, '')) < 6 then
    raise exception 'Password must be at least 6 characters';
  end if;

  update public.users
     set pending_password_hash       = extensions.crypt(p_password, extensions.gen_salt('bf')),
         password_reset_requested_at = now()
   where lower(email) = lower(trim(p_email))
     and approval_status = 'approved'
  returning id into v_id;

  if v_id is null then
    raise exception 'No approved account uses this email';
  end if;
end;
$$;

create or replace function public.decide_password_reset(
  p_user_id uuid,
  p_approve boolean
) returns void
language plpgsql security definer set search_path = public, app as $$
declare v_user public.users%rowtype;
begin
  select * into v_user from public.users where id = p_user_id for update;
  if not found or not app.can_manage_role(v_user.role::text) then
    raise exception 'not authorized to decide this password reset'
      using errcode = '42501';
  end if;
  if v_user.pending_password_hash is null then
    raise exception 'This user has no pending password reset';
  end if;

  update public.users
     set password_hash               = case when p_approve
                                            then pending_password_hash
                                            else password_hash end,
         pending_password_hash       = null,
         password_reset_requested_at = null
   where id = p_user_id;
end;
$$;

create or replace function public.change_own_password(
  p_current_password text,
  p_new_password     text
) returns void
language plpgsql security definer
set search_path = public, app, extensions
as $$
declare v_user public.users%rowtype;
begin
  select * into v_user
  from public.users
  where coalesce((app.jwt() ->> 'is_custom_user')::boolean, false)
    and id = app.user_id()
  for update;

  if not found
     or v_user.password_hash <> extensions.crypt(p_current_password, v_user.password_hash) then
    raise exception 'Current password is incorrect' using errcode = '28P01';
  end if;
  if length(coalesce(p_new_password, '')) < 6 then
    raise exception 'Password must be at least 6 characters';
  end if;

  update public.users
     set password_hash               = extensions.crypt(p_new_password, extensions.gen_salt('bf')),
         pending_password_hash       = null,
         password_reset_requested_at = null
   where id = v_user.id;
end;
$$;

-- ----------------------------------------------------------------------------
-- 8. Grants: email RPCs in, username RPCs out
-- ----------------------------------------------------------------------------
revoke execute on function public.login(text, text) from public, anon, authenticated;
revoke execute on function public.register(text, text, text) from public, anon, authenticated;
revoke execute on function public.admin_create_user(text, text, text, app.user_role, text[], jsonb)
  from public, anon, authenticated;

revoke execute on function public.login_email(text, text) from public;
revoke execute on function public.register_email(text, text, text) from public;
revoke execute on function public.account_email_exists(text) from public;
revoke execute on function public.request_password_reset(text, text) from public;
grant execute on function public.login_email(text, text) to anon, authenticated;
grant execute on function public.register_email(text, text, text) to anon, authenticated;
grant execute on function public.account_email_exists(text) to anon, authenticated;
grant execute on function public.request_password_reset(text, text) to anon, authenticated;

revoke execute on function public.admin_create_user_email(text, text, text, text, text[], jsonb)
  from public, anon;
revoke execute on function public.decide_password_reset(uuid, boolean) from public, anon;
revoke execute on function public.change_own_password(text, text) from public, anon;
revoke execute on function public.admin_set_password(uuid, text) from public, anon;
revoke execute on function public.user_display_names() from public, anon;
grant execute on function public.admin_create_user_email(text, text, text, text, text[], jsonb)
  to authenticated;
grant execute on function public.decide_password_reset(uuid, boolean) to authenticated;
grant execute on function public.change_own_password(text, text) to authenticated;
grant execute on function public.admin_set_password(uuid, text) to authenticated;
grant execute on function public.user_display_names() to authenticated;
