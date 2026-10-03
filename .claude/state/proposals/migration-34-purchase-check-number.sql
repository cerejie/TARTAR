-- ============================================================================
-- PROPOSAL — migration 34: optional check number on a purchase
-- Status: NOT APPLIED. Lives outside supabase/migrations/ so `db push` cannot
-- pick it up. Copy into supabase/migrations/<timestamp>_purchase_check_number.sql
-- once approved; the client input ships after that (roadmap USER DECISIONS).
-- ----------------------------------------------------------------------------
-- Why a migration: a purchase and its voucher are written by one RPC
-- (create_transaction_with_voucher / update_transaction_with_voucher), queued
-- offline as one runWrite. Setting vouchers.check_number from the client would
-- be a second write that is not atomic with the first and cannot be queued
-- offline (the voucher id is unknown until the RPC returns). So the RPCs take
-- the check number themselves.
--
-- Rule (decided by autopilot P3, 2026-10-04): the field shows only when
-- "Paid from" is the bank account — that is the only case the voucher is a
-- check. vouchers_check_details_require_check (check details only on check
-- vouchers) stays as is. A cash voucher never stores a check number.
--
-- Latent bug fixed here too: app.sync_voucher_from_tx keeps check_bank when a
-- purchase is edited from bank account to cash, so the voucher becomes
-- type 'cash' with check_bank set and the check constraint rejects the edit.
-- The trigger now clears every check detail when the voucher stops being a
-- check.
--
-- Incomplete on purpose: the drops, bodies and grants below are commented out
-- until the four bodies are pasted in, so running this file as is only replaces
-- the trigger. Signatures: each function gains p_check_number text default null as its last
-- parameter. The old signatures are dropped first so PostgREST never sees two
-- overloads that both match a named-argument call. Calls queued offline before
-- the migration (no p_check_number) still resolve to the new signatures.
-- On update, p_check_number null keeps the stored value (queued calls), '' clears
-- it, any other text replaces it.
-- No data is changed or dropped.
-- ----------------------------------------------------------------------------

begin;

create or replace function app.sync_voucher_from_tx() returns trigger
language plpgsql security definer set search_path = public, app as $$
declare
  v_type app.voucher_type;
begin
  update public.vouchers v
  set amount         = case when v.gross_amount is null then new.amount
                            else new.amount - v.ewt_amount - v.less_return end,
      gross_amount   = case when v.gross_amount is null then null else new.amount end,
      branch         = new.branch,
      purpose        = new.description,
      due_date       = new.due_date,
      type           = case new.cash_account
                         when 'bank_account' then 'check'::app.voucher_type
                         when 'cash_drawer'  then 'cash'::app.voucher_type
                         when 'petty_cash'   then 'cash'::app.voucher_type
                         else v.type
                       end,
      check_bank     = case when coalesce(new.cash_account = 'bank_account', v.type = 'check')
                            then coalesce(app.bank_account_label(new.bank_account_id), v.check_bank)
                       end,
      check_number   = case when coalesce(new.cash_account = 'bank_account', v.type = 'check')
                            then v.check_number end,
      check_due_date = case when coalesce(new.cash_account = 'bank_account', v.type = 'check')
                            then v.check_due_date end,
      category       = app.voucher_category(new.type, new.expense_type)
  where v.transaction_id = new.id
    and ((v.status = 'pending' and not v.printed) or app.is_own_open_voucher(v));
  return new;
end;
$$;

-- create: base function --------------------------------------------------------
-- drop function if exists public.create_transaction_with_voucher(
--   uuid, app.transaction_type, text, date, numeric, text, text, text, uuid,
--   app.cash_account, text, text, app.voucher_type, uuid, date, numeric,
--   numeric, numeric, text, uuid, boolean
-- );
-- drop function if exists public.create_transaction_with_voucher(
--   app.transaction_type, text, date, numeric, text, text, text, uuid,
--   app.cash_account, text, text, app.voucher_type, uuid, date,
--   numeric, numeric, numeric, text, uuid, boolean
-- );

-- Body: copy public.create_transaction_with_voucher(p_type ... p_vatable) from
-- 20261017000029_voucher_vat_auto_approve.sql unchanged, with these two edits:
--   1. add the parameter      p_check_number text default null
--   2. in the vouchers insert, add the column check_number with the value
--        case when v_vtype = 'check' then nullif(trim(p_check_number), '') end
-- The idempotent wrapper (p_idempotency_key, ...) gains the same last parameter
-- and passes p_check_number => p_check_number.

-- update: base function --------------------------------------------------------
-- drop function if exists public.update_transaction_with_voucher(
--   integer, app.voucher_status, uuid, text, date, numeric, text, text, text,
--   uuid, app.cash_account, text, date, numeric, numeric, numeric, text, uuid, boolean
-- );
-- drop function if exists public.update_transaction_with_voucher(
--   uuid, text, date, numeric, text, text, text, uuid,
--   app.cash_account, text, date, numeric, numeric, numeric, text, uuid, boolean
-- );

-- Body: copy public.update_transaction_with_voucher(p_transaction_id ... p_vatable)
-- from 20261017000029 unchanged, add the parameter p_check_number text default null,
-- and after the `update public.transactions ...` statement (so the sync trigger
-- has already set the voucher type) add:
--
--   if p_check_number is not null then
--     update public.vouchers v
--     set check_number = case when v.type = 'check'
--                             then nullif(trim(p_check_number), '') end
--     where v.transaction_id = p_transaction_id
--       and ((v.status = 'pending' and not v.printed) or app.is_own_open_voucher(v));
--   end if;
--
-- The version-checked wrapper (p_expected_version, p_expected_voucher_status, ...)
-- gains the same last parameter and passes p_check_number => p_check_number.

-- grants: the four new signatures, each with a trailing text ------------------
-- grant execute on function public.create_transaction_with_voucher(
--   app.transaction_type, text, date, numeric, text, text, text, uuid,
--   app.cash_account, text, text, app.voucher_type, uuid, date,
--   numeric, numeric, numeric, text, uuid, boolean, text) to authenticated;
-- grant execute on function public.create_transaction_with_voucher(
--   uuid, app.transaction_type, text, date, numeric, text, text, text, uuid,
--   app.cash_account, text, text, app.voucher_type, uuid, date, numeric,
--   numeric, numeric, text, uuid, boolean, text) to authenticated;
-- grant execute on function public.update_transaction_with_voucher(
--   uuid, text, date, numeric, text, text, text, uuid,
--   app.cash_account, text, date, numeric, numeric, numeric, text, uuid, boolean, text)
--   to authenticated;
-- grant execute on function public.update_transaction_with_voucher(
--   integer, app.voucher_status, uuid, text, date, numeric, text, text, text,
--   uuid, app.cash_account, text, date, numeric, numeric, numeric, text, uuid, boolean, text)
--   to authenticated;

notify pgrst, 'reload schema';

commit;

-- ----------------------------------------------------------------------------
-- Client follow-up once applied (not shipped yet):
--   - IDisbursementInput + schema: check_number (optional, trimmed, max 60).
--   - disbursement form: "Check number" text field in the Payment section directly
--     below "Paid from", hidden unless cash_account = 'bank_account'; edit defaults
--     from row.voucher?.check_number.
--   - transaction.services create / update rpc args: p_check_number (create: the
--     value or null; update: the value or '' so clearing it sticks).
-- Display already ships (Development v2.72): purchase record sheet voucher section,
-- Vouchers table detail, admin payable detail, voucher print, purchases period print.
-- ============================================================================
