# ROADMAP — Offline hardening (live offline test, 2026-09-30)
Updated: 2026-10-01

## Goal
Offline, every write is kept on the device and reaches the database once back online, nothing is
lost or silently stuck, and every page shows the last data it had while online, never a blank
page or an endless skeleton. `yarn build` + `yarn lint` clean after each phase, each phase
harness-verified offline. Replaces the finished pre-deployment QA roadmap (F1-F7, Q7, v1.83,
merged into main).

## Session protocol
1. New conversation: read this file, `git status --short`, start `Next` item 1. Load `build`
   (+ `tartar-shadcn` and `shadcn` docs for UI). Present the phase's file plan and WAIT for
   approval (global CLAUDE.md) before editing.
2. Work on branch `offline-hardening` cut from `main` (create it in O1). Never commit or merge
   unless asked; the user merges.
3. Migrations: write the SQL file, show it, never apply it. Never drop/rename a column.
   Dev and production are the SAME Supabase project: every harness write lands in production.
4. Close a phase: build + lint clean, harness offline run for that phase, tick Done with paths,
   rewrite Next, suggest commit (`git log --oneline --grep="^Development v" -1` + 0.1), tell the
   user to open a new conversation.

## Decisions locked
- L1 Every CLAUDE.md convention holds (no comments, no useState, class strings in *.styles.ts,
  tokens only in theme.css, useConfirm, writes through runWrite, Transactions is reference).
- L2 QA rows may be created freely in QA Test; the user resets all data after this roadmap.
- L3 Offline test runs against the PRODUCTION BUILD (`yarn build` then `yarn preview --port 4199
  --strictPort`), never the dev server: the service worker only exists in the build.
- L4 A write refused by the server is never deleted silently: it is kept as "failed" with its
  reason until the user retries or discards it.

## Open decisions (ask at the start of the phase that needs them)
- OQ1 (O3) Read cache: extend the hand-rolled `store/common/query.store.ts` with IndexedDB
  persistence (small, no migration of hooks) — RECOMMENDED — or do the planned TanStack Query
  switch now with its persister (touches every data hook, much larger).
- OQ2 (O1, ANSWERED: b — client uuid on inserts AND migration 24 for the RPCs) Duplicate protection for retried writes: client-generated uuid on queued inserts
  (no migration), plus migration 24 adding an idempotency key to the RPC writes
  (create_transaction_with_voucher, record_ledger_payment, mark_payable_paid,
  mark_sale_deposited, verify/reject) — or inserts only for now.
- OQ3 (O4, ANSWERED: Hybrid) setup data (banks, accounts, branches, expense types, income sources)
  queues offline with pending rows; account/auth RPCs stay online-only with a "needs internet" error.

## Bugs (evidence: harness runs o1-o5, 2026-09-30, shots in shots/drive/o1-* .. o5-*)
- OB1 CRITICAL stuck queue: one refused write blocks every write behind it forever, silently.
  Run o4: two offline "Mark deposited" on sale P333 both queued; on reconnect the 2nd got
  P0001 "This sale is already deposited", flush `break`s, so "Expense · 902" and "Payment 50 ·
  QA Customer A" NEVER reached the database. No toast; `lastError` and `discard` exist in
  sync.store but nothing in the UI reads them; reload online retries and fails the same way.
- OB2 Duplicate actions offline: a queued action does not change the row, so the same row
  action can be queued again (cause of OB1 in o4).
- OB3 Queued entries are invisible: offline sale P901 got "Saved offline" toast + header badge,
  but was not in the Sales list or the summary cards until sync.
- OB4 Reads are not kept offline: query.store is memory only (no persist). Pages opened before
  going offline keep data; an offline RELOAD or a page not opened yet (Purchases, Vouchers,
  Payables, Reports, Sales after reload) shows skeleton rows + skeleton cards FOREVER (no error,
  no empty state), and the top-bar branch picker is blank (o1-off-reload-sales,
  o1-off-rep). Forms then have no lookups (branches, customers, banks), so nothing can be
  recorded after an offline reload. Root cause of "never settles" not yet found — O3 step 1.
- OB5 Weak connection (navigator says online, API unreachable): write fails with raw toast
  "TypeError: Failed to fetch", not queued, dialog stays open (o5-w5). runWrite only checks
  navigator.onLine.
- OB6 Crash: after recording a receivable payment offline the Receivables page went to
  "Something went wrong" — console "Cannot change the id of an item" (React Aria collection)
  (o4-w4-pay). Payment itself was queued. Reproduce online too before fixing.
- OB7 After a flush nothing refreshes and nothing is announced: no "Synced N changes" toast,
  the open page keeps pre-sync data until navigated away.
- OB8 Not queued at all: bank.services (all writes), reference.services expense types / income
  sources / most setup writes, account.services (login, register, passwords),
  user.services.decidePasswordReset. See OQ3.
- OB10 NOT OFFLINE, pre-existing (o12-acc4, 2026-10-01): accountant sees "Record payment" on
  Receivables but record_ledger_payment is refused online too: 42501 RLS on table payments. Either
  hide the action for accountants or widen the payments policy — business decision, ask the user.
  Offline the refused write lands in the sync panel's failed list as designed (L4).
- OB9 UNTESTED: flush after a long offline period (expired access token -> 401). Must refresh the
  session and retry, never discard; test in O1.

## Verified working (do not re-test unless touched)
- Service worker installs and precaches 86 files; the app shell and session survive an offline
  reload (o1). Harness quirk, NOT an app bug: persistent Playwright profiles here throw
  "Failed to execute 'open' on 'CacheStorage'", so run with EPHEMERAL=1.
- Queue persists across an offline reload (o4: 5 items kept) and flushes on reconnect and on
  app start; sync icon shows the pending count while offline.
- Queued inserts/RPCs that do reach the server apply correctly (sale P901, deposit of P333).

## Phases
- O1 Write safety (OB1, OB5, OB7, OB9, OQ2): sync.store keeps a `failed` list — server
  refusal (PostgREST/P0001/4xx) moves the item there and flush CONTINUES; network errors stop
  and retry later; 401/JWT expired -> supabase.auth.refreshSession() then retry. runWrite
  queues on network failure (TypeError fetch) as well as navigator offline. Flush end:
  invalidate all queries + toast "Synced N" / "N changes need attention". Sync panel
  (popover on SyncIndicator): pending + failed items with reason, Retry / Discard (useConfirm).
  Client uuid on queued inserts (+ migration 24 if OQ2 says so).
  Verify: o4 duplicate-deposit replay, o5 weak wifi, expired-token run.
- O2 Pending visibility + no duplicates (OB2, OB3, OB6): list hooks merge queued writes as
  "Pending sync" rows (tag), row actions on a row with a queued write are disabled; summary
  cards unchanged but show "+ pending" hint only if cheap. Fix OB6. Verify offline sale,
  expense, purchase, payment, deposit, voucher approve each show pending and cannot repeat.
- O3 Offline reads (OB4, OQ1): find why offline fetches never settle; persist the query cache
  to IndexedDB with `updatedAt`; offline = serve cached data + "Offline — showing data from
  <time>" notice in ContentView; prime the cache on sign-in and on every reconnect for every
  page the role can open (first page of each list, summaries, lookups, branch scope, reports
  default period); a view never loaded shows an explicit "Not saved for offline" state, never a
  skeleton. Verify: sign in, go offline, reload, open every page per role.
- O4 Setup writes (OB8, OQ3) + full offline matrix per role (admin, accountant, employee):
  every page, every write, reload, reconnect. Then remove QA leftovers from the tests.

## Done
- Evidence runs o1-o5 done 2026-09-30.
- O1 DONE, harness-verified 2026-09-30 on the production build (v1.85 code + migration 24 applied):
  o6-replay (online sale 341, offline deposit x2 + Expense 904 + Payment 51: 2nd deposit refused
  "already deposited" -> sync panel "Needs attention (1)" with reason, the rest synced, list
  refreshed without reload); o7-weak (blocked API: sale 906 queued, dialog closed, 30s retry synced,
  "Synced 1 change"); o8-expiry (tampered token + offline reload: 401 stops flush, "session expired"
  sign-out, queue kept, 0 failed; sign in again -> "Synced 1 change", expense 908 listed).
  OB6 crash reproduced again in o6 (payment still queued and synced) -> O2.
- O1 code: supabase/migrations/20261012000024_write_idempotency.sql
  (write_receipts + app.claim_write + key-first overloads of the 8 RPCs, originals untouched);
  src/utils/write.utils.ts (WriteError network|session|refused by status 0/401, prepareWrite stamps
  insert id + p_idempotency_key, replayed insert pkey 23505 = success); src/store/common/sync.store.ts
  (failed list persisted, refusal moves on, network/session stop, owner-scoped flush, retry/discard,
  runWrite queues on network failure); src/store/common/query.store.ts refetchAll;
  src/hook/common/network.hook.ts (flushAndReport toasts + refetch, 30s retry while queued,
  useSyncPanelHook); src/components/common/status/{SyncIndicator,SyncPanel}.tsx.
- OB9 decided: custom 8h JWT has no refresh, so 401 stops the flush, keeps the queue, the existing
  expiry handler signs out, and the flush resumes on next sign-in (sync store is not in resetAllStores).

- O2 DONE, harness-verified 2026-09-30 on the production build: o9-pending (emp: offline deposit
  on sale 391 -> row "Pending sync", 2nd "Mark deposited" not reachable; expense 909 and purchase
  393 listed as pending rows; receivable payment 52 -> no crash, record row locked, payment listed;
  reconnect synced 4, 0 failed), o9b-emp (offline sale 392 listed pending, menu not reachable),
  o9c/o9d-admin (offline voucher approve 909/908 -> voucher row and the Expenses row locked via
  voucher id, synced as Approved).
- O2 code: DataTable (OB6: key on the error/empty state rows — same-slot unkeyed TableRows changed
  id; pending row class + "Pending sync" tag in the `actions` column, `pendingKeysOf` prop);
  write.utils (writeTargetsOf, queuedInsertOf, queuedRpcArgsOf, queuedAtOf; prepareWrite stamps
  queuedAt); src/hook/common/pending.hook.ts (usePendingIds, useWithPendingRows: page 1, status
  filter compatible, branch scope, deduped by id); pendingOf mappers in sale/payment/voucher
  services + transactionServices.pendingDisbursementOf; merged in sale/disbursement/payment/voucher
  list hooks; transaction.response blankTransactionFields + disbursementLinkedIds.
  Known gap: pending expense/purchase rows show "—" payee until synced (no join offline).

- O3 DONE, harness-verified 2026-09-30 on the production build (OQ1 = IndexedDB on query.store;
  priming = lookups + visited pages). Root cause of OB4 "never settles": postgrest-js 2.110 retries
  every GET 3x on a network error (1s/2s/4s), and run() reset error to null each attempt, so each
  offline read sat ~7s+ in skeleton; plus the cache was memory only. o11 (admin): warm dash/txn/
  sales/expenses -> 19 keys in IDB; offline: visited pages show data + "Offline — showing data saved
  <time>" in ~1.5s, unvisited Purchases/Vouchers/Reports show "Not saved for offline" (no skeleton);
  offline RELOAD sales/expenses/dashboard serve cache, branch picker filled; online refetches.
  o11b (emp): offline reload sales -> cached; offline sale 911 recorded with Cash Drawer lookup,
  "Pending sync", synced on reconnect. NOT harness-tested: sign-out clears the IDB cache.
- O3 code: src/utils/idb.utils.ts (readAllQueries/putQuery/clearQueries, DB queryCacheStorageKey
  "tartar-query-cache" in keys/storage.keys.ts); src/store/common/query.store.ts (cacheReady
  hydration, offline = no network + cache or "Not saved for offline" error, successful fetch -> IDB,
  network failure keeps cached data, prime(), watch/unwatch + selectOfflineSavedAt /
  selectHasUnsavedWatched, reset clears IDB); query.hook watch/unwatch; network.hook
  useOfflineNotice; src/hook/app/prime.hook.ts (usePrimeLookupsHook in app.hook: on online+user ->
  refetchAll + prime lookups); src/components/common/status/OfflineNotice.tsx in ContentView.

- O4 DONE, harness-verified 2026-10-01 on the production build (o12-*): admin offline reload ->
  all 13 pages serve saved data, no crash; offline income source, expense type, new bank + account
  queued as "Pending sync" rows (pending category row menu locked), reconnect synced 4, 0 failed,
  rows listed, then deleted again; offline change password and offline login show "This needs an
  internet connection…" and queue nothing. Employee: every allowed page offline after reload, sale
  913 pending -> synced. Accountant: every allowed page offline after reload; offline receivable
  payment 53 queued -> refused on sync (OB10, also refused online) -> failed list, not lost.
- O4 code: write.model `errors` (code -> message, used online and in the failed reason);
  write.utils (slug-keyed inserts get no stamped id and no pkey-replay success; writeTargetsOf
  tracks slug); supabase.utils assertOnline/onlineOnly; bank.services + reference.services writes
  via runWrite (+ pendingAccountOf/pendingBranchOf/pendingExpenseCategoryOf/pendingIncomeSourceOf,
  createBranch returns { queued, slug }); account.services + user.decidePasswordReset via onlineOnly;
  pending.hook useWithPendingRows keyOf; merged in bank.account/branch/expense.category/income.source
  manage hooks. Known gaps: pending bank account row shows "—" bank until synced; a second offline
  account under the same NEW bank name creates the bank twice.

## Next (one conversation, in order)
1. Ask the user about OB10 (accountant Record payment: hide it or widen RLS).
2. Deployment checklist left from the previous roadmap: user resets data (all QA rows incl.
   offline test sales P901, P333, P341, P905, P906, P391, P392, P911, expenses 902/904/907/908/909,
   purchase 393, payments 50/51/52, voucher approvals 908/909, emp sale 913,
   bank "QA O12 Bank" (no delete in the UI)), adds Banks + branch
   legal_name/address.
3. Ask, then delete this file, `.claude/state/audit/` and the old scratchpad audit dir
   (f7-approve.json there holds the superadmin password in plain text).

## Path map
- queue: src/store/common/sync.store.ts (runWrite, enqueue, flush, discard, lastError)
- write executor: src/utils/write.utils.ts · types: src/models/common/write.model.ts
- read cache: src/store/common/query.store.ts · src/hook/common/query.hook.ts · src/utils/idb.utils.ts
  · src/hook/app/prime.hook.ts · src/components/common/status/OfflineNotice.tsx
- mutation toasts: src/hook/common/mutation.hook.ts (queued -> "Saved offline")
- online/flush triggers: src/hook/common/network.hook.ts · src/store/common/network.store.ts
- sync UI: src/components/common/status/SyncIndicator.tsx
- storage keys: src/keys/storage.keys.ts (syncStorageKey "tartar-sync-queue")
- chunk-load error screen: src/components/common/status/RouteErrorView.tsx
- OB6: src/components/ledger/modal/RecordPaymentModal.tsx
- queued services: src/services/data/{transaction,sale,voucher,payment,ledger,party,user}.services.ts
- not queued: src/services/data/{bank,reference,account}.services.ts
- PWA: vite.config.ts (VitePWA generateSW, autoUpdate, globPatterns)

## Audit harness (drives the real app, live Supabase = production)
- Dir: `C:/Users/CCLISO~1/AppData/Local/Temp/claude/c--Users-cclisondato-Documents-MyProgramming-
  Ejie-Business-TARTAR/fdf908ac-a5f4-4224-a10c-c56eaf659eb9/scratchpad/audit` (playwright-core
  installed; copy scripts from `.claude/state/audit/` if it is gone).
- Offline runs: `yarn build`, `yarn preview --port 4199 --strictPort` (background), then
  `EPHEMERAL=1 BASE=http://localhost:4199 TAG=<t> node drive.mjs <spec>`. EPHEMERAL = fresh
  context, so every spec starts with a login step.
- `drive.mjs` step keys: login [user,pw], goto, reload, nav "<sidebar label>" (in-app click, no
  page load), offline true|false (context.setOffline), blockApi true|false (aborts supabase.co
  = weak wifi), queue (logs the persisted sync queue), js "<expr>" (page.evaluate), button
  (+page), click, row (+item menu, expand), fill, pick, date, submit (+confirm, keepOpen),
  confirmOnly, dump, text, count, expect, absent, url, toasts, name (screenshot), stop, always.
  `queue` runs before `submit` in a step, so put it on the NEXT step to see that submit's item.
- Specs: o11-admin/o11-emp (O3 offline reads + offline-reload write), o9-pending/o9b-emp/o9c-admin/o9d-admin (O2 pending rows + locks),
  o1-read.json (offline reads, admin), o4-write.json (offline writes + sync, employee),
  o5-weak.json (weak wifi), o6-replay.json (refused replay + sync panel), o7-weak.json (weak wifi
  + 30s retry + toast recorder), o8-expiry.json (tampered token, re-login keeps storage).
  Shots in shots/drive/. Within one step the driver runs goto -> button -> click -> row -> fill ->
  pick -> submit, so a click that must follow a fill goes on the next step. Toasts fade in ~4s:
  catch them with the MutationObserver recorder `js` step from o7 (window.__t), not `toasts`.
- A leftover `yarn preview` may already hold :4199 (strictPort then fails); it serves dist/ from
  disk, so a fresh `yarn build` is still what it serves.
- QA logins `<name>@qa.test` / `QaTest#2026` (qaadmin1/2, qaacc1/2, qaemp1/2). Developer and
  superadmin passwords are never written to disk.

## State
Branch: offline-hardening (cut from development-overhaul at v1.84; main is at v1.83) · O1 code
committed in v1.85 and verified · Migrations through 24 applied · O2 done and verified,
committed v1.87 · O3 committed v1.88 · O4 done and verified, not committed yet (suggested
as v1.89) · roadmap phases O1-O4 complete; OB10 open.
