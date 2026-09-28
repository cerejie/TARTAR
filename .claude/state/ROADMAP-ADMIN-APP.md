# ROADMAP — Admin mobile app (`/admin`)
Updated: 2026-09-28 · Status: IN PROGRESS — A1, M1, M2 done, A2 next

## Goal
A separate, admin-only route domain at `/admin` that looks and feels like a modern native mobile
app — bottom tab bar, segmented tabs, card lists, bottom sheets, smooth transitions — and stays
fully responsive on tablet and desktop. Exactly four tabs:

| Tab | Path | Icon (lucide) | Content |
|---|---|---|---|
| Home | `/admin` | `House` | Overview: Sales, Expenses, Receivables, Payables — All time / Daily / Weekly / Monthly |
| Payables | `/admin/payables` | `HandCoins` | Due checks + near-due / overdue payables |
| Receivables | `/admin/receivables` | `Wallet` | Due reminders — overdue / today / this week |
| Notifications | `/admin/notifications` | `Bell` | Grouped feed with unread badge |

Pattern source for the domain split: PauseCoffee `src/routes/app.routes.tsx` (`/admin` subtree
with its own guard + layout) and `admin.view.routes.tsx` (one `IRoute[]` feeding router, sider
and mobile tab bar).

## Session protocol
Same as ROADMAP.md: one phase per conversation, `build` + `tartar-shadcn` loaded (+ `shadcn`
docs, React Aria tab), `yarn build` + `yarn lint` clean, tick Done with paths, suggest commit,
stop. No migrations in this roadmap — read-only over existing tables.

## Decisions locked
- D1 (user) Domain `/admin/*`, its own layout, AND its own installable PWA identity — a second
  web manifest scoped to `/admin/` with its own name + icon.
- D2 (user) Home AR/AP under a period: big number = outstanding balance now; sub-line = amount
  newly created in the selected period. Sales / Expenses = totals within the period.
  "All time" = everything; the sub-line is hidden.
- D3 (user) Notifications are derived from due alerts (+ due checks), read/unread kept per device
  in a persisted zustand store. No notifications table.
- D4 "Admin" = `permissions.isManager` (admin + superadmin), gated by `can: "viewDashboard"` +
  `permissionLoader("viewDashboard", "/")`. Accountant/employee are redirected to `/`.
- D5 Branch scope: the admin app reuses the existing branch scope store; the top app bar holds a
  compact branch picker (bottom sheet on phone). All four tabs respect it.
- D6 Read-only app. No create/edit forms in `/admin`; a row's "Open in TARTAR" deep-links to the
  full desktop screen. No `runWrite` needed.
- D7 Breakpoints (Tailwind defaults):
  - phone `< md` — sticky top app bar, bottom tab bar (safe-area `pb-safe`), single column.
  - tablet `md–lg` — bottom tab bar kept, content 2 columns (tiles 2×2 → 4×1, lists 2-up).
  - desktop `≥ lg` — bottom bar becomes a left nav rail (icon + label), content centered at a
    max width, lists 2–3 columns, bottom sheets become side sheets/dialogs.
- D8 Same tokens as TARTAR (`theme.css`), light + dark. Any new colour is a new token.
- D9 (user) The normal app (`/`, ProtectedLayout) must be fully usable on phones too, not only
  tablet/desktop — and its phone UI stays distinct from the admin app (no bottom tab bar).
  Phone nav = hamburger in `ProtectedHeader` + sidebar as off-canvas sheet below `md`
  (shadcn sidebar `offcanvas` on mobile; today it is `collapsible="none"` always, which
  squeezes content). Phone tables = stacked row cards below `md`, not horizontal scroll.
  Order: M1 → M2 before A2.

## Phases

### A1 — Domain shell + routes
- `+ routes/admin.routes.ts` (root: `RouteRoot` → guard loader → `AdminAppLayout`),
  `+ routes/admin.view.routes.ts` (the four `IRoute` entries above, `lazyView`, `group: "Admin"`).
- `~ hook/account/account.me.hook.ts` — append the admin tree to `layoutRoutes`, before the
  not-found route. Unauthenticated `/admin` → login, then back to `/admin`.
- `+ layouts/AdminAppLayout.tsx` — top app bar (title from route label, branch picker, avatar
  menu), `<Outlet/>`, `AdminTabBar` (bottom / rail per D7), `RouteProgress`.
- `+ components/common/layout/AdminTabBar.tsx` — reads `adminViewRoutes`, active pill
  indicator, badge slot (filled in A7), hover/focus preload like `ProtectedMenu`.
- `+ styles/admin/admin.layout.styles.ts` — shell, app bar, tab bar, rail, content column.
- `~ ProtectedUserMenu` — "Open admin app" entry for managers; admin app avatar menu has
  "Open full TARTAR" back.
- Tab-switch transition: CSS view transition / fade-slide via tokens, `prefers-reduced-motion`
  respected. Keep each tab's scroll position.

### M1 — Normal app phone layout + navigation (before A2)
- `~ components/common/layout/ProtectedSider.tsx` — `collapsible="none"` at `md+`, off-canvas
  sheet below `md` (sidebar's built-in mobile `Sheet` via `useSidebar().isMobile`/`openMobile`);
  close on navigate.
- `~ ProtectedHeader.tsx` — menu button (`SidebarTrigger`-equivalent, `size="icon"` +
  `aria-label`) shown below `md` only (conditional render, not CSS hide).
- `~ styles/layout/{shell,header,sidebar}.styles.ts` — phone paddings/gaps, header fits 390px
  (logo, branch scope, bell, avatar), `shellInset` full width.
- `~ styles/view/view.styles.ts` + `ContentView` — title row / tabs / actions / toolbar wrap
  cleanly at 390px (status pills scroll horizontally, primary action stays visible).
- Verify at 390 / 768 / 1280, light + dark.

### M2 — Normal app phone tables, filters, cards
- `~ models/common/table.model.ts` — column `mobile` role (`title` | `subtitle` | `amount` |
  `status` | `meta` | `hidden`); default = `meta`.
- `~ components/common/table/DataTable.tsx` — below `md` render rows as stacked cards from those
  roles (row action menu kept, `onAction` / overdue tint kept), all four states, pagination kept.
  One mobile layout in the primitive; features only tag columns.
- `~` feature tables (Transactions first, then the rest) — tag columns with `mobile` roles.
- `~ FilterToolbar` / `FilterPopover` / `SortSelect` — full-width popover → bottom sheet on phone.
- `BentoGrid` / `StatCard` — 1 column on phone, 2 on tablet (check spans).

### A2 — Own PWA identity
- `+ public/admin.webmanifest` (name "TARTAR Admin", short_name "TARTAR Admin", `scope`
  `/admin/`, `start_url` `/admin`, `display: standalone`, icons) + `+ public/admin-icon-*.png`,
  `admin-icon.svg`, `apple-touch-icon-admin.png`. Icon assets: user supplies, or generate a
  brand-blue "A" mark SVG and rasterise.
- `+ hook/layout/admin.manifest.hook.ts` — while under `/admin`, swap `<link rel="manifest">`,
  `apple-touch-icon`, `theme-color` meta and `document.title`; restore on leave.
- `~ vite.config.ts` — workbox `navigateFallback` covers `/admin/*`; include the new icons.
- Risk: iOS reads the manifest at "Add to Home Screen" time only — verify on `/admin` directly.

### A3 — Mobile primitives (`components/common/app/`, `styles/app/app.styles.ts`)
- `SegmentedTabs` — React Aria `ToggleButtonGroup`/`Tabs` from `components/ui`, sliding thumb,
  full-width on phone, auto width on desktop. State via a store, not local.
- `MetricTile` — label, big money value, delta/sub-line, icon chip, tap target → tab.
- `ListCard` / `ListSection` — sticky date-group header, row card (avatar initials, name, meta,
  amount right, days-badge), all four states (skeleton / refreshing / error / empty).
- `AppSheet` — `ui/sheet` or `ui/drawer`: bottom sheet on phone, side sheet on `lg`.
- `store/common/segment.store.ts` + `hook/common/segment.hook.ts` — per-key segment value
  (keys in `keys/segment.keys.ts` or `keys/storage.keys.ts`).

### A4 — Home tab
- `SegmentedTabs`: All time · Daily · Weekly · Monthly (new `overviewPeriodValues` enum —
  do not overload `salesPeriodValues`, whose meaning is chart granularity).
- `~ services/data/dashboard.services.ts` `getOverview(period, branch)` → sales, expenses,
  arOutstanding, arNew, apOutstanding, apNew. Reuse `getSummary` queries where they match.
- `+ hook/data/admin/admin.home.hook.ts`, `+ components/admin/home/*` — 2×2 tile grid (4×1 on
  desktop), "Needs attention" strip (overdue AR/AP + checks due this week → deep links),
  compact sales sparkline via `components/common/chart/`.

### A5 — Payables tab
- Segments: Due checks · Near due · Overdue (counts in the segment labels).
- Due checks = vouchers with a `check_due_date` inside the horizon (read voucher model/status
  values first; if "cleared/cancelled" semantics are unclear, ASK before filtering).
- `~ dashboard.services.ts` `getDueChecks(nearDays, branch)`; near-due/overdue reuse
  `getDueAlerts`. `+ hook/data/admin/admin.payables.hook.ts`, `+ components/admin/payables/*`.
- Row tap → `AppSheet` detail (supplier, amount, due, check bank/no., voucher no., "Open in
  TARTAR").

### A6 — Receivables tab
- Segments: Overdue · Due today · This week. Reuse `getDueAlerts`.
- `+ hook/data/admin/admin.receivables.hook.ts`, `+ components/admin/receivables/*`.
- Row: customer, balance, "3 days overdue" / "due in 2 days" chip; sheet detail with contact
  (tap-to-call `tel:` if the customer has a phone) + "Open in TARTAR".

### A7 — Notifications tab
- Feed from `utils/notification.utils.ts` `notificationGroups` + due checks; segments
  All · Unread.
- `+ store/data/admin/notification.read.store.ts` (zustand `persist`, key in
  `keys/storage.keys.ts`), id = kind + row id + due date so a re-dated item is unread again.
- Unread count → `AdminTabBar` badge; "Mark all read"; swipe-free (tap marks read).

### A8 — Verify + close
- Harness capture at 390 / 768 / 1280 widths, light + dark, all four states per tab; install
  prompt shows the admin manifest. Non-manager redirected. Close: merge follow-ups into
  ROADMAP.md, delete this file.

## Done
- [x] A0 — PauseCoffee domain pattern read, data sources mapped, D1–D3 locked (2026-09-28).
- [x] A1 — shell + routes (2026-09-28): `routes/admin.routes.ts` (guard loader on `admin_route`),
  `routes/admin.view.routes.ts`, `layouts/AdminAppLayout.tsx`,
  `components/common/layout/{AdminAppBar,AdminTabBar}.tsx`, `hook/layout/admin.hook.ts`
  (layout/tab bar/title + per-path scroll restore), `store/common/scroll.store.ts`,
  `styles/admin/admin.layout.styles.ts`, placeholder `pages/Admin/Admin{Home,Payables,
  Receivables,Notifications}View.tsx` (EmptyState — replaced in A4–A7).
  `utils/route.utils.ts` + `adminBasePath` / `isAdminPath`; public `/admin/*` → LoginView and
  login returns to `/admin`; `ProtectedUserMenu` app-switch item (via `useProtectedUserHook`).
  Deferred: tab-bar badge slot → A7; bottom-sheet branch picker → A3 (`AppSheet`); A1 reuses
  `ProtectedBranchScope` popover.
- [x] M1 — phone nav (2026-09-28): `hook/layout/protected.hook.ts` (`useProtectedSiderHook` →
  `collapsible` none/offcanvas via `useSidebar().isMobile`; menu `closeMobileMenu` on press;
  header `showMenuButton`/`toggleMenu`), `ProtectedSider`, `ProtectedMenu`, `ProtectedHeader`
  (lucide `Menu` icon button below `md`), `styles/layout/header.styles.ts` (`headerMenuButton`),
  `ContentView` + `styles/view/view.styles.ts` (`viewTabs` horizontal scroller, head actions
  full width on phone only when tabs present, divider hidden on phone, pills `shrink-0`).
  Visual check at 390/768/1280 still pending (user).
- [x] M2 — phone tables/filters (2026-09-28): `IColumnMobileRole` + `mobile` on
  `IDataTableColumn` (title/subtitle/amount/status/meta/actions/hidden; untagged = first column
  title, `key: "actions"` actions, rest meta). `common/table/DataTableCards.tsx` (below `md`
  via `useIsMobile`; skeleton/refreshing/error/empty, stretched-press title for `onRowClick`,
  selection checkbox, "Details" toggle → `RowDetailPanel`, `rowClassName` tint),
  `common/table/TableEmptyState.tsx` (shared with `DataTable`), `dataCard*` in
  `styles/table/table.styles.ts`. `FilterPopover` → bottom `Sheet` on phone (Reset + Show
  results, `filterSheetFooter`). 19 feature tables tagged. Bento/StatCard already 1-col phone /
  2-col tablet — no change. Phone loses header click-sort (SortSelect remains).
  Visual check at 390/768/1280 pending (user).

## Next
1. A2: own PWA identity.

## State
Branch: development-overhaul · Uncommitted: this file (+ ROADMAP-SALES-VOUCHER.md, pre-existing)
· A1, M1 committed (v1.39); M2 uncommitted (plus unrelated pre-existing sale/* WIP). Reusable today: `dashboardServices.getSummary` / `getDueAlerts`,
`notificationGroups`, `derivePermissions().isManager`, `permissionLoader`, `lazyView`.
