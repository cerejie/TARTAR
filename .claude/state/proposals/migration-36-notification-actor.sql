-- ============================================================================
-- PROPOSAL — migration 36: notification actor (profile picture on notifications)
-- Status: NOT APPLIED. Apply after migration 35 (users.avatar_path). Copy into
-- supabase/migrations/<timestamp>_notification_actor.sql once approved, then
-- redeploy the send-push Edge Function.
-- ----------------------------------------------------------------------------
-- Decisions (user, 2026-10-04): the in-app inbox row and the push banner show
-- the photo of the person who acted; no actor or no photo falls back to the
-- kind icon (inbox) / app icon (push). iOS web push ignores custom icons.
--
-- Shape:
--   * notifications.actor_id — nullable uuid, additive. No foreign key: the
--     actor may be an app.authorities account that has no public.users row.
--     Rows written before this migration keep null.
--   * app.notify — same signature; stores app.user_id() as actor_id.
--   * app.send_push — same signature; adds actor_id to the Edge Function body.
--     The 08:00 due digest runs with no user, so its actor is null.
--   Nothing is dropped or renamed.
-- ============================================================================

alter table public.notifications
  add column if not exists actor_id uuid;

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
  insert into public.notifications (user_id, title, body, url, tag, pending, actor_id)
  select distinct recipient, p_title, coalesce(p_body, ''), coalesce(p_url, '/'), p_tag,
         coalesce(p_pending, false), app.user_id()
  from unnest(p_user_ids) as recipient
  where recipient is not null
    and recipient is distinct from app.user_id();

  perform app.send_push(p_user_ids, p_title, p_body, p_url, p_tag);
end;
$$;

revoke execute on function app.notify(uuid[], text, text, text, text, boolean) from public;

create or replace function app.send_push(
  p_user_ids uuid[],
  p_title    text,
  p_body     text,
  p_url      text,
  p_tag      text
) returns void
language plpgsql security definer set search_path = public, app, extensions as $$
declare
  v_settings app.settings;
  v_recipients uuid[];
begin
  select * into v_settings from app.settings where id;
  if coalesce(v_settings.push_function_url, '') = '' or coalesce(v_settings.push_secret, '') = '' then
    return;
  end if;

  select coalesce(array_agg(distinct s.user_id), '{}'::uuid[]) into v_recipients
  from public.push_subscriptions s
  where s.user_id = any (p_user_ids)
    and s.user_id is distinct from app.user_id();
  if cardinality(v_recipients) = 0 then
    return;
  end if;

  perform net.http_post(
    url     := v_settings.push_function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-push-secret', v_settings.push_secret
    ),
    body    := jsonb_build_object(
      'user_ids', to_jsonb(v_recipients),
      'title', p_title,
      'body', p_body,
      'url', p_url,
      'tag', p_tag,
      'actor_id', app.user_id()
    )
  );
end;
$$;

revoke execute on function app.send_push(uuid[], text, text, text, text) from public;
