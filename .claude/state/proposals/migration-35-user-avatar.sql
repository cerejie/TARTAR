-- ============================================================================
-- PROPOSAL — migration 35: user profile pictures
-- Status: NOT APPLIED. Lives outside supabase/migrations/ so `db push` cannot
-- pick it up. Copy into supabase/migrations/<timestamp>_user_avatar.sql once
-- approved. The client (Development v2.80) already ships: until this is
-- applied the avatar query fails on its own and every avatar shows initials;
-- the Users list and every other screen keep working.
-- ----------------------------------------------------------------------------
-- Decisions (user, 2026-10-04): public bucket; only the user changes their own
-- picture, from Account settings, anytime; only users have avatars (customers,
-- suppliers and master data show names only).
--
-- Shape:
--   * users.avatar_path — nullable, additive. Always '<user id>/avatar.webp'
--     or null. The client busts caches with users.updated_at (users_touch).
--   * storage bucket 'avatars' — public read, 2 MB, jpeg / png / webp only.
--     The client resizes to a 256 px webp before upload (~10–30 KB).
--   * storage.objects policies — a caller may write / replace / delete only
--     objects under their own '<auth.uid()>/' folder. Custom-login tokens carry
--     sub = users.id and role authenticated, so auth.uid() is the users.id.
--   * public.set_own_avatar(p_path) — security definer; sets avatar_path on the
--     caller's own row only (users_manage_update would otherwise let an admin
--     set someone else's, and employees have no update policy at all). Accepts
--     null (remove) or exactly '<caller id>/avatar.webp'.
-- ============================================================================

alter table public.users
  add column if not exists avatar_path text;

alter table public.users
  drop constraint if exists users_avatar_path_own_folder;
alter table public.users
  add constraint users_avatar_path_own_folder
  check (avatar_path is null or avatar_path = id::text || '/avatar.webp');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists avatars_own_insert on storage.objects;
create policy avatars_own_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists avatars_own_update on storage.objects;
create policy avatars_own_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists avatars_own_delete on storage.objects;
create policy avatars_own_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Upsert (replace) needs the caller to see their own object row.
drop policy if exists avatars_own_select on storage.objects;
create policy avatars_own_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create or replace function public.set_own_avatar(p_path text)
returns void
language plpgsql security definer set search_path = public, app as $$
declare
  v_user_id uuid := app.user_id();
begin
  if v_user_id is null then
    raise exception 'Sign in to change your profile picture.';
  end if;

  if p_path is not null and p_path <> v_user_id::text || '/avatar.webp' then
    raise exception 'A profile picture can only be set on your own account.';
  end if;

  update public.users
     set avatar_path = p_path
   where id = v_user_id;
end;
$$;

revoke execute on function public.set_own_avatar(text) from public, anon;
grant execute on function public.set_own_avatar(text) to authenticated;
