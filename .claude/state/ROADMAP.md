# ROADMAP — Client TO-DO backlog (TARTAR TO DOs.txt, 2026-09-29)
Updated: 2026-09-29

## Goal
Every item in the client's TO-DO list is shipped, `yarn build` + `yarn lint` clean after each
phase. One phase per conversation; the user reviews between phases. Replaces the finished
desktop-audit roadmap (V1-V8 done, v1.30-v1.53).

## Session protocol
1. New conversation: read this file, `git status --short`, start `Next` item 1. Load `build`
   (+ `tartar-shadcn` and `shadcn` docs for UI). Present the phase's file plan and WAIT for
   approval (global CLAUDE.md) before editing.
2. Migrations: write the SQL file, show it, never apply it; the user applies it to Supabase.
   Never drop/rename a column; old enum values stay in the DB (hide them in the UI only).
3. Close a phase: build + lint clean, tick Done with paths, rewrite Next, suggest commit
   (`git log --oneline --grep="^Development v" -1` + 0.1), tell the user to open a new
   conversation. Visual work is reported **compiled** unless a screenshot proves it.
4. After the last phase: delete this file and `.claude/state/audit/`.

## Decisions locked (user, 2026-09-29)
- D1 Collection == Customer payment in code (both inflow, customerTypes, ledger
  ledger.services.ts:265). Remove `collection` from the Transactions type filter + Type field;
  old rows keep rendering (label map stays).
- D2 Banks master data: Bank -> many accounts (account name + number), one global list (not
  per branch). Cash Drawer and Petty Cash stay fixed non-bank options. Every "Cash account" /
  "Paid from" dropdown (Sale, Purchase, Expense, Transaction) and the voucher "Bank issuing"
  field read this list.
- D3 Auto reference numbers: `<KIND>-<branch prefix>-<YYMM>-<0001>` (e.g. PUR-FRM-2609-0001),
  one counter per kind + branch + month, generated in the DB on insert. Receivables, payables,
  purchases. Existing reference numbers untouched. Reference fields removed from the forms.
- D4 Expense payee: creatable combobox (same as F24 customer: fuzzy >= 0.8, new name saved on
  submit through service + runWrite) saving into the **Suppliers** list, so it shows in the
  Payables supplier ledger. Supplier field removed from the Expense form.
- D5 Expense type: creatable combobox over expense categories (add if not existing).
- D6 Expense "Particular": free-text field, prints as the voucher Particulars. Voucher
  breakdown section removed from the Expense form -> expenses carry no EWT
  (amount = amount to pay). Purchases KEEP the breakdown.
- D7 Expense payables: an expense with a due date opens a payable on voucher approval, same as
  purchases (trigger app.voucher_approval_payable, currently category = 'PUR' only).
- D8 Payables "Mark paid": row action pays the WHOLE balance immediately after useConfirm; the
  confirm asks Paid from (bank account / cash). No partial payments, no approval step for it.
  No one can delete a payable (all roles). "Record payable" button removed (admin). Paid and
  Balance columns removed from the payables table — for admin, accountant and employee.
- D9 Payable statuses: Open, Due soon (due date within 7 days), Overdue, Paid (kept so history
  stays reachable).
- D10 Rejected sale: employee row action "View reason" opens a modal with the reason and the
  editable sale; resubmit sets status back to `deposited` (awaits admin verification again).
- D11 Reports: per branch, Sales / Expenses / Purchases totals for a month or custom range,
  Net = Sales - Expenses - Purchases, purchases counted by invoice date (txn_date). Print =
  summary only. Admin report == accountant report.
- D12 Admin live refresh: Supabase realtime subscription on transactions invalidates the
  admin's queries (not polling).
- D13 Voucher print format = client LGC check voucher (`C:\Users\cclisondato\Downloads\Sample\
  vouchers sample2.png`; sample1 = same layout, AFC 818). Letterhead, CHECK VOUCHER / Voucher
  No. / Date, payee as big heading, PARTICULARS | Amount, breakdown rows Gross Total / 12% vat
  / 1% withhold / TOTAL / Less return, big net amount, Bank Name / Check No. / Date of Check,
  Received By / Name / Signature / Date. Already built in v1.41 (print.utils.ts) — phase 7
  only makes sure employee prints include the breakdown.
- D14 Signatories: Prepared by = full name of the voucher's creator; Approved by = full name of
  the admin who approved it.
- D15 Notifications (dashboard NotificationsFeed + admin app): scrollable, each item clickable
  -> opens that record. Adds purchases + expenses due, showing due date and bank.
- D16 Accountant header: branch scope selector showing only the accountant's assigned branches.
- D17 Master data: Income Sources CRUD; the Record sale "Income source" dropdown reads it
  (replaces enum incomeSourceValues; old values seeded).
- D18 Transactions: petty_cash removed from the Type field; Petty Cash added as a cash
  account option (Accounting section).
- Carried over, unchanged: every CLAUDE.md convention (no comments, no useState, class strings
  in *.styles.ts, tokens only in theme.css, useConfirm, runWrite, Transactions is reference).

## Path map
- Enums: src/enums/transaction.enum.ts (transactionTypeValues, cashAccountValues,
  incomeSourceValues), ledger.enum.ts (ledgerStatus*, ledgerStatusFilter*), sale.enum.ts,
  role.enum.ts, voucher.enum.ts
- Transactions form: src/hook/data/transaction/transaction.list.hook.ts (customerTypes :53,
  customer_payment :238, reference field :231)
- Sale form: src/hook/data/sale/sale.form.hook.ts (sections :116, Additional details :186,
  reject section :51); list: sale.list.hook.ts
- Purchase form: src/hook/data/purchase/purchase.list.hook.ts (payment section ~:95, details
  ~:132); table src/components/purchase/tables/PurchasesTable.tsx
- Expense form: src/hook/data/expense/expense.list.hook.ts (Payee :137, Paid from :144);
  table src/components/expense/tables/ExpensesTable.tsx
- Shared disbursement: src/hook/data/disbursement/disbursement.list.hook.ts (breakdown :165)
- Ledger (receivables/payables): src/hook/data/ledger/{ledger.list,ledger.scope,
  customer.ledger,ledger.view}.hook.ts ; src/services/data/ledger.services.ts ;
  src/components/ledger/PaymentAllocationModal.tsx
- Vouchers: src/hook/data/voucher/voucher.list.hook.ts (Bank issuing :186) ;
  src/components/voucher/tables/VouchersTable.tsx ; print src/utils/print.utils.ts
  (check bank :102, Prepared/Approved :190)
- Master data: src/pages/MasterData/MasterDataView.tsx ;
  src/components/master-data/{tables,menus}/ ; hooks party/supplier.*, expense-category/*
- Notifications: src/components/dashboard/NotificationsFeed.tsx ;
  src/hook/data/admin/admin.notifications.hook.ts ;
  src/components/admin/notifications/AdminNotificationsOverview.tsx ;
  store/data/admin/notification.read.store.ts
- Reports: src/hook/data/report/report.hook.ts ; models/data/report/report.response.ts
- Payable trigger: supabase/migrations/20260722000007_check_details_and_purchase_terms.sql:65
  (app.voucher_approval_payable) ; latest migration 20260928000010_*.sql
- Form engine: models/common/field.model.ts (type `creatable`), components/common/form/
  FormField.tsx, utils/fuzzy.utils.ts ; creatable pattern: ledger.scope.hook.ts prepare

## Phases
- P1 Quick fixes (no DB): phone filter toolbar overlap; remove Collection (D1); remove the
  "Additional details/information" sections from Sale, Purchase, Expense, Transaction forms;
  Purchases phone card shows amount to pay (not gross); receivable print drops the payment
  history status field; Users "Branch access" renders as a dropdown (admin bug).
- P2 Master data + migration: banks/bank accounts (D2), income sources (D17), petty_cash cash
  account (D18); wire every Cash account / Paid from / Bank issuing / Income source dropdown.
- P3 Auto reference numbers + migration (D3); drop reference fields from Receivable, Payable,
  Record payment, Purchase forms.
- P4 Expense + Purchase forms: expense payee creatable (D4), expense type creatable (D5),
  Particular + no breakdown (D6); purchase payment section = Supplier + Paid from only.
- P5 Payables + migration: expense payables (D7), Mark paid, no delete, no Record payable,
  columns (D8), statuses (D9), Payables "By supplier" supplier ledger like Receivables'
  customer ledger.
- P6 Sales rejection flow (D10).
- P7 Printing: voucher breakdown on employee prints + signatories (D13, D14); Print with period
  picker (daily / weekly / monthly / custom) on Sales, Purchases, Expenses; Purchases filters
  "vouchers created in month" + "paid in month".
- P8 Reports by branch summary + print (D11).
- P9 Notifications (D15), accountant branch selector (D16), admin realtime (D12).
- P10 Screenshot verification (harness below) of P1-P9 + carried-over items below.

## Done
- [x] Backlog triaged, decisions D1-D18 locked (2026-09-29).

## Next
1. P1 — locate the phase's files, present the file plan, wait for approval, implement.

## Carried over from the audit roadmap (fold into P10)
- Mobile M1/M2 shipped in v1.39-v1.46 — screenshot-verify at 390/768/1280 light+dark.
- AD1 sign in as accountant/employee, open /admin once (redirect). AD3 detail sheet empty
  Reference blank vs "—". AD5 admin loading/error states uncaptured. AD6 no due checks in data.
- SV1 Reject sale submit should be danger tone. SV2 "Marked deposited by" -> "Deposited by".
  SV5 no branch has legal_name/address yet. Deposit -> verify flow never run end to end.

## Audit harness (drives the real app with the user's Chrome)
- Scripts in `.claude/state/audit/` (login.mjs, shot.mjs, safe-shot.mjs, routes.json,
  modals.json). Copy to the scratchpad, `npm init -y && npm i playwright-core` there (never in
  the repo). Dev server `yarn dev --port 5199 --strictPort`. `node login.mjs` -> the USER signs
  in. Prefer `safe-shot.mjs`: fakes every Supabase write; never press Save/Approve/Delete live.

## Open
- Migration 20260926000009_accountant_voucher_read.sql (and possibly 20260718000004..
  20260722000008) may not be applied to Supabase yet — confirm with the user before P2.

## State
Branch: development-overhaul · Uncommitted: .claude/state/ROADMAP.md only · Last check:
tree clean at v1.53.
