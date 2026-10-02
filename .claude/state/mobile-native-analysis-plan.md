# TARTAR — Complete UX/UI and Mobile-Native Design Audit

## 1. Executive Assessment

### Overall assessment

TARTAR is **not a weak product design**.

In fact, the documented system has a considerably stronger design foundation than most business applications that attempt to become PWAs.

The implementation already includes:

- a semantic token system
- a coherent component architecture
- dedicated phone shell
- mobile card transformations for tables
- bottom sheets
- keyboard-aware sheets
- safe-area handling
- 44px touch targets
- offline read/write behavior
- persisted filter state
- route scroll restoration
- mobile pull-to-refresh
- app installation behavior
- web push
- PWA standalone mode
- React Aria accessibility primitives
- reduced-motion support
- mobile-specific FAB behavior
- responsive financial number formatting
- explicit loading/error/empty states
- a separate mobile-first Admin application

Those are not superficial responsive techniques. They are strong architectural decisions.

The main weakness is different:

> **TARTAR has many mobile-native components, but its main product architecture still thinks like a desktop business application.**

That distinction matters.

The current main app converts many desktop components into mobile variants, but the **navigation hierarchy, information density, dashboard composition, interaction priority, and cross-product visual language** have not been redesigned as aggressively as the lower-level components.

The clearest example is navigation.

The main app currently keeps the desktop information architecture and simply moves the sidebar into an off-canvas drawer on phones. The documentation explicitly says there is **no bottom tab bar in the main app**, and that this is a locked decision.

That technically works.

But it is exactly the kind of pattern that can make a product feel like:

> "A responsive web application."

instead of:

> "A mobile application that happens to also have a desktop version."

### What TARTAR is already doing well

The strongest parts are:

**1. Component architecture**

The shared `DataTable`, `AppModal`, `AppSheet`, declarative forms, semantic tones, and state contracts establish a strong foundation for consistent redesign.

**2. Mobile interaction primitives**

The system already knows how to turn dialogs into sheets, tables into cards, sort controls into sheets, and row details into bottom-sheet experiences.

**3. PWA engineering**

TARTAR already contains many details that create a native-app illusion: standalone mode, safe areas, keyboard-aware sheets, push notifications, offline queueing, IndexedDB persistence, route transitions, scroll restoration and update handling.

**4. Accessibility**

React Aria, explicit labels, live regions, `aria-busy`, reduced-motion support, 44px hit targets and non-color-only status communication provide an unusually strong accessibility baseline for an enterprise PWA.

**5. Financial data discipline**

The system explicitly uses tabular numerals for monetary values, differentiates money tones from status tones, and gives financial tables role-based mobile mapping.

### What is holding TARTAR back

The main limitations are architectural and experiential:

**1. Main-app navigation is still desktop-derived.**

The drawer is usable but not optimized for frequent mobile access to important modules.

**2. The dashboard is too ambitious for a phone.**

Six statistics + two charts + an alert feed is a lot of competing information for a mobile owner workflow. The source itself flags dashboard density as an open question.

**3. The design system is slightly over-containerized.**

The system uses `rounded-panel` extensively for headers, sidebars, cards, modals, sheets and list sections.

This creates consistency, but also risks making everything look like a floating card.

**4. Main app and Admin app speak different interaction languages.**

The Admin app uses iOS-style segmented controls and grouped lists, while the main app uses stat cards, tables and outline toggle pills. The document itself flags this drift.

**5. Tablet architecture is unresolved.**

The current 768–1023px range mixes desktop chrome with phone data components. That is a genuine architecture problem, not just polish.

**6. The mobile system is optimized around shrinking and transforming components rather than reprioritizing workflows.**

That is the central issue.

---

## 2. Scorecard

### Overall scorecard

| Category                           |        Score |
| ---------------------------------- | -----------: |
| Overall UX                         | **7.7 / 10** |
| Overall UI                         | **8.1 / 10** |
| Desktop UX                         | **8.5 / 10** |
| Mobile UX                          | **6.9 / 10** |
| Native App Feel                    | **7.8 / 10** |
| Information Architecture           | **8.2 / 10** |
| Navigation                         | **6.8 / 10** |
| Visual Hierarchy                   | **7.8 / 10** |
| Typography                         | **7.7 / 10** |
| Spacing                            | **8.0 / 10** |
| Color System                       | **7.4 / 10** |
| Components                         | **8.7 / 10** |
| Forms                              | **7.9 / 10** |
| Tables / Ledger UX                 | **8.2 / 10** |
| Dashboard UX                       | **7.0 / 10** |
| Search / Filtering                 | **7.8 / 10** |
| Data Density                       | **6.9 / 10** |
| Touch Usability                    | **8.8 / 10** |
| Accessibility                      | **8.8 / 10** |
| Responsive Design                  | **7.3 / 10** |
| PWA Experience                     | **9.0 / 10** |
| Financial / Enterprise Credibility | **8.5 / 10** |
| Consistency                        | **7.7 / 10** |
| Performance Perception             | **8.0 / 10** |
| Premium Feel                       | **7.8 / 10** |

### Current Overall Score

# **7.7 / 10**

This is already a **strong enterprise product foundation**.

The score is not higher because the highest remaining problems are not basic component problems. They are **navigation, information density, hierarchy and mobile workflow architecture**.

### Desktop Score

# **8.5 / 10**

Desktop is where the current architecture is most coherent.

The fixed sidebar, floating content surface, real data tables, pagination and persistent branch context match the complexity of the application well.

### Mobile Score

# **6.9 / 10**

Mobile has many excellent technical patterns, but the system still exposes too much of the desktop application's information architecture.

The weakest points are:

- main navigation
- dashboard density
- toolbar complexity
- status/filter language
- tablet breakpoint strategy
- inconsistent visual grammar between Admin and Main
- excessive card/surface treatment

### Native-App Feel

# **7.8 / 10**

The engineering is surprisingly close to native in many places.

What prevents a 9+ rating is primarily the **product-level experience**, not PWA mechanics.

---

# 3. Top 10 Problems

## 1. Main mobile navigation is not optimized for high-frequency actions

### Problem

The main app uses an off-canvas sidebar instead of a persistent mobile navigation surface.

The documented menu contains Dashboard, Transactions, Sales, Purchases, Expenses, Vouchers, Receivables, Payables, Reports, Branch Monitoring, Master Data and Users.

On mobile, these are still effectively hidden behind the drawer.

### Why it matters

A frequent mobile workflow should require:

**open app → tap destination**

not:

**open app → open drawer → visually scan categories → choose destination**

The source specifically identifies **Sales and Vouchers as the most-used phone tasks**.

### Recommended solution

Introduce a mobile navigation layer for the **five highest-value destinations**, while keeping the complete sitemap in a secondary "More" area.

Recommended:

**Home | Sales | Vouchers | Accounting | More**

Inside More:

- Transactions
- Purchases
- Expenses
- Reports
- Branch Monitoring
- Master Data
- Users
- Account
- Theme
- Sync
- Sign out

This is a navigation change, not a feature change.

### Mobile behavior

Persistent bottom navigation.

### Desktop behavior

Keep the current sidebar.

### Priority

**P0**

---

## 2. Mobile dashboard is overloaded

### Problem

The mobile dashboard currently carries six stat tiles, Sales Overview, Cash Flow and Notifications.

### Why it matters

The dashboard currently answers too many questions simultaneously.

On mobile, the user usually needs:

1. What is important today?
2. What needs attention?
3. What changed?
4. What should I do next?

The current composition emphasizes breadth rather than action.

### Recommended solution

Reorder mobile dashboard into:

**Today → Attention → Performance → Trends**

Top:

- Today's Sales
- Today's Expenses
- Net Profit

Then:

**Needs Attention**

- overdue receivables
- due payables
- pending vouchers
- pending sales verification

Then:

**Performance**

- AR
- AP
- Monthly sales

Then:

**Trends**

- Sales chart
- Cash-flow chart

### Mobile behavior

Progressive disclosure.

Only the highest-value metrics appear initially.

### Desktop behavior

Keep the six-card dashboard architecture, but improve priority ordering.

### Priority

**P0**

---

## 3. Too many mobile interactions are represented as buttons instead of contextual actions

The filter toolbar currently collapses controls into icon buttons on phones.

This is technically responsive.

But icon-only controls can increase recognition burden, especially for financial workflows.

### Recommended solution

Use:

**Primary action + Filter + Sort + More**

rather than several isolated icon buttons.

Example:

`[Search] [Filter 2] [Sort] [⋯]`

Only expose controls relevant to the screen.

### Priority

**P0**

---

## 4. The tablet breakpoint is structurally inconsistent

The current tablet range combines desktop chrome with phone data components. The source explicitly identifies this as unresolved.

### Why it matters

A 10-inch tablet has enough space to behave differently from a phone.

### Recommended solution

Make tablet adaptation orientation-aware.

**Portrait tablet**

- mobile shell
- card/list presentation
- sheets

**Landscape tablet**

- compact desktop shell
- real table
- fewer columns
- larger touch spacing

This avoids forcing one intermediate layout on both orientations.

### Priority

**P0**

---

## 5. The design system has too many competing "surface containers"

The same 1.25rem panel radius is used across:

- top bar
- sidebar
- content card
- modals
- sheets
- list sections.

### Why it matters

Everything starts to visually become a "thing floating inside another thing."

Premium enterprise products generally establish stronger differentiation between:

- app chrome
- navigation
- content surfaces
- interactive controls
- temporary overlays

### Recommended solution

Reduce the number of surface levels.

Use:

- 8px — controls
- 12px — standard content cards
- 16px — major mobile surfaces
- 20px — sheets / shell
- pill — statuses only

Do not give every structural component the same visual weight.

### Priority

**P1**

---

## 6. Main app and Admin app feel like two design languages

The Admin app uses:

- grouped lists
- segmented controls
- metric tiles
- iOS-style patterns

The main app uses:

- data tables
- stat cards
- toggle pills
- traditional business-app toolbars.

### Recommended solution

Do not make the apps identical.

Instead establish a **shared TARTAR interaction language**:

- same typography hierarchy
- same spacing
- same status semantics
- same action hierarchy
- same sheet behavior
- same button grammar
- same filter patterns
- same financial-value treatment

Admin can remain more mobile-native.

The main app should borrow the **interaction principles**, not copy the UI.

### Priority

**P1**

---

## 7. Status tabs and segmented tabs are unnecessarily different

The main app uses `ViewSwitch` / outlined toggle groups, while Admin uses an iOS-style segmented control. This is explicitly documented as a gap.

### Recommended solution

Create a single semantic concept:

**Context Switch**

with two presentation variants:

Desktop:

`[All] [Pending] [Approved]`

Mobile:

segmented control or horizontally scrollable chips depending on item count.

Admin and main app then feel related without becoming identical.

### Priority

**P1**

---

## 8. Numeric and financial hierarchy needs stronger emphasis

The current system correctly uses `tabular-nums`, and mobile amounts are right-aligned.

But the source notes an unresolved question around tone mapping: brand/accent/info values remain visually neutral.

### Recommended solution

Create clear financial value levels:

**Level 1 — Primary monetary value**

Large, high-contrast, semibold.

**Level 2 — Transaction amount**

Medium, tabular.

**Level 3 — Supporting value**

Smaller, muted.

**Level 4 — Metadata**

Small, low emphasis.

Do not use color to make every important number louder.

### Priority

**P1**

---

## 9. First-render architecture can visibly expose the wrong UI

The documented mobile hook initially renders desktop state for one frame.

### Why it matters

A single flash of:

- desktop table
- desktop dialog
- wrong shell

can significantly hurt perceived polish.

### Recommended solution

Do not render layout-dependent UI until the breakpoint state is known.

Use a tiny shell-level hydration gate:

**unknown → skeleton shell → final mode**

rather than:

**desktop → switch to mobile**

### Priority

**P1**

---

## 10. Dark mode is incomplete at the semantic-token level

The source explicitly notes that chart colors 2–6, positive, warning and destructive lack full dark-mode variants.

### Why it matters

Financial software needs reliable meaning across themes.

If green, amber and red do not maintain consistent perceived contrast, users can misread important states.

### Recommended solution

Define dark variants for every semantic state and chart series.

Then run contrast checks against:

- background
- panel
- muted
- selected row
- negative row
- chart background

### Priority

**P1**

---

# 4. Mobile-Native Gap Analysis

Here is the central distinction:

## Things that are already genuinely mobile-native

TARTAR already has:

- bottom sheets
- swipe-to-close
- keyboard-aware sheets
- safe-area support
- 44px controls
- pull-to-refresh
- collapsed FAB
- compact title on scroll
- mobile table cards
- infinite load-more
- mobile-specific row details
- offline queue feedback
- mobile notifications sheet
- route scroll restoration
- viewport-aware keyboard handling.

These are strong.

## Things that still feel desktop-derived

### 1. Navigation

Desktop sidebar → mobile drawer.

### 2. Dashboard architecture

Desktop dashboard is compressed rather than substantially re-prioritized.

### 3. Table mental model

Although the table becomes cards, the user is still conceptually operating inside a "table."

### 4. Filter model

The filter architecture remains strongly desktop-toolbar-oriented.

### 5. Page anatomy

Every page still follows a common desktop-like:

**Title → toolbar → table/card body**

architecture.

That is useful for consistency but should not dictate every mobile workflow.

### 6. Action hierarchy

The floating CTA is powerful, but the UI can overemphasize "create" compared with contextual review/action flows.

### 7. Dense financial lists

Cards are better than tables, but some metadata still deserves more aggressive progressive disclosure.

### 8. Desktop-originated terminology

The distinction between filters, status tabs, view tabs, toolbar actions and sort controls can feel like a business desktop application rather than a mobile application.

---

# 5. Screen-by-Screen Audit

---

## Dashboard `/`

### Current purpose

Executive overview of today's and month-to-date financial/business activity.

### Current strengths

- strong metric coverage
- clear KPI vocabulary
- Sales Overview
- Cash Flow
- Notifications
- bento architecture
- desktop layout naturally accommodates multiple information zones.

### Current weaknesses

Six stat cards + two charts + alert feed create a lot of simultaneous competition.

### Mobile problems

- too many metrics above the fold
- charts appear before all attention items are necessarily resolved
- notification feed competes with financial KPIs
- 2-up stat tiles can become visually similar
- no obvious "what should I do next?" hierarchy

### Recommended desktop changes

Keep the structure.

Reorder:

1. key financial snapshot
2. attention
3. trend analysis

### Recommended mobile changes

Use:

**Header**

`Dashboard` + branch context

**Section 1**

3 primary KPIs

**Section 2**

`Needs attention`

**Section 3**

AR / AP / monthly performance

**Section 4**

Charts

### Component changes

- add `PriorityMetric`
- add `AttentionSection`
- add `DashboardMetricGroup`
- reuse existing StatCard tokens

### Interaction changes

Tap KPI → relevant module.

Tap attention item → exact underlying record.

### Priority

**P0**

### Expected UX improvement

High.

---

## Transactions `/transactions`

### Current purpose

Transactional record management.

### Current strengths

The mobile role mapping is strong:

- Date → title
- Time → subtitle
- Type → status
- Amount → primary number
- other metadata → hidden/collapsed

This is exactly the right direction.

### Current weaknesses

The card can still become metadata-heavy.

### Mobile problems

If too many metadata fields are displayed simultaneously, users may perceive each card as a miniature table.

### Recommended desktop changes

Minimal.

### Recommended mobile changes

Primary card:

**Transaction title**

`Oct 3, 10:30 AM`

**₱12,400.00**

`Sale`

`[Pending]`

Then:

`› View details`

Everything else moves into the detail sheet.

### Component changes

Use a dedicated transaction summary rather than relying entirely on generic `DataTableCards`.

### Interaction changes

Entire card should open the record.

Three-dot menu handles administrative actions.

### Priority

**P0/P1**

### Expected UX improvement

High.

---

## Sales `/sales`

### Current purpose

Sales management with deposit and verification workflows.

### Current strengths

- status tabs
- summary cards
- workflow-specific modals

### Current weaknesses

Sales is one of the most important phone workflows, but it is still structured like a standard table module.

### Mobile problems

Deposit/verification operations can require too many modal transitions.

### Recommended desktop changes

Keep current table architecture.

### Recommended mobile changes

Make the sale detail screen more workflow-oriented:

**Sale**

**Amount**

**Customer**

**Verification status**

**Deposit status**

Then:

`Verify`
`Record deposit`
`More`

Use contextual actions instead of exposing all actions in the row menu.

### Component changes

Dedicated `SaleSummary`.

### Interaction changes

Contextual action footer in detail sheet.

### Priority

**P0**

### Expected UX improvement

Very high.

---

## Purchases `/purchases`

### Current purpose

Purchase records, automatically creating a voucher.

### Current strengths

Automatic accounting relationship is conceptually strong.

### Mobile problems

Purchase + voucher relationship could be unclear if only one record layer is shown.

### Mobile recommendation

Show:

**Purchase**

amount / supplier / date

Then:

`Voucher created automatically`

and expose voucher relationship inside details.

### Priority

**P1**

---

## Expenses `/expenses`

### Current purpose

Expense records with automatic voucher creation.

### Mobile recommendation

Mirror Purchases.

Use identical interaction structure so users do not learn two unrelated workflows.

### Priority

**P1**

---

## Vouchers `/vouchers`

### Current purpose

Check/cash approval, resubmission, withholding/VAT calculations, source modal, disbursement and history.

### Current strengths

This is one of the richest workflow modules.

Audit history is especially valuable.

### Mobile problems

This is likely one of the easiest areas to overwhelm users because approval, accounting calculations and history coexist.

### Recommended mobile structure

**Voucher Hero**

Amount + status

**Primary action**

Approve / Resubmit / Review

**Financial summary**

Subtotal

VAT

Withholding

Net

**Details**

Source

Payee

Reference

**Audit**

History

### Mobile interaction

Do not place all accounting information into a long scrolling form by default.

Use collapsible sections:

`Financial summary`
`Voucher details`
`Approval`
`Audit history`

### Priority

**P0**

### Expected UX improvement

Very high.

---

## Receivables `/receivables`

### Current purpose

Ledger records, payments and customer ledger.

### Strength

The two-pane ledger modal architecture is sophisticated.

### Mobile problem

A desktop "two-pane" mental model should not survive literally on a phone.

### Recommendation

Make this:

**Customer → Balance → Outstanding records → Payments → Ledger**

The customer ledger becomes a dedicated detail sheet/screen.

Primary action:

`Record payment`

### Priority

**P0**

---

## Payables `/payables`

Mirror Receivables.

### Mobile structure

**Supplier**

Outstanding

Due soon

Overdue

Payment history

Ledger

### Primary action

`Mark as paid`

### Priority

**P0**

---

## Reports `/reports`

### Current purpose

Multiple accounting reports and printing.

### Current problem

Reports are inherently data-heavy.

### Mobile recommendation

Do not attempt to reproduce desktop reports.

Use:

**Report type**
→ **Period**
→ **Summary**
→ **Key rows**
→ **Open detailed report**
→ **Print**

For print, retain desktop-style formatting.

### Priority

**P1**

---

## Branch Monitoring `/branches`

### Current purpose

Branch monitoring and branch table management.

### Mobile recommendation

Card/list summary:

Branch

status

key metric

tap → branch detail

Do not attempt to preserve every monitoring column.

### Priority

**P1**

---

## Master Data `/master-data`

### Current purpose

Suppliers, expense categories, income sources and banks.

### Mobile problem

The URL-based section switch can remain, but the UI should feel like one settings/data-management area.

### Recommendation

Use:

`Suppliers`
`Categories`
`Income`
`Banks`

as a segmented or horizontally scrolling section control.

Then list records.

### Priority

**P2**

---

## Users `/users`

### Current purpose

User administration, role and branch access.

### Mobile recommendation

User card:

Avatar

Name

Role

Branch access

Status

Then:

`Edit`
`More`

### Priority

**P1**

---

## Account settings `/account`

### Current purpose

Profile, password, install and notifications.

### Current strength

The install experience is unusually thoughtful for a PWA.

### Mobile recommendation

Convert this into an iOS/Android-style settings list:

**Account**

Profile

Password

**App**

Install TARTAR

Theme

Notifications

**System**

Sync

Version

This is one area where the Admin app's grouped-list language is particularly appropriate.

### Priority

**P2**

---

# Admin App

The Admin app is actually a useful reference for how the main app should evolve.

It already uses a bottom tab bar, segmented tabs, grouped lists and mobile detail sheets.

## Admin Home

Strong mobile architecture.

Recommended improvement:

Make "Attention" more dominant than the sales chart.

Priority: **P1**

## Admin Payables

Strong:

- segmented status
- grouped list
- detail sheet
- deep link into main app.

This should become a benchmark for main Payables mobile UX.

## Admin Receivables

Use the same pattern as Payables.

Priority: **P1**

## Admin Notifications

Already appropriately mobile-native.

Improve only by separating:

**Action required**

from

**Information**

and then by urgency.

Priority: **P1**

---

# 6. Recommended Mobile Architecture

## Navigation architecture

### Recommended main mobile navigation

Use a **5-item bottom navigation**:

| Tab        | Purpose                                     |
| ---------- | ------------------------------------------- |
| Home       | Dashboard                                   |
| Sales      | High-frequency sales workflow               |
| Vouchers   | High-frequency approval/accounting workflow |
| Accounting | Receivables + Payables                      |
| More       | Remaining modules                           |

This intentionally does **not** attempt to place all 12+ primary modules into a bottom bar.

The full sidebar remains available inside **More**.

### Why

Mobile navigation should represent **frequency and importance**, not the entire sitemap.

Desktop navigation answers:

> "What areas exist?"

Mobile navigation should answer:

> "Where do I go most often?"

---

## Header architecture

### Default mobile header

Left:

back/menu/context

Center:

page title

Right:

sync / notification / more

The branch selector should not permanently consume large horizontal space.

The current scroll-collapse behavior is directionally correct.

I would refine it rather than replace it.

### Recommended

At top:

`☰  Sales                         🔔`

Branch becomes a compact contextual control below the title only when necessary.

---

# Dashboard

Mobile order:

### 1. Today

3 high-value KPI cards.

### 2. Needs Attention

Actionable list.

### 3. Financial position

AR / AP.

### 4. Performance

Monthly sales / expenses.

### 5. Trends

Charts.

This turns the dashboard from:

**"Everything I know"**

into:

**"Everything I need to know now."**

---

# Ledger

Do not show ledger data as a shrunken table.

Use:

### Ledger row

`Date`

`Reference`

`Description`

`Debit / Credit`

`Running balance`

Then:

Tap → detail sheet.

For the smallest screens:

`Date + description + amount + balance`

Everything else appears in detail.

---

# Transaction detail

Recommended hierarchy:

**Header**

Type + status

**Primary amount**

₱12,400.00

**Core metadata**

Date

Reference

Branch

Recorded by

**Financial details**

Debit

Credit

Balance impact

**Audit**

History / metadata

**Actions**

Contextual footer.

---

# Filters

On mobile, filters should be task-oriented.

Instead of:

`Filter → giant form`

Use:

`Filter`

Then show:

**Quick filters**

Today

This week

Overdue

Pending

Then:

**Advanced filters**

Date

Type

Party

Branch where appropriate

### Footer

`Reset` | `Show results`

The existing bottom-sheet implementation already points in this direction.

---

# Search

Search should become a dedicated interaction mode when useful.

### Default

Search icon.

Tap.

Header transforms into:

`← [ Search transactions... ]`

Keyboard opens.

Results immediately populate.

This is much more native than permanently reserving horizontal space for a desktop-style search field.

---

# Forms

Forms are one of the biggest opportunities.

Current declarative forms are structurally strong.

Mobile forms should use:

### Step-like progressive disclosure

**Step 1**

Core information

**Step 2**

Financial details

**Step 3**

Review

**Submit**

Not necessarily multiple routed pages.

Sections can expand/collapse in one full-height sheet.

### Financial summary

Keep the summary sticky above the bottom action area when appropriate.

---

# Actions

Use an action hierarchy:

### Primary

Full-width sticky action.

### Secondary

Inline text/button.

### Tertiary

More menu.

### Destructive

Separated and confirmation-gated.

This is better than putting all operations into a single toolbar or action menu.

---

# Tables

### Desktop

Keep actual tables.

### Tablet landscape

Use compact tables.

### Phone

Use record cards.

### Never

Use a wide horizontally scrollable accounting table as the default mobile experience.

---

# Modals

Current conversion of dialogs to bottom sheets is correct.

But use different sheet types:

### Action sheet

Short, contextual actions.

### Detail sheet

Read-only information.

### Form sheet

Editable form.

### Full-screen flow

Complex accounting workflow.

This distinction will reduce the feeling that everything is "a modal."

---

# Notifications

Prioritize:

**Action required**

**Due soon**

**Informational**

The current urgency grouping is a good foundation.

---

# Empty states

Current states are functionally solid.

Improve copy toward:

**What happened**
**Why**
**What should I do next**

Example:

> No pending vouchers
> Everything requiring approval is currently cleared.

Better than merely:

> No data found.

---

# Loading

Current skeleton architecture is good.

For mobile:

- keep geometry stable
- avoid full-screen spinners
- avoid dimming entire screens during lightweight refresh
- show local progress where possible

---

# 7. Component Transformation Plan

| Existing Pattern      | Mobile Problem                      | Recommended Mobile Pattern          | Strategy                     |
| --------------------- | ----------------------------------- | ----------------------------------- | ---------------------------- |
| Main sidebar          | Hidden high-frequency navigation    | Bottom nav + More drawer            | **C — redesign interaction** |
| Phone AppBar          | Branch/control competition          | Compact contextual header           | **B — mobile variant**       |
| Desktop table         | Too dense                           | Record card                         | **B — mobile variant**       |
| DataTableCards        | Can become mini-tables              | Priority card + detail sheet        | **B**                        |
| StatCard              | 2-up cards can compete              | Priority metric / compact metric    | **B**                        |
| Dashboard             | Too much visible at once            | Priority sections                   | **C**                        |
| FilterToolbar         | Icon-heavy                          | Filter + Sort + More                | **B**                        |
| FilterPopover         | Too dense                           | Bottom-sheet staged filter          | **B**                        |
| SortSelect            | Fine as sheet                       | Keep                                | **A**                        |
| Status tabs           | Can become crowded                  | Segmented/scrolling context switch  | **B**                        |
| Large EntityFormModal | Long forms                          | Full-height form sheet              | **B/C**                      |
| ConfirmationModal     | Small action dialogs                | Bottom action confirmation sheet    | **B**                        |
| DetailModal           | Read-only data                      | Detail sheet with strong hierarchy  | **B**                        |
| Ledger two-pane modal | Desktop mental model                | Detail-focused ledger screen/sheet  | **C**                        |
| RowActionMenu         | Fine but hidden                     | Contextual action footer + More     | **B**                        |
| Charts                | Can become decorative/dense         | One insight per chart               | **B**                        |
| User menu             | Poor thumb reach if top-right dense | Account/settings sheet              | **B**                        |
| Toasts                | Can obscure mobile UI               | Short confirmation + nonblocking    | **B**                        |
| Offline notice        | Can consume vertical space          | Compact status banner + sync center | **B**                        |
| FAB                   | Strong but can dominate screen      | Context-sensitive create/action     | **B**                        |

---

# 8. Design System Recommendations

## Typography

Keep:

**Plus Jakarta Sans Variable**

It is already appropriate.

The issue is not the font.

The issue is the lack of a clearly named type scale. The source itself flags arbitrary 11px, 13px, 15px, 17px, 19px, 22px and 26px sizes.

### Recommended scale

| Role                  | Mobile |
| --------------------- | -----: |
| Micro                 |   11px |
| Caption               |   12px |
| Secondary             |   13px |
| Body                  |   15px |
| Emphasis              |   16px |
| Section               |   18px |
| Page title            |   24px |
| Large financial value |   28px |
| Hero value            |   32px |

Do not keep adding arbitrary sizes.

Create semantic names such as:

`text-body`

`text-secondary`

`text-label`

`text-section`

`text-page-title`

`text-money-lg`

---

## Financial typography

Use:

- `tabular-nums`
- right alignment
- consistent decimal precision
- strong amount/value contrast
- muted metadata
- explicit currency formatting

For example:

**₱1,250,000.00**

should visually dominate:

`Reference #VCH-20384`

not because it is colorful, but because its size, weight and alignment establish the hierarchy.

---

# Spacing

Establish:

**4 / 8 / 12 / 16 / 20 / 24 / 32**

Use:

- 4 = micro
- 8 = inline
- 12 = compact component spacing
- 16 = default mobile padding
- 20 = section
- 24 = major separation
- 32 = page separation

The current spacing is already generally coherent, but a semantic scale would eliminate one-off values.

---

# Radius

Current 1.25rem panel radius is too universal.

Recommended:

| Element        |             Radius |
| -------------- | -----------------: |
| Inputs         |                8px |
| Buttons        |             8–10px |
| Standard cards |               12px |
| Large surface  |               16px |
| Bottom sheet   |               20px |
| Status chip    |               Pill |
| FAB            | 16px / full circle |

This produces hierarchy.

---

# Shadows

Use less shadow than today for ordinary surfaces.

### Standard content

Border only or extremely subtle shadow.

### Elevated

Dropdowns and menus:

moderate shadow.

### Temporary overlay

Sheets/modals:

stronger shadow.

The goal is:

**elevation should communicate interaction state, not decoration.**

---

# Borders

For accounting products, borders are valuable.

Use borders especially around:

- financial sections
- input boundaries
- table groups
- ledger rows
- audit history
- summary totals

Avoid wrapping every content block inside multiple bordered boxes.

---

# Colors

Current blue foundation is appropriate.

Keep:

**Blue = interaction / brand**

**Green = positive financial movement / success**

**Red = negative / destructive / overdue**

**Amber = pending / attention**

Do not introduce more colors for decoration.

### Dark mode

Complete semantic dark values for:

- positive
- warning
- destructive
- all chart series

This should be treated as a system requirement, not an optional polish item.

---

# Icons

Lucide is appropriate.

Recommended:

- 16px in dense controls
- 20px primary navigation
- 20–24px major action
- avoid oversized decorative icons

Do not use filled icons everywhere.

Reserve filled icons for active states.

---

# Touch targets

The current minimum of 44px is good.

Keep 44px minimum.

For primary mobile CTA:

**48–52px**

For destructive actions:

make the touch area large, but visually separated.

---

# 9. Mobile UX Rules for TARTAR

These should become the product's permanent mobile design rules.

### Rule 1

**Do not shrink desktop interfaces. Reprioritize them.**

### Rule 2

**One mobile screen should have one dominant job.**

### Rule 3

**Primary financial values must always be visually obvious.**

### Rule 4

**Secondary accounting metadata belongs behind progressive disclosure.**

### Rule 5

**A mobile record is not a table row.**

It is a summary of a record.

### Rule 6

**Use bottom sheets for short contextual interactions.**

Use full-screen flows for complex accounting workflows.

### Rule 7

**Persistent navigation should represent frequent tasks, not every route.**

### Rule 8

**Filters should be progressive.**

Quick filters first, advanced filters second.

### Rule 9

**Never hide financial meaning simply to make the interface look minimalist.**

### Rule 10

**Every primary action must be thumb-accessible.**

### Rule 11

**Color indicates meaning; typography establishes hierarchy.**

### Rule 12

**Avoid more than three visual hierarchy levels in a compact card.**

### Rule 13

**Do not use a card simply because a card component exists.**

### Rule 14

**No interaction should require precision tapping.**

### Rule 15

**Loading should preserve layout and communicate progress locally.**

### Rule 16

**Offline status must be visible but not alarming.**

### Rule 17

**Every destructive operation requires explicit confirmation.**

### Rule 18

**Back should always close the current overlay before leaving the page.**

The existing back behavior already follows this principle.

### Rule 19

**Do not introduce a new visual language for every module.**

### Rule 20

**TARTAR should feel like one financial operating system, not a collection of CRUD screens.**

---

# 10. Implementation Roadmap

# Phase 1 — Critical Mobile Fixes

## 1. Redesign main mobile navigation

Add:

**Home / Sales / Vouchers / Accounting / More**

Keep the complete navigation inside More.

## 2. Rebuild mobile dashboard hierarchy

Change from:

**six stats + charts + alerts**

to:

**Today → Attention → Performance → Trends**

## 3. Redesign record cards

Move from generic cardized tables toward:

**title + amount + status + key metadata + detail**

## 4. Make Sales and Vouchers action-oriented

Show primary workflow actions directly in the record detail.

## 5. Redesign Receivables and Payables mobile flows

Use:

**party → balance → records → payments → ledger**

## 6. Fix tablet architecture

Separate:

portrait tablet

from

landscape tablet.

## 7. Eliminate first-render desktop flash

Prevent incorrect desktop table/dialog rendering before mobile state resolves.

---

# Phase 2 — Experience Improvements

## 8. Standardize context switches

Unify:

- status tabs
- ViewSwitch
- SegmentedTabs

under one design language.

## 9. Establish financial hierarchy

Create semantic money-value levels.

## 10. Simplify mobile toolbars

Use:

**Search / Filter / Sort / More**

rather than many isolated controls.

## 11. Unify Main + Admin design language

Keep their different use cases, but share:

- typography
- spacing
- colors
- statuses
- sheets
- actions
- interaction semantics

## 12. Improve forms

Use progressive disclosure and sticky financial summaries.

---

# Phase 3 — Premium Refinement

## 13. Reduce universal panel treatment

Not everything should look like a floating rounded container.

## 14. Formalize the type scale

Remove magic sizes.

## 15. Complete dark-mode semantics

Especially financial states and charts.

## 16. Refine motion

Motion should communicate:

- navigation
- confirmation
- expansion
- state transition

rather than simply making the interface feel animated.

## 17. Improve empty/error/offline copy

Make states more useful and contextual.

## 18. Refine charts

Every mobile chart should answer one clear financial question.

---

# Apple HIG + Material Design 3 Review

## Apple HIG principles TARTAR should adopt

### Strongly applicable

**Progressive disclosure**

Especially for ledger and accounting details.

**Bottom sheets**

Already implemented and highly appropriate.

**Grouped settings**

Especially Account and Master Data.

**Large touch targets**

Already strong.

**Contextual navigation**

Should be strengthened.

**Clear hierarchy**

Needs further improvement on dashboard and lists.

**Motion continuity**

Current view transitions are a good base.

---

# Material Design 3 principles TARTAR should adopt

### Strongly applicable

**Navigation hierarchy**

Useful for desktop.

**State layers**

Useful for touch feedback.

**Semantic color**

Already partly implemented.

**Responsive layout grids**

Already present.

**Adaptive components**

Very relevant to tables and forms.

**Elevation**

Useful when differentiated more strongly.

---

# What TARTAR should NOT do

Do not become an imitation of:

- iOS Settings
- Material Dashboard
- Stripe
- Linear
- Vercel

TARTAR needs its own language.

---

# Premium Product Benchmark

## Stripe

Borrow:

- financial clarity
- extremely strong monetary hierarchy
- restrained color usage
- emphasis on operational state

Do not copy the interface.

---

## Linear

Borrow:

- compact navigation
- keyboard-aware thinking
- clear hierarchy
- minimal visual noise
- fast transitions

Do not copy the dark/productivity aesthetic blindly.

---

## Vercel

Borrow:

- restraint
- typography hierarchy
- compositional simplicity
- strong systemization

---

## Notion

Borrow:

- progressive disclosure
- contextual commands
- flexible information hierarchy

Do not adopt Notion-like ambiguity for financial records.

---

## Apple

Borrow:

- mobile hierarchy
- gesture confidence
- contextual surfaces
- grouped settings
- large touch targets

---

## Revolut / Ramp

These are particularly relevant conceptually because they prove that **financial products can combine density with mobile-native clarity**.

Borrow:

- prominent balances
- direct action hierarchy
- contextual financial summaries
- purposeful color

---

# Desktop vs Mobile Decision Matrix

| Area          | Desktop                     | Mobile                                |
| ------------- | --------------------------- | ------------------------------------- |
| Navigation    | Sidebar                     | **Mobile-specific bottom nav + More** |
| Header        | Full branch + user controls | **Compact contextual header**         |
| Dashboard     | Bento                       | **Action-first vertical sections**    |
| Table         | Real table                  | **Record cards**                      |
| Ledger        | Table + expansion           | **Summary + detail**                  |
| Filters       | Toolbar/popover             | **Sheet**                             |
| Search        | Inline input                | **Search mode**                       |
| Sort          | Select                      | **Sheet**                             |
| Forms         | Dialog                      | **Full-height sheet / flow**          |
| Details       | Dialog / right panel        | **Detail sheet**                      |
| Confirmations | Dialog                      | **Action sheet**                      |
| Charts        | Multi-series                | **Focused insight charts**            |
| Notifications | Popover                     | **Notifications sheet**               |
| Account       | Dropdown                    | **Settings sheet / grouped page**     |

---

# TARTAR — Target Design Direction

TARTAR should evolve from:

> **A sophisticated responsive business application**

into:

> **A financial operating system with two native presentations: desktop and mobile.**

The visual direction should be:

### Precision

Clean geometry.

Consistent alignment.

Strong numerical formatting.

No decorative ambiguity.

### Trust

Neutral surfaces.

Stable interaction patterns.

Predictable confirmations.

Clear state messaging.

### Clarity

Every screen has one dominant purpose.

Secondary information appears progressively.

### Speed

Immediate touch feedback.

Stable layouts.

Fast transitions.

Minimal unnecessary blocking.

### Control

Every financial action has clear state and consequence.

### Professionalism

The visual language should feel closer to:

**financial infrastructure**

than

**marketing dashboard**.

### Modernity

Modern does not mean gradients, huge radii or glassmorphism.

Modern means:

**excellent information hierarchy + restrained visuals + excellent interaction design.**

### Premium quality

The highest-level design principle should be:

> **The interface feels expensive because it feels considered.**

Not because it contains more decoration.

---

# The target mobile experience

When a user opens TARTAR on an iPhone or Android phone, the experience should feel like:

**Open → understand → act**

rather than:

**Open → navigate → filter → inspect → open → scroll → find action**

A user should be able to:

### Check business health

in seconds.

### Find an overdue item

in seconds.

### Open a voucher

in one or two taps.

### Approve or act

without hunting through menus.

### Inspect accounting detail

without losing context.

### Record a transaction

without feeling like they are filling out a desktop form.

That is the difference between:

**responsive**

and

**mobile-native.**

---

# Final Design Verdict

TARTAR does **not** need a visual rewrite.

It needs an **experience reprioritization**.

The system already has enough component infrastructure to support a premium product. The largest opportunity is to move mobile from:

**"desktop architecture with mobile components"**

to:

**"shared business logic with mobile-first information architecture."**

That is a much smaller and safer redesign than rebuilding the application.

The most important principle is:

> **Keep the accounting complexity. Hide the interaction complexity.**

Users should still have access to all necessary accounting information.

They simply should not have to see all of it simultaneously.

---

# Do This First

1. **Replace the main mobile-only drawer navigation with a 5-item persistent navigation model plus More.**
2. **Redesign the mobile dashboard around Today → Attention → Performance → Trends.**
3. **Turn Sales and Vouchers into action-first mobile workflows.**
4. **Redesign Receivables/Payables around party → balance → records → payments → ledger.**
5. **Transform generic mobile table cards into true record-summary components.**
6. **Fix the 768–1023px tablet architecture instead of using the current hybrid model.**
7. **Eliminate the first-render desktop flash on mobile.**
8. **Standardize status tabs and segmented controls into one TARTAR interaction language.**
9. **Establish a formal typography/radius/spacing scale and remove one-off design values.**
10. **Reduce surface/card treatment so TARTAR looks like a premium financial system rather than a collection of floating panels.**

**Bottom line: TARTAR is already structurally strong enough to become excellent. The next leap is not more components—it is better prioritization, navigation and mobile workflow design.**
