-- ============================================================================
-- 28. Notification inbox (2026-10-01)  — apply after 27
--
--   1. public.notifications keeps one row per recipient per event, whether
--      or not that person turned push on. Each user reads only their own
--      rows and marks them read through mark_notifications_read (null = all).
--   2. app.notify saves the inbox rows (never for the actor) and then pushes
--      through app.send_push. The voucher, payment and sale event triggers
--      from 27 now call app.notify. The 8 AM due digest stays push-only: the
--      due list is already live in the app.
--   3. public.notifications joins supabase_realtime so the bell and the
--      Alerts sheet update live; row-level security filters the rows.
--   4. A nightly cron deletes read notifications older than 30 days.
--   Nothing is dropped or renamed.
-- ============================================================================

create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null,
  title      text not null,
  body       text not null default '',
  url        text not null default '/',
  tag        text,
  created_at timestamptz not null default now(),
  read_at    timestamptz
);
create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);
create index if not exists notifications_read_idx
  on public.notifications (read_at) where read_at is not null;

alter table public.notifications enable row level security;
revoke all on public.notifications from anon;

drop policy if exists notifications_own_select on public.notifications;
create policy notifications_own_select on public.notifications
  for select to authenticated
  using (user_id = app.user_id());

create or replace function public.mark_notifications_read(p_ids uuid[] default null) returns void
language sql security definer set search_path = public, app as $$
  update public.notifications
  set read_at = now()
  where user_id = app.user_id()
    and read_at is null
    and (p_ids is null or id = any (p_ids));
$$;

revoke execute on function public.mark_notifications_read(uuid[]) from public, anon;
grant execute on function public.mark_notifications_read(uuid[]) to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end;
$$;

-- ----------------------------------------------------------------------------
-- app.notify — inbox + push
-- ----------------------------------------------------------------------------
create or replace function app.notify(
  p_user_ids uuid[],
  p_title    text,
  p_body     text,
  p_url      text,
  p_tag      text
) returns void
language plpgsql security definer set search_path = public, app as $$
begin
  insert into public.notifications (user_id, title, body, url, tag)
  select distinct recipient, p_title, coalesce(p_body, ''), coalesce(p_url, '/'), p_tag
  from unnest(p_user_ids) as recipient
  where recipient is not null
    and recipient is distinct from app.user_id();

  perform app.send_push(p_user_ids, p_title, p_body, p_url, p_tag);
end;
$$;

revoke execute on function app.notify(uuid[], text, text, text, text) from public;

-- ----------------------------------------------------------------------------
-- Event triggers from 27, now through app.notify
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
    perform app.notify(
      app.push_managers(v_voucher.branch),
      'Voucher needs approval',
      v_label,
      '/vouchers',
      'voucher-' || v_voucher.id
    );
  elsif tg_op = 'UPDATE' and v_voucher.created_by is not null then
    perform app.notify(
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

create or replace function app.push_payment_event() returns trigger
language plpgsql security definer set search_path = public, app as $$
declare
  v_payment public.payments;
begin
  select * into v_payment from public.payments where id = new.id;
  if not found or v_payment.status <> 'pending' or v_payment.branch is null then
    return null;
  end if;

  perform app.notify(
    app.push_managers(v_payment.branch),
    'Payment needs verification',
    concat_ws(' · ', v_payment.party_name, app.peso(v_payment.amount)),
    case v_payment.kind when 'receivable' then '/receivables' else '/payables' end,
    'payment-' || v_payment.id
  );
  return null;
end;
$$;

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

  perform app.notify(
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

-- ----------------------------------------------------------------------------
-- Retention
-- ----------------------------------------------------------------------------
select cron.schedule(
  'tartar-notification-cleanup',
  '30 16 * * *',
  $$delete from public.notifications where read_at < now() - interval '30 days'$$
);
