-- ============================================================================
-- Admin management + customer master details (client decisions, 2026-07-22)
-- ----------------------------------------------------------------------------
--   7. An Admin may add, update and delete another Admin. The superAdmin is not
--      a row in public.users (it is the sole Supabase Auth account), so it stays
--      untouchable simply by dropping the role filter from the Admin policies.
--      An Admin still may not delete their own account — that would lock the
--      session out of the very screen it is using.
--   9. Customers become a master record with the same detail a supplier carries
--      (contact person, contact number, address). Receivables may still name a
--      customer as free text, so saving details for such a name creates the
--      master row and adopts that customer's existing history.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Admins manage admins
-- ----------------------------------------------------------------------------
-- Body is unchanged from 20260716000002 apart from the authorization branch.
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

  -- Every stored role, admin included, is now a manager's to create.
  if not app.is_manager() then
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

create or replace function public.admin_set_password(
  p_user_id  uuid,
  p_password text
) returns void
language plpgsql security definer
set search_path = public, app, extensions
as $$
begin
  if not exists (select 1 from public.users where id = p_user_id) then
    raise exception 'user not found';
  end if;

  if not app.is_manager() then
    raise exception 'not authorized to reset this user''s password'
      using errcode = '42501';
  end if;

  update public.users
     set password_hash = extensions.crypt(p_password, extensions.gen_salt('bf'))
   where id = p_user_id;
end;
$$;

-- RLS: same four Admin policies, no longer narrowed to non-admin rows.
drop policy if exists users_admin_read   on public.users;
drop policy if exists users_admin_insert on public.users;
drop policy if exists users_admin_update on public.users;
drop policy if exists users_admin_delete on public.users;

create policy users_admin_read on public.users
  for select to authenticated using (app.is_admin());
create policy users_admin_insert on public.users
  for insert to authenticated with check (app.is_admin());
create policy users_admin_update on public.users
  for update to authenticated using (app.is_admin()) with check (app.is_admin());
-- Self-deletion excluded: an Admin removing their own row would invalidate the
-- session mid-use, and only the superAdmin could restore it.
create policy users_admin_delete on public.users
  for delete to authenticated using (app.is_admin() and id <> app.user_id());

-- ----------------------------------------------------------------------------
-- 2. Customer master details
-- ----------------------------------------------------------------------------
-- Mirrors the supplier master record (20260721000006) so one form and one
-- service shape serve both parties.
alter table public.customers
  add column if not exists contact_person text,
  add column if not exists address        text;

/**
 * Save a customer's details from the Customer Ledger.
 *
 * `p_customer_id` is null for a receivable that only carries a free-typed name;
 * in that case the matching master record is reused when one already exists,
 * otherwise it is created. Either way the customer's receivables and payments
 * are re-pointed at the record and their denormalised name brought in step, so
 * the ledger shows a single identity from here on.
 *
 * SECURITY DEFINER: the adoption spans every branch (a customer is not
 * branch-scoped) while an employee's row access is not, so the write is
 * authorized by role here instead of by the ledger policies.
 */
create or replace function public.save_customer_details(
  p_customer_id    uuid,
  p_ledger_name    text,
  p_name           text,
  p_contact        text default null,
  p_contact_person text default null,
  p_address        text default null
) returns uuid
language plpgsql security definer
set search_path = public, app
as $$
declare
  v_id   uuid := p_customer_id;
  v_name text := nullif(trim(p_name), '');
begin
  if not (app.is_manager() or app.user_role() = 'employee') then
    raise exception 'not authorized to edit customer details' using errcode = '42501';
  end if;
  if v_name is null then
    raise exception 'A customer name is required';
  end if;

  if v_id is null then
    select id into v_id from public.customers where lower(name) = lower(v_name) limit 1;
  end if;

  if v_id is null then
    insert into public.customers (name, contact, contact_person, address)
    values (v_name, p_contact, p_contact_person, p_address)
    returning id into v_id;
  else
    update public.customers
       set name           = v_name,
           contact        = p_contact,
           contact_person = p_contact_person,
           address        = p_address
     where id = v_id;
    if not found then
      raise exception 'customer not found';
    end if;
  end if;

  update public.receivables
     set customer_id = v_id, customer_name = v_name
   where customer_id = v_id
      or (customer_id is null and customer_name = p_ledger_name);

  update public.payments
     set customer_id = v_id, party_name = v_name
   where kind = 'receivable'
     and (customer_id = v_id or (customer_id is null and party_name = p_ledger_name));

  return v_id;
end;
$$;

grant execute on function public.save_customer_details(uuid, text, text, text, text, text)
  to authenticated;
