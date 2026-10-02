# ROADMAP — Voucher resubmit, admin auto-approve, VAT checkbox
Updated: 2026-10-02 (V1 mig 29 applied; V2 done, not committed; V3 next)

## Goal
1. A rejected voucher is never a dead end: the employee opens "View reason" from the Vouchers page,
   sees the reason, and resubmits the prefilled expense/purchase form (same voucher back to pending).
2. A voucher created by an admin needs no approval (saved Approved); only employee vouchers are reviewed.
3. Expenses, purchases and manual vouchers carry a VAT checkbox; non-VAT invoices compute no VAT.
`yarn build` + `yarn lint` clean per phase, then checked on the Vercel preview of mobilel-app-native.

## Session protocol
Same as ROADMAP.md: one phase per conversation, present the file plan and wait for approval, write
migrations but never apply them (dev = production Supabase), never commit unless asked, close a phase by
ticking Done with paths, rewriting Next, suggesting the commit (`git log --oneline --grep="^Development v" -1` + 0.1).

## Decisions locked (user, 2026-10-01)
- R1 Resubmit opens RIGHT ON the Vouchers page: "View reason" on a rejected row -> the same prefilled
  Expense / Purchase form with the RejectionIntro (reason, who, when) -> "Resubmit". Same voucher number
  goes back to pending (existing app.reopen_rejected_voucher via update_transaction_with_voucher, mig 21).
- R2 Admin-created vouchers need no approval: any voucher created by a manager (app.is_manager():
  admin, superadmin, developer) is saved Approved (approved_by = creator, approved_at = now). Employee
  vouchers stay pending for approval. Same pattern as admin-recorded sales (Verified) and managers' own
  payments (self-verify). Consequence: manual vouchers are only made by managers, so they are never
  rejected again -> no manual-voucher resubmit; legacy rejected manual vouchers get a read-only reason.
- R3 VAT checkbox "VAT-registered invoice" (wording TBD in V2) on Expenses (default UNCHECKED),
  Purchases (default CHECKED), manual vouchers (default by kind: Purchase checked, Expense unchecked;
  re-defaults when the kind changes).
- R4 Non-VAT math: amount before VAT = invoice - return (no /1.12), VAT = 0, withholding = (invoice -
  return) x rate, amount to pay unchanged formula. Withholding stays user-editable (2026-09 decision).
- R5 Existing vouchers back-fill vatable = true (that is how they were computed); history unchanged.

## Phases
- V1 Migration 29 `supabase/migrations/20261017000029_voucher_vat_auto_approve.sql` (write + show, never apply):
  - `vouchers.vatable boolean not null default true`.
  - `app.voucher_ewt(p_invoice, p_less_return, p_rate, p_vatable boolean default true)` — divisor 1 when
    not vatable; keep the 3-arg callers working (default arg or wrapper).
  - Recreate `public.create_transaction_with_voucher` (latest body: mig 24 write_idempotency) and
    `public.update_transaction_with_voucher` (latest body: mig 25 transaction_version) with `p_vatable`;
    the update keeps reopen_rejected_voucher. Drop the old signatures only after recreating (overload
    clash); grants re-issued.
  - Auto-approve: BEFORE INSERT trigger on vouchers — `if app.is_manager() then status 'approved',
    approved_by = app.user_id(), approved_at = now()` (server decides; never trust the client's status).
  - Payable on auto-approve: app.voucher_approval_payable (mig 5, extended mig 7) only fires on UPDATE to
    approved -> make it cover INSERT of an approved PUR voucher with a due date (check payable_id FK order:
    BEFORE INSERT can insert the payable and set new.payable_id).
  - Push/inbox (mig 27/28 vouchers_push): pending-on-insert notifies managers; an approved insert must
    notify nobody. Verify the trigger reads the final status (deferred constraint trigger -> yes).
  - Consider: RLS on vouchers update for approve stays manager-only; offline replay (idempotency keys,
    mig 24) unaffected; no column dropped or renamed.
- V2 VAT checkbox (client):
  - `models/common/field.model.ts` IFieldType + "checkbox"; `components/common/form/FormField.tsx` maps it
    to ui/checkbox (run `npx shadcn@latest docs checkbox`, React Aria tab; add the registry file if missing).
  - `models/data/voucher/voucher.request.ts` IVoucherBreakdownInput.vatable + zod; expense/purchase
    schemas + form-value defaults (expense false, purchase true); manual voucher default by kind via
    deriveValues on `kind`.
  - `utils/voucher.utils.ts` computeVoucherTotals({ vatable }) divisor; recalculatedFields + "vatable";
    voucherTotalsOf reads voucher.vatable; checkbox placed in voucherBreakdownFields (first, full span).
  - `models/data/voucher/voucher.response.ts` vatable; services: `services/data/disbursement.services.ts`
    (p_vatable on create/update RPC payloads, offline queue payload too), `services/data/voucher.services.ts`
    (manual create `vatable`).
  - Amount hints "VAT inclusive." in `hook/data/purchase/purchase.list.hook.ts:96` and
    `hook/data/voucher/voucher.list.hook.ts:221` -> neutral ("Invoice total as billed.").
  - `utils/print.utils.ts` voucherBreakdownRows: "12% vat" cell blank when not vatable; detail/summary
    lines show VAT ₱0.00 (or hide amountBeforeVat/vat) — pick in V2, keep consistent with print.
- V3 Resubmit on Vouchers + auto-approve client:
  - Extract the edit/rejected modal block from `components/expense/tables/ExpensesTable.tsx` (~L365) and
    `components/purchase/tables/PurchasesTable.tsx` (~L390) into one
    `components/disbursement/modal/DisbursementEditModal.tsx` (kind prop); both tables use it.
  - Vouchers row action (`components/voucher/tables/VouchersTable.tsx` actionsOf ~L79): rejected +
    transaction_id + encodeTransactions -> "View reason" (MessageSquareWarning) opens the edit modal with
    the source expense/purchase (kind from voucher.category: PUR -> purchase, else expense). The voucher row
    carries only transaction_id, so a detail query loads the IDisbursement when the modal opens
    (new `disbursement.detail` service + hook, keyed in keys/query.keys.ts; modal key in keys/modal.keys.ts).
    Rejected manual voucher (no transaction_id) -> read-only reason (DetailModal or RejectionIntro only).
  - After resubmit invalidate the voucher list + disbursement keys (realtime also refreshes).
  - Auto-approve UI: manual voucher create toast "Voucher saved — approved" for managers; optimistic/offline
    row shows the manager's voucher as approved (service status from permissions; server is authoritative).
  - Existing reference: `hook/data/disbursement/disbursement.list.hook.ts` (editRejected L163, success
    message L208, rejectedByName L275), `components/common/form/RejectionIntro.tsx`.
  - R8 inbox (needs mig 29 applied — selecting `pending` earlier breaks the inbox query):
    `models/data/inbox/inbox.response.ts` + `services/data/inbox.services.ts` (columns) pending;
    `components/common/app/ListCard.tsx` `pending` prop -> warning dot (`styles/app/app.styles.ts`
    listCardUnreadDot -> cva tone); `utils/format.utils.ts` formatElapsed; `components/inbox/lists/
    InboxFeed.tsx` meta "Waiting <elapsed>" on pending rows; `hook/data/inbox/inbox.list.hook.ts` badge
    count unread + pending (InboxBell); minute tick `store/common/clock.store.ts` + `hook/common/clock.hook.ts`.
    Realtime: DELETE events reach every subscriber (not RLS-filtered) -> each inbox refetches once.
- V4 Verify on the preview: employee expense (non-VAT, 2% EWT) -> withholding = invoice x 2%; admin rejects
  -> employee Vouchers "View reason" -> prefilled -> Resubmit -> pending + manager push/inbox; admin records
  expense/purchase/manual voucher -> Approved at once, no push, purchase with due date opens a payable;
  print a VAT and a non-VAT voucher; offline create/resubmit replays.

- R6 (answers O1) An admin may edit THEIR OWN auto-approved expense/purchase/manual voucher until the
  voucher is printed (printed = true locks it, as before). Everyone else's approved records stay locked.
  V1: relax the approved-lock in app.guard_voucher_change (mig 21) and the transaction lock (mig 4
  voucher_workflow) for `app.is_manager() and created_by = app.user_id() and not printed`; the voucher
  stays approved through the edit (no re-approval, no push). V3: isDisbursementLocked in
  hook/data/disbursement/disbursement.list.hook.ts + VouchersTable menu show Edit for that case.

- R7 (answers O2) An own-edit of an approved record whose payable is open syncs the payable (amount, due
  date, supplier, branch) while it has no payment; any payment (pending/verified) or removing the due date
  refuses the save; adding a due date opens one. Deleting an approved record stays blocked (edit only).
- R8 Pending requests in the inbox: "Voucher needs approval", "Payment needs verification" and the NEW
  "Sale needs verification" (employee marks a sale deposited -> managers) are notifications.pending = true.
  Once resolved (approved/rejected/verified/deleted) they are deleted for every manager. In the Updates
  list a pending row has an ORANGE (warning) dot that stays after it is read, and shows the waiting time
  ("Waiting 45 mins", "1hr 30 mins", "2d 23hrs"). The bell badge = unread + pending.

## Done
- V1 2026-10-01: `supabase/migrations/20261017000029_voucher_vat_auto_approve.sql` (written, NOT applied):
  vouchers.vatable; app.voucher_ewt 4-arg; app.is_own_open_voucher + relaxed guard_voucher_change /
  guard_tx_change / sync_voucher_from_tx / set_voucher_breakdown (7-arg); both create and both update
  RPCs take p_vatable (create default true, update default null = keep stored); vouchers_auto_approve
  BEFORE INSERT; vouchers_zz_approval_payable now INSERT OR UPDATE + app.sync_voucher_payable;
  notifications.pending, app.notify 6-arg, app.resolve_notifications, push_* recreated, payments_push on
  insert or update of status, *_resolve_notifications delete triggers, cleanup cron skips pending.
  Applied by the user before 2026-10-02.
- V2 2026-10-02 (tsc + lint clean, not checked on the preview). Decisions: label "VAT-registered invoice";
  non-VAT HIDES "Amount before VAT" + "VAT (12%)" in the form summary and detail views; print "12% vat"
  cell blank. IFieldType "checkbox" -> FormField (ui/checkbox, horizontal Field + FieldContent);
  IDetailItem.hidden(record) honoured by DetailGrid / DetailRows / RowDetailPanel via
  utils/detail.utils.ts visibleDetailItems. voucher.utils: computeVoucherTotals vatable divisor,
  isVatableVoucher (vatable !== false, so cached pre-29 rows read VAT), voucherVatField, vatable
  recalculates EWT, defaults false, voucherBreakdownOf reads it. Expense form: checkbox after Due date,
  edit reads the stored flag. Purchase default true. Manual voucher: kind change re-defaults vatable
  (purchase true) and recomputes EWT. Services: p_vatable in transaction breakdownArgs, vatable on manual
  insert. Hints "VAT inclusive." -> "Invoice total as billed.", EWT hint neutral.

## Path map
- voucher UI: components/voucher/tables/VouchersTable.tsx · hook/data/voucher/voucher.list.hook.ts ·
  services/data/voucher.services.ts · enums/voucher.enum.ts · utils/voucher.utils.ts · utils/print.utils.ts
- expense/purchase: components/{expense,purchase}/tables/*Table.tsx · hook/data/disbursement/
  {disbursement.list,disbursement.form}.hook.ts · hook/data/purchase/purchase.list.hook.ts ·
  components/common/form/RejectionIntro.tsx · keys/modal.keys.ts (disbursement*ModalKey(scope))
- forms: models/common/field.model.ts · components/common/form/FormField.tsx
- SQL: mig 10 (app.voucher_ewt, sync_voucher_from_tx, breakdown check) · mig 21 (rejection_reason,
  guard_voucher_change, reopen_rejected_voucher) · mig 24 (latest create_transaction_with_voucher) ·
  mig 25 (latest update_transaction_with_voucher) · mig 5/7 (voucher_approval_payable) · mig 27/28 (push)

## Next
1. V3 Resubmit on Vouchers + auto-approve client + R6 own-edit + R8 inbox pending (as planned above).
2. V4 preview checks, incl. the mig 29 server checks: admin expense -> Approved, no push; employee expense
   -> pending + manager inbox row pending = true; approve -> the pending row is gone; V2 non-VAT math
   (2% EWT on a 1,000 non-VAT invoice = 20.00; VAT invoice = 17.86) and the hidden VAT lines.

## State
Branch mobilel-app-native at 82afbe3 (Development v2.10, mig 29 committed and applied). V2 uncommitted.
The mobile roadmap's P0-4 event checks 3 (payment verification) and 4 (sale verified) are still open;
after mig 29, check 4's managers also get "Sale needs verification" on deposit.
