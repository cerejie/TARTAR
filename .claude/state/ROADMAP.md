# ROADMAP — Offline hardening (live offline test, 2026-09-30)
Updated: 2026-09-30

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
- OQ3 (O4) Banks, expense types, income sources and other setup writes: queue offline too, or
  keep them online-only with a clear "needs internet" message.

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
- O1 code (build + lint clean, NOT yet harness-verified): supabase/migrations/20261012000024_write_idempotency.sql
  (write_receipts + app.claim_write + key-first overloads of the 8 RPCs, originals untouched);
  src/utils/write.utils.ts (WriteError network|session|refused by status 0/401, prepareWrite stamps
  insert id + p_idempotency_key, replayed insert pkey 23505 = success); src/store/common/sync.store.ts
  (failed list persisted, refusal moves on, network/session stop, owner-scoped flush, retry/discard,
  runWrite queues on network failure); src/store/common/query.store.ts refetchAll;
  src/hook/common/network.hook.ts (flushAndReport toasts + refetch, 30s retry while queued,
  useSyncPanelHook); src/components/common/status/{SyncIndicator,SyncPanel}.tsx.
- OB9 decided: custom 8h JWT has no refresh, so 401 stops the flush, keeps the queue, the existing
  expiry handler signs out, and the flush resumes on next sign-in (sync store is not in resetAllStores).

## Next (one conversation, in order)
1. O1 verify: user applies migration 24 FIRST (the client already sends p_idempotency_key; the 8
   RPCs fail until it is applied). Then harness: o4 duplicate-deposit replay (2nd deposit lands in
   the sync panel as failed, Expense 902 + Payment 50 still sync), o5 weak wifi (queued, not raw
   toast; syncs within 30s of unblock), expired token (tamper token via js step -> signed out,
   queue kept, sign in -> syncs). Then tick O1 Done, commit.
2. O2, O3, O4 (one per conversation).
3. Deployment checklist left from the previous roadmap: user resets data (all QA rows incl.
   offline test sale P901 and deposited P333), adds Banks + branch legal_name/address.
4. Ask, then delete this file, `.claude/state/audit/` and the old scratchpad audit dir
   (f7-approve.json there holds the superadmin password in plain text).

## Path map
- queue: src/store/common/sync.store.ts (runWrite, enqueue, flush, discard, lastError)
- write executor: src/utils/write.utils.ts · types: src/models/common/write.model.ts
- read cache: src/store/common/query.store.ts · src/hook/common/query.hook.ts
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
- Specs: o1-read.json (offline reads, admin), o4-write.json (offline writes + sync, employee),
  o5-weak.json (weak wifi). Shots in shots/drive/.
- QA logins `<name>@qa.test` / `QaTest#2026` (qaadmin1/2, qaacc1/2, qaemp1/2). Developer and
  superadmin passwords are never written to disk.

## State
Branch: offline-hardening (cut from development-overhaul at v1.84; main is at v1.83) · O1 code
uncommitted · Migration 24 written, NOT applied · Migrations through 23 applied.
