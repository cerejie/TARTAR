# ROADMAP — Visual fixes (visual dry run 2026-10-03)
Updated: 2026-10-03

The previous roadmap (Audit fixes, F1–F9 + SEC-01/SEC-02) is archived as
`.claude/state/ROADMAP-AUDIT-2026-10-03-DONE.md`. The Native-feel mobile PWA roadmap stays parked as
`.claude/state/ROADMAP-PWA-SUSPENDED.md`. When this roadmap finishes, delete this file and rename that one back.

## Goal
Fix every finding of `.claude/state/AUDIT-VISUAL-2026-10-03.md` (UI-01 … UI-17), one phase per shared primitive
or screen group, ordered by severity, `yarn build` + `yarn lint` clean after each, each phase confirmed by
re-sweeping the surfaces it touched and looking at the shots. No finding needs a migration or a new business
rule; the hard-stop items at the end are carried over from the archived roadmap.

## Session protocol
1. Read this file, `git status --short`, start `Next` item 1. Load `build` (+ `tartar-shadcn` and `shadcn` docs
   for UI). Read only the audit sections the phase cites (by finding ID) — never the whole audit.
2. One phase per conversation / worker. Under autopilot, decide the file plan with `decision-making` and do not
   wait for a go; otherwise present the plan and wait.
3. No migrations, no Edge Function deploys, no new business rules. A phase that turns out to need one
   hard-stops.
4. Close a phase: build + lint clean, then the visual check below, tick Done with paths, rewrite Next, update
   State, commit as `Development v<X.Y>` (`git log --oneline --grep="^Development v" -1` + 0.1).
5. Visual check (every phase): the dev server must answer on http://localhost:5199 (if not:
   `yarn dev --port 5199 --strictPort` in the background). Run
   `PW=C:/Users/CER/AppData/Local/Temp/tartar-pw/node_modules/playwright-core/index.mjs OUT=C:/Users/CER/AppData/Local/Temp/tartar-sweep-<phase> SWEEP_PASSWORD=admin12345 ROLES=<roles> DEVICES=<devices> node .claude/skills/deep-critique/scripts/sweep.mjs .claude/state/audit/sweep.config.json`
   (if playwright-core is missing: `npm i playwright-core` inside `C:/Users/CER/AppData/Local/Temp/tartar-pw`,
   never in the project). Open every contact sheet of the run whose captions match the phase's routes, plus
   the full-size shots of the surfaces the phase fixed. Log "looked: <sheets>, <result>" in Done. Writes are
   faked by the sweep — toasts like "changed nothing" are harness artifacts. A shot that still shows the
   defect means the phase is not done.
6. Visuals beyond the sweep (real device, safe areas, keyboard) stay unconfirmed: log "swept, device unconfirmed".

## Decisions locked
Taken by Claude on 2026-10-03, standing in for the user — not given by the user. Any of them may be overturned.
- Empty detail values are hidden, not dashed; "—" stays only in table cells, where columns must align.
- An unresolved user id hides the "Recorded by" row (no "Former user" label) until the user decides otherwise.
- Edit history formats values with the existing formatters and label maps; no new audit columns.
- The scrolling-chip clip on phones is the `ContextSwitch` design (memory: mobile design decisions 2026-10) — not
  changed.
- L1 Every CLAUDE.md convention holds (no comments, no useState, class strings in *.styles.ts, tokens only in
  theme.css, useConfirm, writes through runWrite, Transactions is the reference).

## Phases
- V1 Detail placeholders (UI-01, UI-17; High): `components/common/app/DetailRows.tsx` hides a row whose rendered
  value is empty or the placeholder; `utils/detail.utils.ts` (`visibleDetailItems` / `visibleDetailSections`) is
  the place for the rule; `hook/data/user/user.list.hook.ts:34` stops returning "—" for an unresolved id (add a
  nullable variant for detail rows, keep table cells aligned); drop the redundant `|| "—"` fallbacks in detail
  `render`s (`components/sale/tables/SalesTable.tsx:239-272`, transaction / purchase / expense / voucher /
  ledger tables, `components/admin/receivables/ReceivableEntryDetail.tsx`,
  `components/admin/payables/PayableEntryDetail.tsx`). Re-sweep: ROLES=admin,emp DEVICES=phone; look at
  `/sales`, `/transactions`, `/purchases`, `/expenses`, `/vouchers`, `/receivables`, `/payables`,
  `/admin/receivables` sheets.
- V2 Edit history (UI-02; High): `components/disbursement/modal/DisbursementHistoryModal.tsx:43-70` — per-field
  label + formatter map (status label maps, `*_at` → `formatDateTime`, `*_date` → `formatDate`, `*_by` →
  user name, amounts → `formatMoney`, unknown → humanised name + raw value), "Set to X" for a null old value, no
  `code` styling; map lives in `utils/` with a unit test beside the other `*.test.ts`. Re-sweep: ROLES=admin,acc
  DEVICES=desk; look at every `menu-item-*-edit-history` shot on `/sales`, `/purchases`, `/expenses`.
- V3 Action groups (UI-03, UI-10, UI-11, UI-12; Medium): `components/common/app/SheetActions.tsx` +
  `styles/app/app.styles.ts:156-160` — overflow-only and danger-only footers render a full-width button (no lone
  ⋮); a disabled-only action is not rendered as a footer button; `components/common/table/RowActionMenu.tsx`
  hides ⋮ when every action is disabled; account Password / Notifications sheets pin their action in the sheet
  footer (`components/account/modal/AccountPanelSheet.tsx`, `components/account/views/*`). Re-sweep: ROLES=admin,emp
  DEVICES=phone,desk; look at `/sales` (Verified), `/transactions`, `/expenses` + `/purchases` (Approved),
  `/payables` (Paid), `/account`.
- V4 Date labels (UI-04, UI-08, UI-13; Medium): receivable / payable cards and sheets say "Due <date>"
  (`components/ledger/tables/LedgerRecordsTable.tsx:119-120`, `PayableRecordsTable.tsx:83-84`, the reports
  receivables table, `components/common/table/DataTableCards.tsx` / `RecordDetailSheet.tsx` if the subtitle role
  needs a label); `PurchasesTable.tsx:59-64` hides the due-date meta when there is no date; deposited / reviewed
  values keep date and time together (`SalesTable.tsx:239-256`). Re-sweep: ROLES=admin,emp DEVICES=phone; look at
  `/receivables`, `/payables`, `/purchases`, `/reports` (Receivables), `/sales` (Verified).
- V5 Admin app (UI-05, UI-09; Medium): the `/admin` rail item and active indicator
  (`components/common/layout/AppTabBar.tsx` + its styles under `styles/layout/`) — indicator clears the label,
  label fits the item; `components/admin/receivables/ReceivableEntryDetail.tsx:27` shows the branch name.
  Re-sweep: ROLES=admin DEVICES=phone,tabP,tabL,desk; look at every `/admin/*` shot, zoom the rail.
- V6 Reports (UI-06, UI-07; Medium): `components/report/*` title row — the period stays on one line outside the
  h1 column and the tab strip shows every tab (or scrolls) at 1180 and 1440; Branch Summary card shows Sales,
  Expenses and Purchases so it adds up to Net (`BranchSummaryReport.tsx:21-25`, `DataTableCards.tsx:50,188`).
  Re-sweep: ROLES=admin DEVICES=phone,tabL,desk; add `"settle": 4000` to the `/reports` route in
  `.claude/state/audit/sweep.config.json` so Weekly / Monthly / Cash Flow are not captured as skeletons.
- V7 Ledger modals (UI-14, UI-15, UI-16; Low): record-payment allocation rows labelled
  (`components/ledger/modal/RecordPaymentModal.tsx`), "Not filled" → "No contact details"
  (`components/ledger/CustomerInfoTag.tsx:12`), customer ledger modal columns fit / empty "Created by" column
  dropped (`components/ledger/CustomerLedgerView.tsx`, `ModalSize`). Re-sweep: ROLES=admin DEVICES=desk,phone;
  look at `/receivables` toolbar-Customer ledger, menu-item record-payment, By customer.
- V8 Full re-sweep: every role and device, no ROLES / DEVICES filter, `OUT=C:/Users/CER/AppData/Local/Temp/tartar-sweep-final`.
  Open every contact sheet (viewed = total), keep a per-sheet log in Done, confirm UI-01 … UI-17 are gone and
  nothing regressed; record surfaces captured / failed / sheets viewed. A new defect found here becomes a new
  phase before this one, not a silent fix.
- V9 Offline shows the last loaded data (OFF-01; High — reported by the user from an iPhone on 2026-10-03, with
  screenshots): offline, Sales shows a grid of "You're offline — This was not saved for offline use" cards under an
  "Offline — this page was not saved for offline" banner, and Vouchers shows the same error state. The user's
  requirement: **when offline, every page must show all its data from the cache — the latest data from when the
  device was online — never a "not saved for offline" state for a page that has been loaded or primed.** Find the
  root cause first (do not patch the message): `src/store/common/query.store.ts` (which keys are written to
  IndexedDB, the 120-entry / 30-day trim, the fetcher-forget rule from F2, what a key miss does offline),
  `src/hook/app/prime.hook.ts` (which lists are primed while online — today lookups only?),
  `src/hook/common/query.hook.ts`, `src/utils/idb.utils.ts`, and the list hooks' keys (pagination, sort, status tab
  and branch scope all sit in the key, so the offline key may simply differ from the one cached). Expected shape of
  the fix: while online, prime the default view of every list and stat query a role can open (first page, default
  sort, each status tab, the active branch scope), keep them in IndexedDB through the trim, and offline fall back to
  the newest cached variant of the same list when the exact key is missing; stat cards read their cached values
  too. The offline write queue (`store/common/sync.store.ts`, `utils/write.utils.ts`) must not regress. No
  migration. Verify with a Playwright probe in the scratch folder (not the sweep): sign in online, let prime finish,
  `context.setOffline(true)`, navigate in-app (sidebar links, no reload) to every route as admin, emp and acc on
  phone, screenshot each and look — no "not saved for offline", rows and stat cards present; include a page never
  opened online in that session. Add unit tests for any new pure key / fallback helper. Log "probed offline in dev,
  installed-PWA cold start unconfirmed" — a reload offline needs the production service worker.
- V10 Sweep leftovers (UI-18 … UI-21; Low — found by V8): UI-18 regression from V5 — at 820 the `/admin/receivables`
  and `/admin/payables` master list truncates "QA Custome…" / "RCV-QAT-26…" because the wider rail took 16 px
  (`src/styles/app/app.bar.styles.ts`, the admin master-detail grid) — give the list column its width back; UI-19
  `/admin` Home on phone, Weekly / Monthly: stat tile hint cut mid-word ("+₱4,500.00 new this w…") — let the hint
  wrap or shorten it (`components/admin/*` home stats, `StatCard`); UI-20 Supplier Ledger picker cards on phone
  have an empty second row holding only the chevron (the supplier picker / `LedgerPartiesTable.tsx`) — match the
  customer picker's card; UI-21 `/admin/receivables` and `/admin/payables`: after switching to a tab with no rows
  the detail pane keeps the previously selected record — clear the selection when it is not in the visible list
  (`hook/data/admin/admin.{receivables,payables}.hook.ts`). Re-sweep: ROLES=admin DEVICES=phone,tabP,desk on
  `/admin`, `/admin/receivables`, `/admin/payables`, `/payables` (a temporary config copy with only those routes is
  fine); look at the shots.

## Path map
- detail rows: src/components/common/app/{DetailRows,SheetActions}.tsx · src/components/common/table/
  {RecordDetailSheet,RecordDetailSection,DataTableCards,RowActionMenu}.tsx · src/utils/detail.utils.ts ·
  src/models/common/detail.model.ts · src/styles/app/app.styles.ts
- user names: src/hook/data/user/user.list.hook.ts
- history: src/components/disbursement/modal/DisbursementHistoryModal.tsx
- ledger: src/components/ledger/{tables,modal}/* · src/components/ledger/{CustomerLedgerView,CustomerInfoTag}.tsx
- admin app: src/components/common/layout/{AppTabBar,AdminAppBar}.tsx · src/components/admin/**
- reports: src/components/report/* · src/utils/report.utils.ts
- sweep: .claude/skills/deep-critique/scripts/sweep.mjs · .claude/state/audit/sweep.config.json
- audit: .claude/state/AUDIT-VISUAL-2026-10-03.md

## Done
- [x] Visual audit written 2026-10-03: `.claude/state/AUDIT-VISUAL-2026-10-03.md` — 1,221 surfaces, 0 failed,
  183 / 183 contact sheets viewed; sweep script fixed (main page no longer closed, sheets inline their shots,
  tabs clicked by index after scroll-into-view).
- [x] V1 Detail placeholders (UI-01, UI-17) → Development v2.57: `src/utils/detail.utils.ts` (`isEmptyDetailValue`,
  `joinDetailParts`; `visibleDetailItems` drops a row whose rendered value is null / "" / "—", so empty sections
  drop too) + `src/utils/detail.utils.test.ts`; "—" fallbacks removed from detail renders in
  `components/{sale,transaction,purchase,expense,voucher}/tables/*Table.tsx`, `components/ledger/{Customer,Supplier}LedgerView.tsx`,
  `components/admin/{receivables/ReceivableEntryDetail,payables/PayableEntryDetail}.tsx`; sale deposited / reviewed
  rows and the payment verified hint join only known parts (`hook/data/payment/payment.list.hook.ts`);
  `LedgerPaymentsTable.tsx` drops the "Recorded by" column when no row on the page resolves a recorder (UI-17).
  `userNameOf` keeps "—" for table cells (the shared rule hides it in detail rows). Build + lint clean, tests 99 / 99.
  Swept admin phone (231 surfaces; run hit the 10-min background cap before contact sheets, so full-size shots
  read instead) + emp phone (175 / 0 failed, 22 sheets). Looked: emp sheets 03 (/sales), 09 (/expenses), 13
  (/receivables); admin full shots receivables-card-unpaid-0, sales-card-all-0, sales-card-deposited-0,
  transactions-card-all-0, admin-receivables-toolbar-qa-customer-a — no "—" row, undeposited sale has no deposit
  section, no "Recorded by —", admin receivable has no Contact rows. UI-17 desk table not swept (phone-only
  phase): compiled, desk visual unconfirmed. Swept, device unconfirmed.
- [x] V2 Edit history (UI-02) → Development v2.58: `src/utils/audit.utils.ts` (`auditFieldLabel`, `formatAuditValue`,
  `describeAuditChange`, `auditChangeLines`) + `src/utils/audit.utils.test.ts`; `IAuditChangeLine` in
  `models/data/transaction/transaction.response.ts`; `components/disbursement/modal/DisbursementHistoryModal.tsx`
  renders "<Label>: <summary>" ("Set to X", "Cleared (was X)", "X → Y", "Changed" for unresolvable `*_id`);
  `styles/disbursement/disbursement.styles.ts` `auditField` is plain medium text (no code chip). Build + lint clean,
  tests 106 / 106. Swept admin + acc desk (385 surfaces, 0 failed, 65 sheets). Looked: acc sheet 04 (/sales
  undeposited + deposited edit history), full shots admin sales verified, acc sales rejected, acc purchases approved,
  admin expenses approved edit history — labels, formatted dates, user names, no UUID / ISO / "—"; seeded expenses and
  purchases have no edits ("No edits recorded."), same component. Swept, device unconfirmed (phone not swept).
- [x] V3 Action groups (UI-03, UI-10, UI-11, UI-12) → Development v2.59: `src/components/common/app/SheetActions.tsx` —
  disabled primary / secondary actions drop to the ⋮ menu (still shown there with their hint, e.g. "Edit expense ·
  Locked"); with no enabled primary or secondary, the first enabled overflow action leads as a full-width outline
  (or destructive) button and ⋮ trails only when more remain; `src/utils/action.utils.ts` (`hasEnabledAction`) hides
  ⋮ in `components/common/table/RowActionMenu.tsx` and the footer in `RecordDetailSheet.tsx` /
  `components/ledger/views/LedgerPartySheet.tsx` when every action is disabled. Account sheets pin their action in
  the footer: `components/account/modal/{ChangePasswordSheet,NotificationsSheet}.tsx` (password submit button
  linked by `changePasswordFormId`), `AccountPanelSheet.tsx` takes `footer`, fields shared through
  `components/account/forms/ChangePasswordFields.tsx`, toggle through `components/account/views/NotificationsToggle.tsx`;
  `pushModeNotes` moved to `models/common/push.model.ts`, `usePushNotifications` returns `note` / `canToggle`.
  Build + lint clean. Swept admin + emp phone + desk (829 surfaces, 0 failed, 124 sheets). Looked: emp phone sheet 03
  (/sales), full shots admin + emp phone sales verified (full-width "Edit history", no lone ⋮), admin phone
  transactions (full-width "Delete transaction"), admin phone expenses approved + menu (Open voucher + ⋮, Edit
  expense · Locked in the menu), admin desk payables Paid (no ⋮ on paid rows), admin phone account password +
  notifications (full-width footer button). Swept, device unconfirmed.
- [x] V4 Date labels (UI-04, UI-08, UI-13) → Development v2.60: `IDataTableColumn.cardPrefix` (`models/common/table.model.ts`)
  prefixes a card / sheet-hero field in `components/common/table/DataTableCards.tsx`; "Due" on the due-date subtitle in
  `components/ledger/tables/{LedgerRecordsTable,PayableRecordsTable}.tsx` and `components/report/LedgerReport.tsx`
  (name is now the card title, due date the subtitle); desktop cells unchanged. `PurchasesTable.tsx` `dueDateLabelOf`
  returns "—" (dropped from cards) instead of Pending / Paid / Rejected. `utils/detail.utils.ts` `keepTogether` (NBSP)
  keeps the deposited / reviewed date-time on one line in `SalesTable.tsx`; test in `detail.utils.test.ts`. Build + lint
  clean, tests 107 / 107. Swept admin + emp phone (393 surfaces, 0 failed, 50 sheets). Looked: emp sheet 13
  (/receivables), full shots admin receivables overdue sheet, emp payables page, admin reports Receivables, admin
  purchases All + Approved, emp sales verified sheet — "Due Sep 30, 2026" on cards and sheets, no status under "Due
  date" on purchases, deposited / reviewed time on one line. Swept, device unconfirmed.

- [x] V5 Admin app (UI-05, UI-09) → Development v2.61: `src/styles/app/app.bar.styles.ts` — the rail is `md:w-28`, the
  active indicator sits on the rail's outer edge (`md:-left-2`) instead of the item's, and `appTabLabel`
  (`max-w-full truncate`) keeps a long label inside the item (`components/common/layout/AppTabBar.tsx` wraps the label
  in it). Branch name instead of slug in the admin sheets: `hook/data/admin/admin.{receivables,payables}.hook.ts`
  return `branchLabel` from `useBranchListHook().branchName`, threaded through
  `components/admin/receivables/{AdminReceivablesOverview,ReceivableEntrySheet,ReceivableEntryDetail}.tsx` and
  `components/admin/payables/{AdminPayablesOverview,PayableEntrySheet,PayableEntryDetail}.tsx` (same slug defect,
  fixed alongside). Build + lint clean. Swept admin phone + tabP + tabL + desk (523 surfaces, 0 failed, 79 sheets).
  Looked: sheets admin-tabP-02, admin-tabL-02, admin-phone-26, admin-desk-31; rail zoomed 2.4x on all four `/admin/*`
  pages at tabP, tabL and desk — indicator at the rail edge, clear of "Notifications" / "Receivables" / "Payables",
  labels inside the item; full shots admin phone + desk receivables sheet — "Branch QA Test". Measured: indicator
  x 17–21, item 24–120, widest label 74 px. The sweep opens no admin payable sheet: its branch row is compiled,
  visual unconfirmed. Swept, device unconfirmed.

- [x] V6 Reports (UI-06, UI-07) → Development v2.62: `src/components/common/view/ContentView.tsx` renders `meta` as a
  sibling of the h1 instead of inside the tabs / actions group, and `viewMeta` (`styles/view/view.styles.ts`) is
  `shrink-0 whitespace-nowrap` — the period stays on one line at the right of the title and the tab strip gets the
  whole second row (Dashboard's date is unchanged). `cardMetaLimit` prop on `components/common/table/{DataTable,DataTableCards}.tsx`
  (default 2), passed through `components/report/tables/ReportRowsTable.tsx`; `BranchSummaryReport.tsx` sets it to 3 so
  the phone card shows Sales, Expenses and Purchases under Net (and no longer opens a detail sheet for one hidden
  field). `sweep.config.json` `/reports` has `"settle": 4000`. Build + lint clean, tests 107 / 107. Swept admin
  phone + tabL + desk, `/reports` only (30 surfaces, 0 failed, 6 sheets). Looked: sheets admin-desk-01, admin-desk-02,
  admin-phone-01, admin-tabL-01, full shot admin desk Weekly — desk 1440: period one line top-right, all eight tabs
  visible before Print; tabL 1180: tabs on their own row, the strip scrolls under Print (last chip partly hidden —
  the locked scrolling-chip design); phone card: Sales ₱4,475.00, Expenses ₱9,149.00, Purchases ₱10,384.28, Net
  −₱15,058.28. `settle` only delays the route load: desk Weekly / Monthly and phone Daily / Weekly tab shots are still
  skeleton or blank captures (harness timing; Daily, Cash Flow, Receivables and phone Monthly rendered). Swept,
  device unconfirmed.

- [x] V7 Ledger modals (UI-14, UI-15, UI-16) → Development v2.63: `src/hook/data/ledger/ledger.list.hook.ts`
  `paymentRowLabel` labels each allocation field "<Receivable | Payable> <reference> · Amount to apply" (falls back to
  the row number when there is no reference); `components/ledger/CustomerInfoTag.tsx` "Not filled" → "No contact
  details"; `components/ledger/{CustomerLedgerView,SupplierLedgerView}.tsx` — Date / Due date / Reference cells are
  `nowrapCell` (fixed 120 px widths dropped) and "Created by" is only a column when a row on the page resolves a creator
  (same rule as `LedgerPaymentsTable`), so the table fits `ModalSize` xl without widening. Harness:
  `.claude/skills/deep-critique/scripts/sweep.mjs` waits `route.settle ?? 1500` after a tab click, so V8 captures loaded
  Reports tabs. Build + lint clean. Swept admin desk + phone, `/receivables` + `/payables` (120 surfaces, 0 failed, 19
  sheets). Looked: sheets admin-desk-06, admin-phone-04; full shots admin desk menu-item-all-record-payment
  ("Receivable C-RACE-500-a0eb · Amount to apply"), menu-item-by-customer-view-ledger (every row on one line, no
  "Created by" column), toolbar-Customer ledger + phone card-by-customer-0 ("No contact details"). The sweep opens no
  supplier ledger detail and no payable record-payment: those are compiled, visuals unconfirmed. Swept, device
  unconfirmed.
- [x] V8 Full re-sweep (the worker was cut off by a network failure after viewing; written up by the conductor
  from its per-sheet notes): three roles × four devices, **1,184 surfaces, 0 failed, 179 / 179 contact sheets
  viewed** (admin 522 / 79, emp 363 / 55, acc 299 / 45; out dirs `tartar-sweep-final-{admin,emp,acc}`). UI-01 … UI-17
  confirmed gone, with full-size checks: no dash rows in record sheets and no empty deposit section (UI-01); edit
  history reads "Status: Deposited → Verified · Reviewed by: Set to QA Admin Two" (UI-02); no lone ⋮ — full-width
  "Edit history" / "Delete transaction" / "Mark paid" footers (UI-03); "Due Sep 30, 2026" on cards and heroes
  (UI-04); rail indicator clear of labels at tabP, tabL and desk, zoomed (UI-05); reports period on one line, 8 tabs
  + Print visible at 1440, scrolling at 1180 (UI-06); branch card adds up (UI-07); UI-08 … UI-17 ok. Reports tabs
  now load in the sweep (settle fix). Harness artifacts, not defects: the 5th chip on phone is not reached by the
  sweep (a probe showed `/sales` Rejected and `/payables` Paid scroll into view and filter), some tab shots are
  mid-refresh, dark shots follow the `/account` Theme row. New defects → V10 (UI-18 … UI-21). Per-sheet log: admin
  phone 01–28, tabP 01–03, tabL 01–03, desk 01–45 ok except UI-18 (tabP #238), UI-19 (phone #194 #195), UI-20
  (phone #123), UI-21 (desk #506 #507); acc phone 01–20, tabP 01–02, tabL 01–03, desk 01–20 ok (UI-20 at #91); emp
  phone 01–22, tabP 01–02, tabL 01–03, desk 01–28 ok (UI-20 at #111). Swept, device unconfirmed.
- [x] V9 Offline shows the last loaded data (OFF-01). **Root cause:** the query cache only ever held the exact
  keys a mounted screen had run — `usePrimeLookupsHook` primed the ten lookup lists and nothing else — so a page (or
  status tab) not opened online since sign-in had no entry and `load()` answered "Not saved for offline". Second
  cause: Transactions, Sales, Purchases and Expenses share the `page` filter scope, so one screen's status tab
  (`saleStatus` / `voucherStatus`) leaked into the other screens' cache keys and made them miss even when cached.
  **Fix:** (1) every page query is now built by an exported `…QueryOf` spec (`IQuerySpec` = key + fetcher) that the
  hook and the primer share, so the primed key cannot drift from the mounted one — `transaction` / `sale` /
  `disbursement` / `voucher` / `ledger` / `payment` list hooks, `dashboard.hook.ts`, `admin.home.hook.ts`,
  `report.hook.ts`, `report.summary.hook.ts`, `branch.manage.hook.ts`; (2) `pageFiltersOf` (`utils/filter.utils.ts`)
  strips the foreign status field before the key and the fetch (fetch results unchanged — the services never read
  them); (3) `hook/app/prime.view.hook.ts` (lazy chunk) lists the default view of every page the role can open —
  first page, default sort, every status tab, every dashboard / admin period, every report tab, active branch scope
  — and `usePrimeViewsHook` (`prime.hook.ts`, mounted in `app.hook.ts`) hands it to the new `warm` action of
  `store/common/query.store.ts` on sign-in, reconnect, role or branch-scope change; (4) `warm` fetches in batches
  of 6 without retaining a fetcher, skips keys a mounted screen already keeps fresh, and re-fetches the keys an
  `invalidate` / `refetchAll` touched at most once per 30 s, so the saved copy follows mutations and realtime
  without a request storm; trim raised 120 → 300 entries. The write queue (`sync.store.ts`, `write.utils.ts`,
  `mutation.hook.ts`) is untouched. Tests: `utils/filter.utils.test.ts`, `keys/query.keys.test.ts` (113 / 113).
  Probe (`C:/Users/CER/AppData/Local/Temp/tartar-offline-probe/probe.mjs`, remote hosts aborted +
  `navigator.onLine` false, in-app navigation, no writes — 0 write requests): before the fix admin phone showed
  "You're offline" cards on 12 of 17 routes; after, admin / emp / acc phone and admin desk show 0 on every route,
  none of them opened online in the session except the landing page, and admin phone shows 0 on all 26 status /
  period / report tabs clicked offline, then Transactions after foreign tabs were set. Looked: sheet-admin,
  sheet-admin-tabs, sheet-emp, sheet-acc, full shots sales + vouchers (stat cards and rows present, banner "Offline
  — showing data saved …"). Admin priming is ~62 requests and took 25–45 s on localhost. Probed offline in dev,
  installed-PWA cold start unconfirmed.

- [x] V10 Sweep leftovers (UI-18 … UI-21) → Development v2.66: UI-18 `src/styles/admin/admin.layout.styles.ts`
  `adminSplit` is `3fr / 2fr` with `gap-4` from md and back to equal halves with `gap-6` at lg — at 820 the list column
  is ~386 px (was 318), names and "RCV-QAT-2609-0001" show in full, the detail pane still fits (a 21-character payable
  reference keeps its ellipsis in the list and wraps at hyphens in the pane). UI-19 `src/styles/app/app.styles.ts`
  `metricTileSubLine` wraps to two lines (`line-clamp-2 text-pretty`) instead of truncating. UI-20
  `src/components/common/table/DataTableCards.tsx` — a pressable card with no status tags and no meta fields puts its
  chevron in the head row (`dataCardHeadChevron`, `styles/table/table.styles.ts`) instead of an empty foot row; cards
  with tags or metas unchanged (Master Data supplier / bank cards checked). UI-21
  `hook/data/admin/admin.{receivables,payables}.hook.ts` — the selection is derived from the visible rows (a record
  that leaves the list drops out of the pane / sheet) and a segment change closes the sheet. Build + lint clean, tests
  113 / 113. Swept admin phone + tabP + desk on `/admin`, `/admin/receivables`, `/admin/payables`, `/payables`,
  `/master-data` (temporary config; 144 surfaces, 1 failed — a `page.goto` timeout during a host network drop, retried
  by the next surface; 23 / 23 sheets viewed). The drop put the phone run offline from #9 to #45: those pages show
  V9's "Offline — showing data saved" banner with rows and stat cards (harness/host artifact, not a defect). Looked:
  sheets admin-phone-01 … 09, admin-tabP-01, full shots tabP + desk `/admin/receivables`, desk Due today after a
  selection (pane cleared); phone Weekly / Monthly tiles read "+₱4,500.00 new / this week". Probe (scratch
  `tartar-sweep-v10/probe/probe.mjs`): 0 truncated labels on `/admin/receivables` at 820, tabP detail panes for a
  receivable and a near-due payable, phone Supplier Ledger picker (one row per supplier, chevron beside the amount),
  desk select → switch tab → pane empty on both admin pages. Swept, device unconfirmed.

## Next
1. USER DECISIONS — hard-stop, not an autopilot phase: see Open. Every visual phase (V1 … V10) is done; when the
   Open items are settled, delete this file and rename `.claude/state/ROADMAP-PWA-SUSPENDED.md` back.

## Open
- Offline scope left by V9 (decide): a page beyond the first, a non-default sort, a custom date / search filter, a
  branch scope other than the active one and a ledger / record detail are saved only once opened online — offline
  they still show the honest "not saved" state rather than rows of a different variant. Report and dashboard keys
  carry today's month, so a device that stays offline across a month change misses them. Serving those offline
  from the unpaged summary datasets (client-side filter / sort / page) is a possible follow-up phase.
- Migration 32 (SEC-01 / SEC-02, shipped client-side in Development v2.54) waits for the production deploy — the
  user applies it.
- Cash Flow report rule (carried from the archived roadmap): "Cash In" counts `collection` transactions but the
  "Cash Flow by Category" table has no Collection row. Decide: add a Collection row, or leave collections out
  of Cash In.
- Remaining Open items of the archived roadmap (H1 sign-ups off, H2 max rows, SEC-03 CSP enforce, SEC-05
  send-push redeploy, QA-02 / DATA-01 RPC migrations) are unchanged — see
  `.claude/state/ROADMAP-AUDIT-2026-10-03-DONE.md` § Open.
- Hypothesis (needs DB read, not a rule): whether receivable "Recorded by —" rows have a null `created_by` or a
  user not returned by `user_display_names`. V1 hides the dash either way.

## State
Branch: mobilel-app-native (main was fast-forwarded to v2.63 at 18:14 for a deploy; autopilot stays on this branch)
· Last commit Development v2.66 (V10 sweep leftovers) · Uncommitted: none · Last check: V10 sweep (admin phone /
tabP / desk, 144 surfaces) + probe, 2026-10-03; build + lint clean, tests 113 / 113. Autopilot stopped at USER
DECISIONS (`.claude/state/autopilot/STOP`). Run any sweep or probe with Bash `run_in_background` and `timeout` 3600000.
