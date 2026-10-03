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
