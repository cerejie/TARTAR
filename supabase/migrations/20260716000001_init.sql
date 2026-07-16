-- ============================================================================
-- TARTAR BMS — Milestone 2: schema, RLS, and custom-user login RPC
-- ----------------------------------------------------------------------------
-- Auth model (non-standard, see build spec §4):
--   * Exactly ONE Supabase Auth account exists = the superAdmin (the Developer).
--     It is the sole email/password login (kept to one account to stay within
--     the free-tier auth limit) and has overall access, including assigning any
--     role (admin, accountant, employee, ...).
--   * ALL other users — INCLUDING the Admin (business Owner) — live in the
--     custom `public.users` table and DO NOT use Supabase Auth. They
--     authenticate via public.login(), which mints a JWT signed with the
--     project's own JWT secret so PostgREST + RLS enforce their role and branch
--     scope exactly like a native session.
--   * Admin (Owner) manages employees / accountants / other NON-admin users and
--     runs the business, but cannot manage the superAdmin or other admins.
-- ============================================================================

create schema if not exists app;
create extension if not exists pgcrypto with schema extensions;  -- crypt/gen_salt/hmac

-- ----------------------------------------------------------------------------
-- 0. JWT secret (used by the login RPC to sign custom-user tokens)
--    Not exposed via PostgREST (lives in the private `app` schema).
--    superAdmin must set this ONCE to the project's JWT secret:
--      Project Settings -> API -> JWT Settings -> JWT Secret
--    e.g.  update app.settings set jwt_secret = '<PROJECT_JWT_SECRET>';
-- ----------------------------------------------------------------------------
create table if not exists app.settings (
  id         boolean primary key default true check (id),
  jwt_secret text not null default ''
);
insert into app.settings (id) values (true) on conflict (id) do nothing;

-- ============================================================================
-- 1. Enumerated types
--    NOTE: 'superadmin' is NOT a stored role — it is the Supabase Auth session
--    and is derived at runtime. The users table only holds non-superadmin roles.
--    Add future roles with:  alter type app.user_role add value '<name>';
-- ============================================================================
create type app.user_role        as enum ('admin', 'accountant', 'employee');
create type app.approval_status  as enum ('pending', 'approved', 'rejected');
create type app.transaction_type as enum (
  'sale', 'expense', 'customer_payment', 'supplier_payment',
  'cash_deposit', 'petty_cash', 'purchase', 'collection'
);
create type app.income_source    as enum ('product_sales', 'rental_income');
create type app.expense_type     as enum (
  'electricity', 'water', 'internet', 'salaries',
  'office_supplies', 'repairs_maintenance', 'taxes'
);
create type app.cash_account     as enum ('cash_drawer', 'bank_account');
create type app.voucher_type     as enum ('check', 'cash');
create type app.voucher_status   as enum ('pending', 'approved', 'rejected');
create type app.ledger_status    as enum ('open', 'partial', 'paid');

-- ============================================================================
-- 2. Reference / master data
-- ============================================================================
create table public.branches (
  slug text primary key,          -- hardware | rental | woodworks | farm
  name text not null,
  sort int  not null default 0
);
insert into public.branches (slug, name, sort) values
  ('hardware',  'LGC Hardware & General Merchandise', 1),
  ('rental',    'LGC Rental',                         2),
  ('woodworks', 'AFC Wood Industry',                  3),
  ('farm',      'TARTAR Farm',                        4);

create table public.farm_sections (
  slug text primary key,          -- banana | rubber | coconut | fruit
  name text not null
);
insert into public.farm_sections (slug, name) values
  ('banana',  'Banana'),
  ('rubber',  'Rubber'),
  ('coconut', 'Coconut'),
  ('fruit',   'Fruit');

create table public.customers (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  contact    text,
  created_at timestamptz not null default now()
);

create table public.suppliers (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  contact    text,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 3. Custom users (Admin, Accountant, Employee, ...).
--    superAdmin is NOT stored here — the superAdmin is the auth.users account.
-- ============================================================================
create table public.users (
  id              uuid primary key default gen_random_uuid(),
  username        text not null unique,
  password_hash   text not null,                       -- bcrypt via pgcrypto
  full_name       text,
  role            app.user_role       not null default 'employee',
  access_flags    jsonb               not null default '{}'::jsonb,
  approval_status app.approval_status not null default 'pending',
  branch_access   text[]              not null default '{}',  -- branches.slug[]
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index users_approval_idx on public.users (approval_status);

-- ============================================================================
-- 4. Cash management (financial standing — superAdmin & Admin only)
-- ============================================================================
create table public.cash_accounts (
  branch     text not null references public.branches (slug),
  account    app.cash_account not null,
  balance    numeric(14,2) not null default 0,
  updated_at timestamptz not null default now(),
  primary key (branch, account)
);

-- ============================================================================
-- 5. Transactions ledger (what employees encode)
-- ============================================================================
create table public.transactions (
  id               uuid primary key default gen_random_uuid(),
  type             app.transaction_type not null,
  branch           text not null references public.branches (slug),
  farm_section     text references public.farm_sections (slug),
  txn_date         date  not null default current_date,
  amount           numeric(14,2) not null check (amount >= 0),
  reference_number text,
  description      text,
  customer_id      uuid references public.customers (id),
  supplier_id      uuid references public.suppliers (id),
  cash_account     app.cash_account,     -- which drawer/bank it hit, if any
  income_source    app.income_source,    -- for sales / rental income
  expense_type     app.expense_type,     -- for expenses
  created_by       uuid,                 -- users.id OR superAdmin auth.uid()
  created_at       timestamptz not null default now(),
  -- farm_section only valid on the farm branch
  constraint farm_section_scope check (farm_section is null or branch = 'farm')
);
create index transactions_branch_date_idx on public.transactions (branch, txn_date);
create index transactions_ref_idx         on public.transactions (reference_number);
create index transactions_customer_idx    on public.transactions (customer_id);
create index transactions_supplier_idx    on public.transactions (supplier_id);

-- ============================================================================
-- 6. Receivables (customers pay later) & Payables (bought on credit)
-- ============================================================================
create table public.receivables (
  id               uuid primary key default gen_random_uuid(),
  branch           text not null references public.branches (slug),
  customer_id      uuid references public.customers (id),
  customer_name    text not null,
  amount           numeric(14,2) not null check (amount >= 0),
  paid_amount      numeric(14,2) not null default 0 check (paid_amount >= 0),
  due_date         date not null,
  reference_number text,
  status           app.ledger_status not null default 'open',
  created_by       uuid,
  created_at       timestamptz not null default now()
);
create index receivables_due_idx on public.receivables (due_date, status);

create table public.payables (
  id               uuid primary key default gen_random_uuid(),
  branch           text not null references public.branches (slug),
  supplier_id      uuid references public.suppliers (id),
  supplier_name    text not null,
  amount           numeric(14,2) not null check (amount >= 0),
  paid_amount      numeric(14,2) not null default 0 check (paid_amount >= 0),
  due_date         date not null,
  reference_number text,
  status           app.ledger_status not null default 'open',
  created_by       uuid,
  created_at       timestamptz not null default now()
);
create index payables_due_idx on public.payables (due_date, status);

-- ============================================================================
-- 7. Vouchers (Employee creates -> Admin/superAdmin approves -> only then printable)
-- ============================================================================
create table public.vouchers (
  id          uuid primary key default gen_random_uuid(),
  voucher_no  text unique,
  type        app.voucher_type not null,
  branch      text not null references public.branches (slug),
  payee       text not null,
  amount      numeric(14,2) not null check (amount >= 0),
  purpose     text,
  status      app.voucher_status not null default 'pending',
  printed     boolean not null default false,
  created_by  uuid,
  approved_by uuid,               -- Admin (users.id) or superAdmin (auth.uid())
  approved_at timestamptz,
  created_at  timestamptz not null default now()
);
create index vouchers_status_idx on public.vouchers (status);

-- ============================================================================
-- 8. updated_at maintenance
-- ============================================================================
create or replace function app.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger users_touch        before update on public.users
  for each row execute function app.touch_updated_at();
create trigger cash_accounts_touch before update on public.cash_accounts
  for each row execute function app.touch_updated_at();

-- ============================================================================
-- 9. JWT signing helpers (HS256) used by the login RPC
-- ============================================================================
create or replace function app.url_encode(data bytea) returns text
language sql immutable strict as $$
  -- base64url without padding
  select translate(encode(data, 'base64'), E'+/=\n', '-_');
$$;

create or replace function app.sign_jwt(payload jsonb) returns text
language sql volatile as $$
  with parts as (
    select
      app.url_encode(convert_to('{"alg":"HS256","typ":"JWT"}', 'utf8')) as header,
      app.url_encode(convert_to(payload::text, 'utf8'))                 as body
  ),
  signing as (
    select header || '.' || body as data,
           (select jwt_secret from app.settings limit 1) as secret
    from parts
  )
  select data || '.' ||
         app.url_encode(extensions.hmac(data, secret, 'sha256'))
  from signing;
$$;

-- ============================================================================
-- 10. Identity / role helpers used by RLS
-- ----------------------------------------------------------------------------
--   is_superadmin() : the single Supabase Auth session (the Developer).
--   is_admin()      : a custom user whose role = 'admin' (the Owner).
--   is_manager()    : superAdmin OR admin -> full business control.
-- ============================================================================
create or replace function app.jwt() returns jsonb
language sql stable as $$
  select coalesce(
    nullif(current_setting('request.jwt.claims', true), '')::jsonb,
    '{}'::jsonb
  );
$$;

-- The superAdmin is the only genuine Supabase Auth session. Custom-user tokens
-- carry is_custom_user=true, so the superAdmin is "authenticated and not custom".
create or replace function app.is_superadmin() returns boolean
language sql stable as $$
  select auth.role() = 'authenticated'
     and coalesce((app.jwt() ->> 'is_custom_user')::boolean, false) = false;
$$;

create or replace function app.user_role() returns text
language sql stable as $$
  select case when app.is_superadmin() then 'superadmin'
              else app.jwt() ->> 'user_role' end;
$$;

create or replace function app.is_admin() returns boolean
language sql stable as $$
  select app.user_role() = 'admin';
$$;

-- Full business control: the superAdmin (Developer) or an Admin (Owner).
create or replace function app.is_manager() returns boolean
language sql stable as $$
  select app.is_superadmin() or app.is_admin();
$$;

create or replace function app.user_id() returns uuid
language sql stable as $$
  select nullif(app.jwt() ->> 'sub', '')::uuid;
$$;

-- NULL = "all branches" (superAdmin, Admin, and Accountant who sees everything).
create or replace function app.branch_access() returns text[]
language sql stable as $$
  select case
    when app.user_role() in ('superadmin', 'admin', 'accountant') then null
    else coalesce(
      array(select jsonb_array_elements_text(app.jwt() -> 'branch_access')),
      '{}'::text[]
    )
  end;
$$;

create or replace function app.can_see_branch(p_branch text) returns boolean
language sql stable as $$
  select app.branch_access() is null or p_branch = any (app.branch_access());
$$;

-- ============================================================================
-- 11. Auth RPCs (SECURITY DEFINER — bypass RLS deliberately, validate inside)
-- ============================================================================

-- Self-registration: creates a PENDING employee. Admin/superAdmin approves later.
create or replace function public.register(
  p_username  text,
  p_password  text,
  p_full_name text default null
) returns void
language plpgsql security definer
set search_path = public, app, extensions
as $$
begin
  if length(coalesce(p_username, '')) < 3 or length(coalesce(p_password, '')) < 6 then
    raise exception 'username must be >= 3 chars and password >= 6 chars';
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

-- Custom-user login (Admin / Accountant / Employee): verifies credentials,
-- requires approval, returns a signed JWT + a public profile. The frontend
-- attaches the token as the Authorization: Bearer header so RLS applies.
create or replace function public.login(
  p_username text,
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
  where username = lower(p_username);

  if not found
     or v_user.password_hash <> extensions.crypt(p_password, v_user.password_hash) then
    raise exception 'invalid username or password' using errcode = '28P01';
  end if;

  if v_user.approval_status <> 'approved' then
    raise exception 'account is %', v_user.approval_status using errcode = '28000';
  end if;

  v_claims := jsonb_build_object(
    'role',           'authenticated',
    'aud',            'authenticated',
    'sub',            v_user.id::text,
    'iat',            v_now,
    'exp',            v_now + 60 * 60 * 8,          -- 8-hour session
    'is_custom_user', true,
    'username',       v_user.username,
    'user_role',      v_user.role,
    'branch_access',  to_jsonb(v_user.branch_access),
    'access_flags',   v_user.access_flags
  );

  return jsonb_build_object(
    'token', app.sign_jwt(v_claims),
    'user',  jsonb_build_object(
      'id',            v_user.id,
      'username',      v_user.username,
      'full_name',     v_user.full_name,
      'role',          v_user.role,
      'access_flags',  v_user.access_flags,
      'branch_access', v_user.branch_access
    )
  );
end;
$$;

-- Create an already-approved user with a server-hashed password.
--   * superAdmin may create ANY role (including admin).
--   * Admin may create only NON-admin roles (accountant, employee, ...).
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

-- Reset a user's password (hashed server-side).
--   * superAdmin may reset anyone.
--   * Admin may reset only NON-admin users.
create or replace function public.admin_set_password(
  p_user_id  uuid,
  p_password text
) returns void
language plpgsql security definer
set search_path = public, app, extensions
as $$
declare v_role app.user_role;
begin
  select role into v_role from public.users where id = p_user_id;
  if not found then
    raise exception 'user not found';
  end if;

  if app.is_superadmin() then
    null;
  elsif app.is_admin() and v_role in ('accountant', 'employee') then
    null;
  else
    raise exception 'not authorized to reset this user''s password'
      using errcode = '42501';
  end if;

  update public.users
     set password_hash = extensions.crypt(p_password, extensions.gen_salt('bf'))
   where id = p_user_id;
end;
$$;

grant execute on function public.register(text, text, text)            to anon, authenticated;
grant execute on function public.login(text, text)                     to anon, authenticated;
grant execute on function public.admin_create_user(text, text, text, app.user_role, text[], jsonb) to authenticated;
grant execute on function public.admin_set_password(uuid, text)        to authenticated;

-- ============================================================================
-- 12. Row Level Security
-- ============================================================================
alter table public.branches      enable row level security;
alter table public.farm_sections enable row level security;
alter table public.customers     enable row level security;
alter table public.suppliers     enable row level security;
alter table public.users         enable row level security;
alter table public.cash_accounts enable row level security;
alter table public.transactions  enable row level security;
alter table public.receivables   enable row level security;
alter table public.payables      enable row level security;
alter table public.vouchers      enable row level security;

-- --- Reference data: readable by everyone signed in; writable by managers ----
create policy ref_read_branches on public.branches
  for select to authenticated using (true);
create policy ref_write_branches on public.branches
  for all to authenticated using (app.is_manager()) with check (app.is_manager());

create policy ref_read_farm on public.farm_sections
  for select to authenticated using (true);
create policy ref_write_farm on public.farm_sections
  for all to authenticated using (app.is_manager()) with check (app.is_manager());

-- Customers / suppliers: all signed-in roles read; managers + employees create;
-- managers edit/delete.
create policy customers_read on public.customers
  for select to authenticated using (true);
create policy customers_insert on public.customers
  for insert to authenticated
  with check (app.is_manager() or app.user_role() = 'employee');
create policy customers_modify on public.customers
  for update to authenticated using (app.is_manager()) with check (app.is_manager());
create policy customers_delete on public.customers
  for delete to authenticated using (app.is_manager());

create policy suppliers_read on public.suppliers
  for select to authenticated using (true);
create policy suppliers_insert on public.suppliers
  for insert to authenticated
  with check (app.is_manager() or app.user_role() = 'employee');
create policy suppliers_modify on public.suppliers
  for update to authenticated using (app.is_manager()) with check (app.is_manager());
create policy suppliers_delete on public.suppliers
  for delete to authenticated using (app.is_manager());

-- --- Users table ------------------------------------------------------------
-- superAdmin: full control over everyone.
-- Admin: manage NON-admin users only (cannot see/create/modify/delete admins,
--        cannot elevate anyone to admin, cannot touch the superAdmin — which
--        isn't in this table anyway).
-- Any user: read their own row.
create policy users_superadmin_all on public.users
  for all to authenticated using (app.is_superadmin()) with check (app.is_superadmin());

create policy users_admin_read on public.users
  for select to authenticated
  using (app.is_admin() and role in ('accountant', 'employee'));
create policy users_admin_insert on public.users
  for insert to authenticated
  with check (app.is_admin() and role in ('accountant', 'employee'));
create policy users_admin_update on public.users
  for update to authenticated
  using (app.is_admin() and role in ('accountant', 'employee'))
  with check (app.is_admin() and role in ('accountant', 'employee'));
create policy users_admin_delete on public.users
  for delete to authenticated
  using (app.is_admin() and role in ('accountant', 'employee'));

create policy users_self_read on public.users
  for select to authenticated using (id = app.user_id());

-- --- Cash accounts = "financial standing": managers ONLY --------------------
create policy cash_manager_all on public.cash_accounts
  for all to authenticated using (app.is_manager()) with check (app.is_manager());

-- --- Transactions -----------------------------------------------------------
-- Managers: all. Accountant: read all (Income & Expenses for BIR).
-- Employee: read + encode within assigned branches only.
create policy tx_manager_all on public.transactions
  for all to authenticated using (app.is_manager()) with check (app.is_manager());
create policy tx_accountant_read on public.transactions
  for select to authenticated using (app.user_role() = 'accountant');
create policy tx_employee_read on public.transactions
  for select to authenticated
  using (app.user_role() = 'employee' and app.can_see_branch(branch));
create policy tx_employee_insert on public.transactions
  for insert to authenticated
  with check (app.user_role() = 'employee' and app.can_see_branch(branch));

-- --- Receivables / Payables (Employees view reminders + encode payments) ----
create policy rcv_manager_all on public.receivables
  for all to authenticated using (app.is_manager()) with check (app.is_manager());
create policy rcv_accountant_read on public.receivables
  for select to authenticated using (app.user_role() = 'accountant');
create policy rcv_employee_read on public.receivables
  for select to authenticated
  using (app.user_role() = 'employee' and app.can_see_branch(branch));
create policy rcv_employee_write on public.receivables
  for insert to authenticated
  with check (app.user_role() = 'employee' and app.can_see_branch(branch));
create policy rcv_employee_update on public.receivables
  for update to authenticated
  using (app.user_role() = 'employee' and app.can_see_branch(branch))
  with check (app.user_role() = 'employee' and app.can_see_branch(branch));

create policy pay_manager_all on public.payables
  for all to authenticated using (app.is_manager()) with check (app.is_manager());
create policy pay_accountant_read on public.payables
  for select to authenticated using (app.user_role() = 'accountant');
create policy pay_employee_read on public.payables
  for select to authenticated
  using (app.user_role() = 'employee' and app.can_see_branch(branch));
create policy pay_employee_write on public.payables
  for insert to authenticated
  with check (app.user_role() = 'employee' and app.can_see_branch(branch));
create policy pay_employee_update on public.payables
  for update to authenticated
  using (app.user_role() = 'employee' and app.can_see_branch(branch))
  with check (app.user_role() = 'employee' and app.can_see_branch(branch));

-- --- Vouchers: Employee creates within branch; ONLY managers approve --------
create policy vch_manager_all on public.vouchers
  for all to authenticated using (app.is_manager()) with check (app.is_manager());
create policy vch_employee_read on public.vouchers
  for select to authenticated
  using (app.user_role() = 'employee' and app.can_see_branch(branch));
create policy vch_employee_insert on public.vouchers
  for insert to authenticated
  with check (
    app.user_role() = 'employee'
    and app.can_see_branch(branch)
    and status = 'pending'      -- employees cannot self-approve
    and printed = false
  );
-- (No employee UPDATE policy => approval & printing are manager-only.)
