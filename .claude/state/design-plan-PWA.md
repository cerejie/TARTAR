# TARTAR BMS — Full Design Inventory (Web + PWA)

Snapshot of the design as it exists in the code on 2026-10-03, written so a reviewer who cannot see
the repo can suggest improvements. Every value below is copied from the source, not paraphrased.
Section 16 lists the weak spots already known; section 17 lists the constraints any suggestion
has to respect.

---

## 1. Product context

- **What it is:** TARTAR BMS, a bookkeeping and operations web app for one company with several
  branches (business units). It covers transactions, sales (with deposit/verification), purchases,
  expenses, vouchers (check/cash approval), receivables, payables, reports, branch monitoring,
  master data and users.
- **Users and roles:** `superadmin` (Super Administrator), `admin`, `accountant`, `employee`, plus
  an internal `developer` authority. Menu items and pages are gated per permission.
- **Two installable apps from one codebase:**
  1. **Main app**: `/`, the full system, manifest name "TARTAR Business Management System",
     short name "TARTAR". Used on desktop and phones.
  2. **Admin app**: `/admin`, a slim mobile-first manager app, manifest "TARTAR Admin", with its own
     icons and its own manifest that is swapped in at runtime. It has 4 tabs: Home, Payables,
     Receivables and Notifications.
- **Branch scope:** a global branch selector in the top bar scopes every query. Branch is never a
  per-page filter.
- **Stack:** React 19, TypeScript (strict), Vite 5, Tailwind CSS v4, shadcn/ui on the **`aria-vega`**
  style (React Aria Components primitives, not Radix), lucide-react icons, recharts 3.8, sonner
  toasts, Zustand (the only state mechanism; no `useState`), react-hook-form + zod, Supabase,
  vite-plugin-pwa (injectManifest + Workbox), dayjs.
- **Font:** Plus Jakarta Sans Variable (self-hosted via @fontsource) for both body and headings.

---

## 2. Design tokens (`src/styles/common/theme.css`)

All colour lives in this one file. Components use only semantic utilities (`bg-panel`,
`text-brand`, and so on). Hex values anywhere else count as defects, except the print palette.

### 2.1 Colour: light mode ("airy blue")

| Token | Value | Use |
|---|---|---|
| `--background` | `#ffffff` | body |
| `--foreground` | `#1b1f2a` | main text |
| `--card` / `--popover` / `--panel` | `#ffffff` | surfaces |
| `--primary` / `--brand` / `--ring` | `#0b6bf5` | brand blue, primary buttons, focus ring |
| `--brand-deep` | `#0957c9` | hover/pressed brand, scrollbar hover |
| `--brand-soft` | `#e8f0fe` | soft brand chip/badge fill, selected list row |
| `--brand-mist` | `#f4f8ff` | selected/focused table row |
| `--on-brand` | `#ffffff` | text on brand |
| `--on-brand-muted` | `rgba(255,255,255,.74)` | secondary text on brand hero |
| `--secondary` / `--muted` | `#f3f5f9` | muted fills, pills, footers |
| `--muted-foreground` | `#6b7280` | labels, hints |
| `--accent` | `#e8f0fe` | hover fill |
| `--border` | `#eceef3` | hairlines |
| `--input` | `#e3e6ee` | input borders |
| `--destructive` | `#dc2626` | destructive buttons |
| `--danger` / `--danger-bg` / `--danger-border` | `#dc2626` / `#fef2f2` / `#fecaca` | negative money, overdue rows, delete chips |
| `--info` / `--info-soft` | `#7c3aed` / `#efe9fe` | violet accent chips |
| `--track` | `#e5e7eb` | progress tracks, grab handles |
| `--positive` (static) | `#16a34a` (`--positive-bright` `#22c55e`) | money in, success |
| `--warning` (static) | `#d97706` | pending, near-due |
| `--overlay` | `rgba(15,23,42,.2)` | modal scrim |
| `--backdrop` | `#eef2fb` | app background base |
| `--backdrop-periwinkle` / `-blush` / `-sky` | `#dfe6fb` / `#f4e3f3` / `#d9e8f8` | pastel radial blobs |
| `--sidebar-*` | white, brand primary, `#f3f5f9` accent | sidebar |
| Charts `--chart-1..6` | `#0b6bf5`, `#38bdf8`, `#8b5cf6`, `#16a34a`, `#f59e0b`, `#ef4444` | brand, sky, violet, positive, warning, negative |

### 2.2 Colour: dark mode ("navy"), via the `.dark` class on `<html>`

`--background #0b1220`, `--card/--panel/--popover #111a2e`, `--foreground #e6eaf2`,
`--primary/--brand/--ring #3d8bff`, `--brand-deep #2f74e0`, `--brand-soft rgba(61,139,255,.16)`,
`--brand-mist rgba(61,139,255,.08)`, `--muted/--secondary #1a2540`, `--muted-foreground #94a0b8`,
`--accent #1e2b4a`, `--border rgba(148,163,184,.16)`, `--input rgba(148,163,184,.22)`,
`--track #24304a`, `--info #a78bfa`, `--danger #f87171`, `--danger-bg rgba(248,113,113,.14)`,
backdrop `#0b1220` with blobs `#13203d` / `#1f1733` / `#0e1f36`, `--overlay rgba(2,6,23,.6)`.
Dark mode overrides only `--chart-1`; charts 2–6 keep their light values. `positive`, `warning`
and `destructive` have no dark variant.

Theme mode lives in `store/common/theme.store.ts` (light/dark toggle in the user menu). The
`<meta name="theme-color">` is kept in sync with the active token: `--backdrop` in the main app,
`--panel` in the admin app.

### 2.3 Typography

- Family: Plus Jakarta Sans Variable for `--font-sans` and `--font-heading` (system fallback stack).
- Headings h1–h5: weight 600, letter-spacing `-0.02em`.
- Page title (h1): `text-2xl`, `md:text-[1.625rem]`, semibold, tight tracking. Admin page title is
  `text-2xl`, `md:text-3xl`.
- Section/card titles: `text-base` or `text-lg`, semibold, heading font.
- Table header: `text-[0.8125rem]` (13px), medium, muted. Table cell: `text-sm`.
- Labels and hints: `text-xs` muted. Sidebar group label: `text-[11px]`, uppercase, `tracking-wide`.
- Numbers: `tabular-nums` everywhere money appears. Stat values scale with container queries
  (base → lg → xl → 2xl as the tile widens).
- Auth: title `26px`; hero title `clamp(28px, 2.6vw, 36px)`; wordmark letter-spacing `0.18em`.

### 2.4 Radius, shadow, spacing, motion

- `--radius` `0.75rem` (sm = −4px, md = −2px, lg = base, xl = +4px).
- `--radius-panel` `1.25rem`, used by every floating surface (top bar, sidebar, content card,
  modals, sheets, list sections). `--radius-pill` `999px`.
- Shadows: `--shadow-panel` `0 1px 2px rgba(15,23,42,.03), 0 8px 24px rgba(15,23,42,.05)`;
  `--shadow-raised` `0 8px 30px rgba(15,23,42,.12)` (tile hover); `--shadow-pop`
  `0 12px 40px rgba(15,23,42,.16)` (floating action button).
- No backdrop blur anywhere.
- Spacing rhythm: page sections `gap-5`, body blocks `gap-4`, bento `gap-3` (phone) / `gap-4` (md+),
  toolbar `gap-2`, form grid `gap-4`, form sections `gap-6`.
- Motion: route progress bar `1.1s` loop; row-focus pulse `0.9s × 3` (brand-mist ↔ 22% brand);
  view transitions `180ms`; sheets and row expansion use `tw-animate-css` fade/slide (`200ms`);
  segmented-tab thumb slides `200ms`. Everything respects `prefers-reduced-motion`.

### 2.5 Custom utilities

- `bg-app`: three large pastel radial gradients (periwinkle top-left, blush right, sky
  bottom-left) over `--backdrop`. This is the backdrop behind the floating panels.
- `bg-auth-hero`: brand → brand-deep 160° gradient with violet and sky radial glows (login hero).
- `pt-safe`, `pb-safe` (`max(1rem, safe-area-bottom)`), `p-safe-N`: safe-area-aware padding.
- Scrollbars: 8px, transparent track, brand-blue pill thumb (brand-deep on hover), with the track
  inset by the panel radius so the bar never touches rounded corners.
- **Touch targets:** under `pointer: coarse`, buttons, inputs, select triggers and combobox chips
  get `min-height: 2.75rem` (44px). Icon buttons get 44×44. `xs` and `icon-sm` buttons get an
  invisible 44px hit area through `::after`.
- `--keyboard-inset`: a CSS variable set from `visualViewport` so bottom sheets ride above the
  on-screen keyboard. The viewport meta also sets `interactive-widget=resizes-content`.
- Tap highlight is disabled.

### 2.6 Semantic tones (`styles/common/tone.styles.ts`)

Tones: `default | brand | positive | negative | warning | accent | info`.

- `toneText`: only positive (green), negative (red) and warning (amber) colour the text. brand,
  accent and info stay the foreground colour, so values read neutral.
- `toneChip`: soft fills. brand → `bg-brand-soft text-brand`; positive → `bg-positive/10`;
  negative → `bg-danger-bg text-danger`; warning → `bg-warning/10`; accent and info → violet soft.
- `toneFill`: solid dots and bars.
- `StatusTag` colours `default | positive | negative | warning | info | brand`: an outlined soft
  pill with a 30%-alpha border.
- Rule: money keeps its green/red meaning. Status chips are soft fills. Cards have no tone and are
  always white (or panel in dark mode).

### 2.7 Iconography

lucide-react only. Default sizes are 16px in controls, 20px in navigation and in the floating
action button, and 14px in sort and section icons. Active tab icons are filled
(`[&_svg]:fill-current`).

---

## 3. Breakpoints and device classes

| Range | Name | Shell | Data tables | Dialogs / pickers |
|---|---|---|---|---|
| `< 768px` | **Phone** | `PhoneShell`: compact AppBar + sidebar as an off-canvas drawer | Card list + infinite "load more" | Bottom sheets |
| `768–1023px` | **Tablet** | Desktop shell (header + floating content card), sidebar off-canvas behind a toggle | Card list | Bottom sheets |
| `1024–1279px` | **Desktop** | Header + fixed sidebar + content card | Real table + numbered pagination | Centred dialogs, popovers; `AppSheet` slides in from the right |
| `≥1280px` (`xl`) | Wide | same | Columns marked `collapse: "xl"` appear | same |
| `≥1440px` | — | same | Cell padding grows `px-3` → `px-4` | same |
| `≥1536px` (`2xl`) | Extra wide | same | Columns marked `collapse: "2xl"` appear | same |

Two hooks decide this. `useIsTabletUp` (`min-width: 48rem`) picks the phone shell, the floating
action button and the compact title. `useIsMobile` (`< 1024px`, the shadcn hook) picks cards and
sheets. The two disagree in the tablet range: tablets get the desktop chrome with phone data
components. `sidebarMenuButton` also shrinks from `h-11` to `h-9` when the viewport is
≤ 860px tall.

---

## 4. Application shells and layouts

### 4.1 Desktop shell (main app, ≥768px): `layouts/ProtectedLayout.tsx`

Three floating panels on the pastel `bg-app` backdrop. Each panel is
`rounded-panel border bg-panel shadow-panel`.

```
┌──────────────────────────────────────────────────────────────────────┐ bg-app, p-4, gap-4, h-dvh
│ [≡] [T] TARTAR   ( Branch scope pill ▾ )        [🔔] [☁] │ [A Name ▾]│ Header h-16
└──────────────────────────────────────────────────────────────────────┘
┌──────────────┐ ┌─────────────────────────────────────────────────────┐
│ MAIN         │ │ Page Title            [tabs pills] │ [+ Primary]    │
│ ▣ Dashboard  │ │ [⚙ Filters ▾ (2)]                    Sort by [ ▾ ] │
│ OPERATIONS   │ │ ┌ StatCard ┐┌ StatCard ┐┌ StatCard ┐┌ StatCard ┐     │
│ ▣ Transactions│ │ └──────────┘└──────────┘└──────────┘└──────────┘    │
│ ▣ Sales  ... │ │ ─────────────── DataTable rows ────────────────     │
│ ACCOUNTING   │ │ Showing 1–8 of 120      ‹ 1 2 3 … 15 ›   [8 ▾]      │
│ MONITORING   │ │                                                     │
│ SYSTEM       │ │  (content card scrolls; scrollbar-gutter: stable)   │
│──────────────│ │                                                     │
│ pinned group │ │                                                     │
└──────────────┘ └─────────────────────────────────────────────────────┘
```

- **Header (`ProtectedHeader`)**, `h-16`. Contents: sidebar toggle (only below 1024px); the logo
  mark (36px brand square with a bold "T") and the "TARTAR" wordmark; the **branch scope** trigger
  (pill, `bg-muted`, `w-72` on lg, opens a searchable popover list with check marks);
  **InboxBell** (popover, `w-[min(22rem,100vw-2rem)]`, `max-h-70dvh`, sticky header); the
  **SyncIndicator** (outline icon button with a count badge and an amber offline dot); a vertical
  divider; and the **user menu** (avatar with an online dot, name and role, opening a dropdown with
  Account settings, a theme toggle, "Open admin app" for managers, and Sign out).
- **Sidebar (`ProtectedSider`)**: shadcn `Sidebar` (`collapsible="none"` on desktop,
  `"offcanvas"` below 1024px). Groups come from route data: **Main** (Dashboard), **Operations**
  (Transactions, Sales, Purchases, Expenses, Vouchers), **Accounting** (Receivables, Payables),
  **Monitoring** (Reports, Branch Monitoring), **System** (Master Data, Users). One group is
  "pinned" and renders in the sidebar footer. Menu button: `h-11 rounded-xl`, 20px icons, muted
  text. The active item is a **solid brand fill with white text**. Group labels are 11px uppercase.
  Hovering or focusing an item preloads its lazy chunk.
- **Content card (`SidebarInset`)**: scrolls internally (`overflow-y-auto`,
  `scrollbar-gutter: stable`) with `px-6 py-2` inner padding. A 2px **RouteProgress** bar runs
  across the top of the viewport during navigation.

### 4.2 Phone shell (main app, <768px): `components/common/layout/PhoneShell.tsx`

```
┌──────────────────────────────┐ AppBar h-14 + safe-top, bg-panel, full-bleed
│ [≡]  ( Branch ▾ )   [☁] [🔔] │ after 44px of scroll: branch pill shrinks to an icon,
└──────────────────────────────┘ centred page title fades in, bottom border + shadow appear
│  ↓ pull-to-refresh badge      │
│  Page Title                   │ px-4 pt-4 pb-6 (pb-24 when a FAB exists)
│  [All][Pending][Verified]…    │ status pills scroll horizontally
│  [⚙] [⇅]            (FAB→)    │ filter + sort collapse to round 40px icon buttons
│  ┌ Stat ┐┌ Stat ┐              │ stat tiles go 2-up
│  ┌──────── data card ───────┐ │
│  │ Title          ₱1,200.00 │ │
│  │ subtitle                 │ │
│  │ Label  Value  Label Value│ │
│  │ [Status chip]        [›] │ │
│  └──────────────────────────┘ │
│        … load more …          │
└──────────────────────────────┘
                      ( + Record ) FAB: pill h-14, bottom-right, safe-area aware,
                                   collapses to a 56px circle after 120px of scroll
```

- There is **no bottom tab bar in the main app**. Navigation is the sidebar as a full off-canvas
  drawer that includes the account items (profile, theme, app switch, sign out). This is a locked
  decision.
- The AppBar has `view-transition-name: app-bar`, so it stays put across route transitions.
- The bell opens `PhoneAlertsSheet` (a bottom sheet: "Notifications & Alerts").
- The branch scope opens an `AppSheet` list (`max-h-60dvh`).
- **Pull-to-refresh:** touch drag at `scrollTop 0` with 0.5 resistance. Ready at 64px, max 96px.
  The badge (36px panel circle) rotates with the drag distance and spins while refetching all
  watched queries.
- Scroll position is restored per route. The column fades in for 150ms on each route change.

### 4.3 Admin app shell (`/admin`): `layouts/AdminAppLayout.tsx`

- **Phone:** AppBar on top (same component), content column, **bottom tab bar**:
  `AppTabBar` with 4 items (Home, Payables, Receivables, Notifications with an unread badge). Each
  tab is `h-16` with a 20px icon above a 12px label. The active tab is brand, semibold, with a
  filled icon and a 4px-tall, 40px-wide brand indicator on the top edge of the bar. The bar is a
  rounded panel floating `px-3 pt-2 pb-safe`.
- **md and up:** the tab bar becomes a **left rail** `w-24` (rounded panel). Items stack
  vertically, `rounded-xl` with hover fill, and the indicator becomes a 4×32px bar on the left
  edge.
- Content column: `max-w-6xl` centred, `gap-4`, `p-4`.
- The user menu is a bottom sheet on phones (`AdminUserSheet`) and a dropdown on larger screens.
- Has its own manifest, title ("TARTAR Admin"), favicon and apple-touch-icon, swapped into
  `<head>` on mount. theme-color = `--panel`.

### 4.4 Public / auth layout (`/login`, `/register`, `/forgot-password`)

- Split screen at ≥960px. **Left hero** (`clamp(360px, 42vw, 560px)` wide, `rounded-panel`,
  `bg-auth-hero`, `p-12`): wordmark, a headline, a feature list with 34px translucent icon
  chips, and a decorative farm illustration (`FarmScene`) faded at 30% opacity with a gradient
  mask at the bottom.
- **Right:** a centred auth card `max-w-[440px]`, `px-10 py-11`, that animates in
  (fade + zoom-98 + slide-up, 500ms). Contains title, subtitle, form (`gap-4.5`), 48px full-width
  submit, and an alt link row with a top border.
- Below 960px the hero is hidden and the card shows its own logo and wordmark.
- Success state: `AuthSuccessPanel` with a 56px brand-soft circle icon.

### 4.5 Error views

- `RootErrorView` (whole-app boundary) and `RouteErrorView` (per lazy view, rendered inside the
  shell), plus `ErrorView` for 404.
- Error card: `max-w-[560px]`, `rounded-panel`, `py-12`, on `bg-app`.

---

## 5. Page anatomy: `ContentView` (every main-app page uses exactly one)

```
Row 1  h1 title (from route label) ─ meta text ─ [tabs] │ [actions]
Row 2  OfflineNotice (only when offline)
Row 3  toolbar  (Filters popover, view tabs, etc.)
Body   layout="stack" (flex col gap-4)  or  layout="bento" (BentoGrid)
Footer optional
```

- The title truncates. Below `lg` the tabs drop to their own full-width row (`order-last`) and
  scroll horizontally with a hidden scrollbar. A vertical divider separates tabs from actions
  on `lg`.
- On narrow screens a `ToggleGroup` placed in the toolbar becomes an equal-width grid.
- The route `description` is not rendered.
- **Bento grid:** 2 columns on phone, 12 on md+. Named spans: `quarter` (6 → xl 3), `third`
  (6 → xl 4), `half` (6), `twoThirds` (12 → xl 8), `full` (12), `main` (12 → xl 9), `aside`
  (12 → xl 3). Stat tiles go 1-up per column on phone (2 per row). An odd last tile spans
  full width.
- `SectionHeading`: lg title with a right-aligned extra slot (e.g. "View all").

---

## 6. Component library (`src/components/common/<kind>/`)

These wrap `src/components/ui/` (generated shadcn aria-vega registry: accordion, alert,
alert-dialog, aspect-ratio, avatar, badge, breadcrumb, button, button-group, calendar, card,
chart, checkbox, collapsible, combobox, command, dialog, dropdown-menu, empty, field,
input-group, input, item, label, native-select, pagination, popover, progress, radio-group,
scroll-area, select, separator, sheet, sidebar, skeleton, sonner, spinner, switch, table, tabs,
textarea, toggle-group, toggle, tooltip).

### 6.1 Buttons

- `AppButton`: the shadcn Button plus an optional tooltip and `href`. Variants come from
  aria-vega (default/primary, outline, secondary, ghost, destructive, link). Sizes are
  `xs/sm/default/lg/icon/icon-xs/icon-sm/icon-lg`.
- `PrimaryAction`: the page's main create action. Inline button on ≥768px. On phones it is
  portalled into a **floating pill** (h-14, `shadow-pop`, bottom-right, safe-area offset) that
  collapses to a 56px circle after 120px of scroll, with the label animating out.
- Rule: one primary CTA per page, in the toolbar actions slot or ContentView `actions`.

### 6.2 Cards

- `SectionCard`: the content panel. Title, subtitle, `extra` slot, body, optional footer (top
  border). Supports `flush` (no vertical padding) and `loading` (skeleton h-56), plus
  `error`/`onRetry`. No title means no header is rendered.
- `StatCard`: a metric tile, `@container`-responsive. Title (muted sm), value (heading font,
  tabular, scales up to 2xl), an icon in a 36px tone chip (rounded-md; becomes round and moves
  above the text when the tile is under 12rem wide), a chip row (`StatDelta` arrow and %, or a
  `StatusTag`), and a caption. Variant = tone. Has loading and error states.
- `InfoCard`: the "recommended" card. Chip, meta line, truncated title, 2-line clamped body, and
  an action pinned to the bottom.
- `MetricTile` (admin app): a pressable link tile with a 36px round icon, value up to `text-3xl`
  and a sub-line. Lifts to `shadow-raised` on hover and scales to 98% when pressed.
- Rules: never nest a card in a card. The content card is already a surface, so at most one card
  layer sits on it.

### 6.3 Tables: `DataTable<T>` (`components/common/table/`)

One table component for the whole app. Its props cover columns, data, the four states,
server-side or client-side pagination, sort, row click, inline expansion, row selection, row
class and pending rows.

**Column descriptor** (`IDataTableColumn<T>`): `title`, `dataIndex`/`key`, `align`
(left/center/right, where right adds tabular-nums), `width`, `skeleton` (`text`|`avatar`),
`sorter`, `render`, **`mobile`** role (`title | subtitle | amount | status | meta | actions |
hidden`), and **`collapse`** (`xl` | `2xl`, which hides the column below that width).

**Desktop table:**
- Header row `h-11`, 13px muted, sortable headers show ↑ / ↓ / ⇅ (14px).
- Body rows: cells are `h-14 px-3 py-2 text-sm`; rows have a bottom border and a
  `hover:bg-muted/40` hover.
- Row states: selected → `bg-brand-mist`; **pending sync** → `bg-warning/5`, muted text, and a
  "pending" tag; **overdue** → `bg-danger-bg/60` (set through the row class, never per cell);
  **focused** (deep-linked from a notification) → brand-mist with a 3× pulse animation; clickable
  rows → `cursor-pointer`.
- **Inline expansion:** a chevron in the lead cell (rotates 90°). The detail row is a `bg-muted/40`
  panel with an auto-fill grid of sections (`minmax(18rem, 1fr)`). Each section has an uppercase
  12px title with an icon, then rows of label (8rem) and value. Opening and closing animate with a
  fade and a 4px slide.
- Selection column with checkboxes.
- **States:** loading shows 5 skeleton rows shaped by column alignment and avatar type;
  refreshing dims the body to 60% opacity and shows a small brand spinner beside the label;
  error shows `ErrorState` with Retry; empty shows `TableEmptyState` (icon, text, optional
  action). The loading state is announced to screen readers.

**Mobile card list** (`DataTableCards`, below 1024px). Each row becomes a card:
`rounded-2xl`, border at 60% opacity, `bg-card`, `p-3.5`, `shadow-xs`, `gap-2.5`, 10px between
cards.
- **Head:** optional checkbox; the `title`-role fields (pressable, and the whole card is the hit
  area via an `::after` overlay); `subtitle` fields in xs muted; `amount` fields right-aligned in
  the heading font, semibold and tabular; the `actions` menu.
- **Meta:** a `<dl>` in 2 columns of label/value (xs).
- **Foot:** `status` chips on the left and a round secondary "›" button on the right that opens
  the row's detail sections in a **bottom sheet**.
- Default roles: the first column is the title, the `actions` key is actions, everything else
  is meta.
- Paging on mobile is **infinite scroll** (`LoadMoreSentinel` grows the page size), not numbered
  pages.

**`TablePanel`**: wraps the toolbar, then the table, then the footer, with `gap-3`. It has no card
of its own; the table sits directly on the content surface.

**`TablePagination`** (desktop): "Showing X–Y of Z" on the left; on the right, round
prev/next buttons, numbered pages (32px round, with ellipsis) and a page-size select (md+ only).
Default page size is 8.

**Cells:**
- `AvatarCell`: initials in a brand-soft circle, with the name over a muted hint.
- `ProgressCell`: "value / total" with a percentage over a 3px track.
- `TruncateCell`: max 11rem with ellipsis on lg.
- `RowActionMenu`: a "⋯" trigger (round on mobile) opening a dropdown (min 12rem), with danger
  items and separators.
- Shared cell classes: `nowrapCell`, `stackedCell` (value over hint), `tagRow`.

**Server paging:** transactional tables (Transactions, Sales, Purchases, Expenses, ledger,
payments, disbursements) use Supabase `.range()` with an exact count. Lookup tables (branches,
categories, customers, suppliers, users) are unpaged.

### 6.4 Filters and sorting (`components/common/filter/`)

- `FilterToolbar`: a bare row (no card). Filters on the left, `sort` and `actions` pushed right.
  On phones (compact mode) every toolbar button becomes a **40px round icon button**, the label is
  hidden, and the active-count badge moves to the corner.
- `FilterPopover`: a "⚙ Filters (n) ▾" pill.
  - Desktop: a 20rem popover with a "Filters" header and a ghost "Reset" button.
  - <1024px: a **bottom sheet** whose footer is a 2-column split: [Reset] [Show results].
  - The badge counts active fields. Status and branch are not counted.
- `LedgerFilterBar`: the shared field set (search, type, date range, party…) in `inline`,
  `stack` or `popover` layout.
- `SearchInput` (w-56), `FilterSelect` (w-40), `DateRangeFilter` (a w-64 trigger opening a
  calendar popover), `FilterField` (label above the control).
- `SortSelect`: "Sort by [select]" (w-44, pill) on desktop. On phones it is a round icon button
  that opens an `AppSheet` with full-width options. Changing sort resets to page 1.
- **Status filtering** is not a filter field. It is a pill set in the title row: `StatusFilterTabs`
  → `ViewSwitch` (an outline `ToggleGroup`; the selected pill is solid brand with white text).
  It always starts with "All".
- Filter and sort state live in Zustand (`filter.store`, `sort.store`), keyed per page scope, so
  they survive navigation.

### 6.5 Overlays: modals, drawers, sheets, popovers

One modal registry (`store/common/modal.store.ts`), keyed by constants in `keys/modal.keys.ts`.
A modal carries the whole record (`{ visible, data }`).

| Component | Desktop (≥1024) | Mobile/tablet (<1024) |
|---|---|---|
| `AppModal` (base of all forms and details) | Centred Dialog, `rounded-panel`, sizes sm `max-w-md` / md `xl` / lg `3xl` / xl `5xl`, `max-h: 100dvh−2rem`, **not dismissable by outside click** | **Bottom sheet**, `rounded-t-panel`, `max-h: 92dvh − keyboard`, rides above the keyboard; `fill` option = full height minus the safe top |
| Header | Ruled (bottom border), `px-6 py-4`, 16px semibold title, close X | Ruled sheet header |
| Body | Scrolls inside, `max-h-70dvh` | `flex-1` scroll |
| Footer | `bg-muted/50`, top border, buttons `h-11 px-6`, rounded bottom | `bg-muted/50`, top border, safe-area bottom padding |
| `ConfirmationModal` (mounted once in `App.tsx`, store-driven) | AlertDialog: media circle (brand-soft for confirm, danger-bg for delete), title, message, Cancel + OK (destructive for delete); stays open with a spinner while an async confirm runs | Bottom sheet, centred icon/title/text, full-width stacked 44px buttons |
| `AppSheet` (lightweight pickers and details) | **Right side panel**, `max-w-md`, `rounded-l-panel` | Bottom sheet with a **grab handle** (40×6 pill); **swipe down to close** on the handle and header; closes on navigation |
| `DetailModal<T>` | Read-only sections and rows, 2-column `DetailGrid` | same content in a sheet |
| `PeriodPrintModal` | Pick a period, then print | sheet |
| `EntityFormModal` | see 6.6 | sheet |
| Popovers | Branch scope, inbox, filters, date pickers, comboboxes | Branch scope, filters and sort become sheets; inbox becomes the alerts sheet on phones |
| Dropdown menus | Row actions, user menu | Row actions stay a dropdown; user menu moves into the drawer (main app) or a sheet (admin) |
| Split detail (admin) | `DetailPanel`: a sticky aside next to the list with an empty state ("Select a payable…"), a header with close, and a footer (`bg-muted/50`) | `AppSheet` bottom sheet |

**Android/browser Back** closes the topmost open overlay (modal, sheet or confirm) before it
navigates. This is a history-marker hook, `useOverlayBackHook`. Overlays also close on route
change.

**Ledger modals** (Customer/Supplier ledger): a **two-pane slide** inside one modal. The track
is 200% wide and translates −50% to slide from the list pane to the detail pane (300ms
ease-in-out). On narrow widths the header actions collapse to icon-only round buttons and the
Pay button goes full-width at the bottom.

Rules: never put a modal inside a modal; destructive actions always go through `useConfirm`;
never use `window.confirm`.

### 6.6 Forms

- react-hook-form + zod, **declarative**. A feature hook builds an `IFieldConfig[]` (or sections
  of them), and `EntityFormModal` renders it through `FormField`, the only place where a field
  type maps to a control.
- Field types and their controls:
  - `text`, `password`: Input / InputGroup with an optional icon or prefix.
  - `textarea`
  - `number`, `amount`: number input, spinners hidden, optional `₱` prefix.
  - `select`: searchable Combobox, optionally clearable.
  - `creatable`: Combobox with a "Create '…'" empty state.
  - `multiselect`: Combobox chips.
  - `date`: button trigger with a calendar icon opening a Calendar popover.
  - `checkbox`.
- Field props: `span` (`half` | `full` in a 1-column → md 2-column grid), `required` (red
  asterisk), `hint`, `placeholder`, `hidden(values)` for conditional fields, `optionsOf(values)`
  for dependent options, `inputMode`, `autoComplete`, `hideLabel`.
- `FormSection`: a card-like group with a ruled header whose title is in **primary blue**
  (`text-primary`, base, semibold), `p-5`.
- `FormSummary`: a muted box (`bg-muted p-4 rounded-lg`) of label/value lines. The last
  (emphasis) line has a top border and is bold. Used for VAT and withholding math on vouchers.
- `RejectionIntro`: a muted box of uppercase micro-labels with values, shown when resubmitting a
  rejected record.
- Values are normalised in the hook before the mutation. The submit button shows a loading
  state.

### 6.7 Status and feedback (`components/common/status/`)

- `StatusTag`: a soft outlined pill; colours come from enum → colour maps (approval
  pending/approved/rejected, sale states, voucher states, transaction types).
- `StatDelta`: ↑/↓ with a percentage and a label; colour depends on the "good direction" (sales
  up is good, expenses down is good).
- `ProgressRow`: a value with a unit, a label with a coloured dot, and a progress bar.
- `EmptyState` (min-h-56, icon, text, optional action) and `ErrorState` (danger-bg media,
  message, Retry; a `compact` variant).
- `OfflineNotice`: an Alert ("You're offline — changes you record are kept on this device and sync
  when you reconnect"), placed under the page title.
- `SyncIndicator` and `SyncPanel`. Icon states: WifiOff (offline), spinning RefreshCw (flushing),
  CloudAlert (failed), CloudUpload (pending), CloudCheck (all saved). The count badge is brand,
  or danger when something failed. An amber offline dot shows when offline. The panel lists
  pending and failed writes with reasons, and Retry/Discard.
- `PushPromptNotice`: an inline prompt to enable push notifications.
- `RouteProgress`: a 2px top bar with a sliding brand segment.
- `PageSkeleton`: the `HydrateFallback` for lazy routes (title bar, pill placeholders, rows).
- Toasts (sonner): **top-center**, with a safe-area-aware offset on mobile.

### 6.8 Charts (`components/common/chart/`, recharts through shadcn `ui/chart`)

- `AppBarChart`: `h-72`, full width. Series colours come from `ChartTone` → `--chart-n`.
- `AppDonutChart`: 224px square, with the centre label (value + caption) overlaid; legend rows
  with dots and values plus a total row with a top border.
- `ChartTooltipRow`: name (muted) and value (mono, tabular).
- Palette order: brand blue, sky, violet, green, amber, red.

### 6.9 Admin-app primitives (`components/common/app/`)

- `SegmentedTabs`: an iOS-style segmented control. A `bg-muted` pill track holds a white sliding
  thumb (`shadow-sm`, 200ms). Each item can carry a count chip. Full width on phone, `w-fit` on
  lg.
- `ListSection`: an inset grouped list (iOS Settings style). An uppercase 12px muted header with
  meta, then a `rounded-panel bg-panel shadow-panel` stack of rows.
- `ListCard`: a row with an avatar or media (with an unread or pending dot), name (semibold when
  unread), meta, a 2-line description, a note with an icon, right-aligned figures (amount + date),
  and a chevron. Pressed rows get `bg-muted`, selected rows `bg-brand-soft`, unread rows
  `bg-brand-soft/40`.
- `RecordHero`: centred muted name over a big `text-3xl` amount (top of a detail sheet).
- `DetailRows`: a bordered, divided list of label ↔ right-aligned value rows (`px-4 py-3`).
- `DetailPanel`: the desktop split-view aside (see 6.5).
- `PullIndicator`: the pull-to-refresh badge.
- `AppSheet`: see 6.5.

---

## 7. Screens: main app

Every screen follows the reference composition: ContentView → (summary StatCards) → TablePanel
(FilterToolbar [FilterPopover + SortSelect + PrimaryAction] → DataTable → TablePagination) →
EntityFormModal → RowActionMenu + useConfirm.

| Route | Title-row tabs / actions | Body |
|---|---|---|
| `/` **Dashboard** | meta = today's date; bento layout | `main` column (xl 9/12): 6 StatCards in thirds (Today's Sales with Δ vs yesterday; Today's Expenses with Δ; Accounts Receivable; Accounts Payable; Monthly Sales with a "₱x pending" chip; Net Profit MTD with Δ vs last month); then **Sales Overview** bar chart (twoThirds, with a period switch) and **Cash Flow (MTD)** donut (third). `aside` column (xl 3/12): **NotificationsCard**, a scrolling due-alert feed grouped by urgency (overdue / due soon) with coloured dots, name, sub-line, amount and date |
| `/transactions` **Transactions** (reference module) | — | Summary cards, then a table. Columns: Date (mobile title), Time (subtitle), Type (status tag), Branch (collapse xl, hidden on mobile), Recorded by (collapse 2xl), Amount (right, mobile amount), actions. Expansion sections: Transaction, Classification… FAB "Record transaction" opens an `lg` form modal |
| `/sales` **Sales** | `SaleStatusTabs` pills | SaleSummaryCards, SalesTable; deposit/verify workflow modals (`SaleFormModals`) |
| `/purchases` **Purchases** | — | PurchaseSummaryCards, PurchasesTable (each purchase auto-creates a voucher) |
| `/expenses` **Expenses** | — | ExpenseSummaryCards, ExpensesTable (auto voucher) |
| `/vouchers` **Vouchers** | `VouchersStatusTabs` | VouchersTable (check/cash approval, resubmit, withholding/VAT summary in the form), voucher source modals, disbursement edit and history (audit list with a field-diff list) |
| `/receivables` **Receivables** | Status tabs; toolbar = `LedgerViewTabs` (records/payments); action = **Customer ledger** button | LedgerSummaryCards, LedgerRecordsSection, LedgerPaymentsTable, RecordPaymentModal, CustomerLedgerModal (two-pane slide) |
| `/payables` **Payables** | same pattern for suppliers | PayableRecordsTable, MarkPaidModal, SupplierLedgerModal |
| `/reports` **Reports** | `ViewSwitch` of report types; action = **Print report** | Period report (daily/weekly/monthly), Branch summary (month/range pickers), Receivables / Payables ledger report, Expenses report, Cash-flow report. Printing opens a print window styled with `printPalette` (hex) and a Segoe UI font stack |
| `/branches` **Branch Monitoring** | Create button | BranchMonitorTable + BranchesTable |
| `/master-data` **Master Data** | `ViewSwitch` sections (Suppliers / Expense Categories / Income Sources / Banks), stored in the URL `?section=`; the action changes per section | the matching table |
| `/users` **Users** | Create user | UsersTable with a `UserCell` avatar cell; role and branch access |
| `/account` **Account settings** (not in nav) | bento halves | Profile card (label/value rows), Change password, **Install app** card (install button, or iOS "Share → Add to Home Screen" steps), **Notifications** card (enable push) |

## 8. Screens: admin app (`/admin`)

| Tab | Content |
|---|---|
| **Home** | Page title; SegmentedTabs for the period; `OverviewTiles` (2×2 on phone, 4 across on lg: Sales, Expenses, AR outstanding + new, AP outstanding + new; each links to its tab); `AttentionList` (ListSection of items needing action); `SalesTrendCard` (bar chart) |
| **Payables** | SegmentedTabs (due checks / near-due / overdue …); `PayableEntryList` (ListSection of ListCards). Tapping a row opens `PayableEntrySheet`: a bottom sheet on phone, a `DetailPanel` in a 2-column split on md+. It shows RecordHero and DetailRows, and the footer has "Open in TARTAR" (a deep link into the main app) |
| **Receivables** | same pattern (overdue / due this week) |
| **Notifications** | Title with "Mark all read"; Inbox feed of actions; SegmentedTabs; due-alert `NotificationFeed` grouped by urgency; Inbox "updates" feed. The unread count badges the tab |

---

## 9. PWA and offline design

- **Manifest (main):** standalone, display_override `[standalone, minimal-ui]`, theme and
  background `#eef2fb`, categories business/finance/productivity,
  `launch_handler: navigate-existing`. **Shortcuts:** Sales, Vouchers. **Screenshots:** narrow
  780×1688 and wide 1280×800. Icons: 192, 512, maskable 512, SVG.
- **Manifest (admin):** `/admin.webmanifest`, scope `/admin`, white theme, its own icon set.
- **iOS:** `apple-mobile-web-app-capable`, apple-touch-icons (main and admin), and **24
  apple-touch-startup-image splash screens** (12 devices × light/dark, portrait only), from
  iPhone SE up to iPad Pro 12.9".
- **Viewport:** `viewport-fit=cover`, `interactive-widget=resizes-content`. Safe-area padding is
  applied on the shell, AppBar, tab bar, FAB, sheet footers and toasts.
- **Service worker** (`src/sw.ts`, injectManifest): precaches all js/css/html/png/svg/webp/woff2
  (up to 5MB per file; splash images and screenshots excluded); SPA navigation fallback to
  `index.html`; **web push** handler and `notificationclick` (focus an existing window and
  navigate to the target, or open a new one).
- **Updates:** `registerType: prompt`. When a new version is waiting, a persistent sonner toast
  says "A new version of TARTAR is ready — Reload to update. Changes waiting to sync are kept."
  with a Reload action. The app checks for updates hourly and whenever the tab becomes visible.
- **Install:** captures `beforeinstallprompt` and shows an Install button in Account →
  Install app; shows manual steps on iOS; tracks the installed state.
- **Offline reads:** the query cache is persisted to **IndexedDB** and rehydrated, so the last
  data is visible offline. Lookup lists (branches, sections, categories, income sources, banks,
  bank accounts, customers, suppliers, users) are **pre-primed** on login and on reconnect.
- **Offline writes:** every mutation goes through `runWrite`. Offline writes join a persisted
  queue (Zustand persist), and rows written offline show as **pending** (amber row tint and tag).
  The queue flushes on reconnect. Failed writes appear in the Sync panel with a reason and
  Retry/Discard.
- **Realtime:** a Supabase realtime channel over the live tables refetches affected queries.
- **Native-feel touches:**
  - pull-to-refresh
  - swipe-to-close sheets
  - Back button closes overlays
  - per-route scroll restore
  - view transitions (180ms), with the app bar and tab bar named so they stay fixed
  - keyboard-aware bottom sheets
  - 44px touch targets
  - a FAB that collapses on scroll
  - a compact title on scroll
  - theme-color that follows light/dark
  - `overscroll-contain` on scroll areas
  - the tap highlight is removed

---

## 10. Interaction patterns

- **Primary create:** one PrimaryAction per page. It opens `EntityFormModal` (dialog on desktop,
  sheet on mobile).
- **Row actions:** "⋯" `RowActionMenu`. Destructive items open `useConfirm({ kind: "delete" })`,
  which stays open with a spinner until the mutation settles.
- **Row detail:** desktop rows expand inline; mobile cards have a "›" that opens a detail sheet.
  Ledger records open the ledger modal.
- **Deep links from notifications:** navigate with a focus key; the target row scrolls into view
  and pulses brand-mist three times.
- **Branch switching:** global, from the header pill (popover) or a phone sheet. All queries are
  keyed by branch.
- **Sort:** a single sort select per table; header-click sort also works for client-side columns.
- **Filters persist** per page in Zustand. Reset is disabled when no filter is active.
- **Keyboard:** React Aria provides focus management, typeahead in lists and Escape to close.
  Focus rings are 3px `ring/50`.

## 11. Data-surface state contract

Every list, card or chart renders exactly one of: **loading** (skeletons shaped like the
content), **refreshing** (content dimmed to 60% with a small spinner, layout unchanged),
**error** (ErrorState with Retry), **empty** (EmptyState with icon and optional action),
**data**. Stat tiles and section cards have their own skeleton and error variants.

## 12. Accessibility

- React Aria primitives handle keyboard, focus, ARIA roles and press events.
- Tables have labels; loading is announced through an `sr-only` live region; `aria-busy` is set
  while refreshing.
- Tab-bar items expose `aria-current="page"`, with badge text in the `aria-label`
  ("Notifications, 3 new").
- Icon-only buttons all carry an aria-label and a tooltip.
- Reduced motion turns off every animation, the progress-bar slide and view transitions.
- Touch targets meet 44px on coarse pointers.
- Colour is never the only signal: statuses carry text, and deltas carry arrows.

## 13. Print

The print window uses inline styles from `styles/print/print.styles.ts`: text `#1B1F2A`,
heading `#0F172A`, muted `#6B7280`, border `#ECEEF3`, danger `#DC2626`, font stack Segoe UI
Variable → system. Print windows cannot read CSS variables, which is why hex values are allowed
here.

## 14. Styling architecture (how a designer's suggestion turns into code)

- No class strings in JSX. Every class list is a named constant (or a `cva` variant set) in
  `src/styles/<area>/<area>.styles.ts`, combined with `cn()`.
- Style files: `layout/{shell,sidebar,header,public}`, `view`, `card`, `stat`, `table`, `filter`,
  `modal`, `form`, `status`, `chart`, `dashboard`, `ledger`, `account`, `disbursement`,
  `app/{app,app.bar}`, `admin/{admin.layout,admin.home}`, `common/{tone,toast}`, `print`.
- No inline `style={}`, no new `.css` files, no hex outside `theme.css` and print.
- shadcn `ui/` files are generated and restyled only through tokens. `className` on a `ui`
  component is for layout only.
- The `data-slot` attributes on shadcn parts are used for contextual styling (e.g. coarse-pointer
  sizing, compact toolbar buttons).

## 15. Navigation and information architecture summary

```
Main app (role-gated)
├─ Main ........ Dashboard
├─ Operations .. Transactions · Sales · Purchases · Expenses · Vouchers
├─ Accounting .. Receivables · Payables
├─ Monitoring .. Reports · Branch Monitoring
├─ System ...... Master Data · Users
└─ (hidden) .... Account settings
Admin app (/admin, managers): Home · Payables · Receivables · Notifications
Public: Sign in · Create account · Forgot password
```

Desktop navigation is the sidebar. Phone navigation in the main app is the sidebar drawer. The
admin app uses a bottom tab bar on phones and a left rail on md+. Managers can switch between
the two apps from the user menu.

---

## 16. Known gaps and open questions (where suggestions would help most)

1. **Tablet hybrid (768–1023px):** the desktop chrome (header, content card, sidebar off-canvas)
   is paired with phone data components (card lists, bottom sheets). Should tablets get the real
   table with fewer columns (using `collapse`), or the full phone shell?
2. **First-render flash:** the shadcn `useIsMobile` hook starts as `false`, so phones can render
   the desktop table or dialog for one frame before switching to cards or sheets.
3. **Dark-mode token gaps:** `--chart-2..6`, `--positive`, `--warning` and `--destructive` have
   no dark values (`--destructive` stays `#dc2626` while `--danger` becomes `#f87171`). Contrast of
   amber and green on navy has not been checked.
4. **Tone mapping:** `toneText` maps brand, accent and info to the plain foreground colour, so
   those stat values look neutral. Is that the right call for a finance dashboard?
5. **Magic type sizes:** 11px, 13px, 15px, 17px, 19px, 22px and 26px appear as arbitrary values
   instead of a defined type scale.
6. **Main-app phone navigation:** a drawer only, with no bottom tab bar. This is a locked
   decision, but feedback on discoverability (Sales and Vouchers are the most-used phone tasks)
   is welcome.
7. **Admin vs main visual drift:** the admin app uses iOS-style grouped lists, segmented controls
   and metric tiles, while the main app uses tables, toggle pills and stat cards. Should the two
   converge?
8. **Desktop dialogs are not dismissable** by outside click, while sheets are. Is that consistent
   enough?
9. **Status tabs vs segmented tabs:** two visual languages for the same job (`ViewSwitch` outline
   pills in the main app vs `SegmentedTabs` in the admin app).
10. **Print font** (Segoe UI) differs from the app font (Plus Jakarta Sans).
11. **Splash screens** are iOS portrait only; there is no landscape or iPad mini coverage.
12. **Admin manifest theme colour** is `#ffffff` while the main app is `#eef2fb`, and neither
    switches to dark in the manifest itself.
13. **Dashboard density:** 6 stat tiles, 2 charts and an alert feed on one screen. Is there a
    better hierarchy for owners who check it on a phone?
14. **Empty, error and offline copy** is functional; tone and helpfulness could be reviewed.

## 17. Constraints any suggestion must respect

- Keep shadcn/ui on **aria-vega (React Aria)**: no Radix, Base UI, antd or styled-components.
- Tailwind v4 tokens only. A new colour means a new token in `theme.css`, with a dark value.
- No new dependency unless the existing stack (recharts, sonner, lucide, react-aria-components,
  tw-animate-css) cannot do the job.
- Every form stays declarative (`IFieldConfig` → `FormField`). Every table stays `DataTable` with
  column `mobile`/`collapse` roles. Every overlay stays `AppModal`, `AppSheet` or `useConfirm`.
- Offline-first behaviour (queued writes, pending rows, IndexedDB cache) must not regress.
- One `ContentView` per page; never a card inside a card.
