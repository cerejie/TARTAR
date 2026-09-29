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
- [x] P1 (v1.55) — phone toolbar: styles/filter/filter.styles.ts (actions wrap, sort w-36 on
  phone); Collection out of filter + Type field: enums/transaction.enum.ts
  (transactionTypeFilterValues), LedgerFilterBar.tsx, transaction.list.hook.ts; "Additional
  details" removed: transaction.list, sale.form, purchase.list, expense.list hooks (defaults
  kept); Purchases "Amount to pay" column = phone card amount (PurchasesTable.tsx); receivable
  statement drops payment Status (print.utils.ts); multiselect opens on focus + chevron
  (FormField.tsx, form.styles.ts fieldMultiselectTrigger) — fixes Users Branch access.
- [x] P2 (v1.56) — migration supabase/migrations/20260929000011_banks_income_sources.sql
  (banks, bank_accounts, income_sources, petty_cash, transactions.bank_account_id, RPCs +
  p_bank_account_id, check_bank = account label). Picker (user choice): Cash Drawer / Petty
  Cash / Bank, then Bank + Account selects — hook/data/bank/bank.account.list.hook.ts
  (paymentFields, bankAccountFields, paymentLabelOf, paymentDefaultsOf), utils/payment.utils.ts
  (derivePaymentValues), IFieldConfig.optionsOf (field.model.ts, FormFieldGrid.tsx). Master
  Data tabs Income Sources + Banks (BankAccountsTable, IncomeSourcesTable, create buttons,
  bank.services.ts, reference.services income sources). Wired: sale.form/sale.list,
  transaction.list (petty_cash out of Type), disbursement/purchase/expense hooks, voucher.list
  (Bank issuing -> Bank + Account), Sales/Transactions/Purchases/Expenses tables.
- [x] P3 (v1.57) — migration supabase/migrations/20260930000012_auto_reference_numbers.sql
  (reference_counters + app.next_reference_no; triggers PUR on purchase transactions by
  txn_date month, RCV/PAY on receivables/payables by insert month, PMT on payments via first
  payment_allocations row's branch + paid_at month (user choice); fills only empty refs, so
  voucher-approved payables keep voucher_no; update_transaction_with_voucher no longer writes
  reference_number). Reference fields removed: ledger.scope.hook.ts, ledger.list.hook.ts
  (payment form), PaymentAllocationModal.tsx, purchase.list.hook.ts; schemas ledger.request,
  payment.request, transaction.request (disbursement); services ledger/payment/transaction.
- [x] P4 (v1.58) — migration supabase/migrations/20261001000013_ensure_expense_category.sql
  (public.ensure_expense_category(p_slug, p_name), SECURITY DEFINER, manager or employee, auto
  unique 3-letter code skipping PUR/EXP/GEN — user choice). Submit normalisation
  hook/data/disbursement/disbursement.form.hook.ts (prepare: payee -> supplier via
  utils/party.utils.ts resolveParty, typed expense type -> slug via
  referenceServices.ensureExpenseCategory); disbursement.list.hook.ts (mutations run prepare,
  disbursementPaymentFields = Paid from required). Expense form (expense.list.hook.ts): Payee
  creatable over suppliers, Supplier + Voucher type gone, Expense type creatable, Amount (no
  VAT hint), Particular textarea, no breakdown/summary (EWT 0). Purchase form: Supplier
  creatable required (payee field) + Paid from; breakdown kept. transaction.request.ts: payee
  required, Paid from required, expense_type = name.

- [x] P5 (v1.59) — migration supabase/migrations/20261002000014_payables_mark_paid.sql
  (payments.cash_account + bank_account_id; public.mark_payable_paid SECURITY DEFINER, admin
  or employee, full balance, verified; app.voucher_approval_payable opens payables for expense
  vouchers with a due date). Statuses (user choice: exclusive tabs) upcoming "Open" / due_soon /
  overdue / paid: enums/ledger.enum.ts (dueSoonDays, payableStatus*), ledger.response.ts
  payableStatusOf, filter.utils.ts applyStatusFilter + ledgerFilterScopeOf (payables got its
  own filter scope "payables", default All, so receivables' "unpaid" default no longer leaks).
  Mark paid (admin + employee): payable.form.hook.ts, modal/MarkPaidModal.tsx,
  payableServices.markPaid. tables/PayableRecordsTable.tsx (Amount, no Paid/Balance, no
  Record/Delete); PayablesView drops RecordPaymentModal. Supplier ledger (user choice: full
  mirror): SupplierLedgerModal/View, menus/SupplierLedgerButton, supplier.ledger/detail hooks,
  ledger.store supplier state, printStatement(kind, partyName, ...). LedgerPartiesTable payables
  row -> supplier ledger. Admin PayableEntrySheet drops Balance/Paid. Expense form Due date
  (expense.list.hook.ts) + transaction.services sends due_date for expenses.
- [x] P6 (v1.60) — no migration (mark_sale_deposited already accepts rejected -> deposited).
  Rejected rows (encodeTransactions) show only "View reason" (user choice; Mark deposited /
  Edit stay for undeposited): SalesTable.tsx, openSaleStatuses removed (sale.enum.ts).
  Resubmit modal SaleFormModals.tsx (formIntro: reason, rejected by, rejected on; sale
  sections + Deposit date prefilled with the previous one — user choice): sale.form.hook.ts
  (resubmitModal, rowDefaults, resubmitSections, resubmitMutation), saleResubmitSchema
  (sale.request.ts, saleShape shared), saleServices.resubmit = update + markDeposited (two
  runWrites), saleResubmitModalKey.
- [x] P7 (v1.61) — migration supabase/migrations/20261003000015_voucher_signatories_purchase_paid.sql
  (public.voucher_signatories(uuid[]) SECURITY DEFINER, branch-checked, full_name else username;
  public.purchase_ids_paid_between(from, to) INVOKER: payable paid -> last payment date, no due
  date -> txn_date). printVoucher (print.utils.ts) rebuilt to the LGC sample, breakdown copied
  literally (user choice: "12% vat" = amount before VAT, TOTAL = gross), always rendered (old
  vouchers: Gross/TOTAL = amount); Prepared/Approved names via voucherServices.getList
  withSignatories (IVoucher.prepared_by_name/approved_by_name). Period print (user choice: list
  + totals): models/common/period.model.ts, utils/period.utils.ts (week Mon-Sun),
  hook/common/period.print.hook.ts, common/modal/PeriodPrintModal.tsx, report.utils
  salesPrintDocument/disbursementPrintDocument, printPeriod in sale.list + disbursement.list,
  Print button on Sales/Purchases/Expenses tables (periodPrintModalKey, salePrintModalKey).
  Purchases filter "Date of" (Invoice date / Voucher created / Paid): ILedgerFilters.dateBasis,
  LedgerFilterBar showDateBasis, transaction.services disbursementQuery (purchase only).
- [x] P8 (v1.62) — no migration. Reports tab "Branch Summary" (first, default type summary):
  report.response.ts (IBranchSummaryRow/Totals/Data), report.summary.hook.ts (filter scope
  "report-summary", default current month; Month select over last 12 months derived from the
  range + DateRangeFilter custom range; top-bar branch scope), report.hook.ts spreads it,
  components/report/BranchSummaryReport.tsx, ReportsView.tsx. User choices: Sales = verified
  only (pending as caption), Expenses/Purchases = amount to pay (voucher net) by txn_date,
  rejected vouchers excluded, only branches with activity get a row. Print = summary only
  (report.utils branchSummaryPrintDocument, totals row); period.utils month helpers.

## Next
1. P9 — Notifications (D15), accountant branch selector (D16), admin realtime (D12).

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
- Every migration through 20261003000015 is applied (user confirmed 2026-09-29).
- P5: payable delete is blocked in the UI only (pay_manager_all still allows it in the DB).
  Payables "Record payable" form config remains in ledger.scope.hook.ts (generic hook needs it).

## State
Branch: development-overhaul · Uncommitted: P8 (src + ROADMAP) until v1.62 is committed ·
Migration 20261003000015 applied · Last check: yarn build + yarn lint clean after P8. P8
compiled, not screenshot-verified (fold into P10: Branch Summary tab, month/custom range,
print). P7 compiled, not screenshot-verified (fold into P10: voucher
print vs sample, period print modal, Purchases "Date of" filter; period print scope reads "All
branches" for employees, as the Reports print does). P5 UI compiled, not
screenshot-verified (fold into P10: Mark paid modal stacking over the supplier ledger).
P6 compiled, not screenshot-verified (fold into P10: View reason -> Resubmit end to end; a
failed deposit step leaves the sale rejected with the edits saved).
