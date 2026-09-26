# ROADMAP — Visual UI/UX audit + polish (every page and modal)
Updated: 2026-09-26

## Goal
Every screen and modal is checked visually (desktop + phone, light + dark) with a senior
UI/UX eye for spacing, padding, alignment, hierarchy, overflow, states and practicality, and
every finding is fixed. `yarn build` + `yarn lint` clean after each phase. One phase per
conversation; the user reviews between phases.

## Session protocol
1. New conversation: read this file, `git status --short`, start `Next` item 1. Load `build` +
   `tartar-shadcn` (+ `shadcn` docs for any ui item touched).
2. Do only that phase. Close it: build + lint clean, tick Done with paths, rewrite Next, suggest
   commit (`git log --oneline --grep="^Development v" -1` + 0.1; minor counts past 9), tell the
   user to open a new conversation. Report visual work as **compiled** unless a screenshot
   proves it.
3. After the last phase: delete this file and `.claude/state/audit/`.

## Decisions locked
- Modal header = title only. No description / subtitle line under the title (user, 2026-09-26).
- Audit, then fix in batches by area — never all in one conversation (user, 2026-09-26).
- All CLAUDE.md conventions unchanged (no comments, no useState, class strings in *.styles.ts,
  tokens only in theme.css, useConfirm, runWrite, Transactions is the reference).

## User-reported bugs (fix in V1)
1. Modal header shows a description under the title -> remove it; header is the title only.
2. Modal footer buttons overflow the footer (seen in form modals) -> footer must wrap / fit at
   every ModalSize and on the phone sheet; buttons never spill past the rounded edge.
3. Pill tabs (ViewSwitch / StatusFilterTabs): while a list is loading, the selected pill's text
   turns black on the blue fill, then white again -> selected text must stay on-brand white in
   every state (loading, disabled, pending, hover, focus, dark mode).

## Audit harness (drives the real app with the user's Chrome)
- Scripts saved in `.claude/state/audit/` (login.mjs, shot.mjs, public.json). Copy them into the
  session scratchpad, then there: `npm init -y && npm i playwright-core` (scratch only — never in
  the repo). Chrome channel is installed at C:/Program Files/Google/Chrome.
- Dev server: `yarn dev --port 5199 --strictPort` (background). Scripts target localhost:5199.
- Sign-in: `node login.mjs` opens a visible Chrome on /login with a persistent profile
  (`./profile`); the USER signs in (never ask for the password), script exits on redirect.
- Capture: `node shot.mjs <specs.json>` (add `public` as 2nd arg for no-profile public pages).
  Spec = [{name, path, w, h, dark, settle, actions:[{click|hover|press|fill|scroll, wait}]}];
  PNGs land in `./shots/`, console errors are printed. Read each PNG with the Read tool.
- It runs against the LIVE Supabase: open modals and cancel them; never press Save / Approve /
  Reject / Delete / Archive / Record payment.
- Dark = toggles `.dark` on <html>; phone = 390x844; desktop = 1440x900 (+ 1280x800 spot checks).

## Scope (what to capture)
- Routes: / (Dashboard), /transactions, /purchases, /expenses, /vouchers, /receivables,
  /payables (+ ?view=parties), /reports (each report pill), /branches, /master-data (both pills),
  /users; public /login, /register, a 404.
- Modals (keys in src/keys/modal.keys.ts): transactionForm, voucherForm, userCreate, userEdit,
  userReset, branchCreate, branchEdit, branchScopeSearch (top-bar popover), supplierCreate/Edit,
  expenseCategoryCreate/Edit, customerLedger (+ slide to CustomerLedgerView), customerDetails,
  customerInfo, customerPayment (PaymentAllocationModal), ledgerForm, ledgerPayment
  (RecordPaymentModal), disbursementForm, disbursementEdit, disbursementHistory; plus
  ConfirmationModal (open a delete/confirm and cancel), DetailModal, row-expanded panels,
  Filters popover, Sort select, user menu, notifications popover, sidebar collapsed rail,
  phone sheet sidebar.
- States: loading skeleton, empty, error (offline devtools / bad filter), refreshing, long
  names / big money values, validation errors in forms.

## Audit checklist (senior UI/UX lens)
Spacing rhythm (4/8 scale, equal gutters, card padding vs table padding), alignment (numbers
right, headers aligned with cells, icon/text baselines), hierarchy (one h1, title sizes,
muted text contrast), overflow/wrapping (long names, money, footers, toolbars at 1280 and
390), touch targets >= 40px on phone, focus rings visible, dark-mode contrast and borders,
consistent pill/button heights, empty/loading/error parity, modal width per ModalSize,
scroll containment (only the content card scrolls), sticky headers, redundant labels,
practical flow (primary action placement, destructive actions separated).

## Path map
- Modals: src/components/common/modal/{AppModal,ConfirmationModal,DetailModal}.tsx ;
  src/components/common/form/EntityFormModal.tsx (subtitle prop) ; styles/modal/modal.styles.ts
  (modalHeaderRuled, modalFooter, modalActionSize, drawerHeaderRuled, drawerFooter,
  confirmFooter) ; ModalSize in models/common/view.model.ts
- Pills: src/components/common/view/ViewSwitch.tsx, common/filter/StatusFilterTabs.tsx ;
  styles/view/view.styles.ts (viewSwitchItem) ; consumers components/*/menus/*StatusTabs.tsx,
  ledger/menus/LedgerViewTabs.tsx
- Shell: src/layouts/ProtectedLayout.tsx ; components/common/layout/* ; styles/layout/*.styles.ts
- Content view: components/common/view/{ContentView,BentoGrid,BentoCell,SectionHeading,
  PageSkeleton}.tsx ; styles/view/view.styles.ts
- Table / filters: components/common/table/*, components/common/filter/* ;
  styles/{table,filter}/*.styles.ts
- Cards / status: components/common/card/{SectionCard,StatCard,InfoCard}.tsx,
  components/common/status/* ; styles/{card,stat,status}/*.styles.ts
- Tokens: src/styles/common/theme.css ; tones styles/common/tone.styles.ts
- Screens: components/<domain>/{tables,cards,menus,modal,views}/ ; pages/<Area>/<Area>View.tsx

## Done
- [x] Harness built + verified: public pages captured headless via Chrome channel (login,
  register, phone, errors, 404) — screenshots were in the old scratchpad, recapture in V2.
- [x] V1 — user bugs (compiled, not screenshot-verified): subtitle prop removed from AppModal /
  EntityFormModal / DetailModal and all callers; identity subtitles folded into titles
  (CustomerInfoModal, PaymentAllocationModal, UsersTable reset, DisbursementHistoryModal).
  modal.styles modalFooter flex-wrap, confirmFooter sm:flex-wrap. view.styles viewSwitchItem
  pins on-brand text on selected hover/focus/dark (root cause: toggle hover:text-foreground).
  V2 capture must confirm all three.

## Next

1. **V2 — full capture + findings**: run the harness over the whole Scope, read every shot,
   write a `## Findings` section here (id, screen, issue, fix, severity high/med/low), grouped
   into fix batches V3..Vn by area (shell/nav, tables+filters, modals+forms, cards+dashboard,
   reports, auth/error, mobile). No code changes in V2. Show the user the findings; they pick
   the order.
2. **V3..Vn — fix batches**, one per conversation, re-screenshot each fixed screen.

## Open
- Migration 20260926000009_accountant_voucher_read.sql (and possibly 20260718000004..
  20260722000008) not yet applied to Supabase — accountant voucher views stay empty until then.

## State
Branch: development-overhaul · Uncommitted: yes (V1 src + .claude/state) · Last check: yarn build +
yarn lint clean (after V1)
