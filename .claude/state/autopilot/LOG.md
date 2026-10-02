# Autopilot log

## 2026-10-03 — D3 Dashboard → Development v2.26
- Pending sales verification = ? → sale_status "deposited" (existing `pendingVerification` in sale.list.hook; verify only from Deposited, memory)
- Pending vouchers = ? → status "pending" (existing status; dashboard is manager-only, so actionable)
- Attention items → overdue receivables, overdue payables, payables due this week, vouchers awaiting approval, sales awaiting verification (roadmap list; near-due receivables/checks left to admin)
- Aggregate attention tap → module with status preset via useFilterField (no single record for an aggregate; ?focus needs one id)
- Monthly expenses source → expense-type sumCountedRows MTD (same definition as Today's Expenses; no new rule)
- Phone vs desktop order → two compositions behind DashboardBoard(useIsCompact) (DOM order differs; CSS order would fight bento)
- Desktop → main: Today → Needs attention (full) → AR/AP/Monthly Sales/Monthly Expenses → trends; aside keeps Notifications feed (attention stays second at every width)
- Phone notifications feed → dropped from body (app-bar alerts sheet already carries it)
- KPI tap → StatCard `href` mirroring MetricTile Link (no new primitive; PriorityMetric/DashboardMetricGroup not needed)
- AttentionList home → moved admin/home → dashboard/ (shared by main + admin); item.meta replaces hard-coded "accounts"
- Admin Home dominance → AttentionList moved above period switch + tiles
- Verification: yarn build + yarn lint clean; compiled, visuals unconfirmed

## 2026-10-03 — leftovers → Development v2.27
- Uncommitted autopilot conductor/worker rewrite + CLAUDE.md → committed as its own version (Worker step 3); build + lint clean

## 2026-10-03 — D4 Record cards + detail sheets → Development v2.28
- Card layout → keep generic DataTableCards, cap meta at 2 (audit's dedicated transaction summary not needed; role mapping already right)
- Overflow meta → shown in the detail sheet's core meta list; sheet opens whenever there is overflow, sections or actions (no data lost on phone)
- Cap when onRowClick is set → no cap (card opens a different record, so no sheet holds the overflow)
- Whole-card press → existing title overlay press; separate "Show details" button replaced by a decorative chevron (one tap target)
- Sheet footer actions → DataTable `detailActions` + IRowAction `priority` (reuses the row-action shape; destructive keeps useConfirm)
- Confirm from sheet → keep the sheet open under the confirmation (cancel returns to the record; delete closes it as the row leaves)
- Sheet types → SheetKind action/detail/form/flow via one drawerKind cva; AppModal `fill` → kind "form"; default action = no visual change for existing sheets
- Transactions balance impact / debit-credit → not added (would invent an accounting rule); sections regrouped Details → Financial details → Audit
- Detail rows → wrap long values instead of truncating (description was cut off in sheets)
- Primary CTA height → 48px through sheetActions selector (beats drawerFooter's 44px), other footers unchanged until D9
- Verification: yarn build + yarn lint clean; compiled, visuals unconfirmed

## 2026-10-03 — D5 Sales + Vouchers action-first → Development v2.29
- Sale/voucher detail footer → reuse DataTable `detailActions` = the row-action list with `priority` (one source for row menu + sheet; no dedicated SaleSummary — RecordDetailSheet hero already shows amount, customer, status)
- Sale verification + deposit status → the one sale_status chip in the hero + "Deposit and verification" section first (no new status rule)
- Sale primary → Mark deposited (undeposited, encoder) / Verify (deposited, manager) / Resubmit (rejected, encoder); Reject + Delete stay danger with their existing confirm/modal
- "View reason" label → "Resubmit" where it opens a resubmit form (sales, sourced vouchers, purchases, expenses); manual rejected voucher keeps "View reason" (view-only modal)
- Collapsible sections → IDetailSection `disclosure` rendered by new RecordDetailSection over ui/collapsible (React Aria owns open state; no useState); desktop expanded row ignores it
- Voucher sections → Financial summary open; Voucher details / Approval / Audit history collapsed (audit: no long accounting form by default); "Source" = existing voucherPurpose (no new rule)
- Voucher audit history → created/prepared by/printed only (no voucher history table exists; no schema change)
- Print in sheet → secondary when approved, else in More disabled with its "Needs approval" hint
- Purchases/Expenses voucher link → "Open voucher" navigates to /vouchers with vouchers filter = payee search + voucher status (no ?focus consumer exists; payee is the only search column), gated on createVouchers (route permission)
- openVoucher location → disbursement.list.hook (owner of both tables; a separate hook kind would not fit list|form|detail|manage|scope)
- Verification: yarn build + yarn lint clean; compiled, visuals unconfirmed

## 2026-10-03 — D6 Receivables / Payables phone flow → Development v2.30
- Phone ledger shape → stacked full-screen detail sheet (AppModal kind flow) over the party-list sheet; desktop two-pane slide unchanged (minimal diff, one hook call, desktop untouched)
- Two-pane slide on compact → removed; list renders plainly, detail is its own sheet with the party as title (back = close sheet)
- Party balance → shared LedgerPartyOverview: phone StatCard outstanding + DetailRows facts; desktop keeps the 4-StatCard bento (dedupes customer/supplier)
- Running balance (debit/credit cumulative) → not built; pending/rejected payments and filtered windows need a user rule (Open item). Ledger rows show date, reference, balance/amount due, amount, due date (existing math)
- "Ledger" step → Print statement in the sheet footer (existing statement), records list is the on-screen ledger
- Customer sheet primary → Record payment over the existing selection (disabled until picked); per-record sheet Record payment selects that one row (reuses PaymentAllocationModal)
- Supplier primary Mark as paid → per-record sheet primary (rule is per payable); supplier sheet footer = Print statement
- Main Receivables/Payables record sheets → Record payment / Mark paid primary, Delete danger (D5 pattern)
- Dead max-lg head styles + ledgerPayButton → removed (head is desktop-only now)
- Verification: yarn build + yarn lint clean; compiled, visuals unconfirmed

## 2026-10-03 — D7 Forms → Development v2.31
- Section metadata → existing IFieldSection drives it (no new field); compact + > 1 visible section = collapsible, desktop unchanged cards (minimal diff, no per-hook edits)
- Default disclosure → every section starts expanded (create forms need every section filled; collapse is for navigating, not hiding required input)
- Collapsed section with a validation error → forced open (sectionHasError), so a failed submit never hides its error
- Collapse state → controlled Disclosure over new disclosure.store keyed by form useId, reset on open (useState banned; error-forcing needs control)
- "Review" step → sticky FormSummaryBar pinned above the action bar on compact: total (emphasis) line always visible, tap reveals the rest; desktop keeps inline FormSummary
- Pinned slot → generic AppModal `pinned` prop (both layouts) rather than a compact-only prop
- Manual voucher form → converted to sections (Voucher → Payment → Voucher breakdown) mirroring the purchase form; particulars moved into the core section so the breakdown section is purchase-only
- All-hidden sections → skipped (visibleSectionsOf), so cash/expense vouchers show no empty cards
- Verification: yarn build + yarn lint clean; compiled, visuals unconfirmed
