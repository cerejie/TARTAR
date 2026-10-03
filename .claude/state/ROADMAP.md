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

## Next
1. V2 Edit history.
2. V3 Action groups.
3. V4 Date labels.
4. V5 Admin app.
5. V6 Reports.
6. V7 Ledger modals.
7. V8 Full re-sweep.
8. USER DECISIONS — hard-stop, not an autopilot phase: see Open.

## Open
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
Branch: mobilel-app-native · Last commit Development v2.57 (V1 detail placeholders) · Uncommitted: none · Last check:
V1 sweep admin+emp phone, 2026-10-03. Autopilot running from V2. A sweep of more than one role can exceed a
10-minute background timeout — run it with `timeout` 3600000.
