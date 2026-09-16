# ROADMAP — Apply Transactions design language to Receivables, Payables, Reports, Branch Monitoring, Master Data, Users
Updated: 2026-09-16

## Goal
Every target screen composes ContentView → (StatCard bento) → TablePanel (FilterToolbar + DataTable + TablePagination) → EntityFormModal, with RowActionMenu + useConfirm, StatusTag pills, one primary CTA on the toolbar trailing edge, and thin pages. Full plan: `.claude/state/DESIGN-PLAN.md` — read the section for the phase being worked, not the whole file.

## Decisions locked
- Reference shape -> Transactions (per CLAUDE.md); Purchases/Expenses are the same shape.
- Primary CTA -> last element of FilterToolbar `actions`, RequirePermission-wrapped, "Verb noun".
- Row actions -> RowActionMenu only; no icon clusters, no `type="link"` cell buttons.
- Status -> new `StatusTag` (typeTag + outlined) everywhere; `Badge` and raw `Tag color=` retired; red overdue row background retired.
- Table shell -> TablePanel; `SectionCard title="All X"` around tables removed (header already shows the title).
- Stack rhythm -> `viewBody { gap: md }`; per-component marginBottom removed from card/tablePanel/statGrid/filterBar.
- Toolbar control size -> `middle` across a toolbar.
- Multi-view screens -> `ViewSwitch` (Segmented + useSearchParam) in ContentView toolbar; views stay mounted.
- No drawer introduced. Customer Ledger modal becomes the "Customers" view of Receivables.
- One payment form (merges settle modal + PaymentAllocationModal) with an `intro` context block; EntityFormModal gets optional `intro?: ReactNode`.
- Reports period -> editable date range; presets fill it.
- Phase order -> 0 Foundation, 1 Receivables/Payables, 2 Users/Master Data, 3 Branch Monitoring, 4 Reports, 5 Polish.

## Path map
Reference (copy these):
- page: src/pages/Transactions/TransactionsView.tsx
- cards: src/components/transaction/cards/TransactionSummaryCards.tsx
- table: src/components/transaction/tables/TransactionsTable.tsx · src/components/purchase/tables/PurchasesTable.tsx (edit/history variant)
- hook: src/hook/data/transaction/transaction.list.hook.ts (sections/defaults at L137-256)
Common primitives:
- src/components/common/view/ContentView.tsx · BentoGrid.tsx · BentoCell.tsx
- src/components/common/table/TablePanel.tsx · DataTable.tsx · TablePagination.tsx · RowActionMenu.tsx · RowDetailPanel.tsx · TableDecor.tsx (NameCell/RowActions/ColumnLabel)
- src/components/common/filter/FilterToolbar.tsx · LedgerFilterBar.tsx
- src/components/common/form/EntityFormModal.tsx · FormFieldGrid.tsx · FormSection.tsx · FormField.tsx (types: text,textarea,password,number,amount,select,multiselect,date)
- src/components/common/modal/AppModal.tsx · ConfirmationModal.tsx · DetailModal.tsx
- src/components/common/card/StatCard.tsx · SectionCard.tsx
- src/models/common/view.model.ts (ModalSize/modalWidths, BentoSpan)
Styles:
- tokens: src/styles/common/vars.css.ts · tone: src/styles/common/tone.css.ts · global: src/styles/common/global.css.ts
- src/styles/view/content/content.view.css.ts (viewBody, bentoSpan) · src/styles/table/table.css.ts (tablePanel* at end, typeTag, iconButton, rowOverdue, nowrapCell) · src/styles/filter/filter.css.ts · src/styles/modal/modal.css.ts · src/styles/form/form.css.ts (formGrid, fieldSpan) · src/styles/stat/stat.css.ts (statGrid) · src/styles/card/card.css.ts (card marginBottom) · src/styles/status/status.css.ts
- layout content padding: src/styles/layout/protected.layout.css.ts (`content` ~L342)
Targets (current state):
- Receivables: src/pages/Receivables/ReceivablesView.tsx (fields/defaults live here — move to hook) · src/components/ledger/LedgerManager.tsx · CustomerLedgerModal.tsx · CustomerLedgerView.tsx · PaymentAllocationModal.tsx · CustomerDetailsModal.tsx · CustomerInfoModal.tsx · src/components/payment/PaymentsPanel.tsx
- Payables: src/pages/Payables/PayablesView.tsx (same as Receivables)
- ledger hooks: src/hook/data/ledger/ledger.manage.hook.ts · customer.ledger.hook.ts · customer.detail.hook.ts · src/hook/data/payment/payment.list.hook.ts · src/hook/data/party/customer.record.hook.ts
- ledger services/models/enums: src/services/data/ledger.services.ts · payment.services.ts · src/models/data/ledger/ledger.request.ts · ledger.response.ts (ledgerBalance, isLedgerOverdue) · src/enums/ledger.enum.ts
- Reports: src/pages/Reports/ReportsView.tsx · src/components/report/{PeriodReport,LedgerReport,CashFlowReport,ExpensesReport}.tsx · src/hook/data/report/report.hook.ts · src/styles/view/report/report.view.css.ts
- Branch Monitoring: src/pages/Branches/BranchesView.tsx (columns/handlers live here) · src/hook/data/branch/branch.manage.hook.ts · src/models/data/dashboard/dashboard.response.ts (IBranchMonitorRow L47)
- Master Data: src/pages/MasterData/MasterDataView.tsx · src/components/master-data/SuppliersPanel.tsx · ExpenseCategoriesPanel.tsx · src/hook/data/party/supplier.manage.hook.ts · src/hook/data/expense-category/expense.category.manage.hook.ts
- Users: src/pages/Users/UsersView.tsx (columns/handlers live here) · src/hook/data/user/user.manage.hook.ts (fields ~L95-134) · src/enums/role.enum.ts
- Routes/keys: src/routes/protected.view.routes.ts · src/keys/{query,modal,table,storage}.keys.ts · src/hook/common/{filter,modal,pagination,search.param,confirmation}.hook.ts · src/store/common/filter.store.ts

## Done
- [x] Analysis + full design plan written to `.claude/state/DESIGN-PLAN.md` (no code touched).

## Next
1. Phase 0 step 1 — present a numbered plan for: `viewBody` gap + remove marginBottom in card.css.ts / table.css.ts (tablePanel) / stat.css.ts (statGrid) / filter.css.ts (filterBar); wait for approval; implement; `yarn build && yarn lint`.
2. Phase 0 step 2 — toolbar control size `middle` (LedgerFilterBar + filter.css.ts); FormFieldGrid half→full ≤575px (form.css.ts fieldSpan).
3. Phase 0 step 3 — create `components/common/status/StatusTag.tsx`, `components/common/filter/SearchInput.tsx`, `components/common/view/ViewSwitch.tsx`; `StatusColor` union in enums; apply StatusTag to Transactions/Purchases/Expenses tables.
4. Phase 0 step 4 — `search` in filter.store.ts; `LedgerFilterBar showSearch/showOverdue`.
5. Then Phase 1 (DESIGN-PLAN §9–10, §20 steps 6–9).

## Open
- Branch CRUD → Master Data section (recommended) vs ViewSwitch [Monitoring][Branches] on /branches. Decide before Phase 2/3.
- Whether Reports Export CSV lands in Phase 4 or Phase 5.

## State
Branch: development-v2.3 · Uncommitted: yes (pre-existing edits in LedgerManager, PaymentsPanel, PeriodReport, BranchesView, DashboardView, UsersView, VouchersView — not from this session) · Last check: none run this session (analysis only)
