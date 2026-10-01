-- ============================================================================
-- 27. Push notifications (2026-10-01)
--
--   1. public.push_subscriptions holds one row per device endpoint. A row is
--      readable and deletable by its owner only; it is written through
--      save_push_subscription, which hands an endpoint to whoever signs in on
--      that device, so a shared phone never notifies the previous user.
--   2. app.settings gains push_function_url and push_secret. The developer
--      sets them once after deploying the send-push Edge Function:
--        update app.settings
--        set push_function_url = 'https://<ref>.supabase.co/functions/v1/send-push',
--            push_secret       = '<same value as the PUSH_SECRET function secret>';
--      Until both are set, every push is a no-op.
--   3. Event pushes are deferred constraint triggers, so they read the row as
--      committed: a voucher inserted pending and approved in the same
--      transaction never asks for approval. The actor is never notified.
--        vouchers      becomes pending          -> managers of its branch
--                      approved / rejected      -> its creator
--        payments      inserted pending         -> managers of its branch
--        transactions  sale verified / rejected -> its creator
--   4. app.send_due_digest runs daily at 08:00 Asia/Manila (00:00 UTC):
--      each subscribed superadmin, admin, accountant and the developer gets
--      the count of open or partial receivables and payables due today or
--      overdue in the branches they can see. Nothing is sent for zero.
--   Nothing is dropped or renamed.
-- ============================================================================

create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron with schema pg_catalog;

alter table app.settings
  add column if not exists push_function_url text not null default '',
  add column if not exists push_secret       text not null default '';

-- ----------------------------------------------------------------------------
-- 1. Subscriptions
-- ----------------------------------------------------------------------------
create table if not exists public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null,
  endpoint   text not null unique,
  p256dh     text not null,
  auth       text not null,
  user_agent text,
  created_at timestamptz not null default now()
);
create index if not exists push_subscriptions_user_idx
  on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;
revoke all on public.push_subscriptions from anon;

drop policy if exists push_own_select on public.push_subscriptions;
create policy push_own_select on public.push_subscriptions
  for select to authenticated
  using (user_id = app.user_id());

drop policy if exists push_own_delete on public.push_subscriptions;
create policy push_own_delete on public.push_subscriptions
  for delete to authenticated
  using (user_id = app.user_id());

create or replace function public.save_push_subscription(
  p_endpoint   text,
  p_p256dh     text,
  p_auth       text,
  p_user_agent text default null
) returns void
language plpgsql security definer set search_path = public, app as $$
begin
  if app.user_id() is null or app.user_role() is null then
    raise exception 'Sign in to turn on notifications';
  end if;
  if coalesce(p_endpoint, '') = '' or coalesce(p_p256dh, '') = '' or coalesce(p_auth, '') = '' then
    raise exception 'This device returned an incomplete push subscription';
  end if;

  insert into public.push_subscriptions (user_id, endpoint, p256dh, auth, user_agent)
  values (app.user_id(), p_endpoint, p_p256dh, p_auth, left(p_user_agent, 300))
  on conflict (endpoint) do update
    set user_id    = excluded.user_id,
        p256dh     = excluded.p256dh,
        auth       = excluded.auth,
        user_agent = excluded.user_agent;
end;
$$;

create or replace function public.delete_push_subscription(p_endpoint text) returns void
language sql security definer set search_path = public, app as $$
  delete from public.push_subscriptions
  where endpoint = p_endpoint
    and user_id = app.user_id();
$$;

revoke execute on function public.save_push_subscription(text, text, text, text) from public, anon;
revoke execute on function public.delete_push_subscription(text) from public, anon;
grant execute on function public.save_push_subscription(text, text, text, text) to authenticated;
grant execute on function public.delete_push_subscription(text) to authenticated;

-- ----------------------------------------------------------------------------
-- 2. Recipients and delivery
-- ----------------------------------------------------------------------------
create or replace function app.push_managers(p_branch text) returns uuid[]
language sql stable security definer set search_path = public, app as $$
  select coalesce(array_agg(distinct recipient.user_id), '{}'::uuid[])
  from (
    select u.id as user_id
    from public.users u
    where u.approval_status = 'approved'
      and (
        u.role::text = 'superadmin'
        or (u.role::text = 'admin' and p_branch = any (u.branch_access))
      )
    union
    select a.user_id from app.authorities a
  ) recipient;
$$;

create or replace function app.peso(p_amount numeric) returns text
language sql immutable as $$
  select '₱' || to_char(p_amount, 'FM999,999,999,990.00');
$$;

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
      'tag', p_tag
    )
  );
end;
$$;

revoke execute on function app.push_managers(text) from public;
revoke execute on function app.send_push(uuid[], text, text, text, text) from public;

-- ----------------------------------------------------------------------------
-- 3. Event pushes
-- ----------------------------------------------------------------------------
create or replace function app.push_voucher_event() returns trigger
language plpgsql security definer set search_path = public, app as $$
declare
  v_voucher public.vouchers;
  v_label text;
begin
  select * into v_voucher from public.vouchers where id = new.id;
  if not found or v_voucher.status is distinct from new.status then
    return null;
  end if;
  if tg_op = 'UPDATE' and old.status is not distinct from new.status then
    return null;
  end if;

  v_label := concat_ws(' · ', v_voucher.voucher_no, v_voucher.payee, app.peso(v_voucher.amount));

  if v_voucher.status = 'pending' then
    perform app.send_push(
      app.push_managers(v_voucher.branch),
      'Voucher needs approval',
      v_label,
      '/vouchers',
      'voucher-' || v_voucher.id
    );
  elsif tg_op = 'UPDATE' and v_voucher.created_by is not null then
    perform app.send_push(
      array[v_voucher.created_by],
      case v_voucher.status when 'approved' then 'Voucher approved' else 'Voucher rejected' end,
      v_label,
      '/vouchers',
      'voucher-' || v_voucher.id
    );
  end if;
  return null;
end;
$$;

drop trigger if exists vouchers_push on public.vouchers;
create constraint trigger vouchers_push
  after insert or update of status on public.vouchers
  deferrable initially deferred
  for each row execute function app.push_voucher_event();

create or replace function app.push_payment_event() returns trigger
language plpgsql security definer set search_path = public, app as $$
declare
  v_payment public.payments;
begin
  select * into v_payment from public.payments where id = new.id;
  if not found or v_payment.status <> 'pending' or v_payment.branch is null then
    return null;
  end if;

  perform app.send_push(
    app.push_managers(v_payment.branch),
    'Payment needs verification',
    concat_ws(' · ', v_payment.party_name, app.peso(v_payment.amount)),
    case v_payment.kind when 'receivable' then '/receivables' else '/payables' end,
    'payment-' || v_payment.id
  );
  return null;
end;
$$;

drop trigger if exists payments_push on public.payments;
create constraint trigger payments_push
  after insert on public.payments
  deferrable initially deferred
  for each row execute function app.push_payment_event();

create or replace function app.push_sale_event() returns trigger
language plpgsql security definer set search_path = public, app as $$
declare
  v_sale public.transactions;
begin
  if new.type <> 'sale' or old.sale_status is not distinct from new.sale_status then
    return null;
  end if;

  select * into v_sale from public.transactions where id = new.id;
  if not found
    or v_sale.sale_status is distinct from new.sale_status
    or v_sale.sale_status not in ('verified', 'rejected')
    or v_sale.created_by is null then
    return null;
  end if;

  perform app.send_push(
    array[v_sale.created_by],
    case v_sale.sale_status when 'verified' then 'Sale verified' else 'Sale rejected' end,
    concat_ws(' · ', v_sale.reference_number, app.peso(v_sale.amount),
      case when v_sale.sale_status = 'rejected' then v_sale.rejection_reason end),
    '/sales',
    'sale-' || v_sale.id
  );
  return null;
end;
$$;

drop trigger if exists transactions_sale_push on public.transactions;
create constraint trigger transactions_sale_push
  after update of sale_status on public.transactions
  deferrable initially deferred
  for each row execute function app.push_sale_event();

-- ----------------------------------------------------------------------------
-- 4. Daily due digest
-- ----------------------------------------------------------------------------
create or replace function app.send_due_digest() returns void
language plpgsql security definer set search_path = public, app as $$
declare
  v_today date := (now() at time zone 'Asia/Manila')::date;
  v_recipient record;
begin
  for v_recipient in
    with recipients as (
      select u.id as user_id,
             case when u.role::text = 'superadmin' then null else u.branch_access end as branches
      from public.users u
      where u.approval_status = 'approved'
        and u.role::text in ('superadmin', 'admin', 'accountant')
      union all
      select a.user_id, null::text[] from app.authorities a
    )
    select
      r.user_id,
      (select count(*) from public.receivables x
       where x.status <> 'paid' and x.due_date <= v_today
         and (r.branches is null or x.branch = any (r.branches))) as receivable_count,
      (select count(*) from public.payables x
       where x.status <> 'paid' and x.due_date <= v_today
         and (r.branches is null or x.branch = any (r.branches))) as payable_count
    from recipients r
    where exists (select 1 from public.push_subscriptions s where s.user_id = r.user_id)
  loop
    continue when v_recipient.receivable_count + v_recipient.payable_count = 0;

    perform app.send_push(
      array[v_recipient.user_id],
      'Due today',
      concat_ws(', ',
        case when v_recipient.receivable_count > 0 then
          v_recipient.receivable_count || ' receivable'
          || case when v_recipient.receivable_count = 1 then '' else 's' end end,
        case when v_recipient.payable_count > 0 then
          v_recipient.payable_count || ' payable'
          || case when v_recipient.payable_count = 1 then '' else 's' end end
      ) || ' due or overdue',
      case when v_recipient.receivable_count > 0 then '/receivables' else '/payables' end,
      'due-digest'
    );
  end loop;
end;
$$;

revoke execute on function app.send_due_digest() from public;

select cron.schedule(
  'tartar-due-digest',
  '0 0 * * *',
  'select app.send_due_digest()'
);
