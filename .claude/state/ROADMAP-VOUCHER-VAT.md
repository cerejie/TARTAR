# ROADMAP — Voucher resubmit, admin auto-approve, VAT checkbox
Updated: 2026-10-01 (planned; nothing built)

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
- V4 Verify on the preview: employee expense (non-VAT, 2% EWT) -> withholding = invoice x 2%; admin rejects
  -> employee Vouchers "View reason" -> prefilled -> Resubmit -> pending + manager push/inbox; admin records
  expense/purchase/manual voucher -> Approved at once, no push, purchase with due date opens a payable;
  print a VAT and a non-VAT voucher; offline create/resubmit replays.

## Open (ask at the start of V1)
- O1 Approved = locked (2026-07 decision 4, DB-enforced). With R2 an admin's own expense/purchase is locked
  the moment it is saved, so an admin cannot fix a typo. Keep locked, or let a manager edit their own
  auto-approved record until it is printed?

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

## State
Branch mobilel-app-native, clean at 884c122 (Development v2.08, pushed). Nothing built. The mobile
roadmap's P0-4 event checks 3 (payment verification) and 4 (sale verified) are still to run first.
