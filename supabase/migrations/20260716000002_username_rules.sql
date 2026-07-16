-- ============================================================================
-- Username rules (backend validation)
-- ----------------------------------------------------------------------------
-- Regular usernames may contain ONLY letters (a-z) and numbers (0-9): no '@',
-- spaces, dots, dashes, or other special characters, and never an email. The
-- superAdmin is the sole Supabase Auth account and authenticates by email, so
-- emails are deliberately excluded from the users table.
--
-- This mirrors the frontend rule (USERNAME_REGEX in src/models/user.ts) at the
-- database level so the constraint holds no matter how a row is inserted.
-- ============================================================================

-- Table-level guarantee across every insert path (register, admin_create_user).
-- Usernames are always stored lower-cased, so the class is [a-z0-9]. Safe to add
-- unconditionally: the users table holds no superAdmin and starts empty.
alter table public.users
  add constraint users_username_alnum_chk
  check (username ~ '^[a-z0-9]{3,40}$');

-- Self-registration: validate the username format explicitly so callers get a
-- clear message instead of a raw check-constraint violation.
create or replace function public.register(
  p_username  text,
  p_password  text,
  p_full_name text default null
) returns void
language plpgsql security definer
set search_path = public, app, extensions
as $$
begin
  if lower(coalesce(p_username, '')) !~ '^[a-z0-9]{3,40}$' then
    raise exception 'username may contain only letters and numbers (3-40 characters)';
  end if;
  if length(coalesce(p_password, '')) < 6 then
    raise exception 'password must be at least 6 characters';
  end if;

  insert into public.users (username, password_hash, full_name, role, approval_status)
  values (
    lower(p_username),
    extensions.crypt(p_password, extensions.gen_salt('bf')),
    p_full_name,
    'employee',
    'pending'
  );
exception
  when unique_violation then
    raise exception 'username already taken';
end;
$$;

-- Admin-created users: same explicit username-format check before the
-- role-authorization rules.
create or replace function public.admin_create_user(
  p_username      text,
  p_password      text,
  p_full_name     text,
  p_role          app.user_role,
  p_branch_access text[] default '{}',
  p_access_flags  jsonb  default '{}'::jsonb
) returns uuid
language plpgsql security definer
set search_path = public, app, extensions
as $$
declare v_id uuid;
begin
  if lower(coalesce(p_username, '')) !~ '^[a-z0-9]{3,40}$' then
    raise exception 'username may contain only letters and numbers (3-40 characters)';
  end if;

  if app.is_superadmin() then
    null;  -- superAdmin: any role allowed
  elsif app.is_admin() and p_role in ('accountant', 'employee') then
    null;  -- Admin: non-admin roles only
  else
    raise exception 'not authorized to create a user with role %', p_role
      using errcode = '42501';
  end if;

  insert into public.users
    (username, password_hash, full_name, role, branch_access, access_flags, approval_status)
  values
    (lower(p_username),
     extensions.crypt(p_password, extensions.gen_salt('bf')),
     p_full_name, p_role, p_branch_access, p_access_flags, 'approved')
  returning id into v_id;

  return v_id;
end;
$$;
