# Autopilot log

## 2026-10-03 — D3 Dashboard → Development v2.26
- Pending sales verification = ? → sale_status "deposited" (existing `pendingVerification` in sale.list.hook; verify only from Deposited, memory)
- Pending vouchers = ? → status "pending" (existing status; dashboard is manager-only, so actionable)
- Attention items → overdue receivables, overdue payables, payables due this week, vouchers awaiting approval, sales awaiting verification (roadmap list; near-due receivables/checks left to admin)
- Aggregate attention tap → module with status preset via useFilterField (no single record for an aggregate; ?focus needs one id)
- Monthly expenses source → expense-type sumCountedRows MTD (same definition as Today's Expenses; no new rule)
- Phone vs desktop order → two compositions behind DashboardBoard(useIsCompact) (DOM order differs; CSS order would fight bento)
- Desktop → main: Today → Needs attention (full) → AR/AP/Monthly Sales/Monthly Expenses → trends; aside keeps Notifications feed (attention stays second at every width)
- Phone notifications feed → dropped from body (app-bar alerts sheet already carries it)
- KPI tap → StatCard `href` mirroring MetricTile Link (no new primitive; PriorityMetric/DashboardMetricGroup not needed)
- AttentionList home → moved admin/home → dashboard/ (shared by main + admin); item.meta replaces hard-coded "accounts"
- Admin Home dominance → AttentionList moved above period switch + tiles
- Verification: yarn build + yarn lint clean; compiled, visuals unconfirmed

## 2026-10-03 — leftovers → Development v2.27
- Uncommitted autopilot conductor/worker rewrite + CLAUDE.md → committed as its own version (Worker step 3); build + lint clean

## 2026-10-03 — D4 Record cards + detail sheets → Development v2.28
- Card layout → keep generic DataTableCards, cap meta at 2 (audit's dedicated transaction summary not needed; role mapping already right)
- Overflow meta → shown in the detail sheet's core meta list; sheet opens whenever there is overflow, sections or actions (no data lost on phone)
- Cap when onRowClick is set → no cap (card opens a different record, so no sheet holds the overflow)
- Whole-card press → existing title overlay press; separate "Show details" button replaced by a decorative chevron (one tap target)
- Sheet footer actions → DataTable `detailActions` + IRowAction `priority` (reuses the row-action shape; destructive keeps useConfirm)
- Confirm from sheet → keep the sheet open under the confirmation (cancel returns to the record; delete closes it as the row leaves)
- Sheet types → SheetKind action/detail/form/flow via one drawerKind cva; AppModal `fill` → kind "form"; default action = no visual change for existing sheets
- Transactions balance impact / debit-credit → not added (would invent an accounting rule); sections regrouped Details → Financial details → Audit
- Detail rows → wrap long values instead of truncating (description was cut off in sheets)
- Primary CTA height → 48px through sheetActions selector (beats drawerFooter's 44px), other footers unchanged until D9
- Verification: yarn build + yarn lint clean; compiled, visuals unconfirmed

## 2026-10-03 — D5 Sales + Vouchers action-first → Development v2.29
- Sale/voucher detail footer → reuse DataTable `detailActions` = the row-action list with `priority` (one source for row menu + sheet; no dedicated SaleSummary — RecordDetailSheet hero already shows amount, customer, status)
- Sale verification + deposit status → the one sale_status chip in the hero + "Deposit and verification" section first (no new status rule)
- Sale primary → Mark deposited (undeposited, encoder) / Verify (deposited, manager) / Resubmit (rejected, encoder); Reject + Delete stay danger with their existing confirm/modal
- "View reason" label → "Resubmit" where it opens a resubmit form (sales, sourced vouchers, purchases, expenses); manual rejected voucher keeps "View reason" (view-only modal)
- Collapsible sections → IDetailSection `disclosure` rendered by new RecordDetailSection over ui/collapsible (React Aria owns open state; no useState); desktop expanded row ignores it
- Voucher sections → Financial summary open; Voucher details / Approval / Audit history collapsed (audit: no long accounting form by default); "Source" = existing voucherPurpose (no new rule)
- Voucher audit history → created/prepared by/printed only (no voucher history table exists; no schema change)
- Print in sheet → secondary when approved, else in More disabled with its "Needs approval" hint
- Purchases/Expenses voucher link → "Open voucher" navigates to /vouchers with vouchers filter = payee search + voucher status (no ?focus consumer exists; payee is the only search column), gated on createVouchers (route permission)
- openVoucher location → disbursement.list.hook (owner of both tables; a separate hook kind would not fit list|form|detail|manage|scope)
- Verification: yarn build + yarn lint clean; compiled, visuals unconfirmed

## 2026-10-03 — D6 Receivables / Payables phone flow → Development v2.30
- Phone ledger shape → stacked full-screen detail sheet (AppModal kind flow) over the party-list sheet; desktop two-pane slide unchanged (minimal diff, one hook call, desktop untouched)
- Two-pane slide on compact → removed; list renders plainly, detail is its own sheet with the party as title (back = close sheet)
- Party balance → shared LedgerPartyOverview: phone StatCard outstanding + DetailRows facts; desktop keeps the 4-StatCard bento (dedupes customer/supplier)
- Running balance (debit/credit cumulative) → not built; pending/rejected payments and filtered windows need a user rule (Open item). Ledger rows show date, reference, balance/amount due, amount, due date (existing math)
- "Ledger" step → Print statement in the sheet footer (existing statement), records list is the on-screen ledger
- Customer sheet primary → Record payment over the existing selection (disabled until picked); per-record sheet Record payment selects that one row (reuses PaymentAllocationModal)
- Supplier primary Mark as paid → per-record sheet primary (rule is per payable); supplier sheet footer = Print statement
- Main Receivables/Payables record sheets → Record payment / Mark paid primary, Delete danger (D5 pattern)
- Dead max-lg head styles + ledgerPayButton → removed (head is desktop-only now)
- Verification: yarn build + yarn lint clean; compiled, visuals unconfirmed

## 2026-10-03 — D7 Forms → Development v2.31
- Section metadata → existing IFieldSection drives it (no new field); compact + > 1 visible section = collapsible, desktop unchanged cards (minimal diff, no per-hook edits)
- Default disclosure → every section starts expanded (create forms need every section filled; collapse is for navigating, not hiding required input)
- Collapsed section with a validation error → forced open (sectionHasError), so a failed submit never hides its error
- Collapse state → controlled Disclosure over new disclosure.store keyed by form useId, reset on open (useState banned; error-forcing needs control)
- "Review" step → sticky FormSummaryBar pinned above the action bar on compact: total (emphasis) line always visible, tap reveals the rest; desktop keeps inline FormSummary
- Pinned slot → generic AppModal `pinned` prop (both layouts) rather than a compact-only prop
- Manual voucher form → converted to sections (Voucher → Payment → Voucher breakdown) mirroring the purchase form; particulars moved into the core section so the breakdown section is purchase-only
- All-hidden sections → skipped (visibleSectionsOf), so cash/expense vouchers show no empty cards
- Verification: yarn build + yarn lint clean; compiled, visuals unconfirmed

## 2026-10-03 — D8 Secondary screens → Development v2.32
- File plan → Reports key rows + sheet, period meta, phone Print footer; Branch monitor card roles; Users sheet actions; Master Data short labels; Account compact settings list + panel sheets; notification section titles (Simple tier, all reversible UI)
- Reports "key rows → open detailed" → compact shows first 5 rows + "View all n" full-screen sheet with the full table; desktop untouched (one shared ReportRowsTable for all five reports)
- Report period → periodLabel as ContentView meta for non-summary types (summary already has month/range filters)
- Report Print on phones → ContentView footer (last step of type → period → summary → rows → print); desktop keeps it in actions
- Branch monitoring "status" → not invented (no status field/rule); card = branch + Sales (key metric) + Expenses, receivables/payables in the sheet's Ledger section (no duplicate rows)
- Branches page order → unchanged (management then monitoring) to keep desktop untouched
- Users "Edit / More" → Edit user primary; Approve account (pending) / Approve new password (reset requested) take primary and Edit drops to secondary; Reset password in More; Reject/Delete danger
- Master Data labels → Suppliers / Categories / Income / Banks on all widths (4-segment control fits a phone; page title gives context)
- Account phone → grouped ListSection list; each row opens its own sheet (one modal key per panel, so no content flash on close); desktop bento unchanged; card bodies extracted and shared
- Theme row → tap toggles light/dark (same as account sheet); Sync row → opens the existing AppBar sync sheet; Version → build timestamp via vite define (package version is 0.0.0, no release version exists)
- Notifications order → already Action required → due alerts → updates in main + admin; only titles renamed ("Needs your action" → "Action required", "Updates" → "Information"); due groups keep urgency order
- Verification: yarn build + yarn lint clean; compiled, visuals unconfirmed

## 2026-10-03 — D9 Polish → Development v2.33
- File plan → copy (empty/error/offline), refresh without dimming, 48px drawer CTA, D0 contrast leftovers, chart title drift; motion/icons audit only (Simple tier, all reversible UI)
- Offline error copy → centralised in ErrorState via useIsOnline (one place covers every table, card and section error)
- Empty states → title (what happened) + hint (what next) via TableEmptyState hint / DataTable emptyHint and EmptyState title; shared hints in models/common/table.model (filtered, search, first record) — no invented business rules in copy
- Refresh feedback → no dimming; desktop keeps the header spinner, cards/ListSection get a thin indeterminate RefreshBar positioned absolutely (zero layout shift)
- Phone primary CTA → drawer footer primary 48px (SheetActions already 48px); FAB stays 56px
- D0 leftovers → light destructive/danger #c81e1e (≥ 5.2:1 on muted and danger-bg), chart-2 #0891b2 and chart-5 #d97706 (≥ 3:1 non-text on panel); dark untouched
- Charts → main "Sales Overview" renamed "Sales trend" + period subtitle, same as admin (one question: how sales moved over the period)
- Motion / icons → already compliant (navigation fades, expansion chevrons, FAB state, focus pulse; 16/20px icons); no change
- Verification: yarn build + yarn lint clean; compiled, visuals unconfirmed

## 2026-10-03 — D10 Verification → Development v2.34
- Running-balance ledger Open item → does not block D10 (verification covers what was built); carried to the PWA roadmap's Next as an Open business rule, not built
- Harness → playwright-core installed in the session scratchpad (not the project); new .claude/state/audit/d10.mjs sweep (PW env = module path) with writes faked; drive.mjs reused for phone flows + offline
- Roles → qaemp1 / qaacc1 / qaadmin2 (qaemp2 login now rejected: invalid email or password — noted for the user, not changed)
- Offline regression → one real QA sale (1,031, qaemp1) queued offline and replayed, same as the existing o9 harness; added to the P0-6 reset list
- Result → 172 route checks (3 roles × 4 viewports × light/dark): x-overflow 0, no page/console errors, cards on phone + tablet portrait, tables on tablet landscape + desktop; offline Pending sync + replay ok, failed list empty
- Detail-sheet hero stray "·" under stacked title/subtitle cells → subtitle on its own line (mirrors the card head)
- Tablet landscape bento gap (3 thirds wrapped 2+1 below xl) → third/twoThirds from lg; tablet portrait odd stat sets lead with a full-width card (phone pattern)
- Handoff → D10 passed: mobile ROADMAP.md deleted, ROADMAP-PWA-SUSPENDED.md renamed to ROADMAP.md with a carry-over block; its Next item 1 is the device test script → hard-stop
- Verification: yarn build + yarn lint clean; layout fixes confirmed in emulated-viewport screenshots, physical-device visuals unconfirmed

## 2026-10-03 — R0 Visual audit → Development v2.35
- Leftover tree (conductor roadmap setup: PWA roadmap parked, STOP deleted by user) → committed with R0 as instructed by NEXT_PROMPT, not as its own version
- Harness → playwright-core in the worker scratchpad, Chrome channel, writes faked by route interception (d10 pattern), password only via QA_PASSWORD env; admin role = qaadmin1 per dispatch
- Search scope → Vouchers shares SearchTrigger with Receivables/Payables, so R1 converts all three to inline search (one pattern, no app-bar search mode on phone)
- Print scope → L4 "everywhere": all print entries (Sales/Purchases/Expenses toolbar, Reports, voucher detail + row menu, ledger statements) hidden on phone in R1 — one small pattern, worker-sized
- Customer ledger "pagination" (user item 3) → the book-icon party sheet and the party detail Records list (both paged 1–5 of 6); the Records page list already loads on scroll
- Record-payment selection in party detail → keep behaviour, change only entry/visibility (no new rule)
- Fix phases → R4 sheets + stat tiles, R5 phone card content, R6 tablet-portrait ledger grid (tablet-only finding, allowed by L1)
- "9 accounts" vs "9 records" → copy fix to "records" (count is records; wording only, not a business rule)
- Verification: no source changes; emulated-viewport checked, physical device unconfirmed

## 2026-10-03 — R1 Receivables/Payables phone toolbar → Development v2.36
- Inline search mechanism → CSS-only expand/collapse (`toolbar-searching` custom variant on `[data-filter-toolbar]` :has focus-within or data-filled) instead of focus state in a store (no useState rule; no new state for an ephemeral focus)
- Search placement → always flex-1 in the toolbar row; Filters + Sort sit beside it and collapse to 40px icon pills (40 matches the existing phone toolbar height, not 44)
- App-bar search mode → retired entirely (no caller left): AppBarSearch, SearchTrigger, view.store searchMode, useSearchMode, useAppBarSearchHook, ISearchMode deleted
- F2 badge → inline search excluded from the count on compact; Reset keeps the visible search
- F3 badge → payments scope default paymentStatus "pending" was counted; count now compares each field to the scope default (defaultFiltersOf)
- Reset semantics → restore the scope defaults instead of {} (otherwise a reset payments list shows a badge of 1); side effect: Receivables Reset returns the status pill to its default "Unpaid" — UI only, reversible
- Print on phone → useIsPhone (phone only); tablet portrait keeps Reports footer print and statement print (L1)
- Supplier ledger sheet with no actions on phone → footer undefined (AppModal Close) rather than an empty footer; F5 (R2) removes Close
- Tablet portrait search height → h-9 like the other pills there; h-10 only below md
- Verification: yarn build + yarn lint clean; emulated-viewport checked (390 light/dark, 820, 1440: search 160→262px on focus, Filters/Sort 40x40 side by side, no badge from search, Payments badge gone, no Print on phone, x-overflow 0, no page errors), physical device unconfirmed

## 2026-10-03 — R2 Ledger sheets infinite scroll on phone → Development v2.38
- Leftover tree (user deleted STOP to re-authorize) → committed with R2 as instructed by the dispatch
- Mechanism → client-paged DataTable in card mode grows its slice via the existing LoadMoreSentinel (one change in DataTable covers party list, Records and Payments lists) rather than per-table server paging (no service/hook change, lists are small lookups)
- Breakpoint → isCompact (card mode), same as the existing server-paged load-more path, so phone and tablet-portrait card lists behave alike; desktop/tablet landscape keep TablePagination
- TablePagination visibleOnPhone → removed (no caller left)
- F5 Close → AppModal on phone omits the footer when none is passed (X closes); global on phone, tablet keeps Close (L1)
- Visual check → skipped: QA_PASSWORD not provided in this dispatch; compiled, visuals unconfirmed
- Verification: yarn build + yarn lint clean (lint warnings only in .claude/state/audit scripts, pre-existing)

## 2026-10-03 — R3 Customer/Supplier detail native redesign on phone → Development v2.39
- Scope breakpoint → isPhone only; tablet portrait keeps the AppModal sheet with StatCard + rows (L1 locks tablet)
- Sheet chrome → AppSheet kind="flow" (grab handle, swipe-to-close, title "Customer ledger"/"Supplier ledger"; name lives in the hero) rather than adding a handle to AppModal
- Hero → new LedgerPartyHero (avatar, name, outstanding big + tone, meta line); LedgerPartyOverview untouched for tablet/desktop
- Records | Payments → ContextSwitch, tab in ledger.store (no useState); switching to Payments ends selection
- Card amount → balance, "of <amount>" when partly paid, full amount when paid (display only, no new money rule)
- Record payment entry → footer primary turns on selection mode; same selection + PaymentAllocationModal as before (no rule change); disabled when no unpaid rows
- F7 → customer card tap opens the ledger detail via openCustomerLedger (mirrors supplier), plus "View ledger" in the ⋮ menu
- Payment card "Recorded by —" / ref "—" → deferred to R5 (F13 covers empty fields on all phone cards)
- Visual check → skipped: QA_PASSWORD not provided; compiled, visuals unconfirmed
- Verification: yarn build + yarn lint clean (lint warnings only in .claude/state/audit scripts, pre-existing)

## 2026-10-03 — R4 Sheets and stat tiles polish → Development v2.40
- F9 footer → fix once in SheetActions (all detail sheets): unprioritised danger actions move into the ⋮ More menu, matching the Sale footer shape (primary full width + secondary + ⋮)
- Reject next to Approve/Verify → stays visible: `priority: "secondary"` danger renders as a destructive row button (Sales, Vouchers, Users); hiding a workflow decision in ⋮ was rejected
- "Recorded by —" on record detail → hidden when created_by is empty (ledger + payable); unknown-user lookup still shows "—"
- F10 → FilterPopover compact branch reuses AppSheet (handle, swipe, Sort's header) instead of a bespoke Sheet; footer kept as Reset | Show results grid
- F11 → statCaption line-clamp-2 under the 12rem container query (same trigger as the old truncate), no phone-only hook needed
- Visual check → skipped: QA_PASSWORD not provided; compiled, visuals unconfirmed
- Verification: yarn build + yarn lint clean (lint warnings only in .claude/state/audit scripts, pre-existing)

## 2026-10-03 — R5 Phone card content → Development v2.41
- F13 scope → one filter in DataTableCards (empty / "—" content dropped from every card role) instead of per-table render changes; desktop tables untouched
- F13 detail sheet → the phone record detail sheet's card fields share the filter (empty lines omitted there too, matching R4's "Recorded by" hide)
- F14 line → compact-only "Summary" subtitle: customer/supplier name, else description; no new data, desktop columns unchanged
- F12 fit → 4-option segmented switches get text-xs + 4px padding on phone only (label kept "Categories"); 2–3 option switches unchanged
- F15 copy → attention default noun "record" (counts are ledger rows); admin check items say "check"
- Visual check → skipped: QA_PASSWORD not provided; compiled, visuals unconfirmed
- Verification: yarn build + yarn lint clean (lint warnings only in .claude/state/audit scripts, pre-existing)

## 2026-10-03 — R6 Tablet portrait ledger grid → Development v2.42
- F16 trigger → CSS `md:max-lg:portrait:` variant on the card list (exact match of `useDeviceClass` tabletPortrait) instead of a new JS hook; no re-render, phone and desktop untouched
- F16 scope → opt-in `cardGrid` prop on DataTable, passed only by the /receivables + /payables page tables (records + payments); other card lists unchanged (L1)
- Visual check → skipped: QA_PASSWORD not provided; compiled, visuals unconfirmed
- Verification: yarn build + yarn lint clean (lint warnings only in .claude/state/audit scripts, pre-existing)

## 2026-10-03 — RZ Final sweep + hand-back → Development v2.43
- RZ browse → skipped: QA_PASSWORD absent from the dispatch (per NEXT_PROMPT RZ note); no regressions found or fixed, no source changes
- Roadmap hand-back → mobile audit ROADMAP.md deleted, ROADMAP-PWA-SUSPENDED.md renamed back to ROADMAP.md, unbrowsed R2–R6 + RZ sweep carried into its Next as a pre-device-script check
- Hard-stop → PWA Next item 1 is the device test script (physical phone, user-driven)

## 2026-10-03 — Leftovers → Development v2.44
- Dirty tree at start → committed as its own version (audit, new Audit fixes roadmap, parked PWA roadmap rename, deep-critique skill, STOP removed by the user); yarn build + yarn lint clean first

## 2026-10-03 — F1 Query ordering → Development v2.45
- Who shares the in-flight promise → only `run` (mount, prime); invalidate / refetchAll / refetchWatched / hook `refetch` always start a new request (joining a request sent before a write would hand back pre-write rows, the bug in reverse)
- Ordering token → one module counter + one newest-request record per key, instead of a per-key counter (a cleared map plus per-key restart at 1 could let a pre-sign-out response match a new request)
- reset → also clears pending requests, so a response landing after sign-out is dropped rather than written into the next session's cache
- Superseded response → dropped from both the store entry and the IndexedDB write; its own caller still receives its data
- Scope → query.store.ts + the hook's `refetch` only; fetcher pruning and refetch scope left to F2
- Verification: yarn build + yarn lint clean (lint warnings only in .claude/state/audit scripts, pre-existing); compiled, not exercised under a throttled network

## 2026-10-03 — F2 Refetch scope + cache bound → Development v2.46
- Where to prune fetchers → on `unwatch` when the last watcher leaves and the key is not primed (the fetcher map is then exactly watched + primed, so `invalidate` / `refetchAll` need no extra filtering and F1's `start` / `run` ordering is untouched)
- Primed offline set → a module `primedKeys` set filled by `prime`, cleared on `reset`; primed lookups keep their fetcher and are still refetched on reconnect, after a sync flush and on invalidate
- Unwatched key hit by `invalidate` → keep its stale entry instead of deleting it (mount always refetches; deleting it offline would turn a saved page into "Not saved for offline")
- Search-term variants → detected by a non-empty `"search"` in the key's filter JSON, checked in the store (one place) rather than a `persist` option threaded through every list hook
- Cache bound → newest 120 entries, at most 30 days old, trimmed on hydrate and deleted from IndexedDB (generous age so a branch offline for weeks keeps its pages; primed lookups are always among the newest)
- prime.hook.ts / realtime.hook.ts → no change needed (the store scope covers both callers)
- Verification: yarn build + yarn lint clean (lint warnings only in .claude/state/audit scripts, pre-existing); compiled, not exercised offline in a browser

## 2026-10-03 — F3 Complete reads → Development v2.47
- When a paged read ends → on an empty page, advancing by rows received, not on a short page (a short page cannot tell "end" from a server max-rows below 1,000, value unknown — Open H2; costs one extra empty request per read, accepted for correct totals)
- Helper input → a query factory called once per page, not one reused builder (re-awaiting and re-ranging one PostgREST builder leans on its internals)
- Stable order → the helper appends `id` ascending after the caller's own order (dates tie constantly; without a unique tiebreaker pages can skip or repeat rows)
- Follow-up `.in()` lookups (vouchers, payables, due-payable transactions) → chunked 200 ids each now (complete reads make the id list unbounded, and one long `.in` both overflows the URL and is itself capped)
- Purchases "paid" date basis (RPC id list + one `.in`) → left as is and recorded in Open (a proper fix changes the RPC, which is a migration)
- Lookup lists (customers, suppliers, branches, categories, users) → out of scope (roadmap names aggregates, reports and `getAll` only)
- Home → new `src/utils/page.utils.ts` rather than `supabase.utils.ts` (that file is the client and its errors; paging is a separate job)
- Verification: yarn build + yarn lint clean (lint warnings only in .claude/state/audit scripts, pre-existing); compiled, totals not compared against real data

## 2026-10-03 — F4 Client security hardening → Development v2.48
- File plan → vercel.json headers, reset-approval confirm copy, one `containsPattern` escape helper (Simple tier, all reversible, no schema or rule change)
- Frame protection → enforced now as `X-Frame-Options: DENY` plus an enforced CSP holding only `frame-ancestors 'none'` (a report-only policy with no report endpoint blocks nothing, and that one directive cannot blank the app)
- Full CSP → report-only as locked; `style-src 'unsafe-inline'` kept (React Aria, recharts and the print window set inline styles), `script-src 'self'` only
- Supabase origin in the CSP → `https://*.supabase.co` + `wss://*.supabase.co` rather than reading the project URL out of .env (no secret file read; a custom domain is noted in Open)
- Permissions-Policy → camera, microphone, geolocation, payment, usb all off (the app uses none; push is not governed by it)
- Reset-approval copy → request time via existing `formatDateTime` + "confirm with <name> directly" + why (anyone who knows the email can request); reject copy unchanged
- Escape helper home → `utils/filter.utils.ts` `containsPattern`, reused by party.services search too (the only other `ilike`); filter field and query keys untouched
- `*` wildcard → not handled (PostgREST has no escape for it); recorded in Open
- Verification: yarn build + yarn lint clean (lint warnings only in .claude/state/audit scripts, pre-existing); headers not checked on a deploy; compiled, visuals unconfirmed

## 2026-10-03 — F5 Failure experience → Development v2.49
- File plan → error copy map in error.utils, `toError` wiring, `onSuccess` moved out of the write's try, offline guard in `usePushOffer` (Simple tier, four files, all reversible, no schema or rule change)
- Which server messages to reword → only machine-generated ones, by error code; text the database functions raise themselves (`P0001`, and the custom `42501` / `28000` / `28P01` raises) passes through (it is already plain copy and carries the business rule — rewording it would invent or hide one)
- `42501` → reworded to "You do not have permission to do this" only when the text is Postgres's own (row-level security / permission denied); authored "not authorized to…" messages kept
- Unmapped codes → one generic "could not complete this" line rather than the raw text (the audit's point is no raw server text on screen)
- Developer detail → raw error kept as `cause` on the new Error; no `console.error` (src has no console calls today)
- Network failures → left as raw text in `toError` (query.store keeps cached data offline by matching the `TypeError` prefix; rewording would regress offline reads; `ErrorState` already shows offline copy) — recorded in Open
- Home of the map → `utils/error.utils.ts`, called from `toError` (roadmap names both files; supabase.utils stays the client)
- Throwing `onSuccess` → write stays saved, entry not marked failed, one warning toast "Saved… do not save again — reload" with the cause as description (not swallowed; avoids the double save QA-03 describes)
- Push offer offline → checked at call time from the network store, before `markPromptOffered`, so the one-time offer is kept for the next online save
- Verification: yarn build + yarn lint clean (lint warnings only in .claude/state/audit scripts, pre-existing); compiled, error copy not triggered against a real server error, visuals unconfirmed

## 2026-10-03 — F6 Touch + layout → Development v2.50
- File plan → one selector list in theme.css, a `stackExtra` prop on SectionCard with its class in card.styles, one prop on SalesOverviewCard (Simple tier, four files, style-only, reversible)
- Which option slots get 44px → select-item, combobox-item, dropdown-menu-item, dropdown-menu-sub-trigger, command-item (every listbox / menu row the ui set ships; command-item included because the branch scope list is one); labels and separators left alone (not targets)
- How → `min-height` in the existing coarse `:where` list, not a padding change or an edit to components/ui (generated files stay untouched; zero specificity; desktop density unchanged)
- Where the stacking lives → a `stackExtra` boolean on SectionCard with the class in card.styles.ts, not a class passed in from dashboard.styles.ts (the head grid belongs to the primitive; a feature should not know CardAction's grid placement) — so dashboard.styles.ts is unchanged, unlike the roadmap's file list
- Stack for every card or opt-in → opt-in (NotificationsCard's extra is a short link that fits beside its title)
- Breakpoint → below `md`, as the roadmap states; the switch is already `w-full` below `lg`, so it fills the row
- Verification: yarn build + yarn lint clean (lint warnings only in .claude/state/audit scripts, pre-existing); compiled, visuals unconfirmed

## 2026-10-03 — F7 Master Data search → Development v2.51
- File plan → one pure util (search.utils), four search keys, `useSearch` in the four manage hooks, `FilterToolbar` + `SearchInput` in the four tables (Simple tier, UI-only, reversible, no schema or rule change)
- Client or server search → client-side over the already-loaded list (lookup lists stay unpaged per CLAUDE.md; the list query, its key and the offline cache are untouched)
- Where newest-first is applied → in the manage hooks, on the table rows only, not in the services (the same lists feed every selector, which must keep name / sort order)
- Newest-first vs the "Order" column on categories, income sources and banks → newest-first in the Master Data table as the roadmap states; `sort` still drives pickers and stays visible as a column
- Search state → existing `useSearch` (view store) with keys in `keys/table.keys.ts`; no new store
- What is searched → suppliers: name, contact person, contact, address; categories: name, code; income sources: name; bank accounts: bank, account name, account number
- Empty state → "No … match your search" + the existing `searchEmptyHint` when a term is set, first-record copy otherwise
- Page size → still client-paged at 8; DataTable already clamps the page when results shrink
- `tsconfig.app.tsbuildinfo` → committed (tracked file, changed only by the new source file in its list; leaving it would leave the tree dirty)
- Verification: yarn build + yarn lint clean (lint warnings only in .claude/state/audit scripts, pre-existing); compiled, visuals unconfirmed

## 2026-10-03 — F8 Unit tests → Development v2.52
- File plan → vitest + `yarn test`, one `*.test.ts` beside each unit under test, one shared fixture file (Simple tier, no app code touched, reversible by deleting the files)
- vitest version → ^3.2 (the repo is on Vite 5; vitest 4 needs Vite 6+, and upgrading Vite is out of scope)
- Config → a separate `vitest.config.ts` (node environment, `src/**/*.test.ts`, `@` alias) rather than a `test` block in `vite.config.ts` (keeps the PWA and Tailwind plugins out of test runs and `.claude/state/audit` scripts out of discovery)
- Test location and name → colocated `<file>.test.ts` (no `tests/` tree; the pair stays together, `tsc -b` type-checks them, nothing imports them so the bundle is unchanged)
- `write.utils` imports the Supabase client, which throws without env → `vi.mock("./supabase.utils")` with a small fake server, so the tests need no `.env.local` and make no network call
- Shared row builders → `src/utils/fixture.utils.ts` (voucher, disbursement, category, payable), used by two test files (duplication is a defect here)
- Extra target → `search.utils` (pure, cheap, named in the F7 hand-off); `disbursement.utils` left out (not in the roadmap's F8 list) and recorded in Open
- Date-dependent helpers (`rangeFor`, `periodLabel`, formatted money / dates in print documents) → not tested (locale and clock dependent; totals are what F8 names); overdue ordering tested with year-2000 / year-2999 due dates
- Float sums → asserted to the centavo with `toBeCloseTo`, not pinned to the raw binary float (characterises the rule, not the representation)
- Cash Flow rows vs Cash In total → the tests pin today's behaviour (collections counted in Cash In, no Collection row); whether that is intended is a business rule, so it is recorded in Open, not changed
- Verification: yarn test 92 / 92 passing on the first run (no expectation had to be bent, no money-math bug found); yarn build + yarn lint clean (lint warnings only in .claude/state/audit scripts, pre-existing)

## 2026-10-03 — F9 Entry bundle → Development v2.53
- File plan → lazy-load the two signed-in layouts through the existing `lazyView` + a two-group `manualChunks` in vite.config.ts (Simple tier, three files, reversible, no dependency, no rule or schema change)
- How to find what the entry holds → a throwaway Rollup `generateBundle` analyzer built into the scratch directory, deleted afterwards (no visualizer dependency added)
- Which packages get a vendor chunk → react / react-dom / scheduler / react-router and @supabase only (the boot path needs them whole); react-aria, zod and react-hook-form left to Rollup (a manual react-aria chunk would drag the table / menu parts that are lazy today into the eager load)
- Public auth views → stay eager (CLAUDE.md says so; they are about 16 kB rendered)
- Layout fallback and error boundary → reuse `lazyView` as is (`PageSkeleton`, `RouteErrorView` with its chunk-load "new version" copy) rather than a second helper
- Splitting `FormField` so the sign-in form stops pulling calendar / combobox / select → not done (a form-layer refactor beyond the roadmap's `vite.config.ts` + `routes/*.ts`; recorded in Open)
- More precache entries (90 → 123, +20 KiB) → accepted (the same code split into smaller files; every chunk is still precached, so offline keeps working)
- Next item is USER DECISIONS → STOP written, no next phase
- Verification: yarn build + yarn lint clean (lint warnings only in .claude/state/audit scripts, pre-existing), yarn test 92 / 92; entry 1,292.70 → 703.35 kB, JS before sign-in 1,292.70 → 1,203.60 kB (gzip 389.82 → 364.93); compiled, visuals unconfirmed

## 2026-10-03 — Visual audit (conductor, Stage 1) → Development v2.56
- Archived the Audit fixes roadmap as ROADMAP-AUDIT-2026-10-03-DONE.md (SEC-01 / SEC-02 shipped in v2.54; migration 32 waits for the production deploy)
- qaacc1 password reset → not needed (signed in with admin12345)
- Sweep harness bugs → fixed in sweep.mjs (popup-closer closed the main page; file:// shots blank in contact sheets; tabs matched by text) — harness only, no app code
- Findings → UI-01 … UI-17, none needs a migration or a business rule; phases V1–V8 ordered by severity, carried USER DECISIONS kept as the final hard-stop
- Unresolved "Recorded by" user → hide the row (locked in the roadmap; overturnable)
- Verification: 1,221 surfaces, 0 failed, 183 / 183 contact sheets viewed; app code untouched, so build / lint not rerun

## 2026-10-03 — V1 Detail placeholders → Development v2.57
- File plan → one rule in `utils/detail.utils.ts` (`visibleDetailItems` drops a row whose rendered value is null / undefined / false / blank / "—") + drop redundant detail fallbacks (Simple tier, reversible, no rule or schema change)
- Where the empty check runs → on `item.render(record)` inside `visibleDetailItems` (renders are pure and cheap; keeps the three callers unchanged)
- `userNameOf` returning "—" → kept for table cells (locked: "—" stays in tables); the shared rule hides it in detail rows, so no nullable variant was needed
- Composite "user · date" rows (sale deposited / reviewed, payment verified hint) → `joinDetailParts` keeps only known parts, so an unresolved user shows the date alone and an empty pair hides the row
- UI-17 Payables "Recorded by" column of dashes → hide the column when no row on the page resolves a recorder (derived `showRecordedBy` in `payment.list.hook.ts`); root cause looks like null `created_by` on older rows (services pass it) — left as the Open hypothesis
- Redundant `hidden: (row) => !row.created_by` predicates → left in place (harmless, minimal diff)
- Sweep killed at the 10-min background cap after admin phone → reran emp alone with a 1-hour timeout; admin checked from full-size shots
- Verification: yarn build + yarn lint clean (warnings only in .claude/state/audit scripts, pre-existing), yarn test 99 / 99; swept admin phone 231 + emp phone 175 / 0 failed; looked at emp sheets 03, 09, 13 and five admin full shots — no "—" detail rows; swept, device unconfirmed; UI-17 desk compiled, visuals unconfirmed

## 2026-10-03 — V2 Edit history → Development v2.58
- File plan → one pure util `utils/audit.utils.ts` (field label map + per-field formatter + change summary) with `audit.utils.test.ts`, `IAuditChangeLine` beside `ITransactionAudit`, the modal maps lines; no hook or service change (Simple tier, reversible, no rule or schema change)
- Value formatting → status / type / cash-account label maps, `amount` → `formatMoney`, `*_at` → `formatDateTime`, `*_date` → `formatDate`, `*_by` → `userNameOf`, other enums humanised, booleans Yes / No, anything else raw
- `*_id` fields (customer, supplier, bank account) → no resolver in the modal, so the line reads "<Label>: Changed" rather than printing a UUID (no extra lookups fetched for a rare edit)
- Unresolved user in a `*_by` field → treated as no value (same rule as V1), so the line falls back to "Set to …" / "Changed"
- Null old → "Set to X"; null new → "Cleared (was X)"; untracked keys (`id`, `created_at`, `updated_at`, `version`) skipped
- `verified_by` / `verified_at` labelled "Reviewed by / at" to match the sale sheet's wording
- Field name styling → `auditField` becomes plain medium-weight text with a colon (no `code` chip)
- Verification: yarn build + yarn lint clean (warnings only in .claude/state/audit scripts, pre-existing), yarn test 106 / 106; swept admin + acc desk 385 / 0 failed, 65 sheets; looked at acc sheet 04 and four full edit-history shots — readable labels, dates, names; swept, device unconfirmed

## 2026-10-03 — V3 Action groups → Development v2.59
- File plan → all footer rules inside `SheetActions` + one `hasEnabledAction` util shared with `RowActionMenu` and the two sheets; account sheets get a `footer` slot instead of a per-sheet layout (Simple tier, UI only, reversible)
- Overflow-only footer → first enabled overflow action leads as a full-width outline button (destructive when danger), ⋮ trails only if more actions remain (audit's second option; names the action instead of a vague "More actions")
- Disabled primary / secondary → moved to the ⋮ menu with its hint rather than dropped, so "Edit expense · Locked" still explains itself
- Every action disabled → no ⋮ in table rows and no sheet footer (paid payable); the status chip already says "Paid"
- Password sheet → submit button in the footer linked to the form by `form` id; the desktop card keeps its inline button (fields shared via `ChangePasswordFields`)
- Notifications sheet → toggle in the footer only for on / off modes; other modes show the note alone with no footer
- Verification: yarn build + yarn lint clean (warnings only in .claude/state/audit scripts, pre-existing); swept admin + emp phone + desk 829 / 0 failed, 124 sheets; looked at emp phone sheet 03 and nine full shots; swept, device unconfirmed

## 2026-10-03 — V4 Date labels → Development v2.60
- File plan → one optional `cardPrefix` on `IDataTableColumn`, applied in `DataTableCards` (cards + sheet hero share `cardFieldsOf`), set to "Due" on the three due-date subtitles; per-table render change rejected because it would print "Due" in desktop cells too (Simple tier, UI only)
- Reports receivables card → due date moved from title to subtitle, name becomes the title (was the first column, so the date led the card)
- Customer / Supplier ledger view subtitles → left alone (they render their own composed subtitle, not cited by the audit)
- Purchases due date with no unpaid, non-rejected date → "—" (dropped on cards, aligned in desktop cells); status chip already says Pending / Paid / Rejected
- UI-13 → `keepTogether` (no-break spaces) on the deposited / reviewed date-time only, not in `formatDateTime`, so exports and prints keep plain spaces
- Verification: yarn build + yarn lint clean (warnings only in .claude/state/audit scripts, pre-existing), tests 107 / 107; swept admin + emp phone 393 / 0 failed, 50 sheets; looked at emp sheet 13 and six full shots; swept, device unconfirmed

## 2026-10-03 — V5 Admin app → Development v2.61
- File plan → rail fix in `app.bar.styles.ts` + a label span in `AppTabBar`; branch name resolved in the two admin hooks and passed down as `branchLabel` (Simple tier, UI only, reversible)
- Rail indicator → moved to the rail's outer edge (`md:-left-2`) rather than padding the item (audit's second option; padding would squeeze a 74 px label in an 80 px item)
- Rail width → `md:w-28` (was `w-24`) so "Notifications" has 11 px each side inside the hover fill; nothing else depends on the rail width
- Long labels → `max-w-full truncate` on the label span as a guard; no current label truncates on phone or rail
- UI-09 scope → admin payable + due-check sheets printed the same slug, fixed with the receivable sheet (same defect, same hook pattern)
- Branch lookup → `useBranchListHook().branchName` in the hook (falls back to the slug for an unknown branch), not a new service call
- Verification: yarn build + yarn lint clean (warnings only in .claude/state/audit scripts, pre-existing); swept admin phone + tabP + tabL + desk 523 / 0 failed, 79 sheets; looked at four sheets, rail zoomed on 12 pages, two full receivable-sheet shots; payable sheet branch row compiled, visuals unconfirmed; swept, device unconfirmed

## 2026-10-03 — V6 Reports → Development v2.62
- File plan → period fix in the shared `ContentView` head + `viewMeta`, card fix as an optional `cardMetaLimit` on `DataTable` set by the Branch Summary table (Simple tier, UI only, reversible)
- Where the period goes → stays in the title row as a sibling of the h1, out of the tabs / actions group (moving it to the toolbar row rejected: it would also move the Dashboard date, which shares `meta`)
- Tab strip → no change to `ContextSwitch`; freeing the row is enough for all eight tabs at 1440, and at 1180 it scrolls (the roadmap accepts "or scrolls"; the chip clip is the locked design)
- UI-07 → per-table `cardMetaLimit` of 3 rather than raising the global limit of 2 (a global change would alter every card with three metas); the card then needs no detail sheet
- Verification: yarn build + yarn lint clean (warnings only in .claude/state/audit scripts, pre-existing), tests 107 / 107; swept admin phone + tabL + desk on /reports 30 / 0 failed, 6 sheets; looked at four sheets and one full shot; some report-tab shots still skeleton (harness timing); swept, device unconfirmed

## 2026-10-03 — V7 Ledger modals → Development v2.63
- File plan → label in `ledger.list.hook.ts`, tag copy in `CustomerInfoTag`, column changes in the two ledger views (Simple tier, UI copy / layout only, reversible)
- UI-14 label → one field label "<Receivable | Payable> <reference> · Amount to apply" (a field renders a single label; the hint line keeps due date and balance); `PaymentAllocationModal` left alone (it is a table with headed columns, not cited)
- UI-15 → "No contact details" (the audit's wording); "Complete" / "Incomplete" unchanged
- UI-16 → nowrap cells + drop the "Created by" column when no row resolves a creator, rather than widening the modal (already `ModalSize` xl, the largest; a new size would be a new token for one screen)
- UI-16 scope → `SupplierLedgerView` has the same columns and the same defect, fixed alongside (V5 precedent)
- Harness → sweep.mjs post-tab-click wait uses `route.settle ?? 1500` (conductor's instruction, for V8)
- Verification: yarn build + yarn lint clean (warnings only in .claude/state/audit scripts, pre-existing); swept admin desk + phone on /receivables + /payables 120 / 0 failed, 19 sheets; looked at two sheets and four full shots; supplier ledger detail and payable record-payment compiled, visuals unconfirmed; swept, device unconfirmed

## 2026-10-03 — V8 Full re-sweep (written up by the conductor) → Development v2.64
- Worker cut off by a network failure after viewing 179 / 179 sheets, before writing the roadmap → conductor wrote the Done entry from the worker's per-sheet notes (no app code involved)
- New defects found by V8 → one new phase V10 (UI-18 … UI-21, all Low; UI-18 is a V5 regression), not silent fixes
- User report mid-run (offline Sales / Vouchers show "not saved for offline") → new phase V9, ahead of V10 (High; the user's rule: offline shows the cached data from the last time online)
- HEAD found on main (fast-forward merge at 18:14, origin/main at v2.63; same pattern as the 12:17 merge before the run) → treated as the user's deploy merge; switched back to mobilel-app-native (same commit, clean tree) so autopilot does not run on main

## 2026-10-03 — V9 Offline shows the last loaded data → Development v2.65
- Root cause → the cache held only keys a mounted screen had run (prime covered lookups only), and the shared `page` filter scope leaked one screen's status tab into the other screens' keys
- How the primer learns the keys → each hook exports its `…QueryOf` spec and uses it itself (no drift), rather than a prime file re-composing keys by hand or mounting hidden pages (Complex tier: touches 11 hooks, but the only option where a key change cannot silently break offline)
- Where the primer lives → `hook/app/prime.view.hook.ts`, loaded with one dynamic import so the list hooks stay out of the entry chunk
- What is primed → default view of every page the role can open: first page, default sort, each status tab, each dashboard / admin period, each report tab, active branch scope only (all branches × all pages rejected: request count multiplies by the branch count)
- Freshness vs load → background keys keep no live fetcher; an invalidate marks them stale and one batch run refreshes them at most every 30 s (immediate refetch of ~62 keys on every realtime event rejected)
- Fallback to "newest cached variant of the same list" (roadmap's expected shape) → not built: another tab, page, sort or period is different data and would be shown under the wrong label in a bookkeeping app; priming makes the default variants exact hits instead; left in Open for the user
- Foreign status fields in `page` filters → stripped by `pageFiltersOf` before key and fetch (services never read them, so results are unchanged)
- Cache trim → 120 → 300 entries (admin primes ~62 plus lookups; 120 left no room for visited variants)
- Probe method → remote hosts aborted + `navigator.onLine` false instead of `context.setOffline` (the dev server must keep serving lazy chunks, as the production service worker does); no writes performed, 0 write requests seen
- Verification: yarn build + yarn lint clean (warnings only in .claude/state/audit scripts, pre-existing), tests 113 / 113; probe before 12 / 17 admin routes with offline cards, after 0 on admin / emp / acc phone + admin desk and on 26 tabs clicked offline; looked at four contact sheets and two full shots; probed offline in dev, installed-PWA cold start unconfirmed

## 2026-10-03 — V10 Sweep leftovers → Development v2.66
- File plan → one style constant per finding (UI-18 `adminSplit`, UI-19 `metricTileSubLine`), one shared card rule (UI-20), selection derived in the two admin hooks (UI-21) (Simple tier, layout / UI state only, reversible)
- UI-18 width → asymmetric `3fr / 2fr` split from md, equal halves from lg (narrower rail rejected: undoes V5; stacking the pane under the list rejected: the selected detail would land off-screen); first try `6fr / 5fr` fixed the name but still cut "RCV-QAT-2609-0001", so widened to `3fr / 2fr` after the shot
- UI-19 → let the hint wrap (two-line clamp) rather than shorten the copy ("new this week" keeps its meaning)
- UI-20 → fix in `DataTableCards` (chevron moves into the head row when a pressable card has no tags and no metas) rather than inventing a supplier status tag to "match" the customer card (a tag would need a new label rule; the defect is the empty row); cards with tags or metas unchanged
- UI-21 → selection derived from the visible rows (covers a record leaving the list on refresh) + segment change closes the sheet (a real clear, not one that reappears on switching back)
- Sweep side effect → a host network drop put the phone run offline for ~37 surfaces; V9's cache served every page (banner + rows), recorded as a harness/host artifact
- Verification: yarn build + yarn lint clean (warnings only in .claude/state/audit scripts, pre-existing), tests 113 / 113; swept admin phone + tabP + desk, 144 surfaces, 1 harness timeout, 23 / 23 sheets viewed; probe for 820 truncation, tabP detail panes, phone supplier picker and desk tab switch; swept, device unconfirmed
- Next roadmap item is USER DECISIONS → hard-stop, STOP written

## 2026-10-03 — Stage 1: new roadmap (conductor) → Development v2.67
- User's answers to the Visual roadmap's Open list → collection removal (YES, everything), offline scope (YES, all variants), Migration 32 + archived Open items later
- Visual roadmap → archived as ROADMAP-VISUAL-2026-10-03-DONE.md (user's instruction, overrides the STOP note's "rename PWA back")
- Collection removal → one phase C1, not split by layer (12 app hits; no hit in print or report code)
- User's three extra requests (print title = branch, period print month + year + purchases filter, purchase check number) → phases P1–P3 between collection and offline, so the offline phases also cover any new query the print work adds
- Migration-needing work (collection rows, purchase check number) → proposal under .claude/state/proposals/, client work that does not depend on it ships, the proposal waits in USER DECISIONS (user: "make it a USER DECISIONS hard-stop", i.e. at the end) — keeps the offline phases unblocked
- Offline → two phases (O1 paged-list variants, O2 branches / details / month change), then Z full re-sweep + offline probe for all three roles

## 2026-10-03 — C1 Collection removal → Development v2.68
- File plan → one phase across enum, list hook, filter bar, label sites, routes, report + dashboard Cash In, last payment, tests, proposal (Simple tier, client-only, reversible)
- Legacy `collection` rows → shown as type "Other" via `transactionTypeLabelOf` / `transactionTypeColorOf` (no crash, no "undefined"); labelling them "Customer Payment" rejected: it would pre-empt the migration's conversion choice
- Cash In source → `record_ledger_payment` writes `payments` + `payment_allocations`, not a transaction, so receivable payments are added to Cash In / the "Customer Payment" row (report, print, dashboard `monthlyCashIn`); manual `customer_payment` transactions still count as before
- Which customer payments count → verified only (mirrors `countedAmountOf`, where a sale counts once verified, and `record_ledger_payment`, which applies only verified payments to balances); "non-rejected" rejected; flagged in USER DECISIONS for confirmation
- Dashboard Cash In → updated too, so it agrees with the Cash Flow report for the month
- Customer "last payment" → latest of verified receivable payments and non-sale customer transactions (`.neq("type", "sale")` keeps legacy rows without naming the type)
- "Nothing to collect here" → "No unpaid balances here" (drops the term from the receivables empty state)
- Migration 33 → proposal only (`.claude/state/proposals/migration-33-collection.sql`): recommend converting to `customer_payment` + `not valid`/`validate` check constraint; enum value removal needs a type rebuild, not recommended
- Verification: yarn build + yarn lint clean (warnings only in .claude/state/audit scripts, pre-existing), tests 118 / 118; swept admin + acc phone + desk on /, /transactions, /receivables, /reports, /admin/receivables (168 surfaces, admin desk aborted on a dashboard click timeout and was re-run without / : 63 surfaces, 0 failed); looked: sheet-admin-phone-01, -09, Cash Flow tab admin phone + acc desk (Customer Payment row ₱1,701 = transactions + verified ledger payments, Cash In ₱6,176 = rows), Record transaction form; Playwright probe: form Type options = Customer Payment / Supplier Payment / Cash Deposit, filter Type options have no Collection, no "collection" text on /transactions; swept, device unconfirmed
- Noted, not changed: the Transactions page "Cash In" card sums transactions only (ledger payments are not transactions); left as is, it is that list's summary
- Conductor: user message mid-run (notifications cannot be re-enabled after an accidental deny) → new phase N1, placed first in Next (live bug, small, UI only)

## 2026-10-04 — N1 Account notifications toggle → Development v2.69
- File plan → common `AppSwitch` over `ui/switch` in `components/common/form/`, `NotificationsToggle` becomes the switch, sheet + card share `NotificationsControls`, logic in `push.hook.ts` + `push.store.ts` (Simple tier, UI + client state only, no schema)
- Switch "on" → only when permission is granted and the subscription uses the current key (existing `subscribed` check); denied / default / unsubscribed read off
- Blocked tap → toast with the platform's steps + the same steps inline under the switch (a toast alone vanishes; inline alone gives no feedback to the tap); platform from `isAppleTouchDevice` + Android UA, else desktop
- Flip on by itself → re-read on visibilitychange, focus and Permissions API change; auto-subscribe only if the user asked (blocked tap or a denied prompt), flag persisted so an iOS relaunch from Settings still resumes; flag cleared before the attempt so a failure never loops
- Dismissed prompt ("default") → own message "turn the switch on again to see the prompt"; the next tap calls requestPermission again
- Sheet layout → switch in the body above the note instead of a footer button (a settings switch belongs with its label)
- Verification: yarn build + yarn lint clean (warnings only in .claude/state/audit scripts, pre-existing), tests 121 / 121; swept admin + emp phone + desk on /account (36 surfaces, 0 failed); looked: admin phone Notifications sheet, emp desk card; Playwright probe with faked permission/subscription: on (switch checked), off → tap → dismissed toast, denied → tap → steps toast + inline steps, denied → granted + focus → auto-subscribe attempted (dev has no service worker, so "needs the installed app" toast — expected); swept, device unconfirmed

## 2026-10-04 — P1 Print title = branch → Development v2.70
- File plan → pure `branchScopeTitleOf` in new `utils/branch.utils.ts` (+ test), `printScope` from `useBranchScopeHook`, every printReport caller and `printStatement` take it; `printReport` h1 + `<title>` read the scope, the sub line drops the now-duplicate scope (Simple tier, client only)
- All-branches title → "All branches" (short, already the app's scope label; a branch list grows unbounded and one header per branch would split aggregated reports)
- No branch scope but limited access (employee, single-branch user) → the accessible branch's name, or the names joined " · " when several but not all; "All branches" only when every branch is visible (the old fallback printed "All branches" for an employee who sees one branch)
- Voucher print → unchanged: it already heads with the voucher's own branch (legal name + address), which is right even under the all-branches scope
- Verification: yarn build + yarn lint clean (warnings only in .claude/state/audit scripts, pre-existing), tests 126 / 126; Playwright popup probe (desk, writes faked) as admin, emp, acc: sales / expenses / purchases period print and report print h1 + title = "QA Test", voucher print = "QA Test Trading Corp." (emp; admin + acc had no printable voucher; emp has no /reports); looked: admin report, emp purchases. Not exercised live: the "All branches" / multi-branch label (QA accounts see one branch — covered by unit tests) and the statement print; swept, device unconfirmed

## 2026-10-04 — P2 Period print month + year and the purchases print filter → Development v2.71
- File plan → `month` / `year` in `periodPrintSchema` + `monthValues` / `monthLabels` / `IMonthYear` (period.model), pure month-year helpers in `period.utils.ts` (+ new test), fields in `period.print.hook.ts`; Branch Summary filter swaps its 12-month select for the same pair; purchases print = new `purchasePrintDocument` + `transactionServices.getPurchasesDueAll` (Simple tier, client only, no migration)
- Monthly control → two half-width selects, Month (January–December) + Year, default the current month and year; the date field shows only for daily / weekly (a date picker for a month asked the user to pick a day that does not matter)
- Year options → this year and the 5 before (6), newest first; built when the modal renders so a year change never needs a reload (enough history for a print; older ranges stay reachable through Custom range)
- "Every print option that has a month" → the PeriodPrintModal (sales, expenses, purchases) and the Reports Branch Summary month filter (it drives Print report); the Daily / Weekly / Monthly report tabs are fixed to-date windows with no month choice — unchanged
- Branch Summary with a custom range → both selects show their placeholder; picking a month keeps the range's year, picking a year keeps the range's month
- Purchases due → `due_date` within the range (purchases without a due date are paid on purchase, so never "due"), every voucher status, with a Payment column (payable Open / Partial / Paid, "—" before a payable exists)
- Purchase vouchers → voucher `created_at` within the range via the existing `dateBasis: "voucher"` query, every status shown with its status column; amounts = amount to pay (voucher amount), as the old print
- New service call instead of a "due" date basis in the filter popover → no UI scope creep; reuses `applyLedgerFilters` with a `due_date` column map + `everyRow` + `withVouchers`
- Verification: yarn build + yarn lint clean (warnings only in .claude/state/audit scripts, pre-existing), tests 138 / 138; sweep admin + emp + acc desk + phone on /sales /purchases /expenses /reports (453 surfaces, 0 failed); looked: sheet-admin-desk-15, sheet-acc-phone-07, sheet-emp-desk-01 + full shots admin desk sales print modal, admin phone reports page + year list — Month + Year render, no overflow; popup probe of the purchases print as admin, emp, acc: Oct 2026 (4 due, 12 vouchers, totals match) and Jan 2021 (both empty texts); looked: admin Oct 2026 print, acc reports summary. Phone list pages show no Print button in the toolbar (pre-existing, not touched); swept, device unconfirmed
- Conductor: user message mid-run (2026-10-04) → new phases M1 (mobile list rows), M2 (Payments tab replaces By customer / By supplier), M3 (mobile form interaction), placed after P3 and before O1 so the offline phases prime the new tabs

## 2026-10-04 — P3 Purchase check number → Development v2.72
- Client-only path? → no: purchase + voucher are one RPC write (one runWrite, queued offline); a follow-up voucher update is not atomic and cannot be queued offline (voucher id unknown until the RPC returns) → migration proposal, display shipped, input waits (roadmap protocol 3, no hard-stop)
- Cash "Paid from" → hide the field unless Paid from = bank account (the voucher is a check only then); the check-details constraint stays; the RPC stores the number only on a check voucher
- Update semantics in the proposal → p_check_number null keeps the stored value (calls queued before the migration), '' clears, text replaces; old signatures dropped so PostgREST never sees two matching overloads
- Found while reading: `app.sync_voucher_from_tx` keeps check_bank when a purchase moves bank → cash, so the voucher would break vouchers_check_details_require_check → the proposal's trigger clears all check details when the voucher stops being a check (schema, not applied)
- Proposal file → drops / bodies / grants left commented with exact edit instructions, so running it as is cannot drop the RPCs
- Display → purchase record sheet voucher section "Check number" (hidden when empty), purchases period print "Check No." column in both sections ("—" when empty); Vouchers detail, admin payable detail and voucher print already show it; supplier payable records carry no voucher join — not extended (would need a service join for a field no payable row has yet)
- Verification: yarn build + yarn lint clean (warnings only in .claude/state/audit scripts, pre-existing), tests 138 / 138; sweep admin + emp desk + phone on /purchases /vouchers /payables /admin/payables (266 surfaces, 0 failed); looked: sheet-emp-desk-01, sheet-admin-phone-05, full shot admin phone purchase record sheet; popup probe of the purchases print as admin + emp (Oct 2026: "Check No." column in both sections, "—" for every row — no QA voucher carries a check number yet, so the filled case and the purchase-sheet row are compiled, visuals unconfirmed); voucher print code unchanged (already prints Check No.); swept, device unconfirmed

## 2026-10-04 — M1 Mobile list rows instead of cards → Development v2.74
- File plan → one change in the shared primitive: `DataTableCards.tsx` renamed `DataTableList.tsx`, `dataCard*` styles → `dataList*`, `DataTable.tsx` mounts it; column roles in `table.model.ts` unchanged (Simple tier)
- Where the list applies → wherever cards rendered (phone + tablet portrait, the existing `isCompact` rule from the mobile design memory); tablet landscape and desktop keep the real table
- Row shape → [checkbox] title / one muted secondary line (subtitles + metas joined by "·", truncated) · trailing amount over status · row actions · chevron when pressable; full-width hairline separators, no per-row card chrome; min 56px tall
- Meta labels → dropped on the row (native list), kept in the detail sheet; `cardMetaLimit` still caps the row's metas when the row opens the sheet
- `cardGrid` (2-column tablet portrait grid) → removed from DataTable and the three ledger tables: a native list is one column, and hairline rows in two columns read as a grid of cards
- Readability without labels → due-date meta columns get `cardPrefix: "Due"` (Purchases, Customer / Supplier Ledger records); the detail sheet drops the prefix on labelled meta rows so it never reads "Due date · Due Oct 9"
- Hairlines → `divide-border` at full strength (60% was invisible on the pastel backdrop in the first shots)
- Verification: yarn build + yarn lint clean (warnings only in .claude/state/audit scripts, pre-existing), tests 138 / 138; sweep admin + emp + acc phone + tabP on every route (594 surfaces, 3 failed = admin phone "/" dashboard page.goto timeouts, not a list route); looked: sheet-admin-tabP-01, sheet-emp-phone-05, sheet-acc-phone-10 + full shots admin phone transactions / purchases / receivables / sales-dark, admin tabP receivables — rows, overdue tint, status under amount, chevrons, detail sheets OK; re-sweep admin phone /purchases after the prefix fix (21 surfaces, 0 failed), looked at the purchase sheet; compiled, swept, device unconfirmed
- Commit slip: Development v2.73 (cf640b6, pushed) holds only the `DataTableCards.tsx` → `DataTableList.tsx` rename — a bad pathspec aborted `git add`, so the commit ran on the staged rename alone and that one commit does not build. History not rewritten (no force-push); Development v2.74 carries the whole phase and builds clean

## 2026-10-04 — M2 Receivables / Payables Payments tab → Development v2.75
- File plan → reuse the existing Records / By-party view switch: `ledgerViewValues` = records / payments, `LedgerRecordsSection` mounts `LedgerPaymentsTable` on Payments, pages drop the stacked payments table; delete `LedgerPartiesTable` + the party query, its returns and its priming (Simple tier)
- Tab labels → static "Records" / "Payments" (`ledgerViewLabels`), so `useLedgerViewHook` / `LedgerViewTabs` lose their now-unused scope argument
- Status pills on Payments → hidden (they filter ledger records; payment status lives in the payments Filters popover), same as the old by-party tab
- Summary cards → kept on both tabs (the balance overview belongs to the page, not the table)
- `ledgerPartyKey` / `getPartySummaries` → kept: the Supplier Ledger modal and detail still read them, and the records mutations still invalidate that key
- Old links with `?view=parties` → fall back to Records (`useSearchParam` validates against the values)
- Verification: yarn build + yarn lint clean (warnings only in .claude/state/audit scripts, pre-existing), tests 138 / 138; sweep admin + emp + acc phone + desk on /receivables /payables (227 surfaces, 2 failed = emp desk run "execution context destroyed" harness flake, acc phone "/" goto timeout — not M2 routes); the sweep caps tabs so payables Payments was not captured → Playwright probe admin + emp desk + phone of both Payments tabs; looked: admin-phone receivables tab-payments, acc-desk payables tab-records, admin-desk + emp-phone payables Payments — one table per tab, status pills gone on Payments; swept, device unconfirmed

## 2026-10-04 — M3 Mobile form interaction → Development v2.76
- Audit (deep-critique, Playwright iPhone 13 / Pixel 7 / 820×1180 touch, keyboard = shrunken viewport): focused amount field landed under the keyboard, ~100px of form visible behind a stacked Cancel + Record footer; `select` = ComboBox input (tap raised the keyboard + a floating popover); `date` = floating calendar popover in the sheet; touch tablet + keyboard → viewport turned landscape → `useIsCompact` flipped Sheet → Dialog mid-typing (remount, focus lost); input text 14px from 768px up (iOS focus zoom on tablets); interactive-widget, inputMode / enterKeyHint, 44px targets already in place
- File plan → fixes in the shared primitives only: FormField, breakpoint hook, keyboard hook, modal + form styles, theme.css (Moderate tier, client only, no schema)
- Phone `select` / `date` → native `<select>` (ui/native-select) and native `<input type="date">` wherever the sheet presents (OS picker, no keyboard, no popover positioning) over a React Aria tray (would still need a search input = keyboard, and is not the platform control); creatable / multiselect stay comboboxes (typing is the point); desktop unchanged
- Empty native date → "" when required (zod shows "Use a valid date"), null when optional (`due_date` is nullable)
- Sheet ↔ Dialog flip → hold the device class while a touch user types (`isTextEntry`), re-measured on the next media change / render after; kept `interactive-widget=resizes-content` (the established Android path) rather than switching to resizes-visual
- Keyboard open → footer actions in one compact row (Cancel + primary side by side, ~70px instead of ~165px), pinned summary kept (live total while typing amounts); signalled by `data-keyboard-open` on `<html>` from the keyboard hook (touch + text entry focused)
- Focused field → `scrollIntoView({ block: "nearest" })` on focus and on visualViewport resize, scroll margins keep the label visible
- Sheet heights → `--visual-viewport-height` (written by the keyboard hook, default 100dvh) instead of 100dvh − inset, so the header stays on screen when iOS pans the visual viewport
- 16px field text on coarse pointers at every width; native select joins the 44px target list; native controls take `color-scheme: dark` in dark mode
- Verification: yarn build + yarn lint clean (warnings only in .claude/state/audit scripts, pre-existing), tests 138 / 138; Playwright probe before / after (iPhone 13 + Pixel 7 on purchase, expense, sale, transaction, receivable forms; record payment on iPhone; 820×1180 touch tablet on purchase + expense): after — selects / dates native at 16px / 44px, focused amount above the footer (e.g. iPhone 248–284 vs footer top 316), footer a row while typing, tablet stays a sheet at 820×684; looked: before + after purchase open / select / date, expense keyboard; sweep emp phone + desk on /transactions /sales /purchases /expenses /receivables (153 surfaces, 1 failed = emp desk "execution context destroyed" harness flake; phone toolbar triggers miss the Record FAB, covered by the probe); looked: all 22 sheets (sheet-emp-phone-01…11, sheet-emp-desk-01…11) — desktop forms unchanged, no regressions; probed in emulation, device unconfirmed
