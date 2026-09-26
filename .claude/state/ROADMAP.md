# ROADMAP — "Airy blue" redesign (EduMate mockup) on shadcn + Tailwind
Updated: 2026-09-26

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
- Table: src/components/common/table/{DataTable (339 lines, skeleton at :231),TablePagination,TablePanel,RowActionMenu,RowDetailPanel,TableDecor}.tsx ; styles/table/table.styles.ts ; models/common/table.model.ts
- Filters: src/components/common/filter/{FilterToolbar,LedgerFilterBar,FilterSelect,DateRangeFilter,SearchInput}.tsx ; styles/filter/filter.styles.ts ; store/common/{filter,sort}.store.ts
- Modals: src/components/common/modal/{AppModal (isMobile -> Sheet at :53),ConfirmationModal,DetailModal}.tsx ; components/common/form/EntityFormModal.tsx ; styles/modal/modal.styles.ts
- crm2 modal reference: D:/EJIE BUSINESS/EJIE WORK DCWD/dcwd_apps-crm-customer2/src/components/common/modal/AppModal.tsx + src/styles/modal/{modal,confirmation,detail}.styles.ts (modalHeaderRuled, modalFooter `-mx-6 -mb-6 rounded-b-2xl border-t bg-muted/50 px-6 py-4`, modalActionSize h-11 px-6, drawerFooter pb-safe, detailSections/detailGrid)
- Cards / status: components/common/card/{SectionCard,StatCard}.tsx, components/common/status/{StatusTag,EmptyState,ProgressRow,SyncIndicator}.tsx ; styles/{card,stat,status}/*.styles.ts
- Routes (all views imported eagerly today, no errorElement): src/routes/protected.view.routes.ts, protected.routes.ts, public*.routes.ts
- Query state (has `error`, no retry surfaced in UI): src/store/common/query.store.ts, src/hook/common/query.hook.ts
- Public pages: styles/layout/public.styles.ts, components/auth/*, pages/Error/ErrorView.tsx ; theme.css @utility bg-auth-* / bg-error-page
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

## Next
1. **T2 table + toolbar + pagination** — DataTable restyle per spec (drop border-separate row
   cards, divider rows, tint states, expanded row as soft inset). New common cells only where a
   screen uses them now: `AvatarCell` (person/recorded-by), `ProgressCell` (ledger paid/total).
   TablePagination -> circle prev | centred circle pages with ellipsis | circle next (keep the
   page-size select, compact, beside next). FilterToolbar -> "Filters" popover (active-count
   badge, Reset) + right-side sort select; ViewSwitch -> segmented pills. Apply on Transactions.
2. **T3 modals** — port crm2 AppModal header/body/footer rules and mobile sheet (pb-safe);
   rounded-panel dialog, overlay navy/20. ConfirmationModal gets the same ruled footer +
   h-11 actions; DetailModal -> crm2 sections + 2-col grid; EntityFormModal submit/cancel in
   the ruled footer. Check every modal renders header + footer.
3. **T4 loading / error / lazy** — routes use react-router `lazy` for every view (pages become
   separate chunks; recharts only loads with Dashboard/Reports) + `HydrateFallback`/pending
   `PageSkeleton` inside the content card + thin blue top progress bar on
   `useNavigation().state`; prefetch a route chunk on menu hover/focus. `errorElement` ->
   `RouteErrorView` in the content card (chunk-load failure = "A new version is available —
   Reload", 404, generic with Retry). Query layer: hook returns `error` + `refetch`, and
   `isInitialLoading` (loading && no data) vs `isRefreshing`. DataTable `error` + `onRetry`
   state row (ui Alert/Empty); refresh keeps rows, dims them, shows a header spinner;
   skeleton rows mirror column shapes (circle for avatar cells). StatCard / SectionCard / chart
   skeleton + error states. EmptyState: icon + sentence + optional action. Respect
   prefers-reduced-motion.
4. **T5a screen sweep — transaction family + ledger** — Purchases, Expenses, Receivables,
   Payables (LedgerManager), Payments: status pills in the title row, Filters popover,
   AvatarCell/ProgressCell where the data fits, error/empty states wired.
5. **T5b screen sweep — the rest** — Vouchers, Branches, Users, Master data, Dashboard (bento
   white cards, blue charts, the "Recommended" card style for list cards), Reports, Auth +
   Error pages (backdrop gradient, blue submit, retire bg-auth-* lime/lilac utilities).
6. **T6 docs** — CLAUDE.md Styling bullets + tartar-shadcn token contract + build style map
   updated to the new token names, new primitives, lazy routes and state rules; delete this file.

## Open
- "Sort by" select: server-paged tables sort only the current page today. Confirm in T2 whether
  sorting should move server-side (service `order` param) or the select is left out.

## State
Branch: development-overhaul · Uncommitted: yes (T1, suggest v1.13) · Last check: yarn build + yarn lint clean
