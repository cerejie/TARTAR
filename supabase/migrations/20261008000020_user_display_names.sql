-- ============================================================================
-- User display names (2026-09-30)
--
--   1. user_display_names returns the id and display name (full name, else
--      username) of the users the caller may see named on records: the caller,
--      every admin (admins approve and reject), and every user sharing a
--      branch the caller can see. Employees and accountants cannot read
--      public.users, so this is SECURITY DEFINER; superadmin and admin see
--      every user.
--   Nothing is dropped or renamed.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. user_display_names
-- ----------------------------------------------------------------------------
create or replace function public.user_display_names()
returns table (id uuid, name text)
language sql stable security definer set search_path = public, app as $$
  select
    u.id,
    coalesce(nullif(trim(u.full_name), ''), u.username)
  from public.users u
  where app.branch_access() is null
    or u.id = app.user_id()
    or u.role = 'admin'
    or u.branch_access && app.branch_access();
$$;

revoke execute on function public.user_display_names() from public;
grant execute on function public.user_display_names() to authenticated;
