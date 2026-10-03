# Critique: TARTAR BMS — visual dry run of every surface (deep, focus=ui,mobile)

Audited 2026-10-03 on branch `mobilel-app-native` at Development v2.55.

**Scope & assumptions:** every page, tab, toolbar popover, modal, sheet, drawer and menu reachable by the
three QA roles (qaadmin2 = admin, qaemp2 = employee, qaacc1 = accountant) at phone 390, tablet portrait 820,
tablet landscape 1180 and desktop 1440, light and dark. Writes are faked by the sweep (every non-GET
Supabase call returns `[]`), so toasts such as "Mark voucher printed changed nothing" are harness artifacts,
not findings. Read-only: no project file was changed except the sweep script (see Coverage).

**Coverage:**
- Sweep: `.claude/skills/deep-critique/scripts/sweep.mjs .claude/state/audit/sweep.config.json`, playwright-core
  in a scratch folder, dev server on :5199, `SWEEP_PASSWORD=admin12345` (qaacc1 already signed in with it —
  no reset needed).
- **Surfaces captured: 1,221 (admin 527, emp 378, acc 316). Surfaces failed: 0.** (The admin-phone smoke run
  had 1 failure, `/expenses card-approved-0` "Element is not attached to the DOM", a list re-render race; it
  did not recur in the full run.)
- **Contact sheets viewed: 183 / 183** (admin 79, emp 57, acc 47). Log in § Sheet log.
- Sweep script fixes made during the run (harness only, not app code):
  1. the popup-closer also closed the main page (`context.on("page")` fires for `newPage`) — every run died
     with 1 surface; now skips the main page;
  2. contact sheets embedded shots by `file://` URL, which Chrome blocks from an `about:blank` page — every
     sheet rendered empty frames; shots are now inlined as data URIs;
  3. tabs were clicked by text, so "Paid" matched "Unpaid" and admin-app pills ("Overdue 3") never matched;
     tabs are now clicked by index after `scrollIntoViewIfNeeded`, so off-screen chips are reached.
  Fixes 1–2 were applied before the full run, fix 3 after it — so in this run the payables "Paid" and
  receivables "Paid" chips on phone and the `/admin/*` pill tabs were **not** captured in their selected
  state (manual check: the admin pills do switch, `aria-checked` flips). The final re-sweep phase covers them.
- Not verified: real device (safe areas, keyboard, haptics), print output, push delivery, offline reload.
  Reports Weekly / Monthly / Cash Flow on phone were captured mid-load (skeletons) — desktop shots of the
  same tabs were reviewed instead.
- Redirects observed and intended: accountant `/`, `/vouchers`, `/branches`, `/master-data`, `/users` →
  `/transactions`; employee `/`, `/reports`, `/branches`, `/master-data`, `/users` → `/transactions`.

## Executive summary

The shell, lists, forms and confirm dialogs are consistent and hold up in both themes and at every width;
the receivable sheet now puts ⋮ to the right of "Record payment" on one row, as intended. The defects are in
**content**, not in layout: record sheets print "—" for every empty field (a whole "Deposit and
verification" section of dashes on an undeposited sale, "Recorded by —" on every receivable), the edit
history dialog dumps raw column names, ISO timestamps and user UUIDs, and the hero date on receivable and
payable sheets and cards is a bare date with no label. Two shared primitives produce most of the rest: the
sheet footer leaves ⋮ alone on its own row when a record has only overflow actions, and the admin tablet
rail draws its active bar through the label. Fix the placeholder rule in `DetailRows` first — one change
cleans every record sheet.

## Surface inventory (coverage contract)

Counts of captured surfaces per route and trigger kind, all roles and devices; per-row screenshots are in
the manifests (`C:/Users/CER/AppData/Local/Temp/tartar-sweep-<role>/manifest.json`).

| Route | page | tab | toolbar | card / sheet | sheet ⋮ | row menu | menu item | header | roles |
|---|---|---|---|---|---|---|---|---|---|
| / | 18 | 8 | 20 | 4 | 0 | 0 | 0 | 22 | admin,emp,acc |
| /transactions | 18 | 0 | 14 | 6 | 1 | 1 | 1 | 0 | admin,emp,acc |
| /sales | 18 | 30 | 17 | 30 | 15 | 15 | 32 | 0 | admin,emp,acc |
| /purchases | 18 | 24 | 17 | 18 | 8 | 9 | 20 | 0 | admin,emp,acc |
| /expenses | 18 | 24 | 17 | 24 | 9 | 12 | 27 | 0 | admin,emp,acc |
| /vouchers | 18 | 16 | 13 | 18 | 0 | 8 | 10 | 0 | admin,emp,acc |
| /receivables | 18 | 36 | 32 | 35 | 8 | 12 | 21 | 0 | admin,emp,acc |
| /payables | 18 | 36 | 30 | 35 | 0 | 12 | 12 | 0 | admin,emp,acc |
| /reports | 18 | 24 | 15 | 8 | 0 | 0 | 0 | 0 | admin,emp,acc |
| /branches | 18 | 0 | 10 | 6 | 0 | 1 | 2 | 0 | admin,emp,acc |
| /master-data | 18 | 8 | 10 | 12 | 0 | 4 | 11 | 0 | admin,emp,acc |
| /users | 18 | 0 | 10 | 6 | 1 | 1 | 3 | 0 | admin,emp,acc |
| /account | 18 | 0 | 24 | 0 | 0 | 0 | 0 | 0 | admin,emp,acc |
| /admin | 6 | 8 | 6 | 0 | 0 | 0 | 0 | 0 | admin |
| /admin/payables | 6 | 6 | 0 | 0 | 0 | 0 | 0 | 0 | admin |
| /admin/receivables | 6 | 6 | 6 | 0 | 0 | 0 | 0 | 0 | admin |
| /admin/notifications | 6 | 4 | 12 | 0 | 0 | 0 | 0 | 0 | admin |

Header surfaces (phone + desktop): sidebar drawer, branch picker sheet/popover, sync sheet/popover,
notifications sheet/popover, account menu. Confirm dialogs: delete transaction / sale / purchase /
receivable / supplier / category / income source / bank account / user, archive branch / category / income
source / account, approve voucher. Not reached: none by design; "Paid" chips on phone and `/admin` pill
selected states are partial (see Coverage).

Shared-primitive states checked (sheet footer `SheetActions`): primary only (payable "Mark paid"), primary +
overflow (receivable "Record payment" + ⋮, user "Edit user" + ⋮), primary + secondary + overflow (sale
"Mark deposited" / "Edit sale" + ⋮), secondary only (approved expense, disabled "Edit expense" + ⋮),
overflow only (verified sale, transaction) — **defect, UI-02**; danger only (transaction: Delete inside ⋮).

## High-priority findings

### [UI-01] Record sheets print "—" for every empty field
**Category:** UI · **Severity:** High · **Confidence:** High · **Basis:** FACT

**What I found** — Detail rows render whatever `render` returns, and most renders fall back to `"—"`, so a
sheet lists every field the record *could* have. An undeposited sale opens on a "Deposit and verification"
section whose three rows are all "—"; a transaction sheet shows Reference —, Description —, a "Farm" section
of dashes, Customer or supplier —, Cash account —; every receivable shows "Recorded by —"; the admin
receivable sheet shows Contact — and Contact person —.
**Evidence** — emp phone #17 #21 #25 (sale), #96–#108 (transaction / purchase / expense / voucher sheets),
admin phone #101 #105 #109 #113 #117 (receivable "Recorded by —"), admin phone #209–#211 and desk #507–#511
(`/admin/receivables` Contact —). `components/common/app/DetailRows.tsx:19-24` renders every visible item;
57 `"—"` fallbacks across 25 feature components; `hook/data/user/user.list.hook.ts:34` returns `"—"` for an
id it cannot resolve, so `hidden: (row) => !row.created_by` (`components/ledger/tables/LedgerRecordsTable.tsx:216`)
passes and the row still shows a dash; `components/sale/tables/SalesTable.tsx:239-254` (deposit date,
deposited by, reviewed by — no `hidden`); `components/admin/receivables/ReceivableEntryDetail.tsx:28-29`.
**Why it matters** — a dash reads as data ("someone recorded it, name unknown"); a section of dashes buries
the two rows that matter.
**User impact** — on a phone the meaningful rows are pushed below the fold by empty ones; "Recorded by —"
looks like an audit gap.
**Technical impact** — each new detail item re-decides the empty case; 57 copies of the same fallback.
**Recommended direction** — one rule in the shared layer: a detail row whose value is empty (null,
undefined, "", or the placeholder) is not rendered, and a section with no rendered rows is not rendered
(`visibleDetailSections` already drops sections with no visible items). Have `userNameOf` return
`undefined` (or add a `userNameOrNull`) so unresolved users hide the row instead of printing "—". Keep "—"
only in table cells, where the column must align.
**Verification** — re-sweep `/sales`, `/transactions`, `/receivables`, `/admin/receivables` on phone; no
detail row shows "—"; an undeposited sale opens with no deposit section.

### [UI-02] Edit history dialog shows raw column names, ISO timestamps and user UUIDs
**Category:** UI · **Severity:** High · **Confidence:** High · **Basis:** FACT

**What I found** — the Edit history modal lists each change as `<code>sale status</code> undeposited →
deposited`, `verified at — → 2026-10-02T09:43:17.881837+00:00`, `verified by — → 85cce83d-ef9d-4abc-…`,
`deposited by — → 4f7c0487-…`. Empty old values print "—".
**Evidence** — acc desk-08 (sales / expenses edit history), admin desk #307 #311, emp desk #233 #237.
`components/disbursement/modal/DisbursementHistoryModal.tsx:64-67`:
`{field.replaceAll("_", " ")} {String(change.old ?? "—")} → {String(change.new ?? "—")}`.
**Why it matters** — the audit trail is the one place an admin goes to answer "who changed this"; it answers
with a UUID.
**User impact** — admins cannot read the history without a database.
**Technical impact** — none to fix; the formatters (`formatDateTime`, `formatMoney`, status label maps,
`userNameOf`) already exist.
**Recommended direction** — a field-label + value-formatter map per audited table (status → label map,
`*_at` → `formatDateTime`, `*_date` → `formatDate`, `*_by` → `userNameOf`, amounts → `formatMoney`, unknown
fields → humanised name and raw value); render "Set to X" when the old value is null instead of "— → X".
**Verification** — open Edit history on a verified sale (desk and phone); no UUID, no ISO string, no `code`
styling, no "—".

## UX/UI findings

### [UI-03] Sheet footer leaves ⋮ alone on its own row when there is no primary action
**Category:** UI · **Severity:** Medium · **Confidence:** High · **Basis:** FACT + UX PRINCIPLE
**What I found** — when a record has only overflow actions (verified sale: Edit history + Delete; admin
transaction: Delete), the footer is a single 48 px ⋮ button at the left edge of an otherwise empty row.
**Evidence** — emp phone #29 #33, admin phone #15 #16 #35 #36 #39 #40.
`components/common/app/SheetActions.tsx:24-44` (`secondary.length === 0` branch renders
`sheetActionsRow` with `primaryButton` null and `menu`); `styles/app/app.styles.ts:156-160`.
**Why it matters** — visual-sweep § 3: "an overflow or icon button alone on its own row is a defect"; a
lone icon at the left reads as misaligned and hides what it does.
**Recommended direction** — overflow-only footer: render the overflow as a full-width outline "More
actions" (or the first non-danger overflow item as an outline button + ⋮ trailing when there are two or
more); danger-only: a full-width destructive button. Smallest move is inside `SheetActions` only.
**Verification** — re-sweep `/sales` (Verified tab) and `/transactions` on phone as admin and emp.

### [UI-04] Receivable and payable dates have no label
**Category:** UI · **Severity:** Medium · **Confidence:** High · **Basis:** FACT + UX PRINCIPLE
**What I found** — the receivable / payable card and sheet hero show "Sep 30, 2026" next to an "Overdue"
chip with no word saying it is the due date (Purchases cards say "Due date" — inconsistent). The reports
receivables card and sheet do the same.
**Evidence** — admin phone #101 #105 #109 (receivable sheet), #132 #135 #138 #141 (payable sheet), emp phone
#88 onward (cards), admin phone #160 #161 (reports receivables). `LedgerRecordsTable.tsx:119-120` and
`PayableRecordsTable.tsx:83-84` map the "Due date" column to `mobile: "subtitle"`, which renders the value
without its title.
**Recommended direction** — render the due date as "Due Sep 30, 2026" in the mobile subtitle (a `render`
for the subtitle role, or a `mobile: "meta"` with its title); same for the reports receivables card.
**Verification** — re-sweep `/receivables`, `/payables`, `/reports` (Receivables tab) on phone.

### [UI-05] Admin tablet rail: active bar overlaps the item label
**Category:** UI · **Severity:** Medium · **Confidence:** High · **Basis:** FACT
**What I found** — on the `/admin` app at 820 and 1180 the rail's active indicator is drawn through the
first letters of "Notifications" / "Receivables" / "Payables", and the label touches the rail edge.
**Evidence** — admin tabP #244 #245 (zoomed crop confirms the bar crosses "N"), tabL #261 #262, desk
#493 #505. Source: `components/common/layout/AppTabBar.tsx` (the rail variant) and its styles under
`styles/layout/`.
**Recommended direction** — give the rail item horizontal padding that clears the indicator, or move the
indicator to the item's outer edge; let long labels shrink or wrap inside the item, not under the bar.
**Verification** — re-sweep `/admin/*` at tabP, tabL, desk; zoom the rail.

### [UI-06] Reports title row: period wraps to three lines and the last tab is clipped on desktop
**Category:** UI · **Severity:** Medium · **Confidence:** High · **Basis:** FACT
**What I found** — on Daily / Weekly / Monthly / Cash Flow / Receivables the period ("Sep 27, 2026 – Oct 3,
2026") sits under the h1 and wraps; the tab strip then loses its last chip ("Exp", "Expe" clipped).
**Evidence** — admin desk #447–#451; acc and emp desk sheets show the same.
**Recommended direction** — keep the period on one line (`whitespace-nowrap`) and move it out of the title
column (into the toolbar row or under the tabs), or let the tab strip scroll with a fade like the phone
`ContextSwitch`.
**Verification** — re-sweep `/reports` at desk and tabL.

### [UI-07] Reports "Totals by Branch" card on phone does not reconcile
**Category:** UI · **Severity:** Medium · **Confidence:** High · **Basis:** FACT
**What I found** — the phone card shows Net −₱15,058.28 with Sales ₱4,475.00 and Expenses ₱9,149.00 — the
reader cannot get from those two to the net because Purchases (₱10,384.28) is not on the card (the desktop
table has it).
**Evidence** — admin phone #149 #153, tabP #237. `components/report/BranchSummaryReport.tsx:21-25`: Sales,
Expenses, Purchases have no `mobile` role, and `DataTableCards.tsx:50,188` keeps only the first
`cardMetaLimit = 2` metas when the card opens a detail sheet.
**Recommended direction** — show all three components on this card (mark Purchases as a meta and lift the
limit for this table, or render Net's breakdown) so the card adds up.
**Verification** — re-sweep `/reports` Branch Summary on phone; Sales − Expenses − Purchases = Net on the card.

### [UI-08] Purchases card labels a status as "Due date"
**Category:** UI · **Severity:** Low · **Basis:** FACT — `dueDateLabelOf` (`components/purchase/tables/PurchasesTable.tsx:59-64`)
returns "Pending" / "Paid" / "Rejected" when there is no due date, under the "Due date" title (admin phone
#55 #56, tabP #232). Hide the meta when there is no date; the status chip already says it.

### [UI-09] Admin receivable sheet shows the branch slug
**Category:** UI · **Severity:** Low · **Basis:** FACT — "Branch qa_test" instead of "QA Test"
(`components/admin/receivables/ReceivableEntryDetail.tsx:27`, admin phone #209–#211, desk #507–#511).
Resolve through the branch name lookup.

### [UI-10] Approved-expense sheet leads with a disabled button
**Category:** UI · **Severity:** Low · **Basis:** UX PRINCIPLE — the footer's first button is a disabled
"Edit expense" with no reason; the ⋮ menu says "Locked" (admin phone #63 #64 #65 #72, purchases #56). Drop
the disabled button from the footer and keep "Edit · Locked" in the menu, or show the reason.

### [UI-11] Paid payable row menu has nothing to do
**Category:** UI · **Severity:** Low · **Basis:** UX PRINCIPLE — ⋮ opens a single disabled "Already paid"
(admin desk #436 #437 #440, emp desk #346 #349). Hide ⋮ when every action is disabled.

### [UI-12] Account sheets put their action inside the body
**Category:** UI · **Severity:** Low · **Basis:** JUDGMENT — Change password and Notifications sheets end
with a small right-aligned "Update password" / "Turn on notifications" in the body, where every other sheet
pins a full-width footer (admin phone #188 #191). Move them to the sheet footer.

### [UI-13] Deposited-by / Reviewed-by values orphan "PM"
**Category:** UI · **Severity:** Low · **Basis:** FACT — "QA Employee Two · Oct 2, 2026 5:43" / "PM" wraps
on phone (emp phone #29). Put the time on its own line or keep date and time together (`whitespace-nowrap`
on the time).

### [UI-14] Record-payment modal: reference and amount lines have no label
**Category:** UI · **Severity:** Low · **Basis:** FACT — each allocation row is a bare reference
("C-RACE-500-a0eb") over an unlabeled amount field (admin desk #393 #397 #409 #413). Label the row
("Receivable C-RACE-500-a0eb") and the field ("Amount to apply").

### [UI-15] "Not filled" chip meaning is unclear
**Category:** UI · **Severity:** Observation · **Basis:** JUDGMENT — the By-customer card and customer
ledger table show "Not filled" (`components/ledger/CustomerInfoTag.tsx:12`) for customers with no contact
details (emp phone #90 #111, admin desk #385). "No contact details" says what is missing.

### Desktop
- [UI-16] Low · FACT — Customer ledger modal: Date / Due date / Reference columns wrap to two lines and
  "Created by" is a column of "—" (admin desk #414, emp desk #324). Widen the modal (`ModalSize`) or drop the
  empty column.
- [UI-17] Low · FACT — Payables "Payments" table "Recorded by" column is all "—" (admin desk #419–#422) —
  same root as UI-01 (`userNameOf`).
- Master Data supplier table Contact number / Address columns are mostly "—" (#256) — data, not layout; not a
  finding.

### Mobile
- Scrolling chip rows clip the fifth chip mid-word ("Verif", payables "Paid") (emp phone #12 #114). This is
  the `ContextSwitch` scrolling-chips design (memory: tartar-mobile-design-decisions-2026-10); the clip is the
  affordance. Observation only.
- The sheet ⋮ popover opens over the primary button (emp phone #18) — normal popover behaviour. Not a finding.

## Positive findings
- The receivable sheet footer puts "Record payment" full-width with ⋮ trailing on the same row at equal
  height (admin phone #101 #105 #109) — the intended fix holds.
- Every destructive action routes through one confirm dialog with consistent copy and danger styling
  (desk #281 #292 #298 #330 #394 #457 #464 #469 #479 #486).
- Dark mode has no vanishing element in 400+ dark shots; tokens hold.
- Empty states are explicit and specific ("No purchases match the current filters", "Nothing due here",
  "Every change is saved").
- Permission redirects for emp and acc land on `/transactions` with no flash of a forbidden page.

## Recommended action plan
### Immediate
UI-01 (placeholder rule in `DetailRows` + `userNameOf`), UI-02 (edit history formatting).
### Short term
UI-03 (sheet footer overflow-only), UI-04 (due-date label), UI-05 (admin rail), UI-06 + UI-07 (reports).
### Medium term
UI-08 … UI-17 low-severity polish, grouped by screen.

## Hypotheses to verify
- The receivable "Recorded by —" may be a row whose `created_by` user is not returned by
  `user_display_names` for that role (deleted user or RPC filter) rather than a null — confirm with
  `select created_by from receivables` before choosing between "hide" and "show 'Former user'". Either way
  UI-01's rule hides the dash.

## Sheet log (183 / 183 viewed)
Paths under `C:/Users/CER/AppData/Local/Temp/tartar-sweep-<role>/`.

| Sheets | Surfaces | Result |
|---|---|---|
| acc phone 01–22 | #0–#169 | UI-01, UI-04, UI-13; chip clip (obs.) |
| acc tabP 01–02, tabL 01–03 | pages | ok |
| acc desk 01–20 | #170–#315 | UI-02 (desk-08), UI-16 |
| emp phone 01–22 | #0–#173 | UI-01 (#17 #21 #25 #96–#108), UI-03 (#29 #33), UI-04 (#88…), UI-13 (#29), UI-15 (#90 #111) |
| emp tabP 01–02, tabL 01–03 | pages | ok |
| emp desk 01–30 | #200–#377 | UI-02 (#233 #237), UI-11 (#346 #349), UI-16 (#324), UI-06 |
| admin phone 01–03 | #0–#23 | UI-03 (#15 #16) |
| admin phone 04–12 | #24–#95 | UI-03 (#35–#40), UI-10 (#63–#72), UI-15 (#95) |
| admin phone 13–18 | #96–#143 | UI-01 (#101–#117), UI-04 (#101–#141) |
| admin phone 19–21 | #144–#167 | UI-07 (#149 #153), UI-04 (#160 #161); skeleton tabs #156–#158 not reviewable |
| admin phone 22–24 | #168–#191 | UI-12 (#188 #191) |
| admin phone 25–29 | #192–#228 | UI-09 + UI-01 (#209–#211); dark carry-over from theme toggle = harness |
| admin tabP 01–03 | #229–#245 | UI-05 (#244 #245), UI-07 (#237), UI-08 (#232) |
| admin tabL 01–03 | #246–#262 | UI-05 (#261 #262) |
| admin desk 01–08 | #263–#310 | UI-02 (#307) |
| admin desk 09–23 | #311–#400 | UI-02 (#311), UI-14 (#393 #397) |
| admin desk 24–31 | #401–#448 | UI-14 (#409 #413), UI-16 (#414), UI-17 (#419–#422), UI-11 (#436–#440), UI-06 (#447 #448) |
| admin desk 32–44 | #449–#526 | UI-06 (#449–#451), UI-05 (#493 #505), UI-09 (#507–#511) |
