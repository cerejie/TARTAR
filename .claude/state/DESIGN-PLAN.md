# TARTAR — UI/UX Consistency Design Plan
Written: 2026-09-16 · Reference modules: Transactions, Purchases, Expenses
Targets: Receivables, Payables, Reports, Branch Monitoring, Master Data, Users

---

# 1. Executive Summary

TARTAR already has a design system; it is applied unevenly. Transactions, Purchases and
Expenses share one composition — `ContentView` → `StatCard` bento → `TablePanel`
(`FilterToolbar` + `DataTable` + `TablePagination`) → `EntityFormModal` → `RowActionMenu` +
`useConfirm`. The six target modules predate it and drift in the ways daily users notice:

- Primary button lives in three places (toolbar trailing edge / `ContentView actions` / `SectionCard extra`).
- Row actions come in three styles (`RowActionMenu` / tooltip icon-button cluster / inline `type="link"` buttons).
- Status renders three ways (`typeTag` outlined pill / raw antd `Tag color=` / antd `Badge`).
- Tables sit in two shells (`TablePanel` vs `SectionCard title="All X"` duplicating the app header).
- Receivables/Payables bury the collector's job under a 9-column client-paged table, a second card, and a modal-in-modal-in-modal.
- Pages (`BranchesView`, `UsersView`, `ReceivablesView`, `PayablesView`) carry columns/fields/handlers.

Plan: (1) settle five shared standards (CTA slot, row actions, status pill, page shell, stack
spacing); (2) add three small common pieces (`StatusTag`, `SearchInput`, `ViewSwitch`);
(3) re-compose the six modules onto the Transactions shape, adapted per job.

---

# 2. Reference Module Analysis (Transactions / Purchases / Expenses)

## A. Page structure as built

| Slot | What it is | Source |
|---|---|---|
| Page header | App-level: route `label` + `description`, sync indicator right. Never in-page. | `components/common/layout/ProtectedHeader.tsx`, `routes/protected.view.routes.ts` |
| Body | `ContentView` → `viewBody` flex column; optional `toolbar`/`meta`/`actions` row | `components/common/view/ContentView.tsx` |
| Summary | `statGrid` → `BentoGrid` → 4 × `BentoCell span="quarter"` → `StatCard(title,value,variant,icon,caption=period)` | `components/transaction/cards/TransactionSummaryCards.tsx` |
| Table shell | `TablePanel`: bordered surface radius lg; toolbar (pad md, bottom hairline) / body (md, top md, bottom sm) / footer (pad md, top hairline) | `components/common/table/TablePanel.tsx`, `styles/table/table.css.ts` (tablePanel*) |
| Toolbar | `FilterToolbar` (filters start, actions end, wrap); `LedgerFilterBar` = RangePicker + optional status/type Select + reference Input + ghost Clear, all `size="large"` | `components/common/filter/*.tsx` |
| Primary CTA | `Button type="primary"` + `PlusOutlined`, verb-noun ("Record purchase"), inside `RequirePermission`, trailing edge of toolbar | `TransactionsTable.tsx` |
| Table | `DataTable` size middle; chevron in lead cell; `RowDetailPanel` sections on expand | `components/common/table/DataTable.tsx` |
| Pagination | `TablePagination` footer: "1 – 20 of 143 items", first/last, page list, size 10/20/50/100 | `components/common/table/TablePagination.tsx` |
| Forms | `EntityFormModal size="lg"` with `sections` (boxed groups, 2-col grid, `hidden(values)`), Cancel + primary submit | `components/common/form/EntityFormModal.tsx` |
| Row actions | `RowActionMenu`: 1 action → icon button + tooltip; >1 → dropdown; danger items; disabled keeps reason in label | `components/common/table/RowActionMenu.tsx` |
| Destructive | `useConfirm({ kind:"delete", title:"Delete X?", message:"…of ₱N … cannot be undone." })` | `components/common/modal/ConfirmationModal.tsx` |
| Feedback | mutation `successMessage` toast; table spinner; StatCard skeleton; `emptyText="No X match the current filters"` | hooks |

## B. Measured spacing

Tokens `space`: 4/8/16/24/32/40 (`styles/common/vars.css.ts`). Radii 4/8/12/16/24/32/pill.

| Where | Value | Token |
|---|---|---|
| Content padding desktop → tablet → phone | 24×40 → 16 → 8 | lg xxl → md → sm |
| Bento gap | 16 | md |
| statGrid → table | 16 | md |
| card / tablePanel → next | **8** | sm (marginBottom) |
| Panel toolbar/footer padding | 16 | md |
| Panel body | 16 inline / 16 top / 8 bottom | md/md/sm |
| StatCard body | 16×24 | md lg |
| SectionCard head / body | 24 24 0 / 16 | lg / md |
| Table header → first row | 8 | literal headerGap |
| Row detail panel / content / section gap | 16 / 16 / 24 | md / md / lg |
| Modal header / body / footer | 24 / 0 (+16 right gutter, 68dvh) / 16 24 24 | lg / md / md lg lg |
| Form sections gap / grid col / grid row / section pad | 16 / 16 / 8 / 16 | md / md / sm / md |
| Toolbar gap | 8 | sm |
| Micro (chips, captions, insets) | 2, 6, 10, 12 | literals |

Verdict: 8-based scale; one inconsistency — stack rhythm is md after stats but sm after
cards/panels, implemented as per-component marginBottom instead of container gap.

## C. Patterns worth naming
- Lead-cell expansion is the app's detail view (no navigation, list stays visible).
- Permission-shaped columns: `...(permissions.isManager ? [...] : [])`.
- Enum label + colour maps feeding one Tag shape (`typeTag`, `variant="outlined"`).
- Money right-aligned, tabular-nums, `nowrapCell` on dates/amounts/actions.
- One primary per screen, verb-noun label.
- Confirm copy: question title + consequence sentence naming the amount.

## D. Not worth copying
- Transactions "Time" column (already in expansion).
- Purchases "Due date" column rendering the word "Paid" (date column showing a status).
- Long disabled-reason labels — keep ≤5 words + em-dash reason.
- Reference search placed last — in lookup lists (Users, Master Data) search goes first.

---

# 3. Current Design Language

Typography (Segoe UI Variable Display headings / Text body; tabular nums in cells):

| Role | Size/weight | Class |
|---|---|---|
| Modal title | 20/700 −0.02em | `modalTitle` |
| Card title | 18 h4 600 | `cardTitle` |
| Stat value | 18/600 −0.03em | stat.css |
| Form section title | 15/700 | `formSectionTitle` |
| Body / cell / tag | 14 / 13 (500) | antd, `typeTag` |
| Detail value | 13.5/600 | `rowDetailValue` |
| Helper / subtitle / pager info | 12.5 muted | `modalSubtitle`, `cardSubtitle` |
| Caption / meta / detail label | 12 muted | `statCaption`, `viewMeta` |
| Table header / eyebrow | 11/700 uppercase 0.08em | th, `rowDetailSectionTitle` |

Colour: ink = primary; lime = decorative only (th bg, icon-button hover, active page, expanded
tint); lilac = focus ring only; green/red = money + success/danger; amber = warning.
Surfaces: white, hairline borders, radius lg panels/rows, xxl modals, pill tags/icon buttons.
Density: Table middle, 32px icon buttons, 38px stat icons, 2-col sectioned forms.

Keep: tokens, type scale, colour roles, TablePanel geometry, expansion, EntityFormModal,
confirm store, RowActionMenu, TablePagination.
Standardize: CTA slot, row-action style, status pill, page shell, stack rhythm, empty copy,
toolbar control size.
Improve: form grid on phones, sticky lead column, active-filter visibility, 40px inputs vs
32px button in toolbars.
Do not reuse: `SectionCard title="All X"` as table shell; `Row/Col` for stats; `Badge status`;
raw `Tag color=`; `type="link"` cell buttons; `ColumnLabel` header icons.

---

# 4. Problems and UX Risks

Cross-cutting
1. Three CTA homes.
2. Three row-action idioms; Users Reject fires with no confirm (`UsersView.tsx` approval column).
3. Three status renderings; overdue is both red row and red tag.
4. Duplicate titles (header "Users" + card "All Users").
5. Stack rhythm 16 / 8 / 8.
6. Toolbar control heights 40 vs 32.
7. Non-thin pages: `BranchesView`, `UsersView`, `ReceivablesView`, `PayablesView`.
8. Two pagers (TablePagination footer vs DataTable attached antd pager).

Receivables / Payables (`components/ledger/LedgerManager.tsx`)
9. No summary (outstanding/overdue/due-soon exist only in LedgerReport).
10. Nine columns; three money columns (Amount/Paid/Balance) — Balance is the decision number.
11. Settle modal = one amount field, no context; `PaymentAllocationModal` collects date+ref. Two payment forms.
12. Customer Ledger = xl modal with internal search, slide panes, two nested modals.
13. Payments verification is a second card below, client paged, text-link actions.
14. "Overdue" filter option is a derived condition — must render consistently.
15. Delete confirm has no consequence sentence.

Reports — Row/Col stats, no icons/captions, no custom period, unpaged/unshelled tables, off-standard tags, no export.
Branch Monitoring — CRUD first though route says monitor; monitor table has no period; header icons; archive uses delete icon (Expense Categories uses InboxOutlined).
Master Data — no search; Customers missing; primary in card head.
Users — no search/filter; branch slugs not names; inline approvals; self-delete button lacks aria-label; no pending-at-a-glance.

---

# 5. Reusable Components

Reuse exactly: ContentView, BentoGrid/BentoCell, StatCard, TablePanel, FilterToolbar, DataTable
(+RowDetailPanel), TablePagination, RowActionMenu, EntityFormModal (+FormSection, FormFieldGrid,
FormField), AppModal, DetailModal, ConfirmationModal/useConfirm, RequirePermission, NameCell,
formatMoney/formatDate, usePagination, useLedgerFilters, useModal.

Reuse with modification

| Component | Change | Why |
|---|---|---|
| `LedgerFilterBar` | add `showSearch` (leading), `showOverdue` | name search for lookups; overdue-only for ledgers |
| `DataTable` | drop attached antd pager once all tables use TablePagination; add `stickyLead` (P2) | one pager look |
| `FormFieldGrid` | half → full span ≤575px | phone forms |
| toolbar controls | one size (`middle`) across a toolbar | 40 vs 32 mismatch |
| `viewBody` | `gap: md`; remove marginBottom from `card`, `tablePanel`, `statGrid`, `filterBar` | one rhythm |
| `StatCard` | always pass `caption` = period | numbers need a period |
| `EntityFormModal` | optional `intro?: ReactNode` rendered above sections | context block for action modals |

New (common)

| Component | Path | Purpose |
|---|---|---|
| `StatusTag` | `components/common/status/StatusTag.tsx` | Tag + typeTag + outlined, fed `{label, color: StatusColor}`; replaces Badge and raw Tag |
| `SearchInput` | `components/common/filter/SearchInput.tsx` | Input + SearchOutlined + allowClear bound to `useLedgerFilters(scope).search` |
| `ViewSwitch` | `components/common/view/ViewSwitch.tsx` | Segmented bound to `useSearchParam` (Reports/Master Data already do this inline) |

No drawer, no new table, no new modal shell.

---

# 6. Standard Layout System

```
[App header: title · description · sync]            ← from route data
[ContentView]
  [toolbar]   ViewSwitch (multi-view screens only)
  [statGrid]  BentoGrid of 3–4 StatCards, caption = period (only when numbers drive decisions)
  [TablePanel]
     toolbar: FilterToolbar → [search][date][status][type][Clear] … [secondary][PRIMARY]
     body:    DataTable (lead-cell expand, gated columns, RowActionMenu last)
     footer:  TablePagination
  [EntityFormModal ×N, other modals]  ← siblings, never nested
```

Rules
- Exactly one `type="primary"` per screen, last in FilterToolbar actions, RequirePermission-wrapped, "Verb noun".
- Secondary actions: default buttons before the primary, max two; a third goes into a `…` dropdown.
- No SectionCard around a table. SectionCard is for non-table panels.
- No in-page heading repeating the header title.
- Stat grid: `quarter` ×4 or `third` ×3, never more than 4, every tile has `caption`.
- Expansion for record detail; DetailModal only for a record opened from outside its list.
- Multi-view screens: ViewSwitch in ContentView toolbar, one TablePanel per view, views kept mounted (`display:none`).

---

# 7. Standard Modal / Drawer System

`modalWidths` (`models/common/view.model.ts`):

| Size | Width | Use | Examples |
|---|---|---|---|
| sm | 420 | confirm; single-field action | delete confirm, reset password, set active |
| md | 560 | ≤6 flat fields, one group, single column | supplier, category, branch, user |
| lg | 760 | sectioned forms (2–3 boxed sections, 2-col) or form + context block | transaction, purchase, expense, record payment w/ allocation |
| xl | 1040 | read-only table inside a modal | edit history/audit only |

Keep `modal.css.ts` as is: radius xxl, header lg, title 20/700 + subtitle 12.5, body 68dvh with
16px right gutter, footer md lg lg + hairline, buttons right, order Cancel → Primary, gap 8,
danger primary only for delete. maskClosable=false, centered, destroyOnHidden.

Additions
- Subtitle mandatory on form modals; says what submit does when not obvious.
- Context block for action modals via `intro` prop (party, due date, balance above the fields).
- Drawer: not introduced. Revisit only for a long side-by-side flow.
- Never a modal for anything with its own search, pagination, or child modal → that is a view.

---

# 8. Standard Spacing and Padding System

| Context | Token | px |
|---|---|---|
| Page padding | lg/xxl → md → sm | 24/40 → 16 → 8 |
| Between stacked blocks | md (viewBody gap) | 16 |
| Bento gap | md | 16 |
| Panel toolbar/footer | md | 16 |
| Panel body | md inline, md top, sm bottom | 16/16/8 |
| Table cell | antd middle (12×8) | — |
| Row detail panel/content/sections | md/md/lg | 16/16/24 |
| Card head/body | lg lg 0 / md | 24/16 |
| Stat card body | md lg | 16×24 |
| Modal header/footer | lg / md lg lg | 24 / 16-24-24 |
| Form section gap/pad/grid col/row | md/md/md/sm | 16/16/16/8 |
| Toolbar gap | sm | 8 |
| Heading → description | 2 (component-internal) | 2 |
| Chip rows/captions | 6/10 (component-internal) | — |

Rule: layout spacing = tokens only; 2/6/10/12 only inside a component's own `.css.ts`.
One change carries it: `viewBody { gap: md }` + remove marginBottom from `card`, `tablePanel`, `statGrid`, `filterBar`.

---

# 9. Receivables Design Plan

Goal: know who owes what and how overdue; record a collection against the right records; verify it.
Hierarchy: (1) Balance, party, due/overdue; (2) status, branch, reference; (3) amount, paid, recorded by, payment history.

Layout
```
ViewSwitch: [Records] [Customers] [Payments]
StatCards (third): Outstanding balance · Overdue balance (negative, caption "n records") · Due in 7 days
TablePanel per view
```
Records toolbar: `[search party][date range][status Open/Partial/Paid/Overdue][Clear] … [Record payment][Record receivable]`.
Default status filter = not paid.

Records table (7 cols): Due date (nowrap; overdue → StatusTag "Overdue" negative instead of status pill; drop red row bg) · Customer (NameCell) · Branch · Balance (right) · Status (StatusTag) · Reference · Action.
Expansion: Record (amount, paid, created, recorded by) · Payments (last 3 allocations w/ status) · Customer (contact/address).
Row actions: Record payment (disabled w/ reason when paid) · View customer (→ Customers view scoped) · Delete (manager; "Deleting this ₱X receivable also removes its payment allocations.").

Customers view (was CustomerLedgerModal): search + Customer · Outstanding · Unpaid records · Last transaction · Action (Record payment, Customer details). Expansion = customer's open records. Customer details = md EntityFormModal; Record payment = same lg allocation modal. No nested modals.

Payments view (was PaymentsPanel): Date · Customer · Amount · Reference · Status (StatusTag, tooltip verifier) · Recorded by (manager) · Action (RowActionMenu: Verify, Reject-with-confirm). Filters date range, status; default Pending.

One payment form: EntityFormModal lg, `intro` context (customer, records, balance), section Payment (date, amount per record prefilled with balance, reference). Merges settle modal + PaymentAllocationModal. From Records row → one line; from Customers row → all open lines.

Interactions: create → page 1 reload; record payment → toast "Payment recorded — pending verification"; verify/reject in Payments view; sort Balance/Due date client-side now, server later.

Data work: `ledger.services.getList` → paged `IPaginationResponse` + `getAll` for `report.hook.ts`; `payment.services.getList` paged; fields/defaults move from page into `receivable.list.hook.ts`; `LedgerManager` replaced by `components/ledger/tables/*`.

Risks: losing "Paid" column (expansion + status covers); default filter hides paid (status select visibly set).
Improvements: 5 → 3 steps to record a collection; balance-first scan; verification above the fold.

---

# 10. Payables Design Plan

Same structure, adapted:
- Goal: what we owe, when due, schedule/approve payments.
- Stats: Outstanding · Overdue · Due in 7 days (primary here, tone warning).
- Views: Records · Suppliers · Payments. Supplier details reuse Master Data supplier form (`partySchema`).
- Table: same with Supplier; default sort due date asc.
- Payments: labels "Pending approval / Approved"; Approve gets a confirm ("Approve payment of ₱X to Supplier?"); Receivables' Verify does not.
- Primary "Record payable"; secondary "Record payment".
Same component family parameterised by scope.

---

# 11. Reports Design Plan

```
ContentView toolbar: ViewSwitch [Daily][Weekly][Monthly][Cash flow][Expenses][Receivables][Payables]
StatCards (third): report-specific, caption = period, icons like Transactions
TablePanel
   toolbar: [date range — custom; presets fill it] … [Export CSV (P2)][Print]
   body: DataTable read-only, no actions, no expansion
   footer: TablePagination (client-side over getAll)
```
- Period becomes a real filter (`useLedgerFilters("reports")`); presets set range, picker stays editable.
- Row/Col → BentoGrid third; icons + captions.
- LedgerReport tags → StatusTag; overdue negative tone; overdue-first order; P2 aging tiles (Current/1–30/31–60/60+) as quarter stats.
- No primary. Print = default button trailing; Export before it.
- Cash-flow Direction → StatusTag positive/negative In/Out.
Differs: no create/actions/expansion/status filter — reading, not encoding.

---

# 12. Branch Monitoring Design Plan

Goal: each branch's cash, sales, expenses, receivables, payables for a period; spot exceptions.

IA decision (recommended): branch CRUD moves to Master Data as a section; `/branches` = monitoring only.
Alternative if kept together: ViewSwitch [Monitoring][Branches], Monitoring first.

```
StatCards (quarter): Total cash balance · Sales (period) · Expenses (period) · Net receivable position
TablePanel
   toolbar: [date range][Clear] … [Print]   ← no primary
   body: Branch · Cash balance · Sales · Expenses · Receivables · Payables · Net (money right)
         expansion: overdue receivables (count/amount) · overdue payables · last transaction · active users
   footer: none (≤20 rows) but still TablePanel
```
- Period caption on every number.
- Remove ColumnLabel header icons.
- Sort cash balance desc; exceptions → StatusTag "Attention" warning in a Flags column, not red rows.
- Clicking branch name sets sider branch scope → Transactions (drill-down without a new screen).

---

# 13. Master Data Design Plan

Goal: keep lookup lists correct.
Layout: ViewSwitch [Suppliers][Customers][Expense categories][Branches]; one TablePanel per view; toolbar `[search][status Active/Archived][Clear] … [Add supplier]`. No stats.
- Customers is new (form exists only in ledger modal today: `CustomerDetailsModal`, `hook/data/party/customer.record.hook.ts`); same treatment as Suppliers with `partySchema`.
- Branches moves in; archive icon = InboxOutlined everywhere; Restore non-danger.
- Tables: Name (NameCell) · 2–3 detail cols · Status (StatusTag Active/Archived) · Action (RowActionMenu: Edit, Archive/Restore, Delete-with-confirm). Address/long text → expansion.
- Forms md, flat fields (already right).
- Keep referential-constraint confirm messages; friendly failure toast when delete refused.
Differs: no stats, no date filter, client-paged (lookups stay unpaged; TablePagination over memory).

---

# 14. Users Design Plan

Goal: approve accounts, keep roles/branch access right, reset passwords.
Layout: no stats; TablePanel toolbar `[search username/name][role][approval Pending/Approved/Rejected][Clear] … [Add user]`; "n pending" StatusTag warning pill next to search when pending > 0.
Table: User (NameCell, username + full name stacked, "You" tag on self) · Role (StatusTag, per-role colour map in `role.enum.ts`) · Branch access (names via `branchName`, "All branches" when empty) · Approval (StatusTag) · Created (nowrap) · Action.
Row actions: Approve (pending; confirm "Approve user X? They can sign in immediately.") · Reject (pending; delete-kind; consequence) · Edit · Reset password · Delete (disabled w/ reason for self; confirm names username).
Forms: Add user md sections Account (username, temp password) + Access (role, branch multiselect); Edit same minus password; Reset sm.
Pending rows sort to top by default.

---

# 15. Consistency Matrix

E = exists · R = reuse exactly · A = adapt · N = new · — = not used

| Pattern | Txn | Purch | Exp | Recv | Pay | Reports | Branch | Master | Users |
|---|---|---|---|---|---|---|---|---|---|
| App header from route | E | E | E | R | R | R | R | R | R |
| Stat bento | E | E | E | R third | R third | A Row/Col→Bento | R quarter | — | — |
| ViewSwitch | — | — | — | N | N | A inline→shared | N/opt | A | — |
| TablePanel shell | E | E | E | A from SectionCard | A | A | A | A | A |
| FilterToolbar + LedgerFilterBar | E | E | E | A +search,overdue | A | A period | A period | A search+status | A search+role+approval |
| Primary CTA trailing | E | E | E | A move | A | — | — | A from card | A from header |
| DataTable + expansion | E | E | E | A add | A | R no expansion | A | A | A |
| RowActionMenu | E | E | E | A from cluster | A | — | A | A | A |
| StatusTag | N adopt | N adopt | N adopt | N | N | N | N | N | N |
| TablePagination footer | E | E | E | A server | A | A client | — | A client | A client |
| EntityFormModal | E | E | E | A sections+intro | A | — | R | R | A sections |
| useConfirm w/ consequence | E | E | E | A add msg | A | — | R | R | A approve/reject |
| History/audit modal | — | E | E | P2 | P2 | — | — | — | — |
| Print / export | — | — | — | P2 statement | P2 | E / N export | N print | — | — |

---

# 16. Responsive Strategy

Breakpoints in use: 1200 / 992 / 768 / 576 / 480 / 420. Keep.

| Range | Stats | Toolbar | Table | Modal |
|---|---|---|---|---|
| ≥1200 | 4 across | one row, primary right | full | as sized |
| 992–1199 | 2×2 | wraps, primary stays right row 1 | full, h-scroll | as sized |
| 768–991 | 2×2 | filters row + actions row (primary full-width right) | manager cols kept; sticky lead (P2) | antd cap, 68dvh |
| <768 | 1 col | search + date stacked; Clear icon-only | Balance/lead first; rest via expansion | grid 1-col; footer buttons full-width |

Order never changes (stats → toolbar → table → pager). Nothing hidden on phones — moves into expansion. ViewSwitch scrolls, never becomes a select.

---

# 17. Accessibility

- Contrast: textMuted on white ≈5.1:1 ✓; on lime th ≈4.6:1 (passes, no margin — darken to `text` if header lightens); amber ≈4.5:1 borderline → tags with text only.
- Not colour-only: every status has a word (StatusTag); money direction has icon/sign; overdue = word, red row removed.
- Targets: icon buttons 32; chevron hit area → 40 on touch; menu items 32.
- Keyboard: lilac focus-visible on ViewSwitch items + interactive StatusTag; Escape collapses expansion.
- Labels: aria-label on all icon-only buttons (Users self-delete missing); dropdown trigger "Actions for {name}".
- Errors: zod under field; failure toast names record.
- Motion: prefers-reduced-motion already honoured.

---

# 18. Token / Component Strategy

- Typography roles in new `styles/common/type.css.ts` (eyebrow, title, value, body, helper, caption).
- `StatusColor` union (`default|positive|negative|warning|info|brand`) for every `*Colors` map in `enums/`; StatusTag maps to tone. (`ledgerStatusColors.open="default"`, `paymentStatusColors.pending="gold"` are antd names today.)
- State vocabulary: loading = skeleton/spinner; empty = "No {things} match the current filters" (filtered) / "No {things} yet — {verb} your first one" (unfiltered); success toast "{Thing} {verb}ed"; error toast names record; disabled = reason in label.
- Ownership: `components/common/status/StatusTag.tsx`, `components/common/filter/SearchInput.tsx`, `components/common/view/ViewSwitch.tsx`; styles `styles/status/status.css.ts`, `styles/filter/filter.css.ts`, `styles/view/common/`.

---

# 19. User Flow Improvements

| Flow | Today | Planned | Steps |
|---|---|---|---|
| Collect one receivable | find row → $ → amount → Record → scroll → Verify | row menu → Record payment (prefilled) → Record; Payments view (Pending) → Verify | 6 → 4 |
| Collect across invoices | Ledger button → modal → search → row → pane → Record → allocation modal | Customers view → search → row menu → allocation modal | 7 → 4 |
| Approve user | unfiltered list → Approve | "n pending" pill → row menu → Approve → confirm | same clicks, no accidental rejects |
| Custom-range report | impossible | Monthly → adjust range → Print | new |
| Branch short on cash | scroll past CRUD → table w/o period | tiles → table w/ period → expand | 3 → 1 |

---

# 20. Implementation Roadmap

Gate each phase: `yarn build` + `yarn lint` clean + user visual check.

Phase 0 — Foundation
1. `viewBody` gap md; remove marginBottom from `card`, `tablePanel`, `statGrid`, `filterBar`.
2. Toolbar control size unified (`middle`); `FormFieldGrid` phone collapse.
3. `StatusTag`, `SearchInput`, `ViewSwitch`; `StatusColor` union in enums; `type.css.ts`.
4. `LedgerFilterBar showSearch/showOverdue`; `search` in `filter.store.ts`.
5. Apply StatusTag to the three reference tables first.

Phase 1 — Receivables & Payables
6. Paged `ledger.services.getList` + `getAll`; paged `payment.services.getList`; `keys/table.keys.ts`.
7. `receivable.list.hook.ts` / `payable.list.hook.ts` / `payment.list.hook.ts` on Transactions shape.
8. `components/ledger/cards/LedgerSummaryCards.tsx`, `tables/LedgerRecordsTable.tsx`, `tables/LedgerPartiesTable.tsx`, `tables/LedgerPaymentsTable.tsx`, `modal/RecordPaymentModal.tsx`. Delete `LedgerManager`, `CustomerLedgerModal`, `CustomerLedgerView`, `PaymentsPanel`.
9. Pages = ContentView + cards + ViewSwitch views.

Phase 2 — Users & Master Data
10. Users: filters in `user.list.hook.ts`; `components/user/tables/UsersTable.tsx`; role colours; approvals via menu + confirm.
11. Master Data: `SuppliersTable`, `CustomersTable` (new), `ExpenseCategoriesTable`, `BranchesTable` (moved); primary → toolbar; search.

Phase 3 — Branch Monitoring
12. `branch.monitor.hook.ts` w/ period; `components/branch/cards/BranchMonitorCards.tsx`, `tables/BranchMonitorTable.tsx`; page thinned; route description updated.

Phase 4 — Reports
13. Period filter; BentoGrid stats; TablePanel; StatusTag; client TablePagination; Export CSV (P2).

Phase 5 — Polish (P2)
14. Sticky lead column, aging tiles, customer statement print, "Add new…" in party selects, active-filter chips.

---

# 21. Priorities

P0 — Receivables/Payables re-composition; Users approvals via menu + confirm, branch names; one CTA slot / one row-action idiom / one status pill; pages thinned.
P1 — TablePanel everywhere, duplicate titles removed, stack rhythm; search on Users/Master Data; Customers section; Branches → Master Data; Reports custom period + bento + tags; Branch Monitoring period + flags − header icons; toolbar size; phone form grid.
P2 — Aging, CSV export, statement print, sticky lead, filter chips, ledger edit-history, "Add new party" in selects.

---

# 22. Final UX Principles

1. One shell, adapted per job.
2. One primary, trailing edge, verb-noun.
3. Decision numbers first; period on every figure.
4. Detail on demand, in place; never a modal from a modal.
5. A status is a word in a pill; red rows retired.
6. Danger is deliberate — useConfirm with a consequence sentence.
7. Disabled explains itself in the label.
8. Lists paged the same way — one footer.
9. Nothing hidden on small screens — it moves into the expansion.
10. Lime decorates, ink decides, green and red mean money.
