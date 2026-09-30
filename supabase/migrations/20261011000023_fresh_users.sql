-- ============================================================================
-- Fresh accounts for email sign-in (2026-09-30)
--
--   Apply after 20261010000022. Every table user was created with a
--   username and no email, so none can sign in any more. They are removed,
--   and so is every Supabase Auth account except the developer. Records
--   that name a removed user keep their rows; the name no longer resolves.
--   The superadmin signs up again by email and the developer approves them.
--   Nothing is dropped or renamed.
-- ============================================================================

delete from public.users;

delete from auth.users
where lower(coalesce(email, '')) <> 'cerejie1342@gmail.com';
