# ROADMAP — Mobile-native design improvements
Updated: 2026-10-03 (D6 done)

## Goal
Move the main app from "desktop architecture with mobile components" to "shared business logic with
mobile-first information architecture", per `.claude/state/mobile-native-analysis-plan.md` (the audit,
the source of every item below) and `.claude/state/design-plan-PWA.md` (the design inventory it audited).
No visual rewrite: reprioritise hierarchy, density, workflows and tokens. Desktop keeps its tables,
sidebar and bento; it only gets the token, ordering and shared-component changes.
`yarn build` + `yarn lint` clean after every phase, then the user checks it on a phone.

## Session protocol
1. New conversation: read this file, run `git status --short`, start `Next` item 1. Load `build`
   (+ `tartar-shadcn`, and `shadcn` docs for UI). Do not re-read the audit end to end; read only the
   section the phase cites (line ranges below).
2. Present the phase's file plan (files touched, new files, what moves) and WAIT for the user's go.
3. Implement → `yarn build` + `yarn lint` → say "compiled", never "renders" (user confirms visuals).
4. Tick the phase in Done with the paths touched, rewrite Next, update State, suggest the commit
   (`Development v<X.Y>`, re-check `git log --oneline --grep="^Development v" -1`).
5. ONE phase per conversation. Then tell the user to open a new conversation.
6. When D10 is done: delete this file, rename `ROADMAP-PWA-SUSPENDED.md` back to `ROADMAP.md`,
   and continue the suspended PWA roadmap at its Next (device test script → P0-6 QA reset → merge →
   production deploy).

## Decisions locked (2026-10-03, user)
- N1 Phone nav: KEEP the sidebar drawer (memory `tartar-phone-nav-sidebar`, roadmap D2 revised).
  No bottom tab bar or More sheet in the main app. INSTEAD add a "Quick actions" row on the phone
  dashboard (Sales, Vouchers, Receivables, Payables; role-filtered through route `can`), one tap
  from Home. Audit items 1 / §6 nav / "Do This First" #1 are replaced by this.
- N2 Surfaces: ADOPT the radius/shadow hierarchy, via theme.css tokens only — controls 8px,
  standard cards 12px, large mobile surfaces 16px, sheets/shell 20px, status chips pill, FAB
  16px/circle. Ordinary content: border or very subtle shadow; menus moderate; sheets/modals strong.
  The three-floating-panel shell stays, but not every block gets the panel radius.
- N3 Tablet: ORIENTATION-AWARE. Portrait tablet (768–1023 portrait) = phone shell + cards + sheets.
  Landscape tablet = desktop shell + real `DataTable` with fewer columns (existing `collapse`
  roles) + touch spacing. Replaces the current hybrid (desktop chrome + phone data).
- N4 Tabs: ONE `ContextSwitch` component with two presentations — segmented control when ≤ 4
  items, horizontally scrolling chips when more — same tokens in main and admin. Replaces
  `ViewSwitch`, `StatusFilterTabs` and admin `SegmentedTabs` (callers migrate; old files deleted).
- L1 Every CLAUDE.md convention holds (no comments, no useState, class strings in *.styles.ts,
  tokens only in theme.css with a dark value, useConfirm, writes through runWrite, Transactions is
  the reference, aria-vega only, no new dependency). Offline-first must not regress.
- L2 Out of scope: bottom nav (N1), Capacitor/native wrappers, changing business rules, schema
  changes (none expected; if one appears, show SQL and wait).

## Phases
- D0 Tokens — type scale, radius, shadow, dark semantics, money levels. (audit §8 L1687-1899, gap #3 #5)
  - theme.css `@theme`: semantic text sizes (micro 11, caption 12, secondary 13, body 15,
    emphasis 16, section 18, page-title 24, money-lg 28, hero 32) → utilities `text-body`,
    `text-label`, `text-section`, `text-page-title`, `text-money-lg` …; replace every arbitrary
    `text-[11px|13px|0.8125rem|15px|17px|19px|22px|26px]` in src/styles with them.
  - Radius tokens per N2 (`--radius-control`, `--radius-card`, `--radius-surface`,
    `--radius-sheet`; keep `--radius-panel` for the shell); shadow levels (`--shadow-card`
    subtle, `--shadow-menu`, `--shadow-overlay`). Re-point component styles to them.
  - Dark values for `--positive`, `--warning`, `--destructive` (align with `--danger`),
    `--chart-2..6`; contrast check vs background, panel, muted, selected row, danger row, chart bg.
  - Money levels in a styles file (L1 primary value, L2 transaction amount, L3 supporting, L4
    meta), all `tabular-nums`; hierarchy by size/weight, not colour (audit item 8).
- D1 Breakpoints — kill the first-render flash, orientation-aware tablet. (audit items 4, 9)
  - `hook/use-mobile.ts` (shadcn, starts `false` → one desktop frame) must read the same
    `useSyncExternalStore`-style source as `hook/common/breakpoint.hook.ts` so the first render is
    already correct; shell gate only if a frame is still wrong.
  - One device-class vocabulary: phone | tabletPortrait | tabletLandscape | desktop. Phone shell for
    phone + tabletPortrait; cards/sheets for the same; desktop shell + table for tabletLandscape+.
  - Callers of `useIsTabletUp` / `useIsDesktop` / `useIsMobile` move to it; delete what is unused.
- D2 ContextSwitch + phone toolbar. (audit items 3, 6, 7; §6 Filters/Search L1442-1504)
  - New `components/common/view/ContextSwitch.tsx` per N4; migrate SaleStatusTabs,
    VouchersStatusTabs, LedgerStatusTabs, LedgerViewTabs, Reports + Master Data ViewSwitch, admin
    SegmentedTabs callers; delete ViewSwitch / StatusFilterTabs / SegmentedTabs.
  - Phone toolbar = `[Search] [Filter n] [Sort] [⋯]` with labels where room allows, only the
    controls a screen uses. Filter sheet: Quick filters (Today, This week, Overdue, Pending as the
    screen supports) then Advanced; footer Reset | Show results. Search mode: tap → app bar becomes
    `← [Search …]` with the keyboard open (only on screens that already search).
- D3 Dashboard. (audit item 2, §5 Dashboard L662-745, §6 Dashboard L1338-1370)
  - Phone order: Today (3 KPIs: Today's Sales, Today's Expenses, Net Profit) → Quick actions row
    (N1) → Needs attention (overdue receivables, due payables, pending vouchers, pending sales
    verification; tap → record via existing `?focus=<id>`) → Financial position (AR, AP) →
    Performance (monthly sales/expenses) → Trends (charts, one insight each).
  - Desktop keeps the bento; reorder to snapshot → attention → trends.
  - KPI tap → module. Reuse StatCard tokens; new pieces only if StatCard cannot express them
    (audit names PriorityMetric / AttentionSection / DashboardMetricGroup — use only what is needed).
  - Admin Home: make AttentionList more dominant than SalesTrendCard.
- D4 Record cards + detail sheets. (audit §5 Transactions L747-815, §6 Tables/Modals/Actions)
  - DataTableCards priority layout: title + primary amount + status + ≤ 2 key meta; rest moves
    to the detail sheet. Whole card opens the record; ⋯ keeps admin actions.
  - Detail sheet hierarchy: header (type + status) → hero amount → core meta → financial details
    → audit → contextual action footer (primary full-width sticky 48–52px, secondary inline,
    tertiary in More, destructive separated + useConfirm).
  - Sheet types named: action / detail / form / full-screen flow. Transactions first (reference).
- D5 Sales + Vouchers action-first. (audit §5 Sales L817-879, Vouchers L933-1000)
  - Sale detail: amount, customer, verification + deposit status; footer Verify / Record deposit /
    More (role- and status-aware).
  - Voucher detail: hero (amount + status) → primary action (Approve / Resubmit / Review) →
    collapsible Financial summary (subtotal, VAT, withholding, net) / Details (source, payee,
    reference) / Approval / Audit history. Business rules unchanged (memories
    `tartar-voucher-vat-decisions-2026-10`, `tartar-sales-voucher-decisions-2026-09`).
  - Purchases + Expenses cards show "Voucher created automatically" + link in detail; identical
    structure for both. (audit L881-931)
- D6 Receivables / Payables phone flow. (audit L1002-1060, §6 Ledger L1372-1400)
  - Phone: party → balance → outstanding records → payments → ledger; customer/supplier ledger as a
    detail screen/sheet, not the two-pane modal. Primary action Record payment / Mark as paid.
  - Ledger row: date, reference, description, debit/credit, running balance; smallest screens
    date + description + amount + balance. Benchmark: admin Payables (ListSection + sheet).
  - Desktop keeps the two-pane ledger modal.
- D7 Forms. (audit §6 Forms L1508-1540)
  - EntityFormModal on phones: collapsible sections (core → financial → review) in the full-height
    sheet, driven by `IFieldConfig` section metadata — still declarative, still `FormField`.
  - Sticky financial summary above the action bar where the form has totals (voucher/expense/
    purchase withholding + VAT).
- D8 Secondary screens. (audit L1062-1217, Admin L1221-1268)
  - Reports phone: type → period → summary → key rows → open detailed → Print (print unchanged).
  - Branch Monitoring: card list (branch, status, key metric) → detail.
  - Master Data: ContextSwitch sections + lists. Users: card (avatar, name, role, branch access,
    status) + Edit / More.
  - Account: grouped settings list (Account: Profile, Password · App: Install, Theme,
    Notifications · System: Sync, Version) using admin ListSection.
  - Admin + main notifications: Action required → Due soon → Informational.
- D9 Polish. (audit Phase 3 L2091-2122, §6 Empty/Loading L1626-1657, Icons/Touch L1868-1899)
  - Empty / error / offline copy: what happened, why, what next. Loading keeps geometry; no
    full-screen dimming on light refresh.
  - Motion only for navigation/confirmation/expansion/state change. Charts: one question each.
  - Icons 16 dense / 20 nav / 20–24 major; filled only for active. Primary phone CTA 48–52px.
  - Main vs admin share typography, spacing, statuses, sheets, actions (audit item 6) — audit the
    drift left after D0–D8.
- D10 Verification: phone portrait, tablet portrait + landscape, desktop; light + dark; each role;
  offline regression (pending rows, queued write replay); x-overflow 0; harness in
  `.claude/state/audit/` (run login.mjs first). Then hand back to the suspended PWA roadmap.

## Path map
- tokens: src/styles/common/{theme.css,tone.styles.ts,toast.styles.ts}
- breakpoints: src/hook/common/breakpoint.hook.ts (useIsDesktop, useIsTabletUp; matchMedia store) ·
  src/hook/use-mobile.ts (shadcn useIsMobile, flash source)
- shells: src/layouts/{ProtectedLayout,AdminAppLayout}.tsx · src/components/common/layout/{PhoneShell,
  AppBar,AppBarSearch,SidebarToggle,ProtectedSider,PhoneAlertsSheet,AccountSheetItems}.tsx ·
  src/hook/layout/{protected.phone,app.bar,admin}.hook.ts · src/styles/layout/shell.styles.ts ·
  src/styles/app/app.bar.styles.ts
- view: src/components/common/view/{ContentView,BentoGrid,ContextSwitch}.tsx · src/utils/segment.utils.ts
- filter: src/components/common/filter/{FilterToolbar,FilterPopover,SortSelect,LedgerFilterBar,
  QuickDateFilters,SearchTrigger}.tsx · search mode: store/common/view.store.ts + hook/common/search.hook.ts
- admin primitives: src/components/common/app/{AppSheet,DetailRows,ListCard,ListSection,RecordHero}.tsx · src/components/admin/home/{AttentionList,OverviewTiles}.tsx ·
  src/hook/data/admin/admin.{payables,receivables}.hook.ts
- cards/status: src/components/common/card/StatCard.tsx · src/components/common/status/{EmptyState,
  ErrorState}.tsx · src/components/common/table/TableEmptyState.tsx
- tables: src/components/common/table/{DataTable,DataTableCards,LoadMoreSentinel}.tsx
- modals/forms: src/components/common/modal/{AppModal,DetailModal}.tsx ·
  src/components/common/form/EntityFormModal.tsx · src/components/common/button/PrimaryAction.tsx
- dashboard: src/pages/Dashboard/DashboardView.tsx · src/components/dashboard/{CashFlowDonut,
  NotificationsCard,NotificationsFeed,SalesOverviewCard}.tsx ·
  src/hook/data/dashboard/{dashboard,notification.list}.hook.ts
- transactions (reference): src/components/transaction/{cards/TransactionSummaryCards,
  tables/TransactionsTable}.tsx · src/hook/data/transaction/transaction.list.hook.ts
- sales: src/components/sale/{cards/SaleSummaryCards,menus/SaleStatusTabs,modal/SaleFormModals,
  tables/SalesTable}.tsx
- vouchers: src/components/voucher/{menus/VouchersStatusTabs,modal/VoucherSourceModals,
  tables/VouchersTable}.tsx
- ledger: src/components/ledger/{CustomerLedgerModal,CustomerLedgerView,SupplierLedgerModal,
  SupplierLedgerView}.tsx · ledger/menus/{LedgerStatusTabs,LedgerViewTabs,CustomerLedgerButton,
  SupplierLedgerButton}.tsx · ledger/tables/{LedgerRecordsTable,LedgerPaymentsTable,
  PayableRecordsTable,LedgerPartiesTable}.tsx · ledger/modal/{RecordPaymentModal,MarkPaidModal}.tsx ·
  ledger/views/LedgerRecordsSection.tsx · ledger/cards/LedgerSummaryCards.tsx
- account: src/components/account/cards/{AccountProfileCard,InstallAppCard,NotificationsCard}.tsx ·
  account/forms/ChangePasswordCard.tsx
- pages: src/pages/{Dashboard,Transactions,Sales,Purchases,Expenses,Vouchers,Receivables,Payables,
  Reports,Branches,MasterData,Users,Account,Admin}/
- anything else: `.claude/skills/build/references/pathfind.md`, never a tree scan.

## Done
- [x] Plan written; old PWA roadmap suspended as `.claude/state/ROADMAP-PWA-SUSPENDED.md` (git mv).
- [x] D0 Tokens (2026-10-03). theme.css: type scale `text-{micro,caption,label,body,emphasis,section,
  page-title,money-lg,hero}` (`label` not `secondary` — collides with the colour); radius
  `rounded-{control 8,card 12,surface 16,sheet 20}` + panel/pill, shadcn sm/md/lg/xl re-derived to
  6/8/10/12; shadows `shadow-{card,menu,overlay}` (raised/pop deleted; shadcn shadow-md/lg → menu/overlay);
  positive/positive-bright/warning moved to :root+.dark vars, light darkened to #15803d/#b45309 (user ok);
  dark destructive=#f87171, chart-2..6 dark values. cn.utils tailwind-merge knows text/radius/shadow names.
  + styles/common/money.styles.ts `moneyLevel` (primary/amount/supporting/meta) used by recordHeroAmount,
  listCardAmount, listSectionMeta, dataCardAmount, formSummaryValue, paymentTotalValue. Re-pointed:
  styles/{app/app,app/app.bar,layout/sidebar,layout/public,table/table,view/view,modal/modal}.styles.ts.
  `rounded-panel` now only on shell + auth/error cards. Page title is 24px on every width.
  Contrast: dark all ≥ 5.4:1; light positive/warning ≥ 4.6:1. Known leftovers (not changed, D9):
  light destructive on muted 4.42:1; light chart-2 / chart-5 ~2:1 (non-text, below 3:1).
- [x] D1 Breakpoints (2026-10-03). hook/common/breakpoint.hook.ts: one useSyncExternalStore device store
  (`DeviceClass` in models/common/view.model.ts) → useIsPhone / useIsCompact (phone|tabletPortrait) /
  useIsDesktop; useIsTabletUp deleted. phone = <48rem, or <64rem and <30rem tall (sideways phone);
  tabletPortrait = <64rem portrait; desktop ≥64rem. hook/use-mobile.ts delegates to useIsCompact (first
  render correct, no gate needed; only ui/sidebar imports it). Main shell/cards/sheets/FAB on useIsCompact;
  admin stays width-only (useIsPhone: admin.hook, admin.{payables,receivables}.hook) — user decision.
  theme.css `compact:` / `wide:` custom variants (same queries); sidebar drawer + rowActionTrigger use them.
  AppBar gets `floating` prop (admin non-phone) instead of md: classes, so the main phone bar stays phone at
  tablet portrait; branch sheet = !floating. DataTable cells `pointer-coarse:h-16`. Room-only md:/lg: left
  as is (shell/header render only ≥48rem; bento, filter, ledger, form, modal grids).
- [x] D2 ContextSwitch + phone toolbar (2026-10-03). common/view/ContextSwitch (options: ISegmentOption;
  ≤4 = segmented w/ SelectionIndicator, >4 = scrolling outline chips; styles view.styles `contextSwitch*` cva,
  segmentedTabs* + viewSwitchItem + viewToolbar toggle-group hack removed); utils/segment.utils
  (segmentOptionsOf, statusSegmentOptionsOf adds "All", statusOfSegment). Migrated Sale/Vouchers/disbursement
  Voucher/Ledger status tabs, LedgerViewTabs, SalesOverviewCard, Reports, MasterData, 4 admin *Overview.
  Deleted ViewSwitch, StatusFilterTabs, SegmentedTabs. Phone toolbar: icon-only collapse removed from
  filterToolbarStart; labelled pills [Search] [Filters n] [Sort] (Sort label on compact, chevron desktop
  only). FilterPopover `quick` slot → "Quick filters" / "Advanced" sections (sheet + popover).
  QuickDateFilters: Today / This week (Mon start) / This month via period.utils quickDateRangeOf /
  quickDateOfRange (models/common/period.model quickDate*); status not duplicated (user). Search mode:
  view.store `searchMode` (scope, placeholder, pathname) + useSearchMode; SearchTrigger (LedgerFilterBar,
  compact + showSearch = Receivables/Payables records) → PhoneShell swaps AppBar for AppBarSearch
  (← clears + exits, autofocus); closed on route change. No ⋯ More (no screen has secondary toolbar actions).
  Docs: CLAUDE.md, build/stack.md, tartar-shadcn SKILL.md name ContextSwitch.

- [x] D3 Dashboard (2026-10-03, autopilot). pages/Dashboard/DashboardView thin → dashboard/views/DashboardBoard
  (useIsCompact) → DashboardPhone (Today 3 KPIs → QuickActions → AttentionList → Financial position AR/AP →
  Performance Monthly Sales/Expenses → Trends) | DashboardDesktop (bento main: Today → Needs attention →
  AR/AP/Monthly Sales/Monthly Expenses quarters → Sales overview + Cash flow; aside Notifications feed).
  dashboard/cards/{Today,Position,Performance}StatCards + CashFlowCard; dashboard/{QuickActions,DashboardSection}.
  StatCard `href` (KPI tap → /sales, /expenses, /reports, /receivables, /payables; statLink). AttentionList moved
  admin/home → dashboard/ (item.meta); utils/attention.utils (toAttentionItem, balancesOf, dashboardAttentionItemsOf)
  shared with admin.home.hook. dashboard.services getSummary +monthlyExpenses (expense type, same as today's),
  getPendingReviews (vouchers status pending; sales sale_status deposited) → query key dashboardReviewsKey (live).
  Attention items: overdue receivables, overdue payables, payables due this week, vouchers awaiting approval
  (tap presets Vouchers status=pending), sales awaiting verification (presets Sales status=deposited). Quick
  actions via route.utils quickActionRoutesOf(filterRoutesByPermission). Admin Home: Needs attention first.

- [x] D4 Record cards + detail sheets (2026-10-03, autopilot). common/table/DataTableCards: priority layout —
  title/subtitle + amount + status + ≤ 2 meta (`cardMetaLimit`); overflow metas move to the sheet; whole card
  opens the record (title PressArea overlay; onRowClick wins), decorative chevron replaces the "Show details"
  button (`dataCardChevron`; `dataCardToggle` removed). New common/table/RecordDetailSheet (AppSheet kind
  detail: hero = title · subtitle, amount, status chips → all meta columns as detailRows → each IDetailSection
  as a titled DetailRows group → SheetActions footer). New common/app/SheetActions (IRowAction `priority`
  primary = full-width 48px, secondary = inline outline, unprioritised = "More actions" RowActionMenu, danger =
  separated destructive, its onSelect still opens useConfirm). DataTable `detailActions` prop → cards sheet.
  Sheet types: models/common/view.model `SheetKind` (action | detail | form | flow) → modal.styles `drawerKind`
  cva (detail min 60dvh, form = old fill, flow full-screen); AppSheet + AppModal take `kind` (AppModal `fill`
  removed; EntityFormModal form, DetailModal + admin Payable/ReceivableEntrySheet detail). models/common/table
  ICardField/ICardFields; RowActionMenu `label`. detailRow wraps (items-start, break-words) instead of truncate.
  Transactions (reference): sections Details (reference, branch, description, farm section) → Financial
  details (cash account, income source, party) → Audit (recorded by [manager], recorded at); detailTitle
  "<Type> transaction"; detailActions = delete for managers.

- [x] D5 Sales + Vouchers action-first (2026-10-03, autopilot). IDetailSection `disclosure` (expanded |
  collapsed; models/common/detail.model) → new common/table/RecordDetailSection (ui/collapsible, React Aria
  Disclosure; app.styles recordSheetSectionToggle/Chevron); RecordDetailSheet uses it, desktop RowDetailPanel
  ignores it. Sales (SalesTable): detailTitle "Sale", detailActions = row actions with priority — Mark deposited /
  Verify / Resubmit sale primary (status- and role-aware, unchanged rules), Edit secondary, history in More,
  Reject/Delete danger; sections Deposit and verification → Details → Audit. Vouchers (VouchersTable):
  "<Type> voucher", Approve / Resubmit (sourced rejected; manual = View reason) primary, Edit + Print (approved)
  secondary; sections Financial summary (expanded; voucherBreakdownItems) → Voucher details (source, payee,
  reference, type, branch, category, due, check) → Approval (status, decided by/at, reason) → Audit history
  (prepared by, created, printed), the last three collapsed; voucher.list.hook exposes userNameOf.
  Purchases + Expenses (identical): section "Voucher created automatically" (+ voucher status), "Open voucher"
  secondary action (createVouchers) → disbursement.list.hook openVoucher: resets the vouchers filter scope to
  search = payee + status, page 1, navigates /vouchers; rejected → "Resubmit" primary, Edit secondary.

- [x] D6 Receivables / Payables phone flow (2026-10-03, autopilot). Compact: ledger/{Customer,Supplier}LedgerModal
  render the party list plainly (styles/ledger `ledgerPane`) and {Customer,Supplier}LedgerView opens as its own
  stacked full-screen AppModal (kind flow, title = party, onClose = closeLedgerDetail/closeSupplierDetail;
  detail hooks expose `detailOpen`). Phone order: balance (new ledger/cards/LedgerPartyOverview: StatCard
  outstanding + DetailRows unpaid / last payment / last transaction; desktop = the old 4-StatCard bento, now
  shared) → Records (filter + cards: date title, reference subtitle, balance/amount due, status, amount + due
  date meta) → Payments. Sheet footer (SheetActions): customer Record payment primary (selection, disabled
  until rows picked) + Print statement secondary + Customer information in More; supplier Print statement.
  Record sheets: customer-ledger row Record payment primary (selects that row, opens PaymentAllocationModal);
  supplier-ledger + main PayableRecordsTable Mark paid primary; main LedgerRecordsTable Record payment primary
  + Delete danger; detailTitle Receivable/Payable. Desktop two-pane modal unchanged (head styles' dead
  max-lg variants and ledgerPayButton removed).

## Next
1. D7 Forms (see Phases). EntityFormModal phone sections + sticky financial summary.
2. D8 → D10 in order.

## Open
- D6: a true running-balance ledger (debit/credit per record and payment, cumulative balance) was NOT built —
  needs the user's rule on pending/rejected payments and on filtered date windows. The phone ledger shows each
  record's amount + remaining balance (existing `ledgerBalance`) and Print statement. Decide before D10.

## State
Branch mobile-app-native-newlook · Uncommitted: none ·
Last check: yarn build + yarn lint clean (2026-10-03) · Last commit Development v2.29 (D5, autopilot).
D9 note: phone dashboard section labels reuse ListSection's small-caps head; desktop attention list sits in the
bento main column (ListSection panel) — check visually. D4: confirm-from-sheet stacks the confirmation over
the open detail sheet (React Aria nested overlay) — check on a phone; tables with > 2 meta columns now open a
sheet even without detailSections. D6: ledger detail is a sheet stacked on the party-list sheet (customer
details edit opens from the list sheet underneath) — check overlay order on a phone. D5: "Open voucher" lands on Vouchers filtered by payee +
status (search is payee-only, so same-payee vouchers with that status also show); action-row labels changed on
desktop too (View reason → Resubmit where it opens a resubmit form).
