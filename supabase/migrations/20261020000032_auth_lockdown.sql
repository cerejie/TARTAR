-- ============================================================================
-- 32. Auth lockdown   (RUN ONLY AFTER the new client is live in PRODUCTION)
--
-- Closes the old entry points that migration 31 replaced. Any browser still
-- running the old client can no longer sign in or request a reset until it
-- reloads into the new version, so run this after the merge + production
-- deploy, not before.
--
--   - login_email            -> replaced by login_account (lockout)
--   - request_password_reset -> replaced by request_password_help (flag only)
--   - account_email_exists   -> no longer needed; it revealed which emails exist
--   - decide_password_reset  -> replaced by admin_set_password / dismiss_password_reset
--
-- Nothing is dropped. Passwords staged through the old anonymous flow are
-- cleared so none of them can be approved later; the "Reset requested" flag
-- stays, so managers still see who asked.
-- ============================================================================

revoke execute on function public.login_email(text, text) from public, anon, authenticated;
revoke execute on function public.request_password_reset(text, text) from public, anon, authenticated;
revoke execute on function public.account_email_exists(text) from public, anon, authenticated;
revoke execute on function public.decide_password_reset(uuid, boolean) from public, anon, authenticated;

update public.users
   set pending_password_hash = null
 where pending_password_hash is not null;

notify pgrst, 'reload schema';
