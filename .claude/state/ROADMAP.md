# ROADMAP — Collection removal, print fixes, offline completeness (2026-10-03)
Updated: 2026-10-03 (C1 done)

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

## Next
1. N1 Account notifications toggle.
2. P1 Print title = branch.
3. P2 Period print month + year and the purchases print filter.
4. P3 Purchase check number.
5. O1 Offline variants of the paged lists (include the new `report-payments` key and `payments` in the datasets).
6. O2 Offline branch scopes, details and month change.
7. Z Final re-sweep + offline probe, all roles.
8. USER DECISIONS — hard-stop, not an autopilot phase: see Open.

## Open
- USER DECISIONS (end of run):
  - Migration 32 (SEC-01 / SEC-02, client shipped in Development v2.54) — the user applies it at the production deploy.
  - Collection migration proposal (written by C1, `.claude/state/proposals/migration-33-collection.sql`): how legacy
    `collection` rows convert (A customer_payment, recommended / B keep / C cash_deposit) and the check constraint
    that blocks new ones. Also confirm C1's Cash In rule: only verified customer payments count (pending ones are
    left out, like unverified sales in `countedAmountOf`).
  - Purchase check-number migration proposal, if P3 needs one (`.claude/state/proposals/migration-34-purchase-check-number.sql`)
    — the input ships after it is applied.
  - The archived audit roadmap's Open items: H1 sign-ups off, H2 max rows, SEC-03 CSP enforce, SEC-05 send-push
    redeploy, QA-02 / DATA-01 RPC migrations — see `.claude/state/ROADMAP-AUDIT-2026-10-03-DONE.md` § Open.
- Carried, not a decision: the Visual roadmap's "Recorded by" hypothesis (needs a DB read) — see the archived file.

## State
Branch: mobilel-app-native · Last commit Development v2.68 (C1 Collection removal) · Uncommitted: none · Last check: C1, build + lint clean, tests 118 / 118, swept admin + acc desk + phone. Run any sweep or probe
with Bash `run_in_background` and `timeout` 3600000.
