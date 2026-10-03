# ROADMAP — Mobile visual audit + Receivables/Payables fixes (branch mobile-app-native-newlook)

> Opened 2026-10-03 after Development v2.34. The PWA roadmap (device test script, P0-6 QA reset,
> merge, deploy) is parked as `.claude/state/ROADMAP-PWA-SUSPENDED.md`; the last phase of this
> roadmap renames it back to `ROADMAP.md`.

## Goal
The phone view (< 768px) of every page looks and behaves like a native app, starting with the
user's Receivables/Payables complaints, found by actually browsing the running app as each role.
`yarn build` + `yarn lint` clean after each phase.

## User request (2026-10-03, verbatim intent)
1. Receivables and Payables on phone: tapping search must not put a search in the header (app
   bar). The search input, when focused, expands; Filter and Sort compress to icon-only (text
   hidden), and Filter and Sort sit beside each other.
2. On the phone view, Print must not be displayed at all.
3. Customer ledger on phone is not paginated: it loads the next page on scroll down.
4. Tapping a customer to see its details is not pleasing for a native mobile view — redesign it.
5. Test visually: sign in with the QA accounts, browse every page and module on the phone view,
   and audit what needs to change specifically.
The user's screenshots did not arrive; the user said to ignore them and browse the phone view
directly. Design reference: `.claude/state/mobile-native-analysis-plan.md`.

## Session protocol (autopilot)
1. Worker reads this file + `.claude/state/autopilot/NEXT_PROMPT.md`, starts `Next` item 1.
   Load `build` (+ `tartar-shadcn` and `shadcn` docs for UI). Decide with `decision-making`.
2. One phase per worker. Every CLAUDE.md convention holds (no comments, no useState, class strings
   in *.styles.ts, tokens only in theme.css, useConfirm, writes through runWrite).
3. Migrations / new business rules / permissions = hard-stop, never decided.
4. Visual check is part of every phase: after `yarn build` + `yarn lint`, run the app
   (`yarn dev`), sign in with the QA account for the role, and screenshot the touched screens at
   phone 390x844 (light + dark) with playwright-core installed in the session scratchpad (never in
   the project; Chrome channel; harness examples in `.claude/state/audit/`, e.g. `drive.mjs`,
   `d10.mjs`). Look at the screenshots. Log "emulated-viewport checked, physical device unconfirmed".
   Screenshots stay in the scratchpad, never committed.
5. Never perform real writes while browsing (no create/edit/delete/approve submits). Open forms
   and sheets, then cancel.
6. QA accounts: admin `qaadmin1@qa.test`, employee `qaemp1@qa.test`, accountant `qaacc1@qa.test`.
   The password is given to the worker in its dispatch prompt; read it from the `QA_PASSWORD` env
   var in scripts and never write it to any file in the repo or state.

## Decisions locked
- L1 Phone = < 768px. Tablet and desktop layouts must not change unless a finding is tablet-only.
- L2 Phone nav stays the sidebar drawer (memory: tartar-phone-nav-sidebar); /admin keeps its tab bar.
- L3 Phone lists load the next server page on scroll; desktop keeps TablePagination (PWA D6).
- L4 Print is hidden on phone everywhere it appears (user item 2).

## Phases
- R0 Visual audit (no source changes).
- R1 Receivables/Payables phone toolbar — user items 1 + 2.
- R2 Customer ledger infinite scroll on phone — user item 3.
- R3 Customer (party) detail native redesign on phone — user item 4.
- R4+ Fix phases written by R0 from its findings.
- RZ Final sweep + hand-back.

## Audit findings (R0, 2026-10-03)
Browsed with playwright-core (scratchpad, writes faked) as qaadmin1 / qaemp1 / qaacc1 at 390x844
light, dark spot-check, 820x1180 spot-check. All 13 main routes + 4 /admin routes: x-overflow 0,
no page or console errors. Role gating as expected (emp: no Reports/Branches/Master Data/Users;
acc: no Vouchers/Branches/Master Data/Users; non-admins land on /transactions).
- F1 all roles, /receivables + /payables (+ /vouchers, same `SearchTrigger`): tapping Search
  swaps the whole app bar for a search field (`SearchTrigger` -> `view.store` `searchMode` ->
  `PhoneShell` `AppBarSearch`). Toolbar row is Search | Filters ........ Sort (Sort pinned far
  right). Fix: on phone the search is inline in the toolbar row — a search pill that expands to
  `flex-1` input on focus/tap while Filters and Sort collapse to 44px icon-only buttons (badge
  kept) sitting side by side; blur with an empty value restores labels. App bar never changes.
  Retire the phone app-bar search mode if no other caller remains. -> R1
- F2 /receivables: after typing a search term the Filters badge shows 1 — the search field is
  counted as an active filter. Fix: the inline search is visible, so it does not count in the
  badge. -> R1
- F3 admin, /receivables Payments section: its Filters pill shows a badge "1" on first load
  with nothing chosen. Fix: find the default-valued field being counted; defaults do not count.
  -> R1
- F4 all roles, Print on phone: Sales / Purchases / Expenses toolbar "Print", Reports "Print
  report", voucher detail footer "Print voucher" + Vouchers row menu "Print voucher", Customer /
  Supplier detail footer "Print statement" + its More menu. Fix (L4): hide every print entry on
  phone (`useIsMobile`), desktop + tablet unchanged. -> R1
- F5 all roles, Customer Ledger / Supplier Ledger sheet (book icon, `CustomerLedgerModal` /
  `SupplierLedgerModal`): party list is paged "1–5 of 6" with the pager half hidden behind the
  sticky footer; footer "Close" duplicates the X. Fix: phone loads the next page on scroll (L3,
  same mechanism as the Records list, which already shows "9 of 9" with no pager); drop the
  Close footer on phone. -> R2
- F6 Customer / Supplier detail (`CustomerLedgerView` / `SupplierLedgerView`): Records list is
  paged "1–5 of 6" inside the sheet. Fix: infinite scroll on phone; Payments list the same when it
  pages. -> R2
- F7 By customer / By supplier tab (`LedgerPartiesTable` cards): tapping the card body does
  nothing; details only via ⋮ -> "Customer details" / "View ledger", and via the book-icon sheet.
  Fix: card tap opens the party detail; ⋮ keeps secondary actions. -> R3
- F8 Customer / Supplier detail on phone: full-height dialog with only "Camille" + X (no grab
  handle, unlike every other detail sheet); balance hero is a bordered card and the stats a second
  bordered card (card in sheet); record cards lead with ₱0.00 (balance) on paid rows while the
  real amount is a small secondary "Amount ₱200,000.00"; every card shows a "—" ref line and a
  selection checkbox; a disabled primary "Select receivables to pay" is always on screen; payment
  cards show "Recorded by —". Fix: native detail — same sheet chrome as the record detail
  (handle, title row), unboxed hero (avatar, name, outstanding balance as the big figure, unpaid
  count + last payment / last transaction as a meta line), Records | Payments segmented switch,
  compact rows (ref or date, due date, status chip, balance with "of <amount>" when partly paid),
  empty "—" lines omitted, payment selection entered from a "Record payment" primary that turns
  on selection (checkboxes only in selection mode). Print hidden (F4). Supplier detail mirrors it.
  -> R3
- F9 Receivable / payable record detail sheet: "Delete receivable" is a half-width tinted danger
  button right-aligned under the full-width primary — unbalanced; "Recorded by —" row shown.
  Fix: follow the Sale detail sheet footer (full-width primary + secondary + ⋮ with Delete
  inside, danger); omit empty audit rows. -> R4
- F10 Filters sheet (phone `FilterPopover`) has no grab handle and a different header than the
  Sort sheet (handle + title + X). Fix: one sheet chrome for both. -> R4
- F11 Half-width stat tiles truncate the caption to one line on phone: "Unpaid records due wit…",
  "Sales less expenses an…", "Deposited, awaiting an…", "Not yet deposited to th…", "Purchases
  with a due d…", "₱30,410.00 pending v…". Fix: two-line clamp on phone half tiles. -> R4
- F12 admin, /master-data: segment label "Categori…" truncated in the 4-way switch. Fix: fit the
  label (shorter segment padding or font step on phone) without renaming the tab. -> R5
- F13 Phone cards print empty fields as "—": Master Data suppliers "Contact number — / Address
  —", Receivables payment cards "Recorded by —", ref "—" lines. Fix: omit an empty field on phone
  cards (desktop tables keep the dash). -> R5
- F14 all roles, /transactions cards: only date, time, type chip and amount — no party or
  description, so rows are hard to tell apart. Fix: add the description / party line the row
  already carries (no new data). -> R5
- F15 admin, / and /admin: "Overdue receivables · 9 accounts" while Receivables says "9 records
  past due" — the count is records, not accounts. Fix: copy says "records". -> R5
- F16 tablet portrait 820, /receivables + /payables: phone cards stretch to the full 788px width
  with amount and chevron far from the name. Fix (tablet-only, L1): two-column card grid on tablet
  portrait for ledger record cards. -> R6
- Checked and fine: dashboard, sales/purchase/expense/voucher detail sheets, record-receivable
  form sheet, sort sheet, Account list, /admin home, payables, receivables, notifications, dark
  mode on receivables and transactions.

## Done
- R0 Visual audit -> findings F1–F16 above (no source changes).
- R1 Receivables/Payables/Vouchers phone toolbar (F1–F4) -> inline toolbar search
  (`SearchInput toolbar`, `data-toolbar-search`/`data-filled`) in `LedgerFilterBar`; CSS variant
  `toolbar-searching` in `styles/common/theme.css` keyed on `[data-filter-toolbar]`
  (`FilterToolbar`) collapses Filters/Sort to 40px icon pills (`filterPillLabel`,
  `filterPillBadge` in `styles/filter/filter.styles.ts`); app-bar search mode retired
  (`AppBarSearch`, `SearchTrigger`, `view.store` searchMode, `useSearchMode`,
  `useAppBarSearchHook`, `ISearchMode` deleted). Badge: `activeFilterCount(filters, defaults)`
  counts only fields differing from the scope default (`defaultFiltersOf` in `filter.store`),
  inline search not counted; Reset restores scope defaults (keeps the inline search). Print hidden
  on phone (`useIsPhone`) in Sales/Purchases/Expenses toolbars, Reports footer, Vouchers row/detail
  action, Customer/Supplier ledger sheet footer. Emulated 390/820/1440 checked.
- R2 Ledger sheets infinite scroll on phone (F5, F6) -> one mechanism in `DataTable`: client-paged
  tables in card mode (`isCompact`) grow their slice by `pageSize` through `LoadMoreSentinel`
  ("n of m") instead of the client `TablePagination`, so the Customer/Supplier ledger party list
  and the party detail Records/Payments lists load on scroll; server-paged ledger tables already
  did. `TablePagination` `visibleOnPhone` prop removed (no caller). `AppModal` sheet on phone
  renders no footer when none is passed (the X closes) — drops the duplicate Close. Visual check
  not run: no QA password in the dispatch; compiled, visuals unconfirmed.
- R3 Customer/Supplier detail native redesign on phone (F7, F8) -> phone (`useIsPhone`) renders
  `components/ledger/views/LedgerPartySheet.tsx` (AppSheet `kind="flow"`: grab handle + title row
  "Customer ledger"/"Supplier ledger", `SheetActions` footer) with an unboxed
  `cards/LedgerPartyHero.tsx` (avatar, name, outstanding as the big figure, "n unpaid · Last
  payment · Last transaction" meta line) and a Records | Payments `ContextSwitch`
  (`ledgerPartyTabOptions` in `enums/ledger.enum.ts`; tab in `ledger.store` `ledgerPartyTab`).
  Phone record cards: ref-or-date title, "date · Due date" subtitle (`utils/ledger.utils.ts`),
  `tables/cells/LedgerAmountCell.tsx` (balance, "of <amount>" when partly paid, amount when paid),
  status chip; no "—" lines. Customer payment selection: footer "Record payment" turns on
  selection mode (`ledgerSelecting`), checkboxes only then, footer becomes "Pay n selected" +
  Cancel; "Customer information" in More. Tablet portrait keeps the old AppModal sheet (L1).
  F7: `LedgerPartiesTable` customer card tap + new "View ledger" item open the detail through
  `useCustomerLedgerHook().openCustomerLedger` (mirrors `openSupplierLedger`). Payment cards'
  "Recorded by —" / ref "—" left to R5 (F13). Visual check not run (no QA password); compiled,
  visuals unconfirmed.
- R4 Sheets and stat tiles polish (F9–F11) -> `components/common/app/SheetActions.tsx`: danger
  actions without a priority join the ⋮ "More actions" menu (after a separator, destructive
  variant) instead of a right-aligned danger button; a danger action with `priority: "secondary"`
  stays a visible destructive button in the row. Reject actions paired with an approve/verify
  primary got `priority: "secondary"` (Sales, Vouchers, Users account + password reset) so they stay
  visible. `sheetActionsDanger` removed. Ledger + payable record detail hide "Recorded by" when
  `created_by` is empty. F10: phone/tablet-portrait `FilterPopover` renders through `AppSheet`
  (grab handle, swipe, same header as Sort), footer Reset | Show results (`filterSheetFooter`).
  F11: `statCaption` clamps to two lines in narrow tiles (`@max-[12rem]/stat:line-clamp-2`).
  Visual check not run (no QA password); compiled, visuals unconfirmed.
- R5 Phone card content (F12–F15) -> F13: `components/common/table/DataTableCards.tsx` drops any
  card field (title/subtitle/amount/status/meta, and the phone detail sheet's card fields) whose
  rendered content is empty or "—", so every phone/tablet-portrait card omits empty fields
  (Suppliers contact/address, payment ref, "Recorded by —"); desktop tables keep the dash.
  F14: `TransactionsTable` adds a compact-only (`useIsCompact`) "Summary" subtitle — customer or
  supplier name, else description — truncated (`dataCardLine` in `styles/table/table.styles.ts`).
  F12: `ContextSwitch` passes `dense` when a segmented switch has 4 options; `contextSwitchItem`
  `dense` = `max-sm:text-xs` + 4px segment padding on phone (`styles/view/view.styles.ts`).
  F15: `toAttentionItem` default noun "account" -> "record" (`utils/attention.utils.ts`); admin
  check items pass "check" (`hook/data/admin/admin.home.hook.ts`). Visual check not run (no QA
  password); compiled, visuals unconfirmed.

- R6 Tablet portrait ledger grid (F16) -> `DataTable`/`DataTableCards` take a `cardGrid` prop; the card list adds `dataCardGrid` (`md:max-lg:portrait:grid-cols-2`, same range as `useDeviceClass` tabletPortrait) in `styles/table/table.styles.ts`, so phone stays one column and desktop keeps the table. Passed by `LedgerRecordsTable`, `PayableRecordsTable`, `LedgerPaymentsTable` (/receivables, /payables). Visual check not run (no QA password); compiled, visuals unconfirmed.

## Next
1. RZ Final sweep: re-run the R0 browse on every route for all three roles at phone + tablet
   portrait, fix small regressions, then rename `ROADMAP-PWA-SUSPENDED.md` back to `ROADMAP.md`
   (delete this file; its record is git history + LOG.md) and hard-stop: the PWA Next item 1 is
   the device test script, which needs the user.

## State
- Last commit: Development v2.42 (R6 tablet portrait ledger grid). Previous: v2.41 (R5), v2.40 (R4), v2.39 (R3), v2.38 (R2), v2.37 (pause), v2.36 (R1), v2.35 (R0). Audit harness lives only in the R0 worker's
  scratchpad (`lib.mjs` login + faked writes, `sweep.mjs`, `ledger.mjs`, `party2.mjs`,
  `detail.mjs`); `.claude/state/audit/d10.mjs` is the committed equivalent to copy from.
