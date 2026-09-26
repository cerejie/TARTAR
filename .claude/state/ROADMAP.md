# ROADMAP — "Airy blue" redesign (EduMate mockup) on shadcn + Tailwind
Updated: 2026-09-26 (T5c closed)

## Goal
Every screen matches the design spec below: pastel backdrop, floating top bar + floating
sidebar + one floating content card, mockup table/pagination/filters, crm2-style modals,
and complete loading / error / empty / lazy-loading states. `yarn build` + `yarn lint`
clean after each phase. One phase per conversation; user reviews between phases.

## Session protocol
1. New conversation: the `checkpoint` skill resumes — read this file, `git status --short`,
   start `Next` item 1. Load `build` + `tartar-shadcn` (+ `shadcn` docs for any new ui item).
2. Do only that phase. Close it: build + lint clean, tick Done with paths, rewrite Next,
   add paths to Path map, suggest commit `Development v1.<N+1>` (minor counts up: v1.10 ->
   v1.11), tell the user to open a new conversation. Report visual work as **compiled**.
3. After the last phase: delete this file.

## Decisions locked
- Colours -> mockup blue primary, pastel lavender/pink/blue backdrop, white floating panels.
  lime + lilac + ink-as-brand are retired. Money keeps green/red. Dark mode kept (navy variant).
- Shell -> follow the mockup. The branch scope takes the search box's place (no global search).
  Page title moves into the content card; the route `description` subtitle is removed from the UI.
- Font -> Plus Jakarta Sans via `@fontsource-variable/plus-jakarta-sans` (user-approved dep),
  imported in `src/main.tsx`, precached by the PWA.
- Modals -> crm2 pattern: ruled header, scrolling body, ruled tinted footer, bottom sheet on phones.
- Version numbering -> minor counts up past 9 (v1.10, v1.11 …), never rolls to v2.0.
- Unchanged: all CLAUDE.md conventions (no comments, no useState, styles in *.styles.ts, tokens
  only in theme.css, useConfirm, runWrite, pagination, Transactions is the reference).

## Design spec (from the mockup — the image is not kept; this section is the source of truth)
Page
- Full-viewport soft gradient backdrop: periwinkle top-left, pink/lilac right, pale blue
  bottom-left (`@utility bg-app` in theme.css). ~16px gutter around and between panels.
- Three floating white panels, radius ~20px (`rounded-panel`), hairline white/grey border,
  very soft shadow, no blur (perf): top bar (full width), sidebar (left, ~13rem),
  content card (fills the rest, scrolls internally).
Top bar (h ~64px)
- Left: blue rounded-square logo mark with a white glyph + wordmark "TARTAR" (semibold).
- Where the search sits: the branch scope trigger — pill input-look (grey fill, icon, branch
  name, chevron, ~18rem) opening the existing Command popover.
- Right: circular outlined icon buttons with a small blue count badge (sync queue / online
  state; notifications), then a divider and the user chip: 40px avatar, name (semibold) over
  email (muted), opening the user menu (dark-mode toggle, sign out).
Sidebar
- Nav items: 20px lucide icon + label, 14px, ~44px tall, rounded-xl. Active = solid blue fill,
  white text/icon. Hover = light grey fill. No group labels in the mockup -> TARTAR keeps its
  groups as tiny muted labels with generous spacing.
- Bottom-pinned item (mockup "Settings") -> the admin group (Branches, Users, Master data).
- Collapses to an icon rail on desktop; on phones the top bar shows the trigger and the
  sidebar is the shadcn sheet.
Content card
- Title row: page title h1 (~26px, semibold, dark navy) left; right side holds the screen's
  segmented status pills (mockup "Upcoming / In progress / Completed": pill buttons, active
  = solid blue + white, others white with grey border) and/or the primary action.
- Toolbar row under it: left a "Filters" outlined pill button (icon + chevron, active-count
  badge) opening a popover with the screen's filter fields + Reset; right "Sort by:" muted
  label + outlined pill select with icon.
- No footer bar (the online state moves into the top bar sync button).
Table
- No header fill, no row cards. Header labels ~12-13px, muted grey, sentence case, medium.
- Rows ~56px, 14px dark text, 1px very light divider between rows, no vertical borders.
  Hover = faint grey row tint. Selected = faint blue tint. Overdue = faint red tint.
- Person cell: 32px round avatar (initials fallback) + name. Progress cell: "14/56" (value
  bold, total muted) with "(25%)" right-aligned, above a 3px blue bar on a grey track.
  Avatar stack: overlapping 32px circles + blue "+N" circle. Row action: solid blue
  rounded-lg button, fixed width, ~36px tall.
- Pagination: outlined circular prev button at far left, circular next at far right,
  centred page numbers as 32px circles, active = solid blue + white, ellipsis between.
Cards (mockup "Recommended for you")
- White cards with light border, radius ~16px, pastel category chip top-left (blue-100/
  amber-100/near-black variants), muted meta top-right, semibold title, 2-line clamped muted
  body, outlined blue "Learn more" button. Section heading + "View all" blue link on the right.
Palette (chosen in T0 — exact values live in theme.css :root / .dark)
- primary #0B6BF5 (hover a step darker), primary-soft #E8F0FE, text #1B1F2A,
  muted text #6B7280, border #ECEEF3, track #E5E7EB, panel #FFFFFF,
  backdrop stops ~#E7ECFB / #F4E6F4 / #DDE9F8. positive/warning/danger keep their meaning,
  as soft-fill chips. Charts: blue, sky, violet, green, amber, red.

## Path map
- Tokens / base / utilities: src/styles/common/theme.css (shell backdrop = `bg-app`, panels = `rounded-panel shadow-panel bg-panel`) ; tones: src/styles/common/tone.styles.ts
- Font import: src/main.tsx ; PWA precache globs: vite.config.ts
- Shell: src/layouts/ProtectedLayout.tsx ; src/components/common/layout/{ProtectedHeader,ProtectedSider,ProtectedMenu,ProtectedBranchScope,ProtectedUserMenu,ProtectedNotifications,RouteRoot}.tsx ; src/hook/layout/protected.hook.ts (menu, header, notifications, title, user hooks) ; styles/layout/{shell,header,sidebar}.styles.ts ; round count buttons = countButton/countBadge/offlineDot in styles/status/status.styles.ts
- Content view: src/components/common/view/{ContentView,ViewSwitch,BentoGrid,BentoCell}.tsx ; styles/view/view.styles.ts
- Table: src/components/common/table/{DataTable (skeleton in renderBody),TablePagination,AvatarCell,TablePanel,RowActionMenu,RowDetailPanel,TableDecor}.tsx ; styles/table/table.styles.ts ; models/common/table.model.ts
- Filters: src/components/common/filter/{FilterToolbar,LedgerFilterBar,FilterPopover,SortSelect,FilterSelect,DateRangeFilter,SearchInput}.tsx ; styles/filter/filter.styles.ts ; store/common/{filter,sort}.store.ts
- Modals (T3 done): src/components/common/modal/{AppModal (isMobile -> Sheet),ConfirmationModal,DetailModal}.tsx ; components/common/form/EntityFormModal.tsx ; styles/modal/modal.styles.ts
- crm2 modal reference: D:/EJIE BUSINESS/EJIE WORK DCWD/dcwd_apps-crm-customer2/src/components/common/modal/AppModal.tsx + src/styles/modal/{modal,confirmation,detail}.styles.ts (modalHeaderRuled, modalFooter `-mx-6 -mb-6 rounded-b-2xl border-t bg-muted/50 px-6 py-4`, modalActionSize h-11 px-6, drawerFooter pb-safe, detailSections/detailGrid)
- Cards / status: components/common/card/{SectionCard,StatCard}.tsx, components/common/status/{StatusTag,EmptyState,ProgressRow,SyncIndicator}.tsx ; styles/{card,stat,status}/*.styles.ts
- Routes: src/routes/protected.view.routes.ts (`...lazyView(() => import(view))`), src/routes/route.lazy.ts (lazy + preload + HydrateFallback PageSkeleton + ErrorBoundary RouteErrorView), protected.routes.ts (root ErrorBoundary RootErrorView) ; public views stay eager
- Load / error primitives: common/view/PageSkeleton.tsx, common/layout/RouteProgress.tsx (useNavigation bar, keyframe route-progress in theme.css), common/status/{ErrorState,RouteErrorView,RootErrorView,EmptyState (icon + action)}.tsx, utils/error.utils.ts
- Query state: src/hook/common/query.hook.ts returns IQueryState (models/common/query.model.ts) = entry + isInitialLoading + isRefreshing + refetch
- Screen wiring shape (per T4, Transactions): hook returns loading = isInitialLoading, refreshing, error, retry (+ summaryError / retrySummary); DataTable refreshing/error/onRetry; StatCard + SectionCard error/onRetry (SectionCard also loading); avatar column `skeleton: "avatar" as const"
- Public pages: styles/layout/public.styles.ts, components/auth/*, pages/Error/ErrorView.tsx ; theme.css @utility bg-auth-* / bg-error-page
- Sort / status (T5a): hook/common/sort.hook.ts `useSortOption(key, options, onChange)` ; hook/common/filter.hook.ts `useFilterField(scope, field, paginationKey)` (resets page 1) ; common/filter/StatusFilterTabs.tsx (ViewSwitch + "All") ; common/table/{ProgressCell,TablePanel (title)}.tsx ; enums/ledger.enum.ts ledgerStatusFilter* / ledgerSortOptions / paymentSortOptions ; keys/table.keys.ts *SortKey ; ILedgerFilters.voucherStatus (transaction.services disbursementQuery `vouchers!inner`)
- Screens (T5a): pages/{Purchases,Expenses} tabs = components/disbursement/menus/VoucherStatusTabs ; pages/{Receivables,Payables} = components/ledger/{cards/LedgerSummaryCards, menus/{LedgerStatusTabs,CustomerLedgerButton}, tables/{LedgerRecordsTable,LedgerPaymentsTable}, modal/RecordPaymentModal} ; hooks disbursement.list / ledger.list / payment.list
- Screens (T5b): pages/Vouchers = components/voucher/{menus/VouchersStatusTabs, tables/VouchersTable} + hook/data/voucher/voucher.list.hook (paged, filter scope "vouchers", confirmDecision) ; pages/Branches = components/branch/tables/{BranchesTable,BranchMonitorTable} + branch.manage.hook (confirmArchive/confirmRestore) ; pages/Users = components/user/tables/UsersTable + user.manage.hook (confirmApproval/confirmRemove, displayName)
- Screens (T5c): Dashboard = components/dashboard/{DueAlertCards,SalesOverviewCard,CashFlowDonut,NotificationsFeed} + dashboard.hook (summary/sales/alerts error+retry) ; alert grouping utils/notification.utils.ts `notificationGroups` (types + notificationKindLabels/Paths in models/data/dashboard/dashboard.response.ts) ; common/card/InfoCard.tsx ("Recommended" card) + common/view/SectionHeading.tsx ; Reports = report/{Period,Expenses,CashFlow,Ledger}Report in TablePanel, IReportState (models/data/report/report.response.ts) ; Master data = components/master-data/tables/{SuppliersTable,ExpenseCategoriesTable} + supplier.manage / expense.category.manage hooks (formFields, confirm*) ; ledger By-party = ledger/{menus/LedgerViewTabs, views/LedgerRecordsSection} + hook/data/ledger/ledger.view.hook.ts (?view=records|parties, enums ledgerViewValues)
- Reference screen: components/transaction/tables/TransactionsTable.tsx + hook/data/transaction/transaction.list.hook.ts

## Done
- T0 tokens + font (v1.12): src/styles/common/theme.css (blue :root / navy .dark, intent tokens
  brand, brand-deep, brand-soft, brand-mist, on-brand, on-brand-muted, panel, track, info,
  info-soft, backdrop-*; --radius-panel, --shadow-panel; @utility bg-app replaces bg-auth-page +
  bg-error-page; bg-auth-hero/-submit now blue; scrollbar = track). Sweep: styles/{card,common/tone,
  dashboard,layout/{header,shell,sidebar,public},modal,status,table,print}. Font import in
  src/main.tsx; vite.config.ts globPatterns + woff2, manifest theme_color blue. Old tokens
  (ink*, on-ink*, lime*, lilac*, cloud, mist, border-subtle) deleted — grep returns nothing.
  CardTone/ChartTone keep the value name "ink" (model rename left to T5b Dashboard).
- T1 shell + title move (v1.13): ProtectedLayout = SidebarProvider(bg-app, flex-col) > ProtectedHeader
  top bar + shellBody row (ProtectedSider | SidebarInset content card). Sidebar container is
  repositioned by `shellSidebar` (top-24 bottom-4 left-4 = gutter + h-16 bar); SIDEBAR_WIDTH 14rem
  in components/ui/sidebar.tsx. Header: logo "T" + TARTAR, ProtectedBranchScope pill (AppButton
  ghost), ProtectedNotifications (bell + popover of dashboard/NotificationsFeed, mobile only via
  useProtectedHeaderHook.showNotifications), SyncIndicator (outlined round icon button, count badge,
  offline dot), ProtectedUserMenu (renamed from ProtectedSiderUser; name over role — IAuthUser has no
  email). Sidebar pins route group `pinnedRouteGroup = "System"` (utils/route.utils.ts) in the footer;
  Branch Monitoring stays in Monitoring. ProtectedFooter deleted. useProtectedTitleHook feeds
  ContentView's h1; ContentView gained `tabs` (title row, before `actions`); `meta` moved to the
  toolbar row's right side. NotificationsPanel now wraps NotificationsFeed; dueAlertCount in
  models/data/dashboard/dashboard.response.ts.
- T2 table + toolbar + pagination (v1.14): styles/table/table.styles.ts (plain divider rows,
  dataTableRowExpanded / dataTableRowStatic, overdue = bg-danger/5, cell cva lost `expanded`,
  tablePagination* + avatarCell*). DataTable row classes. TablePagination = outline round prev |
  centred circle pages via `pageItems()` (models/common/pagination.model.ts, gap-start/gap-end) |
  range + size select (md+) | round next. New common: table/AvatarCell.tsx (formatInitials in
  utils/format.utils.ts), filter/FilterPopover.tsx (Filters pill + Badge count + Reset),
  filter/SortSelect.tsx. FilterToolbar `sort` slot (before actions). LedgerFilterBar
  `layout="popover"` (stacked fields in FilterPopover, count = activeFilterCount in
  utils/filter.utils.ts; inline stays default). ViewSwitch = spaced pills (viewSwitchItem).
  Server sort: IPaginationRequest.sort, ISortOption (table.model), transactionSortOptions
  (enums/transaction.enum.ts), transactionSortKey (keys/table.keys.ts), hook sortKey /
  sortOptions / changeSort (resets to page 1, sort key in query key), service .order(sort)
  + created_at tie-break. Transactions: Filters popover + Sort by + "Recorded by" AvatarCell
  (name + role hint; Role column merged into it).
- T3 modals (v1.15): styles/modal/modal.styles.ts = crm2 frame (modalHeaderRuled, modalFooter
  rounded-b-panel bg-muted/50 + modalActionSize h-11 px-6, drawerHeaderRuled, drawerFooter pb-safe,
  confirmContent / confirmFooter, detailGrid + detailItem cva `wide`; modalFooterActions, detailList,
  detailRow deleted). AppModal always renders ruled header + footer (default outline "Close" when no
  `footer`); dialog + sheet = rounded-panel bg-panel. ConfirmationModal ruled footer. DetailModal =
  2-col label-over-value grid (IDetailItem.span > 1 = full row; CustomerInfoModal address span 2);
  sections not added (no consumer). theme.css: --overlay token (navy/20 light, /60 dark) ->
  `bg-overlay` in components/ui/{dialog,alert-dialog,sheet}.tsx; `@utility pb-safe`.

- T4 loading / error / lazy (v1.16): protected views lazy via routes/route.lazy.ts `lazyView`
  (own chunks; recharts only in the Dashboard chunk; public auth views kept eager — entry screen),
  HydrateFallback = common/view/PageSkeleton, per-view ErrorBoundary = common/status/RouteErrorView
  (chunk-load -> "A new version is available" Reload, 404 -> Back home, else Retry = navigate(0)),
  root ErrorBoundary = RootErrorView (full page). RouteProgress bar in ProtectedLayout
  (motion-safe animate-route-progress). ProtectedMenu preloads chunks on hover/focus. Client
  navigation keeps the old page + progress bar (no skeleton flash). useQuery -> isInitialLoading /
  isRefreshing. DataTable: error row (ErrorState) + onRetry, refreshing dims tbody + header
  spinner, skeleton cells follow column align / `skeleton: "avatar"`. StatCard/SectionCard
  error + onRetry, SectionCard loading skeleton. EmptyState icon + action. Transactions wired.

- T5a transaction family + ledger (v1.17): user approved switching Receivables/Payables to the
  migrated ledger set (LedgerManager + ledger.manage.hook + ledgerSettleModalKey deleted;
  PaymentsPanel kept for CustomerLedgerView). Title-row pills: Purchases/Expenses = voucher status
  (All/Pending/Approved/Rejected, server filter via vouchers!inner, stripped from summary);
  Receivables/Payables = All/Unpaid/Overdue/Paid (filters.status, scope "ledger"). Status no longer
  counts in the Filters badge. Filters popover + Sort by on Purchases, Expenses, ledger records,
  payments (server .order + created_at tie-break). AvatarCell: Recorded by (disbursements), party
  (ledger, payments). ProgressCell = ledger "Paid" column. Overdue row tint on ledger records.
  Loading/refreshing/error/retry + summary error wired on all four screens. Transactions hook now
  uses useSortOption.

- T5b Vouchers + Branches + Users (v1.18): user split the old T5b into T5b/T5c/T5d.
  voucher.services.getList paged (IPaginationResponse, applyLedgerFilters on created_at/amount/
  payee, voucherStatus eq, sort + created_at tie-break); no getAll (the hook was the only
  consumer). voucherSortOptions (enums/voucher.enum.ts), voucherSortKey + voucherExpansionKey
  (keys/table.keys.ts), filter scope "vouchers" (filter.model + filter.store). Vouchers: status
  pills in title row, Filters popover (search payee + dates; LedgerFilterBar `showReference`),
  Sort by, pagination, RowActionMenu (approve/reject behind useConfirm — user-approved, print),
  check details + category + decided-at in the expanded row. Branches: two titled TablePanels,
  AvatarCell, voucher prefix column, RowActionMenu (restore now confirms). Users: AvatarCell
  (name + @username), approve/reject moved into RowActionMenu behind useConfirm, stays unpaged
  (lookup list). FilterToolbar children optional. TableDecor ColumnLabel + columnLabel/columnIcon
  styles deleted; RowIcon no longer exported.

- T5c Dashboard + Reports + Master data (v1.19): CardTone + SectionCard `tone` deleted (all cards
  white); ChartTone renamed brand/sky/violet/positive/warning/negative (chart-1..6). Dashboard:
  DueAlertCards (SectionHeading + up to 4 InfoCards, overdue first, open-ledger button;
  loading/error/empty) above the stats, NotificationsPanel deleted, cash-flow card white (donut
  text = foreground), error/retry on every tile + sales + cash flow. Reports: type pills in the
  title row, tables in titled TablePanel, loading/refreshing/error/retry. Master data: pills in the
  title row; Panels -> tables (AvatarCell, RowActionMenu; category restore now confirms; supplier
  contact person merged into the avatar hint). Receivables/Payables: "Records | By customer/
  supplier" pills in the toolbar row; status pills hide in the party view (party totals ignore
  status). TableDecor kept — PaymentsPanel + CustomerLedgerModal still use NameCell/RowActions.

## Next
1. **T5d Auth + Error pages** — backdrop gradient, blue submit, retire bg-auth-hero/-submit
   lime/lilac remnants in theme.css + styles/layout/public.styles.ts.
2. **T6 docs** — CLAUDE.md Styling bullets + tartar-shadcn token contract + build style map
   updated to the new token names, new primitives, lazy routes and state rules (CardTone is gone from the view vocabulary; InfoCard,
   SectionHeading added); delete this file.

## Open
- vouchers!inner filter is untested against the live DB — confirm the Purchases/Expenses pills.
- Vouchers paging/filters untested against the live DB — confirm pills, search and sort.
- PaymentsPanel (CustomerLedgerView) still uses NameCell/RowActions — convert when touched.

## State
Branch: development-overhaul · Uncommitted: yes (T5c, suggest v1.19) · Last check: yarn build + yarn lint clean
