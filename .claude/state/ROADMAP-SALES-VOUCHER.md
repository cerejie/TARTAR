# ROADMAP — Sales deposit/verification + Voucher computation
Updated: 2026-09-28 · Status: PLANNED — decisions D1–D8 must be confirmed before S1

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
roadmap's last capture step — see D8.

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

## Decisions (recommended default in **bold**; confirm or change)
- D1 Sales screen: **new `/sales` module like Purchases/Expenses** (sidebar entry, status pills
  Undeposited / Deposited / Verified / Rejected, stat cards) and `sale` removed from the generic
  Transactions form. Alt: a "Sales" pill inside Transactions.
- D2 Who does what: **employee records + marks Deposited; admin (manager) Verifies or Rejects;
  admin-recorded sales still need the Deposited step but self-verify**. Accountant read-only.
- D3 Deposit details captured: **deposit date + deposit slip / reference no. (+ bank account)**.
- D4 Unverified sales: **excluded from Sales totals, still counted as Cash In** (money was
  received) and shown as "Pending verification". Alt: excluded from cash-in too.
- D5 Voucher breakdown: **inputs = Gross, VAT-registered payee (toggle), EWT rate (None / 1% goods
  / 2% services), Less return; computed = Net of VAT, VAT, EWT, Amount payable**. Payable opened
  on approval = amount payable (net). Purchase/expense transaction amount = gross.
- D6 Voucher number: **keep `HAR-PUR-2026-00000187`** (locked 2026-07) vs switch to `2026-187`.
- D7 Letterhead: **new branch fields legal_name + address in Branch Monitoring**; confirm which
  branch prints "AFC 818 Gas Station" (or it is a new branch).
- D8 Particulars: manual vouchers dropped free-text purpose on 2026-07-19; the sheet has a
  Particulars line -> **re-add optional `particulars` text on every voucher**.
- Existing data: **all historical sales back-filled as Verified** so past reports don't change.

## Phases

### S1 — Migration (propose, wait for approval) `supabase/migrations/2026092x000010_sales_verification_voucher_breakdown.sql`
- `app.sale_status` enum: undeposited, deposited, verified, rejected.
- `transactions`: sale_status, deposited_by, deposited_at, deposit_date, deposit_reference,
  verified_by, verified_at, rejection_reason. CHECK: sale_status NOT NULL iff type = 'sale'.
  Back-fill existing sales = verified. Index (branch, type, sale_status, txn_date).
- RPCs (SECURITY DEFINER, row-locked, audited through the existing edit-history table):
  `mark_sale_deposited`, `verify_sale` (managers), `reject_sale` (managers, reason).
- Lock trigger: verified sale is immutable/undeletable (mirrors approved-voucher lock);
  undeposited/deposited stays editable with audit trail. RLS: employees only own-branch.
- `vouchers`: particulars, gross_amount, vat_registered, ewt_rate, ewt_amount, less_return
  (numeric(14,2), defaults 0/false). CHECK amount = round(gross - ewt - less_return, 2) when
  gross is set; trigger computes ewt_amount so the client can't tamper.
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
- Cash in/out per D4.

### S4 — Voucher computation
- `utils/voucher.utils.ts` `computeVoucherTotals({ gross, vatRegistered, ewtRate, lessReturn })`
  -> { netOfVat, vat, ewt, amountPayable }, centavo rounding. One source for form preview,
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
- [x] S0 — spreadsheet analysed, plan written (2026-09-28).

## Next
1. User confirms D1–D8. Then S1: write the migration for review (do not apply).

## State
Branch: development-overhaul · Uncommitted: this file + .claude/docs/ · No src changes.
