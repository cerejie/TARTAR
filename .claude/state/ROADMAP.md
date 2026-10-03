# ROADMAP — Audit fixes (deep critique 2026-10-03)
Updated: 2026-10-03

The Native-feel mobile PWA roadmap is parked as `.claude/state/ROADMAP-PWA-SUSPENDED.md` (device test
script, QA reset list, merge). When this roadmap finishes, delete this file and rename that one back.

## Goal
Fix every finding of `.claude/state/AUDIT-2026-10-03.md` that needs no schema change and no new business
rule, one phase per commit, `yarn build` + `yarn lint` clean after each. Findings that need a migration
or a rule are handed to the user as the last Next item.

## Session protocol
1. Read this file, `git status --short`, start `Next` item 1. Load `build` (+ `tartar-shadcn` and
   `shadcn` docs for UI). Read only the audit section the phase cites — never the whole audit.
2. One phase per conversation / worker. Under autopilot, decide the file plan with `decision-making`
   and do not wait for a go; otherwise present the plan and wait.
3. No migrations, no Edge Function deploys, no new business rules in F1–F9. A phase that turns out to
   need one hard-stops.
4. Close a phase: build + lint clean, tick Done with paths, rewrite Next, update State, commit as
   `Development v<X.Y>` (`git log --oneline --grep="^Development v" -1` + 0.1).
5. Visuals are never confirmed by a build: log "compiled, visuals unconfirmed".

## Decisions locked
Taken by Claude with the decision-making skill on 2026-10-03, standing in for the user — not given by the
user. Any of them may be overturned; say so and the phase is replanned.
- DATA-01 fix now → a client "fetch every page" helper, not aggregate RPCs (no migration needed, correct at
  any row cap; RPCs stay an Open item for the user).
- Query store → fix in place (ordering, refetch scope, cache bound); the TanStack Query migration is not
  started here (larger, and the offline queue behaviour must survive it).
- Security headers → ship the plain headers enforced and the CSP as `Content-Security-Policy-Report-Only`;
  enforcing it waits for a clean preview console (a wrong CSP blanks the production app).
- SEC-01 → client-side safeguard only in F4 (confirm copy); the real fix is a migration, Open.
- Tests → vitest as a devDependency, pure utils only, characterising current behaviour. Why a new
  dependency: the repo has no test runner at all, and vitest reuses the existing Vite config.
- Technical-debt observations (long hooks/components, duplicate ledger service methods) are NOT scheduled
  (CLAUDE.md: convert when touched, never wholesale).
- L1 Every CLAUDE.md convention holds (no comments, no useState, class strings in *.styles.ts, tokens only
  in theme.css, useConfirm, writes through runWrite, Transactions is the reference).

## Phases
- F1 Query ordering (QA-01): per-key request sequence so only the newest response writes; share the
  in-flight promise for one key. `store/common/query.store.ts`.
- F2 Refetch scope + cache bound (PERF-01, PERF-02): `invalidate` / `refetchAll` rerun watched keys and the
  primed offline set only, and forget fetchers of unwatched variants; trim the IndexedDB cache on hydrate
  (age/count bound). Offline reload and `prime` must still work. `store/common/query.store.ts`,
  `utils/idb.utils.ts`, `hook/app/prime.hook.ts`, `hook/app/realtime.hook.ts`.
- F3 Complete reads (DATA-01): one helper that pages a query to the end on a stable order; use it in every
  aggregate and report read and remove `reportLimit`. `utils/supabase.utils.ts` (or a new
  `utils/page.utils.ts`), `services/data/{dashboard,ledger,transaction}.services.ts`, and any other
  service `getAll` (check payment, voucher, sale).
- F4 Client security hardening (SEC-03, SEC-01 safeguard, SEC-04): `vercel.json` headers + report-only CSP;
  password-reset approval confirm states when it was requested and to verify with the person first
  (`hook/data/user/user.manage.hook.ts`); escape `%`, `_`, `\` in `ilike` terms (`utils/filter.utils.ts`).
- F5 Failure experience (UX-01, QA-03, UX-03): map server errors to plain copy in `toError`
  (`utils/supabase.utils.ts`, `utils/error.utils.ts`); `onSuccess` outside the write's failure path
  (`hook/common/mutation.hook.ts`); no push offer while offline (`hook/common/push.hook.ts`).
- F6 Touch + layout (MOB-01, UI-01): options in select / combobox / menu ≥ 44px on coarse pointers
  (`styles/common/theme.css` coarse rule); Dashboard "Sales Overview" head stacks its pills below md
  (`components/dashboard/SalesOverviewCard.tsx`, `styles/dashboard/dashboard.styles.ts`).
- F7 Master Data search (UX-02): `SearchInput` + newest-first on the four Master Data tables
  (`components/master-data/tables/*.tsx`, their manage hooks).
- F8 Unit tests (TEST-01): vitest + `yarn test`; tests for `utils/voucher.utils.ts`, `utils/write.utils.ts`
  (replay rules), `sumCounted`, `utils/report.utils.ts` totals. No rule changes; a failing expectation
  that reveals a real bug is reported, not silently "fixed".
- F9 Entry bundle (PERF-03): find what the 1.29 MB entry holds, defer what the sign-in route does not
  need, split vendors; record before/after sizes. `vite.config.ts`, `routes/*.ts`.

## Path map
- query cache: src/store/common/query.store.ts · src/hook/common/{query,mutation}.hook.ts ·
  src/utils/idb.utils.ts · src/hook/app/{prime,realtime}.hook.ts · src/keys/query.keys.ts
- offline queue (do not regress): src/store/common/sync.store.ts · src/utils/write.utils.ts ·
  src/hook/common/network.hook.ts
- aggregates: src/services/data/{dashboard,ledger,transaction}.services.ts · src/utils/filter.utils.ts
- errors: src/utils/{supabase,error}.utils.ts · src/components/common/status/ErrorState.tsx
- auth UI: src/hook/data/user/user.manage.hook.ts · src/components/user/tables/UsersTable.tsx
- deploy: vercel.json · vite.config.ts · src/sw.ts
- money math: src/utils/{voucher,report,disbursement}.utils.ts ·
  src/models/data/transaction/transaction.response.ts (sumCounted)
- audit: .claude/state/AUDIT-2026-10-03.md

## Done
- [x] Audit written 2026-10-03: `.claude/state/AUDIT-2026-10-03.md` (lint + build clean at v2.43). Committed v2.44.
- [x] F1 Query ordering (v2.45): `src/store/common/query.store.ts` — one request record per key (global
  counter id + shared promise); only the newest request for a key writes the entry or the IndexedDB cache;
  `run` (mount, prime) joins the in-flight request, `refresh` / `invalidate` / `refetchAll` /
  `refetchWatched` always start a new one; `reset` drops pending requests so a late response cannot land
  after sign-out. `src/hook/common/query.hook.ts` — `refetch` calls `refresh`. Compiled, not exercised
  under a throttled network.
- [x] F2 Refetch scope + cache bound (v2.46): `src/store/common/query.store.ts` — a fetcher is forgotten when
  its key loses its last watcher unless the key is primed, so `invalidate` / `refetchAll` rerun watched keys
  plus the primed lookups only; `invalidate` keeps the stale entry of an unwatched key (refetched on mount,
  still readable offline) instead of deleting it; search-term variants are never written to IndexedDB; on
  hydrate the cache keeps the newest 120 entries no older than 30 days and deletes the rest.
  `src/utils/idb.utils.ts` — `deleteQueries`. `prime.hook.ts` / `realtime.hook.ts` needed no change.
  Compiled, not exercised offline in a browser.
- [x] F3 Complete reads (v2.47): `src/utils/page.utils.ts` (new) — `everyRow` pages a query to the end on its
  own order plus an `id` tiebreaker, 1,000 rows a page, stopping on an empty page so it is complete at any
  server row cap; `everyRowIn` splits an id list into 200-id chunks for follow-up `.in()` lookups.
  `src/services/data/{transaction,sale,payment,ledger}.services.ts` — every `getAll`, `getDisbursementAll`,
  party summary and party ledger read goes through it; `reportLimit` is gone; voucher and payable lookups
  are chunked. `src/services/data/dashboard.services.ts` — summary, overview, sales series, branch monitor,
  due alerts, pending reviews and due checks all read every row. No query key or filter field changed.
  Compiled, totals not compared against `select sum(...)` on real data.
- [x] F4 Client security hardening (v2.48): `vercel.json` — enforced `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy` and a `Content-Security-Policy` holding
  only `frame-ancestors 'none'`; the full policy (self, `*.supabase.co` over https/wss, inline styles, data /
  blob images) ships as `Content-Security-Policy-Report-Only`. `src/hook/data/user/user.manage.hook.ts` — the
  reset-approval confirm states when the request was made and to confirm with the person first.
  `src/utils/filter.utils.ts` — `containsPattern` escapes `\`, `%`, `_`; used by `applyLedgerFilters` and
  `src/services/data/party.services.ts`. Headers not checked with `curl -I` on a preview; compiled, visuals
  unconfirmed.

## Next
1. F5 Failure experience — audit § UX-01, QA-03, UX-03.
2. F6 Touch + layout — audit § MOB-01, UI-01.
3. F7 Master Data search — audit § UX-02.
4. F8 Unit tests — audit § TEST-01.
5. F9 Entry bundle — audit § PERF-03.
6. USER DECISIONS — hard-stop, not an autopilot phase (schema change / business rule): see Open. Then
    delete this file and rename ROADMAP-PWA-SUSPENDED.md back to ROADMAP.md.

## Open
- SEC-01 real fix (migration): replace the anon-supplied reset password with an admin-issued one.
- SEC-02 (migration): failed-login counter + lockout; minimum password length.
- H1 (dashboard check): Supabase Auth "Allow new users to sign up" must be OFF — else any outsider can
  read customers, suppliers and bank accounts.
- H2 (dashboard check): API "Max rows" value.
- QA-02 (migration): idempotency key on `update_transaction_with_voucher`.
- DATA-01 follow-up (migration): server-side aggregate RPCs for the dashboard. Until then every aggregate
  read costs one extra empty request (the end-of-data probe) and ships every row.
- DATA-01 remainder (not done in F3): the purchases "paid" date basis still takes its id list from the
  `purchase_ids_paid_between` RPC in one response and sends it back as one `.in("id", …)` — past the API
  max rows, or a few hundred ids in the URL, that one filter is still incomplete. The clean fix is an RPC
  change (migration). Lookup lists (customers, suppliers, branches, categories, users) are still single
  unpaged reads.
- SEC-03 follow-up (user, preview deploy): `curl -I` the preview URL, open the app with the console open, and
  once no CSP report-only violation shows, rename `Content-Security-Policy-Report-Only` to
  `Content-Security-Policy` in `vercel.json` (merging `frame-ancestors 'none'` into it). If the Supabase
  project uses a custom domain, add it to `connect-src` first.
- SEC-04 remainder: PostgREST also reads `*` as a wildcard in `ilike` and has no escape for it, so a search
  for `*` still matches everything.
- SEC-05: `send-push` failure counting needs an Edge Function redeploy by the user.

## State
Branch: mobile-app-native-newlook · Last commit Development v2.48 (F4) · Uncommitted: none · Last check:
yarn build + yarn lint clean 2026-10-03.
