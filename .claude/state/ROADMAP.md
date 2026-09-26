# ROADMAP — Visual UI/UX audit + polish (every page and modal)
Updated: 2026-09-27

## Goal
Every screen and modal is checked visually (desktop + phone, light + dark) with a senior
UI/UX eye for spacing, padding, alignment, hierarchy, overflow, states and practicality, and
every finding is fixed. `yarn build` + `yarn lint` clean after each phase. One phase per
conversation; the user reviews between phases.

## Session protocol
1. New conversation: read this file, `git status --short`, start `Next` item 1. Load `build` +
   `tartar-shadcn` (+ `shadcn` docs for any ui item touched).
2. Do only that phase. Close it: build + lint clean, tick Done with paths, rewrite Next, suggest
   commit (`git log --oneline --grep="^Development v" -1` + 0.1; minor counts past 9), tell the
   user to open a new conversation. Report visual work as **compiled** unless a screenshot
   proves it.
3. After the last phase: delete this file and `.claude/state/audit/`.

## Decisions locked
- Modal header = title only. No description / subtitle line under the title (user, 2026-09-26).
- Audit, then fix in batches by area — never all in one conversation (user, 2026-09-26).
- F17 -> no change. Receivables keeps both "Customer ledger" and "By customer"; no Payables
  counterpart. Intentional (user, 2026-09-26).
- F18 -> no change. No bell on desktop is intentional (user, 2026-09-26).
- F24 -> one Customer field (user, 2026-09-26): remove "Customer name (if not in the list)".
  The Customer control is a combobox that accepts free text; a name that matches no existing
  customer is saved as a NEW customer on submit. Suggestions are fuzzy-matched: word order
  does not matter ("Dela Cruz Juan" == "Juan Dela Cruz"), typos show the nearest customers,
  but only at >= 80% similarity (no weaker matches listed). The Payable form's Supplier field
  works the same way (one combobox, new supplier saved on submit, same fuzzy match). Creation
  goes through the service + runWrite.
- All CLAUDE.md conventions unchanged (no comments, no useState, class strings in *.styles.ts,
  tokens only in theme.css, useConfirm, runWrite, Transactions is the reference).

## User-reported bugs (fix in V1)
1. Modal header shows a description under the title -> remove it; header is the title only.
2. Modal footer buttons overflow the footer (seen in form modals) -> footer must wrap / fit at
   every ModalSize and on the phone sheet; buttons never spill past the rounded edge.
3. Pill tabs (ViewSwitch / StatusFilterTabs): while a list is loading, the selected pill's text
   turns black on the blue fill, then white again -> selected text must stay on-brand white in
   every state (loading, disabled, pending, hover, focus, dark mode).

## Audit harness (drives the real app with the user's Chrome)
- Scripts saved in `.claude/state/audit/` (login.mjs, shot.mjs, public.json). Copy them into the
  session scratchpad, then there: `npm init -y && npm i playwright-core` (scratch only — never in
  the repo). Chrome channel is installed at C:/Program Files/Google/Chrome.
- Dev server: `yarn dev --port 5199 --strictPort` (background). Scripts target localhost:5199.
- Sign-in: `node login.mjs` opens a visible Chrome on /login with a persistent profile
  (`./profile`); the USER signs in (never ask for the password), script exits on redirect.
- Capture: `node shot.mjs <specs.json>` (add `public` as 2nd arg for no-profile public pages).
  Spec = [{name, path, w, h, dark, settle, actions:[{click|hover|press|fill|scroll, wait}]}];
  PNGs land in `./shots/`, console errors are printed. Read each PNG with the Read tool.
- It runs against the LIVE Supabase: open modals and cancel them; never press Save / Approve /
  Reject / Delete / Archive / Record payment.
- Dark = toggles `.dark` on <html>; phone = 390x844; desktop = 1440x900 (+ 1280x800 spot checks).

## Scope (what to capture)
- Routes: / (Dashboard), /transactions, /purchases, /expenses, /vouchers, /receivables,
  /payables (+ ?view=parties), /reports (each report pill), /branches, /master-data (both pills),
  /users; public /login, /register, a 404.
- Modals (keys in src/keys/modal.keys.ts): transactionForm, voucherForm, userCreate, userEdit,
  userReset, branchCreate, branchEdit, branchScopeSearch (top-bar popover), supplierCreate/Edit,
  expenseCategoryCreate/Edit, customerLedger (+ slide to CustomerLedgerView), customerDetails,
  customerInfo, customerPayment (PaymentAllocationModal), ledgerForm, ledgerPayment
  (RecordPaymentModal), disbursementForm, disbursementEdit, disbursementHistory; plus
  ConfirmationModal (open a delete/confirm and cancel), DetailModal, row-expanded panels,
  Filters popover, Sort select, user menu, notifications popover, sidebar collapsed rail,
  phone sheet sidebar.
- States: loading skeleton, empty, error (offline devtools / bad filter), refreshing, long
  names / big money values, validation errors in forms.

## Audit checklist (senior UI/UX lens)
Spacing rhythm (4/8 scale, equal gutters, card padding vs table padding), alignment (numbers
right, headers aligned with cells, icon/text baselines), hierarchy (one h1, title sizes,
muted text contrast), overflow/wrapping (long names, money, footers, toolbars at 1280 and
390), touch targets >= 40px on phone, focus rings visible, dark-mode contrast and borders,
consistent pill/button heights, empty/loading/error parity, modal width per ModalSize,
scroll containment (only the content card scrolls), sticky headers, redundant labels,
practical flow (primary action placement, destructive actions separated).

## Path map
- Modals: src/components/common/modal/{AppModal,ConfirmationModal,DetailModal}.tsx ;
  src/components/common/form/EntityFormModal.tsx (subtitle prop) ; styles/modal/modal.styles.ts
  (modalHeaderRuled, modalFooter, modalActionSize, drawerHeaderRuled, drawerFooter,
  confirmFooter) ; ModalSize in models/common/view.model.ts
- Pills: src/components/common/view/ViewSwitch.tsx, common/filter/StatusFilterTabs.tsx ;
  styles/view/view.styles.ts (viewSwitchItem) ; consumers components/*/menus/*StatusTabs.tsx,
  ledger/menus/LedgerViewTabs.tsx
- Shell: src/layouts/ProtectedLayout.tsx ; components/common/layout/* ; styles/layout/*.styles.ts
- Content view: components/common/view/{ContentView,BentoGrid,BentoCell,SectionHeading,
  PageSkeleton}.tsx ; styles/view/view.styles.ts
- Table / filters: components/common/table/*, components/common/filter/* ;
  styles/{table,filter}/*.styles.ts
- Cards / status: components/common/card/{SectionCard,StatCard,InfoCard}.tsx,
  components/common/status/* ; styles/{card,stat,status}/*.styles.ts
- Tokens: src/styles/common/theme.css ; tones styles/common/tone.styles.ts
- Screens: components/<domain>/{tables,cards,menus,modal,views}/ ; pages/<Area>/<Area>View.tsx

## Done
- [x] Harness built + verified: public pages captured headless via Chrome channel (login,
  register, phone, errors, 404) — screenshots were in the old scratchpad, recapture in V2.
- [x] V1 — user bugs (compiled, not screenshot-verified): subtitle prop removed from AppModal /
  EntityFormModal / DetailModal and all callers; identity subtitles folded into titles
  (CustomerInfoModal, PaymentAllocationModal, UsersTable reset, DisbursementHistoryModal).
  modal.styles modalFooter flex-wrap, confirmFooter sm:flex-wrap. view.styles viewSwitchItem
  pins on-brand text on selected hover/focus/dark (root cause: toggle hover:text-foreground).
  V2 capture must confirm all three.

- [x] V2 — capture + findings (2026-09-26): 36 route shots (desktop light/dark/phone) + 36
  modal/popover/menu shots, all read. V1 confirmed visually: modal header title-only ✓, footer
  fits at 1440/1280/phone ✓, selected pill text white at rest ✓ (loading-state flash not
  capturable statically — user to confirm). Findings below. Specs saved in
  .claude/state/audit/{routes,modals}.json (selectors `text=<button label>`, `tbody tr:first-child td:last-child
  button` for row action, `td:first-child button` for expand, `[role=menuitem]:has-text('Edit')`).

- [x] V3 — tokens + dark mode (compiled, not screenshot-verified): F1 theme.css danger /
  danger-bg / danger-border moved into :root/.dark vars (dark = #f87171 + rgba soft fills),
  exposed via @theme inline; table.styles dataTableRowOverdue -> bg-danger-bg. positive/warning
  already use /10 alpha fills (fine in dark). F2 root cause: SelectContent/ComboboxContent
  descendant rule `data-focused:bg-foreground/10` outranked item `data-selected:bg-primary`;
  scoped to `not-data-selected` in ui/select.tsx + ui/combobox.tsx. F3 modal.styles
  confirmAction cva (solid destructive for delete), ConfirmationModal defaults
  Confirm/Delete + Cancel. F4 public.styles errorCard border removed (Empty adds border-dashed).
- [x] V4 — tables + row UI (compiled, not screenshot-verified, 2026-09-27): F5 root cause =
  ui TableCell whitespace-nowrap on every cell -> dataTableCell whitespace-normal (nowrapCell
  columns still win); Vouchers "Created" stacked date/time. F6 new
  components/user/table/cells/UserCell.tsx (muted "—" when no user) in Transactions/Purchases/
  Expenses. F7/F8 RowActionMenu always a kebab menu (w-auto min-w-48, nowrap items, separator
  before first danger item, IRowAction.hint -> DropdownMenuShortcut); locked/disabled labels
  shortened to label + hint ("Locked", "Nothing unpaid", "Needs approval"); CustomerLedgerModal
  id-card button -> RowActionMenu. F9 rowDetail* = 8rem label grid, values left, auto-fill
  sections; dropped duplicate fields (Tx Time + Recorded-by section; disbursement Recorded-by
  section -> "Recorded at", Printed; ledger Amount/Paid). F10 TablePagination = range left,
  prev/pages/next/size right. F11 no code divergence found (both scopes share
  LedgerPartiesTable, align right) — nowrap added on CustomerLedgerModal Outstanding; re-check
  in capture. F12 branch voucher prefix -> StatusTag like category codes.

## Findings (desktop; mobile deferred by user)

### V3 — tokens + dark mode
- F1 high · all dark pages: `--color-danger-bg`/`--color-danger-border` (theme.css:165-166) have
  no dark value -> Overdue/Expense chips, danger StatCard icon tiles (Cash Out, Net Cash Flow,
  Today's Expenses, Overdue balance) and the confirm-delete badge render WHITE in dark; overdue
  row tint (`dataTableRowOverdue`) nearly invisible in dark. Fix: dark overrides for the danger
  soft tokens (and audit positive/warning soft fills the same way).
- F2 high · Sort select (all pages): selected option = pale text on brand-soft fill, unreadable
  ("Newest first" in m-tx-sort). Fix: selected item text = foreground/brand, not on-brand.
- F3 med · ConfirmationModal delete: primary is a soft-red "Yes" beside "No" — low emphasis and
  vague. Fix: solid danger button; default okText "Delete"/"Confirm", cancelText "Cancel".
- F4 low · 404 / error card has a dashed border; should be the plain panel surface.

### V4 — tables + row UI
- F5 high · Vouchers table overflows at 1440: "Created" clipped mid-datetime, no Status/Action
  column visible. Payables Records: "Reference" clipped ("Refe"). Fix: tighten column set /
  truncate Branch, keep all columns inside the card at 1280+.
- F6 med · "Recorded by" empty person renders an avatar with "—" plus a two-line "—/—". Fix:
  AvatarCell with no person -> single muted "—".
- F7 med · Row actions inconsistent: Transactions = bare red trash button per row; others =
  RowActionMenu kebab; Payables by-supplier = unlabeled "$" icon; Customer ledger = id-card
  icon. Fix: RowActionMenu everywhere (destructive item last, separated).
- F8 med · RowActionMenu too narrow: "Archive branch", "Reset password", "Locked — voucher
  approved or printed" wrap to 2-4 lines. Fix: min-width + nowrap; locked state = disabled
  "Edit" with a short hint, not a 4-line item. Add separator before destructive items.
- F9 med · Expanded row panels: label left / value flush far right across a wide column (values
  detached); redundant "Recorded by: Recorded by"; duplicates visible columns (Time);
  Receivables panel is one half-width section. Fix: compact label/value grid, values next to
  labels, drop fields already shown in the row.
- F10 low · Pager: prev at far left, page pills centred, range+size+next far right. Fix: group
  controls right (or range left, controls right).
- F11 low · Receivables "By customer": Outstanding money left-aligned under header (Payables
  by-supplier right-aligns). Money right-aligned everywhere.
- F12 low · Type/voucher-code tags: Branches prefix plain text vs categories code chip. Pick one.

### V5 — page composition + filters
- F13 med · Branches, Master Data, Users: primary action sits alone in a row under a redundant
  section heading ("Branches", "Suppliers", "Expense Categories"), not in ContentView `actions`.
  Fix: title-row action like Transactions; drop the heading that repeats the title/pill.
- F14 med · Filters popover header: "Filters" centred with "Reset" stacked under it; fields have
  no labels. Fix: header row (title left, Reset right); labelled fields.
- F15 med · Dashboard: date "Sep 26, 2026" sits alone on a right-aligned row, leaving a gap under
  the h1. Fix: date in the title row (`meta`/actions).
- F16 low · Reports: StatCards have no icons (every other page has); "Print report" styled as
  one of the 7 pills — separate it as the action.
- F17 low · Receivables has a "Customer ledger" button; Payables has no counterpart; Customer
  ledger modal duplicates the "By customer" view. Question for user: keep both?
- F18 low · Desktop top bar has no notifications bell (phone shows one with badge 10).
  Question: intentional (dashboard alerts cover it)?
- F19 low · Vouchers page has no StatCards while Purchases/Expenses do (consistency; optional).

### V6 — modals + forms
- F20 med · Record payment (ledger): per-record labels are "· due Jul 22… · balance …" (leading
  "·" when no reference), amounts prefilled raw ("60000"). Fix: label = ref or "Record n",
  formatted amounts, balance as hint.
- F21 med · Empty selects / multi-selects show no placeholder (Cash account, Customer, Supplier,
  Branch access looks like a text input). Fix: "Select …" placeholders in FormField.
- F22 low · Required markers missing on Manual voucher, Branch, Supplier, Category, User forms
  while transaction forms have them. Fix: mark from the zod schema consistently.
- F23 low · Number inputs show native spinners (Amount). Hide them.
- F24 low · Receivable/Payable form: "Customer" select + "Customer name (if not in the list)"
  text — two fields for one thing. Question: combobox allowing a new name?
- F25 low · Purchase "Paid from" select shows a clear ✕ instead of the chevron other selects use.

### V7 — dashboard charts
- F26 med · Sales Overview x-axis: raw "08-29 08-31" labels crowd/overlap; use formatted short
  dates with tick thinning.
- F27 low · Cash Flow donut: legend shows a blue "Net Cash Flow" dot with no blue arc.
- F28 low · Chart cards unequal height (Sales Overview shorter than Cash Flow) — align.

### Mobile — deferred (user: separate roadmap after desktop)
- M1 critical · `ProtectedSider` `collapsible="none"` -> sidebar always inline at 390px, content
  column ~100px wide on every page. Needs offcanvas sheet on mobile.
- M2 · Phone form sheet footer stacks full-width (ok); amount spinners visible (F23).

### Not captured (cover during fix batches)
Disbursement modals, customer info/payment modals, supplier/category edit, DetailModal,
loading/error states, long-name/large-money stress, validation errors (never press Save live).

## Next

1. **V5 — page composition + filters** (F13-F16, F19; F17/F18 decided: no change). Optionally
   first a capture of V3 + V4 (dark chips, row menus, expanded rows, pager, Vouchers at 1440,
   Receivables "By customer" Outstanding alignment).
2. **V6 — modals + forms** (F20-F25; F24 decided, see Decisions locked).
3. **V7 — dashboard charts** (F26-F28).
Order may be changed by the user. Mobile (M*) goes to a new roadmap after V7.

## Open
- Migration 20260926000009_accountant_voucher_read.sql (and possibly 20260718000004..
  20260722000008) not yet applied to Supabase — accountant voucher views stay empty until then.

## State
Branch: development-overhaul · Uncommitted: V4 src changes + .claude/state · Last check:
yarn build + yarn lint clean (after V4).
