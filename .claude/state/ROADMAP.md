# ROADMAP — Collection removal, print fixes, offline completeness (2026-10-03)
Updated: 2026-10-04 (Z probes done; v2.80 user UI requests; Z sweep pending)

The previous roadmap (Visual fixes, V1–V10) is archived as `.claude/state/ROADMAP-VISUAL-2026-10-03-DONE.md`. The
Native-feel mobile PWA roadmap stays parked as `.claude/state/ROADMAP-PWA-SUSPENDED.md`. When this roadmap finishes,
delete this file and rename that one back.

## Goal
Settle the user's answers to the Visual roadmap's Open list (2026-10-03) plus three print / purchase requests:
1. Delete the "collection" concept everywhere — the customer payment is the collection.
2. Printing: the branch name replaces "TARTAR" as the title; period printing picks month + year; the purchases print
   is filtered to the selected dates.
3. Purchases: an optional check number, shown wherever the purchase's records and voucher appear.
4. Offline completeness — every variant of every page shows cached data, never under the wrong label.
`yarn build` + `yarn lint` + `yarn test` clean after each phase, each phase confirmed by a sweep or an offline probe.

## Session protocol
1. Read this file, `git status --short`, start `Next` item 1. Load `build` (+ `tartar-shadcn` and `shadcn` docs for
   UI). Read only the paths the phase cites, from the Path map — never re-explore.
2. One phase per conversation / worker. Under autopilot, decide the file plan with `decision-making` and do not wait
   for a go; otherwise present the plan and wait.
3. No migration is ever applied, no Edge Function deploys. A phase that needs a schema change writes it as a
   proposal under `.claude/state/proposals/` (never under `supabase/migrations/`, so `db push` cannot pick it up),
   ships only the client work that does not depend on it, adds the proposal to USER DECISIONS, and continues — it
   does not hard-stop. A phase that needs a new business rule not settled below hard-stops.
4. Close a phase: build + lint + test clean (`yarn build`, `yarn lint`, `yarn test`), then the check below, tick Done
   with paths, rewrite Next, update State, commit as `Development v<X.Y>`
   (`git log --oneline --grep="^Development v" -1` + 0.1).
5. Visual check (UI phases): the dev server must answer on http://localhost:5199 (if not:
   `yarn dev --port 5199 --strictPort` in the background). Run
   `PW=C:/Users/CER/AppData/Local/Temp/tartar-pw/node_modules/playwright-core/index.mjs OUT=C:/Users/CER/AppData/Local/Temp/tartar-sweep-<phase> SWEEP_PASSWORD=admin12345 ROLES=<roles> DEVICES=<devices> node .claude/skills/deep-critique/scripts/sweep.mjs .claude/state/audit/sweep.config.json`
   (if playwright-core is missing: `npm i playwright-core` inside `C:/Users/CER/AppData/Local/Temp/tartar-pw`, never
   in the project; a temporary config copy with only the phase's routes is fine). Open every contact sheet whose
   captions match the phase's routes plus the full-size shots of the surfaces fixed; log "looked: <sheets>, <result>".
   Print documents open in a new window the sweep does not capture: probe them with Playwright (`page.waitForEvent
   ("popup")`, screenshot the popup) and look at the shot. Writes are faked by the sweep — "changed nothing" toasts
   are harness artifacts.
6. Offline check (offline phases): a Playwright probe in the scratch folder, not the sweep. Sign in online as
   admin / emp / acc (password admin12345), let the primer finish, then `context.setOffline(true)` — if lazy chunks
   then fail to load from the dev server, fall back to V9's method (abort remote hosts + `navigator.onLine` false;
   see the archived roadmap's V9 entry) and log which one ran. Navigate in-app only (sidebar links, tabs, pager,
   sort, filters, branch switch, record sheets — no reload), screenshot each step and open the shots: rows and stat
   cards present, no "not saved for offline", and every label matches the rows under it. No writes. Log "probed
   offline in dev, installed-PWA cold start unconfirmed".
7. Visuals beyond the sweep (real device, safe areas, keyboard, a physical printer) stay unconfirmed: log "swept,
   device unconfirmed".

## Decisions locked
Given by the user on 2026-10-03 unless marked otherwise.
- Mobile tables (2026-10-04): rows render as a native-style list, not cards, keeping the important information.
- Receivables / Payables (2026-10-04): a Payments tab replaces By customer / By supplier; party grouping lives in the
  Customer / Supplier Ledger.
- Mobile forms (2026-10-04): form modals must feel like a native app on iOS and Android — responsive inputs and
  dropdowns, the keyboard never hiding the field or the action, no layout jumps.
- Collection: remove the term everywhere — transaction type, labels, enums, filters, forms, reports, print documents,
  tests, route descriptions. Customer payments are the collection; Cash Flow "Cash In" counts customer payments, not
  collection transactions. Existing `collection` rows are production data: never drop them; converting them or
  removing the enum value is a migration proposal (USER DECISIONS). Until it is applied the client must not crash or
  mislabel a legacy `collection` row it still receives.
- Offline scope = YES: page 2+, non-default sorts, custom date / search filters, branch scopes other than the active
  one, and record / ledger details, all from data cached while online. Report and dashboard keys survive a month
  change offline. Never show another tab's, period's or branch's rows under the wrong label (V9's rule stands: a
  derived offline view is computed from cached data for exactly the variant requested, or honestly says it is not
  saved).
- Print title: the current branch's name instead of "TARTAR"; with the all-branches scope the title must still read
  well (design it: e.g. "All branches" or the branch list, decided in P1).
- Period print: when the period is monthly the user picks month and year only (default the current month and year);
  every print option that has a month picks month + year the same way. Roles: accountant, employee, admin.
- Purchases print: filtered to the selected dates — the purchases due within the range (with amounts) and every
  purchase voucher created within the range (with amounts). Roles: accountant, employee, admin.
- Purchase check number: optional input on the record-purchase modal, in the Payment section directly below "Paid
  from"; shown wherever the purchase's records appear when it exists, especially the voucher and its print. Roles:
  employee, admin.
- Migration 32 (SEC-01 / SEC-02) and the archived roadmap's Open items: later, not in this run.
- L1 Every CLAUDE.md convention holds (no comments, no useState, class strings in *.styles.ts, tokens only in
  theme.css, useConfirm, writes through runWrite, Transactions is the reference).

## Phases
- C1 Collection removal (all layers; the grep is small): `src/enums/transaction.enum.ts:13,19,38,49` (drop the value,
  `transactionTypeFilterValues` collapses to `transactionTypeValues`), `hook/data/transaction/transaction.list.hook.ts:61,174`,
  `services/data/ledger.services.ts:281` (`getCustomerLastPayment` — decide what "last payment" reads once collection
  is gone; legacy rows must not vanish from a customer's history before the migration), `routes/admin.view.routes.ts:36`
  and `routes/protected.view.routes.ts:36` (descriptions), `components/admin/receivables/ReceivableEntryList.tsx:33`
  ("Nothing to collect here" — copy, decide), `models/data/transaction/transaction.response.test.ts:74`,
  `utils/report.utils.test.ts:29,70,88`. Confirm Cash Flow "Cash In" (`utils/report.utils.ts:53`, `cashInflowTypes`)
  counts customer payments — check whether `record_customer_payment` writes a `customer_payment` transaction or only
  `payments` / `receivable_payments` rows, and make Cash In count the customer payments either way (read the RPC in
  `supabase/migrations/`, newest definition wins). Legacy rows: decide how a row whose type the client no longer knows
  is parsed and labelled (no crash, no "undefined"). Print documents: `utils/print.utils.ts` (no hits today — confirm).
  Write `.claude/state/proposals/migration-33-collection.sql`: convert `collection` rows (to what — state the options
  and the recommended one; a business rule, so the user picks) and stop new ones (a check constraint; removing a
  Postgres enum value needs a type rebuild — say so). No data dropped. Check: sweep ROLES=admin,acc DEVICES=desk,phone
  on `/transactions` (type filter, form type options), `/reports` (Cash Flow), `/receivables`, `/admin/receivables`;
  look for any "Collection".
- N1 Account notifications toggle (user report 2026-10-03, mid-run): on `/account` the Notifications setting must be a
  toggle (on / off). Bug: a user who accidentally disallowed notifications has no way to turn them back on short of
  deleting and reinstalling the app. Required: a switch that reads "on" only when permission is granted and the push
  subscription is active, "off" otherwise (denied, default, unsubscribed); tapping it on requests permission /
  subscribes, tapping it off unsubscribes. Browser fact to design around: once `Notification.permission` is
  `denied`, the page cannot re-prompt — so with denied permission the switch stays off and tapping it must show the
  exact steps to re-allow (per platform: iOS installed PWA → Settings › Notifications › TARTAR; Android Chrome → site
  settings; desktop → the address-bar lock), and the switch re-reads permission on `visibilitychange` / focus and via
  `navigator.permissions.query({ name: "notifications" })` `onchange`, so it flips on by itself after the user allows
  it. Also check the "default" state after a dismissed prompt re-prompts. Files: `components/account/modal/NotificationsSheet.tsx`,
  `components/account/views/NotificationsToggle.tsx`, `models/common/push.model.ts` (`pushModeNotes`), the
  `usePushNotifications` hook (`note` / `canToggle`), `services/data/push.services.ts`, state in a zustand store (no
  useState). Use the shadcn `switch` via a common primitive. Check: sweep ROLES=admin,emp DEVICES=phone,desk on
  `/account` (Notifications sheet), plus a Playwright probe with `context.grantPermissions` / a denied context to see
  the on, off and denied states; real-device permission flow stays unconfirmed.
- P1 Print title = branch: `utils/print.utils.ts:294,384,403` ("TARTAR" in the h1 and `<title>`). Thread the active
  branch scope's name (the top-bar branch scope; `useBranchListHook().branchName`) into every print document; design
  the all-branches case (decide with decision-making: "All branches" vs the branch list vs one header per branch) and
  keep `printPalette` the only hex source. Check: a Playwright popup probe for each print entry (sales, expenses,
  purchases period print, a voucher print, a report print) on one branch and on all branches, as admin and emp;
  look at the shots.
- P2 Period print month + year and the purchases print filter: `components/common/modal/PeriodPrintModal.tsx`,
  `hook/common/period.print.hook.ts`, `models/common/period.model.ts`, and the callers
  `components/{sale,expense,purchase}/tables/*Table.tsx`; plus any report print with a month (`components/report/*`).
  Monthly → month + year selects (default current), the same control wherever a month is chosen. Purchases print →
  two sections filtered to the selected range: purchases due within it (due date in range, with amounts) and purchase
  vouchers created within it (with amounts); reuse the existing services (`transaction.services.ts`
  `purchase_ids_paid_between`, `voucher.services.ts`) and add an unpaged `getAll`-style call only if none fits — no
  migration. Pure date-range / month helpers get unit tests. Check: sweep ROLES=admin,emp,acc DEVICES=desk,phone on
  `/sales`, `/expenses`, `/purchases` print modals, plus a popup probe of the purchases print for a range with and
  without due purchases; look at the shots.
- P3 Purchase check number: the purchase form fields (`hook/data/disbursement/disbursement.form.hook.ts:119`
  "Paid from", the purchase request model), display in `components/purchase/tables/PurchasesTable.tsx:296`,
  `components/voucher/tables/VouchersTable.tsx`, `components/admin/payables/PayableEntryDetail.tsx`, the payable /
  ledger records and `utils/print.utils.ts` (voucher print). Schema facts: `vouchers.check_number` exists
  (`20260722000007_check_details_and_purchase_terms.sql`) but a check constraint allows it only on `type = 'check'`
  vouchers, and the purchase RPC (latest definition `20261017000029_voucher_vat_auto_approve.sql:~196-330`, wrapped by
  `20261012000024_write_idempotency.sql`) takes no check number. First look for a client-only path that is atomic and
  survives the offline queue (`runWrite`); if none, write `.claude/state/proposals/migration-34-purchase-check-number.sql`
  (new optional RPC parameter on create + update; what happens to a check number when "Paid from" is cash — decide
  hide-the-field vs constraint change, prefer hiding it unless Paid from is the bank account), ship the display side
  (it already reads `vouchers.check_number`) and leave the input for after approval, recorded in USER DECISIONS.
  Check: sweep ROLES=admin,emp DEVICES=desk,phone on `/purchases`, `/vouchers`, `/payables`; popup probe of a check
  voucher print.
- M1 Mobile list rows instead of cards (user request 2026-10-04, mid-run): on mobile, table rows render as a modern
  native list (iOS / Android list style: full-width rows with hairline separators, title + key value on the first
  line, one muted secondary line, trailing amount / status, chevron when pressable, no card chrome per row) instead
  of a card per row — still showing the important information. One change in the shared primitive
  (`components/common/table/DataTableCards.tsx`, `styles/table/table.styles.ts`, `IDataTableColumn` card roles in
  `models/common/table.model.ts`) so every table follows; the detail sheet (`RecordDetailSheet`) keeps the full
  record. Applies wherever cards render today (phone + tablet portrait, per the mobile design memory — decide, and log
  it). Keep the four data states (skeleton rows become list skeletons), selection / press feedback, overdue danger
  tint, and the V-phase rules (Due prefix, cardMetaLimit, chevron). Check: deep-critique sweep ROLES=admin,emp,acc
  DEVICES=phone,tabP on every list route; look at every sheet.
- M2 Receivables / Payables tabs (user request 2026-10-04): replace the "By customer" (receivables) and "By supplier"
  (payables) tabs with a "Payments" tab; the payments table that today sits below the records moves into that tab,
  so each tab shows one table. Reason given by the user: customer / supplier grouping already lives in the Customer
  Ledger / Supplier Ledger, so the by-party tabs are redundant. Files: the receivables / payables views and their
  tab definitions (`components/ledger/**`, `LedgerRecordsTable.tsx`, `PayableRecordsTable.tsx`,
  `LedgerPaymentsTable.tsx`, `LedgerPartiesTable.tsx` if it only served those tabs), `hook/data/ledger/*.list.hook.ts`,
  the status / tab enum, `hook/app/prime.view.hook.ts` (prime the Payments tab instead of the by-party tab). Delete
  dead code the removal leaves (no orphan components, keys or styles). Check: sweep ROLES=admin,emp,acc
  DEVICES=phone,desk on `/receivables`, `/payables`; look at each tab.
- M3 Mobile form interaction (user report 2026-10-04: on iOS and Android, filling forms in modals is "very
  destructive" — inputs and dropdowns not responsive to taps, the keyboard covers most of the screen, other
  components jump around). Start with a deep-critique pass of the form modals on phone (`EntityFormModal`, `AppModal`,
  `FormField`, the select / combobox / date picker controls, the phone sheet presentation) — mobile WebKit / Chrome
  facts to check: inputs under 16px font-size trigger iOS zoom; `vh` / fixed footers vs the virtual keyboard
  (`visualViewport`, `interactive-widget=resizes-content` in the viewport meta, `dvh` / `svh`); a focused field
  scrolled into view above the keyboard; React Aria popovers (Select / ComboBox / DatePicker) inside a modal sheet on
  touch — use the native-feeling tray / sheet presentation on phones rather than a floating popover; touch targets
  ≥ 44px; `inputMode` / `enterKeyHint` / `autoComplete` per field type (numeric keypad for amounts, date fields);
  body scroll lock without the iOS jump; the footer action staying reachable. Then fix in the shared primitives so
  every form modal benefits — no per-form patches. Check: Playwright phone emulation (iPhone and Pixel devices,
  `hasTouch`, `isMobile`) — tap every field type in the purchase, expense, sale, transaction and record-payment forms,
  open each dropdown / date picker, simulate the keyboard by shrinking the viewport / `visualViewport` height, and
  screenshot; look at the shots. Real iOS / Android keyboard behaviour stays unconfirmed — log "probed in emulation,
  device unconfirmed".
- O1 Offline variants of the paged lists: page 2+, non-default sorts, custom date / search filters for transactions,
  sales, purchases, expenses, vouchers, receivables, payables, payments. Expected shape (decide): while online the
  primer also caches the unpaged dataset each list can be derived from (the `getAll` the reports already use, per
  branch scope, within the 300-entry trim — revisit the trim and IndexedDB size), and offline a key miss derives the
  exact variant (filter → sort → page) client-side from it with a pure, unit-tested helper; when no dataset covers the
  variant, the honest "not saved" state stays. Totals and stat cards derive from the same dataset. Files:
  `store/common/query.store.ts` (`load` miss path ~146-195, `warm` ~269, trim ~47-55), `hook/app/prime.hook.ts`,
  `hook/app/prime.view.hook.ts`, `hook/common/query.hook.ts`, `utils/idb.utils.ts`, the `…QueryOf` specs in the list
  hooks, `utils/filter.utils.ts`. The write queue (`store/common/sync.store.ts`, `utils/write.utils.ts`,
  `hook/common/mutation.hook.ts`) must not regress. Check: offline probe (protocol 6) as admin phone + desk: page 2,
  each sort, a date range, a search, on every list.
- O2 Offline branch scopes, details and month change: switching the top-bar branch scope offline shows that branch's
  cached data (prime every branch the role can see — measure the request count and keep it bounded); record /
  ledger detail sheets and modals (customer / supplier ledger, payment allocations, edit history, voucher detail)
  open offline from cached data; report and dashboard keys survive a month change (the cache keeps last month's
  entries reachable under their own period; the current month offline is derived from cached datasets or honestly
  not saved — never last month's numbers under this month's label). Check: offline probe as admin, emp, acc on phone:
  switch branch, open details, and fake a month change (`page.clock` or a Date override in the probe) on `/dashboard`
  and `/reports`.
- Z Final: full re-sweep (every role and device, no ROLES / DEVICES filter,
  `OUT=C:/Users/CER/AppData/Local/Temp/tartar-sweep-final2`), every contact sheet opened (viewed = total), no
  "Collection" anywhere, print popups for each role; then the offline probe of O1 + O2 for all three roles on phone
  and desk. A new defect becomes a new phase before this one, not a silent fix.

## Path map
- collection: src/enums/transaction.enum.ts · src/hook/data/transaction/transaction.list.hook.ts ·
  src/services/data/ledger.services.ts · src/routes/{admin,protected}.view.routes.ts · src/utils/report.utils{,.test}.ts ·
  src/models/data/transaction/transaction.response.test.ts · src/components/common/filter/LedgerFilterBar.tsx:15,160 ·
  supabase/migrations/20260716000001_init.sql:42-45 (the enum) · 20260718000004_voucher_workflow.sql (payments RPC)
- print: src/utils/print.utils.ts · src/styles/print/print.styles.ts · src/components/common/modal/PeriodPrintModal.tsx ·
  src/hook/common/period.print.hook.ts · src/models/common/period.model.ts
- purchases: src/components/purchase/tables/PurchasesTable.tsx · src/hook/data/disbursement/disbursement.form.hook.ts ·
  src/services/data/{transaction,voucher}.services.ts · src/models/data/voucher/voucher.{request,response}.ts ·
  src/components/voucher/tables/VouchersTable.tsx · src/components/admin/payables/PayableEntryDetail.tsx
- offline: src/store/common/query.store.ts · src/hook/app/{prime,prime.view}.hook.ts · src/hook/common/query.hook.ts ·
  src/utils/idb.utils.ts · src/utils/filter.utils.ts · src/keys/query.keys.ts · write queue: src/store/common/sync.store.ts,
  src/utils/write.utils.ts, src/hook/common/mutation.hook.ts
- sweep: .claude/skills/deep-critique/scripts/sweep.mjs · .claude/state/audit/sweep.config.json
- proposals: .claude/state/proposals/

## Done
- [x] Stage 1 (conductor, 2026-10-03): Visual roadmap archived as `.claude/state/ROADMAP-VISUAL-2026-10-03-DONE.md`;
  "collection" mapped (`grep -ri collection src/ supabase/ .claude/skills/build/references` — 12 app hits listed in C1,
  the rest are React Aria `Collection` / `allowsEmptyCollection`, not the concept; DB enum in the init migration; no
  hit in print or report code; Cash In already excludes the type); offline path mapped (query.store.ts 380 lines,
  prime.hook.ts 121, prime.view.hook.ts 265, idb.utils.ts 56); this roadmap written.

- [x] C1 Collection removal (Development v2.68): `collection` dropped from `src/enums/transaction.enum.ts`
  (`transactionTypeFilterValues` gone, `LedgerFilterBar.tsx` uses `transactionTypeValues`; new `transactionTypeLabelOf` /
  `transactionTypeColorOf` label a legacy row "Other", tested in `src/enums/transaction.enum.test.ts`), used in
  `TransactionsTable.tsx`, `PeriodReport.tsx`, `utils/report.utils.ts` print rows; `transaction.list.hook.ts` customer
  types + form options; route descriptions; `ReceivableEntryList.tsx` empty copy "No unpaid balances here".
  Cash In: `record_ledger_payment` writes `payments` + `payment_allocations`, never a transaction, so verified
  receivable payments (`isCountedPayment` / `sumCountedPayments` in `models/data/payment/payment.response.ts`) now add to
  the Cash Flow "Customer Payment" row and Cash In (`report.utils.ts`, new `paymentServices.getAllInPeriod`,
  `reportCustomerPaymentQueryOf` + `reportPaymentKey`, primed in `prime.view.hook.ts`) and to the dashboard
  `monthlyCashIn` (`dashboard.services.ts`). `getCustomerLastPayment` = latest of verified receivable payments and
  non-sale customer transactions (legacy rows kept without naming them). Proposal
  `.claude/state/proposals/migration-33-collection.sql` (convert → customer_payment recommended, check constraint).

- [x] N1 Account notifications toggle (Development v2.69): new common primitive `src/components/common/form/AppSwitch.tsx`
  (shadcn `ui/switch`, label + optional description, styles `switchRow` / `switchText` / `switchLabel` /
  `switchDescription` in `styles/form/form.styles.ts`); `NotificationsToggle.tsx` is now the switch (on only when
  permission is granted and the subscription is active), shown for on / off / blocked; `NotificationsControls.tsx`
  puts the switch above the note and `NotificationsSheet.tsx` renders the same controls (no footer button;
  `notificationsActions` removed). `push.hook.ts`: `toggle` / `busy`; blocked → tapping on shows a toast with the
  platform's steps (`pushBlockedSteps` in `models/common/push.model.ts`, `pushPlatformOf` in `utils/push.utils.ts`,
  tested in `push.utils.test.ts`) and the note shows them inline; a dismissed prompt ("default") says to tap again,
  which re-prompts; status listener re-reads on `visibilitychange`, window `focus` and the Permissions API `change`;
  `enableRequested` (persisted in `store/common/push.store.ts`) makes a blocked → allowed change subscribe by itself.

- [x] P1 Print title = branch (Development v2.70): `printReport` h1 and `<title>` = the scope title, sub line =
  title · period (`utils/print.utils.ts`); `printStatement` takes the scope too (`CustomerLedgerView.tsx`,
  `SupplierLedgerView.tsx` via `customer.detail.hook.ts` / `supplier.detail.hook.ts`). Scope title = `printScope` from
  `useBranchScopeHook` (`hook/data/branch/branch.scope.hook.ts`) via pure `branchScopeTitleOf` in new
  `src/utils/branch.utils.ts` (tested in `branch.utils.test.ts`): scoped branch name; else the only visible branch, or
  the visible names joined " · " for limited access; "All branches" when every branch is visible. Callers:
  `sale.list.hook.ts`, `disbursement.list.hook.ts`, `report.hook.ts`, `report.summary.hook.ts`. Voucher print already
  heads with its own branch's legal name — unchanged.

- [x] P2 Period print month + year and the purchases print filter (Development v2.71): `PeriodPrintModal` monthly
  shows Month + Year selects (default current; date field only for daily / weekly) — `monthValues` / `monthLabels` /
  `IMonthYear` and `month` / `year` in `periodPrintSchema` (`models/common/period.model.ts`), fields built per open in
  `hook/common/period.print.hook.ts`; pure helpers `monthYearOf`, `currentMonthYear`, `monthYearRangeOf`,
  `monthYearOfRange`, `recentYears` (this year + 5 back), `yearLabelsOf` in `utils/period.utils.ts` (old
  `currentMonth` / `monthRangeOf` / `recentMonths` / `monthLabelsOf` / `monthOfRange` replaced), tested in new
  `utils/period.utils.test.ts`. Reports Branch Summary month filter = the same Month + Year pair
  (`report.summary.hook.ts`, `BranchSummaryReport.tsx`, `ReportsView.tsx`). Purchases print = two sections:
  "Purchases due" (`transactionServices.getPurchasesDueAll`, `due_date` in range, payment status) and "Purchase
  vouchers" (existing `getDisbursementAll` with `dateBasis: "voucher"`), each with count + amount-to-pay total —
  `purchasePrintDocument` in `utils/report.utils.ts` (tested), wired in `disbursement.list.hook.ts`. No migration.

- [x] P3 Purchase check number (Development v2.72): no client-only path — the purchase and its voucher are one RPC
  write (one `runWrite`, queued offline); a follow-up voucher update would not be atomic and cannot be queued (voucher
  id unknown offline). Proposal `.claude/state/proposals/migration-34-purchase-check-number.sql`: `p_check_number`
  (last, default null) on create + update and their wrappers, stored only when the voucher is a check (field shown only
  when Paid from = bank account; the check constraint stays); also fixes `app.sync_voucher_from_tx`, which kept
  `check_bank` when a purchase moved from bank to cash (the constraint would reject that edit). Display shipped: the
  purchase record sheet voucher section shows "Check number" when set (`PurchasesTable.tsx`), the purchases period
  print has a "Check No." column in both sections (`report.utils.ts` `checkNumberOf`, tested). Vouchers table detail,
  admin payable detail and the voucher print already showed it. Input waits for the migration (USER DECISIONS).
- [x] M1 Mobile list rows instead of cards (Development v2.74): `components/common/table/DataTableCards.tsx` renamed
  `DataTableList.tsx` (mounted by `DataTable.tsx` wherever cards rendered: phone + tablet portrait) — each row is a
  full-width hairline-separated list row: optional checkbox, title, one muted secondary line (subtitles + metas,
  capped by `cardMetaLimit` when the row opens the detail sheet, values joined by "·", truncated), trailing amount over
  status, row actions, chevron when pressable; list skeleton rows; press / focus / selected / overdue tints on the row.
  Styles `dataCard*` → `dataList*` in `styles/table/table.styles.ts` (`dataCardLine` kept, TransactionsTable uses it).
  `cardGrid` removed (DataTable + the three ledger tables) — a native list is one column. `RecordDetailSheet` unchanged.
  Labels no longer show on the row, so due-date metas got `cardPrefix: "Due"` (`PurchasesTable.tsx`,
  `CustomerLedgerView.tsx`, `SupplierLedgerView.tsx`).
- [x] M2 Receivables / Payables Payments tab (Development v2.75): `ledgerViewValues` = records / payments with static
  `ledgerViewLabels` (`enums/ledger.enum.ts`); `useLedgerViewHook` takes no scope (`hook/data/ledger/ledger.view.hook.ts`);
  `LedgerViewTabs` (no props) switches Records / Payments; `LedgerRecordsSection.tsx` renders `LedgerPaymentsTable`
  on Payments (kind from the scope) and the records table otherwise; `LedgerStatusTabs` hides on Payments (payment
  status lives in the payments filter popover); `ReceivablesView.tsx` / `PayablesView.tsx` no longer stack the payments
  table under the records. Deleted `components/ledger/tables/LedgerPartiesTable.tsx`, the `ledgerPartyQueryOf` /
  `partyQuery` / `parties*` / `openPaymentForParty` returns in `ledger.list.hook.ts` and their priming in
  `prime.view.hook.ts` (the Payments tab was already primed by `paymentQueryOf`). Kept `ledgerPartyKey` and
  `getPartySummaries` — the Supplier Ledger (`supplier.ledger.hook.ts`, `supplier.detail.hook.ts`) still reads them.

- [x] M3 Mobile form interaction (Development v2.76): audit (Playwright iPhone 13 / Pixel 7 / 820×1180 touch, keyboard
  simulated by shrinking the viewport) found: the focused field ended under the keyboard behind a stacked two-button
  footer (~100px of form visible); `select` was a React Aria ComboBox input (tap = keyboard + floating popover) and
  `date` a floating calendar popover inside the sheet; on a touch tablet the keyboard turned the viewport landscape,
  so `useIsCompact` flipped Sheet → Dialog mid-typing (remount, focus lost). Fixes, shared primitives only:
  `FormField.tsx` renders `select` as the native `ui/native-select` and `date` as a native `<input type="date">`
  wherever the sheet presents (compact) — creatable / multiselect stay comboboxes (typing is the point); styles
  `fieldNativeSelect` / `fieldNativeDate` (`styles/form/form.styles.ts`). `hook/common/breakpoint.hook.ts` holds the
  device class while a touch user types (`isTextEntry` in new `utils/keyboard.utils.ts`). `hook/app/keyboard.hook.ts`
  also writes `--visual-viewport-height`, sets `data-keyboard-open` on `<html>` while a touch user types, and scrolls
  the focused field into view on focus and on viewport resize. `styles/modal/modal.styles.ts`: sheet heights from
  `--visual-viewport-height` (top stays visible when iOS pans the viewport), body `overscroll-contain` + field scroll
  margins, footer actions in one compact row while the keyboard is open. `theme.css`: token default, 16px field text
  on coarse pointers (no iOS focus zoom at any width), native select in the 44px touch-target list, dark
  `color-scheme` for the native controls. Viewport meta unchanged (`interactive-widget=resizes-content`).

- [x] O1 Offline variants of the paged lists (Development v2.77): offline (or on a network failure) a list / summary key
  miss now derives the exact variant from a cached dataset instead of "not saved". `IQueryFetcher` (`models/common/query.model.ts`)
  carries an optional `offline` deriver; `store/common/query.store.ts` `load` calls it on a miss (`derivedOf` /
  `settleDerived`: in memory only, never persisted, `updatedAt` = the dataset's, so the "saved at" banner stays honest);
  `useQuery` / `run` / `refresh` take the fetcher type. Pure helpers in new `src/utils/dataset.utils.ts` (tested in
  `dataset.utils.test.ts`): `coversFilters` (dataset filters ⊆ request; dated datasets only for the same date basis and a
  range inside theirs), `matchesLedgerFilters` (mirrors `applyLedgerFilters`), `matchesLedgerStatus` (mirrors
  `applyStatusFilter`), `isWithinDays` (voucher-date basis), `sortRowsBy` (column + created_at desc, Postgres null order),
  `pageOfRows`, `derivedRows` / `derivedPage`, `withOfflineDerive`. Datasets = the existing summaries (transactions,
  sales, purchases, expenses, ledger, all-time per branch scope) + new `voucherDatasetQueryOf` (`voucherServices.getAll`)
  and `paymentDatasetQueryOf` (all-time `getAllInPeriod` per kind), primed in `prime.view.hook.ts`. Wired in the
  `…QueryOf` specs of `transaction` / `sale` / `disbursement` / `voucher` / `ledger` / `payment` list hooks (lists and
  their summaries, so stat cards follow the filter) and `reportCustomerPaymentQueryOf` (report-payments for any report
  type, from the receivable payments dataset). Purchases with date basis "Paid" stay honestly not saved (needs the
  server RPC). Filter column maps moved to `utils/filter.utils.ts` (`transactionFilterColumns`, `voucherFilterColumns`,
  `ledgerFilterColumns`, `ledgerSearchColumnsOf`) and the services import them. Trim (300) unchanged: +3 keys per branch.
  Write queue untouched.

- [x] O2 Offline branch scopes, details and month change (Development v2.78, suggested — not committed in-session):
  branch scopes: `datasetSourcesOf` (`utils/dataset.utils.ts`, tested) always adds the all-branches dataset as a
  fallback, so any branch scope derives from the "All branches" datasets (matchers already filter by branch);
  `prime.view.hook.ts` splits `datasetQueriesOf` (summaries + voucher / payment datasets) from the paged first pages
  and, for roles that can scope (`canScope`, passed from `prime.hook.ts`), primes the all-branches datasets when a
  branch is active plus the dashboard keys of every other scope (lists / reports derive). `warm` (`query.store.ts`)
  now queues only keys not warmed before or still empty, so a scope switch does not refetch the whole set (stale keys
  still refresh via invalidate / `refetchAll`). Requests in the first 45 s after login: admin 306, acc 140, emp 101.
  Month change: `currentMonthKey` (`utils/period.utils.ts`) in the dashboard summary / sales / profit / overview keys,
  the report range in report-transactions / report-payments keys (alerts / checks / reviews carry no period label);
  reports derive offline — report-transactions / receivables / payables reuse the dataset specs' fetchers, Branch
  Summary derives from the sale / purchase / expense datasets (`report.summary.hook.ts`). Details: `matchesParty`
  (tested) + `partyLedgerFetcherOf` (`ledger.list.hook.ts`: customer / supplier ledger, record-payment open rows),
  `partyPaymentsFetcherOf` (`payment.list.hook.ts`: ledger Payments tabs), customer last payment
  (`customer.detail.hook.ts`), voucher source (`voucher.detail.hook.ts`, from the disbursement dataset), edit history
  (new `transactionServices.getAllAudits` dataset `transactionAuditKey`, `transactionAuditFetcherOf`, invalidated by
  sale / disbursement writes). `admin.home.hook.ts` alerts reuse `dashboardAlertsQueryOf`.

- [x] U1 User UI requests, out of roadmap (Development v2.80): phone list rows get a visible divider
  (`dataList` → `foreground/10`); phone users list shows the role above the approval tag and hides branches /
  created (`listHidden`); unpaid due dates red + semibold on receivables / payables / purchases (`DueDateCell`);
  avatars only for users — every other name cell is `NameCell`; users upload / change / remove their own photo from
  Account settings (`account.avatar.hook.ts`, `image.utils.ts` 256 px webp, `FileButton`, `ProfileAvatar`; online
  only; initials until migration 35 is applied); phone rows drop the ⋮ menu when the detail sheet carries the same
  actions (`DataTableList`), and sheets show enabled danger actions as a full-width button under the primary
  (`SheetActions`); minimum browser = iOS / Safari 16.4 (Tailwind v4 needs `color-mix`, `@container`,
  `@property`): `utils/browser.utils.ts` feature-detects and `main.tsx` renders `UnsupportedBrowserView` instead of
  `App` (checked in Chrome with `color-mix` faked off; a real iOS 15 device unconfirmed).

- Z progress (2026-10-04, not yet done): offline probes complete — O1 (admin / emp / acc × phone / desk) and O2
  phone (admin / emp) from the previous session; this session O2 acc phone re-run alone (84-request suspect did not
  reproduce: all-branches Customer / Supplier Ledger filled, ₱1,799.00 matches, 0 "not saved") and O2 desk admin /
  emp / acc (prime 310 / 110 / 132 requests; 0 "not saved" except the admin next-month dashboard, expected; ledger
  labels match rows). Probe misses, not defects: desk edit-history trigger, report-type tabs, emp / acc dashboard
  nav, acc voucher source / next-month dashboard (unconfirmed). Prints verified (all-branches title unconfirmed:
  QA accounts see one branch). Logged: probed offline in dev, installed-PWA cold start unconfirmed. Sweep
  `tartar-sweep-final3` is INVALID for Z: source edits (v2.80) hot-reloaded mid-run — admin desk aborted after 8
  surfaces, emp phone after 1 (timeouts), and the rest mixes pre / post v2.80 code.

## Next
1. Z Final — remaining step only: with v2.80 committed and NO source edits during the run, full sweep into
   `OUT=C:/Users/CER/AppData/Local/Temp/tartar-sweep-final4` (Bash `run_in_background`, timeout 3600000; no probe
   while it runs), confirm every role × device has its full surface count (log ends `done: … contact sheets`), open
   every contact sheet (viewed = total), grep for "Collection", log "looked: <sheets>, <result>" and "swept, device
   unconfirmed". Then mark Z done and commit. A defect becomes a new phase before Z.
2. USER DECISIONS — hard-stop, not an autopilot phase: see Open.

## Open
- USER DECISIONS (end of run):
  - Migration 32 (SEC-01 / SEC-02, client shipped in Development v2.54) — the user applies it at the production deploy.
  - Collection migration proposal (written by C1, `.claude/state/proposals/migration-33-collection.sql`): how legacy
    `collection` rows convert (A customer_payment, recommended / B keep / C cash_deposit) and the check constraint
    that blocks new ones. Also confirm C1's Cash In rule: only verified customer payments count (pending ones are
    left out, like unverified sales in `countedAmountOf`).
  - Purchase check-number migration proposal (written by P3, `.claude/state/proposals/migration-34-purchase-check-number.sql`)
    — approve it (field only when Paid from = bank account; also fixes the bank → cash edit trigger bug), then the
    input ships (client follow-up listed at the end of the proposal).
  - The archived audit roadmap's Open items: H1 sign-ups off, H2 max rows, SEC-03 CSP enforce, SEC-05 send-push
    redeploy, QA-02 / DATA-01 RPC migrations — see `.claude/state/ROADMAP-AUDIT-2026-10-03-DONE.md` § Open.
  - Avatar migration proposal (written in U1, `.claude/state/proposals/migration-35-user-avatar.sql`):
    `users.avatar_path`, public `avatars` bucket (2 MB, jpeg / png / webp), own-folder storage policies,
    `set_own_avatar`. Until applied the avatar query fails alone and everyone shows initials.
- Carried, not a decision: the Visual roadmap's "Recorded by" hypothesis (needs a DB read) — see the archived file.

## State
Branch: main · Last commit Development v2.79 (phone list rows; O2 committed as v2.78) · Uncommitted: U1 (suggested as Development v2.80) · Last check: U1, `npx tsc -b` + lint clean (src), visual changes compiled — user to confirm on device; Z offline probes all clean (see Z progress). Run any sweep or probe
with Bash `run_in_background` and `timeout` 3600000, never two at once, and never edit `src/` while one runs.
