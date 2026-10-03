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
