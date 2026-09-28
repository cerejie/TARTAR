# ROADMAP — Sales deposit/verification + Voucher computation
Updated: 2026-09-28 · Status: IN PROGRESS — S1–S3 done, S4 next

## Goal
1. A sale is only "actual sales" once an employee has marked it **Deposited** and an admin has
   **Verified** it. Dashboard, reports and branch totals count verified sales only; the rest is
   shown as pending.
2. Sales get their own screen ("tab") with the deposit → verify workflow.
3. Vouchers carry the client's check-voucher breakdown (source: `.claude/docs/Check_Voucher_.xlsx`)
   and print in that layout.

## Session protocol
Same as ROADMAP.md: one phase per conversation, `build` + `tartar-shadcn` loaded, `yarn build`
+ `yarn lint` clean, tick Done with paths, suggest commit, stop. Migrations are PROPOSED only —
never applied or run without explicit approval. Starts after (or in parallel with) the UI-audit
roadmap's last capture step (user, 2026-09-28: UI-audit capture goes first).

## Source analysis — Check_Voucher_.xlsx (3 sheets, same template)
Sheets: `LGC ` (LGC Hardware and General Merchandise), `Afc wood` (AFC Wood Industry),
`afc 818` (AFC 818 Gas Station). Layout, identical on all three:

| Block | Cells |
|---|---|
| Letterhead | A1 business legal name, A2 address |
| Title row | A3 "CHECK VOUCHER", C3 Voucher No. (`2026-187`), C4 Date |
| Payee | A5 (e.g. "WV NEW DAVAO GOLDSTAR HARDWARE CO., INC", "COTELCO") |
| Particulars / Amount | A7 free text ("PAYMENT FOR ASSORTED VARIOUS"), C7 = amount payable |
| Breakdown | Gross Total, "12% vat", "1% withhold", TOTAL, Less return |
| Check | Bank Name, Check No., Date of Check |
| Receipt | Received By — Name, Signature, Date |

Formulas:
```
B12 "12% vat"     = Gross / 1.12          -> actually the VAT-exclusive BASE, not the VAT
B13 "1% withhold" = B12 * 1%              -> expanded withholding tax on goods
C7  Amount        = Total - Withholding - Less return
```
Worked: LGC 214,500 gross -> base 191,517.86 -> EWT 1,915.18 -> pays 212,584.82.
AFC Wood (COTELCO): no gross, no EWT, Total 24,399.82 - return 388.17 = 24,011.65.

Observations the build must handle:
- EWT is optional per voucher (utility bills have none) — it is a toggle, not always-on.
- Total is typed by hand, equal to Gross when Gross is used. The system derives it — one input.
- The sheet never rounds (C7 = 212584.821428…). The system rounds each line to centavos.
- "12% vat" mislabels the base. Print should say "Net of VAT" + show VAT separately (D5).
- Voucher numbers there are `YYYY-seq` per business; ours are `HAR-PUR-2026-00000187` (D6).
- Letterhead = branch legal name + address; `branches` has neither today.
- "AFC 818 Gas Station" has no matching branch (branches: hardware, rental, woodworks, farm) (D7).

## Current state (what the plan builds on)
- `transactions.type = 'sale'`, no status column. Sales feed `dashboard.services.ts`
  (todaysSales, monthlySales, chart, branch totals) and `components/report/PeriodReport.tsx`.
- `app.approval_status` / payments already model pending → verified with `verified_by/at`,
  manager self-verify, reject RPC — the sale workflow reuses that pattern.
- `vouchers`: amount, payee, category, check_bank/number/due_date; no breakdown columns.
  `printVoucher` in `utils/print.utils.ts` is a label/value list, not the client's layout.
- Purchases/Expenses already left the generic Transactions form so vouchers can't be bypassed;
  Sales follows the same move.

## Decisions locked (user, 2026-09-28)
- D1 Sales = separate `/sales` module like Purchases/Expenses (sidebar entry, status pills,
  stat cards). `sale` removed from the generic Transactions form.
- D2 Employee records a sale and marks it Deposited; admin (manager) Verifies or Rejects.
  A sale recorded by an admin skips the Deposited step and is saved Verified straight away.
  Accountant read-only.
- D3 Verify = admin checked the money was credited to the bank. Unverified sales STILL count as
  Cash In; they are excluded from Sales totals only and shown as "Pending verification".
- D4 Mark Deposited captures the deposit date only.
- D5 Voucher amounts (client paper voucher 2026-006 + xlsx checked line by line):
  - Inputs: Invoice amount (VAT inclusive = "Gross Total"), Withholding tax select
    None / 1% goods / 2% services (default None), Less return (optional).
  - Auto: Amount before VAT = (invoice - return) / 1.12, VAT = difference, Withholding =
    base x rate, Amount to pay = invoice - withholding - return. Centavo rounding per line.
  - Withholding amount is EDITABLE after auto-calculation (a rate change or invoice/return
    change recalculates it; a manual edit stands otherwise). DB stores ewt_rate + ewt_amount
    as entered and enforces only amount = invoice - ewt - return; no trigger overwrites ewt.
  - Purchase/expense transaction amount = invoice (the cost). Voucher amount, check amount and
    the payable opened on approval = Amount to pay (net). Withholding kept on the voucher for a
    monthly "tax withheld" total.
  - Labels: "Invoice amount", "Amount before VAT", "VAT (12%)", "Withholding tax",
    "Less return", "Amount to pay" — never "12% vat" for the base.
- D6 Voucher number stays `HAR-PUR-2026-00000187`.
- D7 AFC 818 was only a sample — no new branch. Letterhead = branch legal name + address fields
  on branches (Branch Monitoring edit form).
- D8 Optional free-text `particulars` returns on every voucher.
- D9 Existing sales back-filled as Verified so historical reports do not change.

## Phases

### S1 — Migration (propose, wait for approval) `supabase/migrations/2026092x000010_sales_verification_voucher_breakdown.sql`
- `app.sale_status` enum: undeposited, deposited, verified, rejected.
- `transactions`: sale_status, deposited_by, deposited_at, deposit_date, verified_by,
  verified_at, rejection_reason. Insert by a manager -> verified (D2). CHECK: sale_status NOT NULL iff type = 'sale'.
  Back-fill existing sales = verified. Index (branch, type, sale_status, txn_date).
- RPCs (SECURITY DEFINER, row-locked, audited through the existing edit-history table):
  `mark_sale_deposited`, `verify_sale` (managers), `reject_sale` (managers, reason).
- Lock trigger: verified sale is immutable/undeletable (mirrors approved-voucher lock);
  undeposited/deposited stays editable with audit trail. RLS: employees only own-branch.
- `vouchers`: particulars, gross_amount, ewt_rate, ewt_amount, less_return
  (numeric(14,2), defaults 0/false). CHECK amount = gross - ewt_amount - less_return when
  gross is set; ewt_amount is user-editable (D5), not recomputed server-side.
- `branches`: legal_name, address (nullable).
- `create_transaction_with_voucher` recreated with the breakdown params.

### S2 — Sales module (UI) — mirrors Purchases
- `enums/sale.enum.ts` (status values, labels, colours, sort options)
- `models/data/sale/sale.{request,response}.ts` (deposit schema, ISale, ISaleSummary)
- `services/data/sale.services.ts` (paged getList + count, summary, deposit/verify/reject RPCs
  via runWrite)
- `hook/data/sale/sale.list.hook.ts` (filters, status pills, pagination, mutations, confirms)
- `components/sale/{tables/SalesTable,cards/SaleSummaryCards,menus/SaleStatusTabs}.tsx`,
  deposit modal = EntityFormModal
- `pages/Sales/SalesView.tsx`, route `/sales`, keys (query, modal, table)
- Drop `sale` from the Transactions form type list; row actions: Mark deposited / Verify /
  Reject via RowActionMenu + useConfirm.

### S3 — "Actual sales" everywhere
- `dashboard.services.ts`: sales metrics + chart + branch totals filter `sale_status = verified`;
  new "Pending verification" tile/alert for admins, "Undeposited" alert for employees.
- `PeriodReport` / report services: verified sales only; pending shown as a separate line.
- Cash In keeps counting every sale regardless of status (D3).

### S4 — Voucher computation
- `utils/voucher.utils.ts` `computeVoucherTotals({ invoice, ewtRate, lessReturn, ewtOverride })`
  -> { amountBeforeVat, vat, ewt, amountToPay }, centavo rounding. One source for form preview,
  table, print.
- `voucher.request.ts` + Purchases/Expenses request schemas: breakdown fields; FormField gets a
  read-only computed "summary" row if none exists.
- Voucher / Purchase / Expense list hooks: fields, defaults, normalize; services pass columns.
- Voucher table + detail panel: show gross, EWT, return, payable.

### S5 — Voucher print in the client layout
- Rewrite `printVoucher`: letterhead (branch legal name + address), CHECK/CASH VOUCHER title,
  Voucher No. + Date, Payee, Particulars/Amount with breakdown, Bank / Check No. / Date of
  check, Received by Name / Signature / Date, Prepared / Approved. `printPalette` only.
- Branch Monitoring edit form: legal name + address fields.

### S6 — Verify + close
- Harness capture: Sales page states, deposit/verify modals (cancel only), voucher form preview,
  print preview. Close: merge any follow-ups into ROADMAP.md, delete this file.

## Done
- [x] S0 — spreadsheet + paper voucher analysed, plan written, D1–D9 locked (2026-09-28).
- [x] S1 — migration written, committed v1.36:
  `supabase/migrations/20260928000010_sales_verification_voucher_breakdown.sql`. NOT applied —
  apply it before testing S2 against the database.
- [x] S2 — Sales module: `enums/sale.enum.ts`, `models/data/sale/sale.{request,response}.ts`,
  `services/data/sale.services.ts`, `hook/data/sale/sale.{list,form}.hook.ts`,
  `components/sale/{tables/SalesTable,cards/SaleSummaryCards,menus/SaleStatusTabs,modal/SaleFormModals}.tsx`,
  `pages/Sales/SalesView.tsx`, `/sales` route, sale keys, `ILedgerFilters.saleStatus`.
  `sale` dropped from the Transactions form. Row actions: Mark deposited + Edit (undeposited /
  rejected, encoders), Verify + Reject (managers, deposited), Edit history, Delete (managers,
  not verified). History reuses `DisbursementHistoryModal` (row widened to ITransaction).

- [x] S3 — Actual sales: `isVerifiedSale` / `isPendingSale` in `models/data/sale/sale.response.ts`
  (+ `pendingSaleStatuses` in `enums/sale.enum.ts`); `ITransaction.sale_status` + column in
  `transaction.services.ts`. `dashboard.services.ts` today/yesterday/monthly/last-month sales,
  chart and branch monitor = verified only; `monthlyPendingSales` shown as a chip on the Monthly
  Sales tile (`DashboardView`). `PeriodReport` + `report.utils` print: Sales = verified, pending
  line added. Transactions summary Sales = verified. Cash In unchanged (D3). Pending =
  undeposited + deposited; rejected is neither. Role-specific alerts not built (one pending chip).

## Next
1. S4: Voucher computation — `utils/voucher.utils.ts` `computeVoucherTotals`, form fields, table.

## State
Branch: development-overhaul · Uncommitted: S3 src changes + this file.
