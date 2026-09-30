# ROADMAP — Pre-deployment QA fixes (live multi-role test, 2026-09-30)
Updated: 2026-09-30

## Goal
Fix every bug found in the 2026-09-30 live test (2 admins, 2 accountants, 2 employees, superadmin,
QA Test branch) so the app is deployable. `yarn build` + `yarn lint` clean after each phase. One
phase per conversation; the user reviews between phases. Replaces the finished client TO-DO roadmap
(P1-P10 + carried-over, v1.55-v1.71).

## Session protocol
1. New conversation: read this file, `git status --short`, start `Next` item 1. Load `build`
   (+ `tartar-shadcn` and `shadcn` docs for UI). Present the phase's file plan and WAIT for
   approval (global CLAUDE.md) before editing.
2. Migrations: write the SQL file, show it, never apply it; the user applies it to Supabase.
   Never drop/rename a column.
3. Close a phase: build + lint clean, tick Done with paths, rewrite Next, suggest commit
   (`git log --oneline --grep="^Development v" -1` + 0.1), tell the user to open a new
   conversation. Visual work is reported **compiled** unless a harness run proves it.
4. After the last phase: delete this file and `.claude/state/audit/` (ask first).

## Decisions locked
- L1 Branch Summary (D11) is the source of truth for money totals: Sales = verified sales,
  Expenses/Purchases = amount to pay (voucher net) by txn_date, rejected vouchers excluded,
  Net = Sales - Expenses - Purchases. Every other total (pages, dashboard, admin home, branch
  monitoring, period reports) must agree with it. Pending-voucher handling: follow whatever
  `transactionServices.getBranchSummary` does today — read it first, do not invent a rule.
- L2 The user resets all data before deployment. QA rows may be created freely in QA Test.
- L3 Carried over, unchanged: every CLAUDE.md convention (no comments, no useState, class strings
  in *.styles.ts, tokens only in theme.css, useConfirm, runWrite, Transactions is reference).

## Open decisions (ask the user at the start of the phase that needs them)
- Q1 (F5, ANSWERED: remove) Current Cash / Bank Balance / Branch Monitoring "Cash balance" read
  `cash_accounts.balance`, which nothing ever writes (always P0.00). Compute from transactions per
  cash account + bank account (needs opening balances), or remove the three tiles?
- Q2 (F6, ANSWERED: reduce only on verify) A PENDING (unverified) customer payment already reduces the receivable balance
  (P2,000 -> P1,200 before verify; reject restores it). Keep, or only reduce on verify?
- Q3 (F6, ANSWERED: add resubmit) Rejected expense/purchase vouchers are "Locked" for employees — no correct-and-resubmit
  like sales (D10). Add a resubmit flow?
- Q4 (F6, ANSWERED: required reason) Voucher "Reject" has no reason field (sale reject does). Add one?
- Q5 (F6, ANSWERED: follow voucher status) A purchase with no due date shows "Paid" in Due date while its voucher is still Pending.
- Q6 (F6b, ANSWERED: make admins branch-limited) Admin "Branch access" does nothing (admins always see all branches). Hide the field for
  admins, or make admins branch-limited?

## Bugs (evidence from the live run)
- B1 Sign in from `/login` -> "Page not found" until reload. Real path: Register -> redirected to
  /login -> approved user signs in -> 404. Cause: account.login.hook.ts:53 sets the session (router
  rebuilds at /login, not in the protected tree) and only then `resetLocation("/")` (replaceState,
  router never sees it). Signing in from `/` works.
- B2 Payments not branch-scoped: `payments`/`payment_allocations` read policy `using (true)`
  (migrations/20260718000004_voucher_workflow.sql:363,376). Employees/accountants (QA Test only)
  see Camille P6,500 and mario1 P1,200 of other branches; payment lists also ignore the manager's
  top-bar branch scope (payment.services.ts getList has no branch filter).
- B3 Totals count rejected vouchers / wrong basis:
  Expenses page Total + Top category (expense.list.hook summarize, sumDisbursements), dashboard
  "Today's Expenses" (dashboard.services onDay isExpense), Branch Monitoring Expenses and admin Home
  Expenses all show P350 = P250 approved + P100 rejected. Purchases summary
  (purchase.list.hook.ts:21-27): Outstanding = rows with due_date, gross invoice, never drops after
  Mark paid (stayed P1,120 after the P1,110 payable was paid); Paid = rows without due date;
  purchases table Due date column still shows the date after the payable is Paid.
  Period reports (Daily/Weekly/Monthly, components/report/PeriodReport.tsx + report.hook.ts):
  Expenses P415 includes rejected P100 + pending P65; Net = Sales - Expenses (no purchases).
  Cash Flow report: Cash Out uses gross invoice + rejected/pending; still lists "Collection" (D1).
- B4 "By customer" / "By supplier" ignore the top-bar branch scope:
  ledger.services getPartySummaries takes no branch (ledger.list.hook.ts:184).
- B5 "Rejected by —" on the employee's rejected-sale modal: users RLS lets an employee read only
  their own row (init.sql:539); sale.form.hook.ts:268 userNameOf. Needs a SECURITY DEFINER name
  RPC like `voucher_signatories` (P7).
- B6 Inline-created lookups are not refreshed: after the expense form creates an expense type /
  payee supplier (disbursement.form.hook.ts prepare -> resolveParty / ensureExpenseCategory), the
  Expenses table shows the slug `qa_utilities` until reload, and a SECOND expense typed with the
  same new payee created a DUPLICATE supplier ("QA Power Co" x2 in Master Data). Same risk for
  purchase Supplier and receivable Customer creatables.
- B7 Vouchers list purpose line is "—" for every expense voucher: voucherPurpose
  (models/data/voucher/voucher.response.ts:45) only matches the generic expense code; expense
  vouchers carry the expense type's code (WTR, QAU).
- B8 `/vouchers` opens by URL for accountants — the only `can` route without `permissionLoader`
  (routes/protected.view.routes.ts:71-80).
- B9 Customer statement print lists the REJECTED P100 payment under Payment history as if paid
  (print.utils.ts printStatement; P1 dropped the status column). Statements go to customers.
- B10 Report tables show branch slugs (`qa_test`) instead of names: Daily/Weekly/Monthly
  Transactions table, Receivables and Payables report tables. Payables report "Outstanding
  Suppliers" lists Paid rows (P0 balance).
- B11 Minor UX:
  - Date picker stays open after picking a day (FormField date case) — must click outside.
  - Payment "Verify" commits with no confirm (sale Verify confirms) — LedgerPaymentsTable /
    payment list hook; convention: committing actions go through useConfirm.
  - Main app has no favicon (index.html has no icon link -> /favicon.ico 404 on every load).
  - Users table Branches column shows slugs and shows "All" for an EMPTY list
    (UsersTable.tsx:127) — DB treats empty as NO branches for employees/accountants.
  - Pending-account sign-in toast is the raw server text "account is pending".
  - Manual voucher Branch defaults to LGC Hardware while the admin scope is QA Test.
  - Period print says "All branches" for an employee limited to QA Test; walk-in customer prints
    "—" (table says "Walk-in").
  - Offline-queued sale is not shown in the list until sync; no toast when the queue syncs.

## Verified working (do not re-test unless touched)
Role nav + URL guards (employee/accountant redirects), accountant branch scope (qaacc2 = Hardware +
QA Test only), user create/edit/reset password/approve registration, pending sign-in blocked,
branch create with letterhead, income source + bank account create, supplier delete blocked with a
clear toast when referenced, sale record (bank/cash/petty) -> deposit -> verify, reject -> View
reason -> resubmit -> verify, sale edit + edit history + delete, purchase (1% WHT: P1,120 ->
P1,110) and expense vouchers -> approve/reject, payables opened on approval (purchase + expense
with due date), Mark paid from bank/cash (PMT refs), receivable + partial payment + verify +
reject (balance restored), auto references RCV/PMT/QAT-*, voucher print (letterhead, breakdown,
bank, Prepared/Approved names), customer ledger, period print, Branch Summary = dashboard Net
Profit (P610), admin app pages, offline record -> sync, phone layout, no console/HTTP errors on
any route (superadmin, accountant).

## Phases
- F1 Quick fixes, no DB: B1 (set location before the session so the router builds at "/"),
  B8 (permissionLoader createVouchers -> /transactions), B7 (expense vouchers read "Expense" or the
  expense type label), B6 (invalidate supplier/customer/expense-category queries after a creatable
  saves; resolve against fresh data so no duplicates), B11 date picker closes on select, payment
  Verify via useConfirm, favicon link, Users table branch names + "None" for empty non-admins,
  friendly pending-account message, manual voucher Branch defaults to the scope.
- F2 Totals consistency, no DB (L1): B3 everywhere (Expenses/Purchases summaries, dashboard today's
  expenses, branch monitoring, admin home, period reports incl. purchases in Net, cash flow basis,
  hide Collection row), purchases Outstanding/Paid from payable status + amount to pay, purchases
  Due date column shows Paid once paid, B9 (statement excludes rejected payments or shows status),
  B10 (branch names in report tables, Payables report unpaid only). Re-check Branch Summary P610
  still matches.
- F3 Branch scoping + migration: B2 (payments/allocations read policy through
  receivables/payables branch with app.can_see_branch; payment lists honour the top-bar scope),
  B4 (party summaries take the branch scope). Propose SQL, user applies.
- F4 Names + migration: B5 (SECURITY DEFINER `user_display_names(uuid[])`, branch-checked like
  voucher_signatories) wired into "Rejected by" and any employee/accountant "Recorded by".
- F5 Cash & bank balances: ask Q1, then implement (compute or remove), migration only if needed.
- F6a Behaviour decisions Q2-Q5 (done v1.78).
- F6b Q6 admins branch-limited: app.branch_access() NULL for superadmin only; every
  `app.is_manager()` policy/RPC on branch data gains app.can_see_branch; backfill existing admins'
  users.branch_access to all branches; Users form shows Branch access for admins; Users table
  stops printing "All" for admins; top-bar branch list follows access. Ask first: admin with no
  branches; whether admins still manage users/branches/master data across all branches.
- F7 Re-run the live harness on every fixed item (QA profiles below), then deployment checklist:
  merge development-overhaul -> main, apply all migrations to production if it is a different
  Supabase project, user resets data, add Banks + branch legal_name/address.

## Done
- [x] Live multi-role test 2026-09-30 (this file's Bugs + Verified sections).
- [x] F1 quick fixes (v1.73): B1 account.login.hook resetLocation before the session; B8 vouchers
  permissionLoader; B7 voucherPurpose non-PUR = Expense; B6 disbursement.list.hook invalidates
  suppliers + expense categories; FormField date Dialog close on select; receivable Verify via
  useConfirm; Users Branches column (All admin / None empty / names, user.manage.hook
  branchAccessLabelOf); pending/rejected sign-in text (account.services toLoginError); manual
  voucher branch = scope. New icons: main stacked-ledger (public/icon*.png|svg,
  apple-touch-icon.png, vite.config manifest icons, index.html links) and admin navy gauge
  (admin-icon*, apple-touch-icon-admin.png; admin.manifest.hook swaps rel=icon). Generator:
  session scratchpad icons/build-icons.mjs (not kept). Not harness-verified yet (F7).
- [x] F2 totals consistency (v1.74): one rule in models/data/transaction/transaction.response.ts
  (countedAmountOf / sumCounted / amountToPayOf / isCountedDisbursement) used by Expenses +
  Purchases summaries (disbursement/expense/purchase list hooks), dashboard.services (today's/
  yesterday's expenses, monthly cash in/out, getOverview = admin Home, getBranchMonitor via
  `vouchers(status, amount)` embed), report.utils (sumBy, cashFlowTotals, periodTotals = Branch
  Summary calc, Collection row hidden, branch names in print). Disbursements carry `payable`
  (transaction.services withVouchers -> payablesOf); Purchases Outstanding = payable balance or
  voucher amount, Paid = no-due-date + payable paid_amount; Due date shows Paid once payable paid.
  Reports use getAllWithVouchers; Period reports 4 tiles (Net incl. purchases); Receivables/
  Payables reports unpaid only + branch names; statement skips rejected payments. Not
  harness-verified yet (F7: re-check Branch Summary P610, Expenses P250, Purchases totals).
- [x] F3 branch scoping (v1.75): migration 20261007000019_payment_branch_scope.sql (NOT applied
  until the user runs it) adds payments.branch (backfilled from allocations), record_ledger_payment
  stamps it and rejects cross-branch allocations ("Pay one branch at a time" - user decision),
  mark_payable_paid stamps the payable branch, pmt_read/pmt_insert/alloc_read branch-scoped.
  ILedgerPayment.branch; payment.services getList filters branch; payment.list.hook uses
  scopedFilters(top-bar scope); ledger getPartySummaries(branch) + ledger.list.hook party query
  and party-open payment records honour scope. Not harness-verified yet (F7).
- [x] F4 names (v1.76): migration 20261008000020_user_display_names.sql (NOT applied until the
  user runs it) adds SECURITY DEFINER `user_display_names()` (no args - userNameOf is per-row
  sync, so one name map: caller + admins + users sharing a visible branch; managers see all).
  IUserDisplayName, userDisplayNamesKey, user.services getDisplayNames; user.list.hook runs it for
  non-managers so every userNameOf ("Rejected by", "Recorded by", deposited/verified by) resolves.
  Not harness-verified yet (F7). Migration 20 applied by the user.
- [x] F5 balances (v1.77): Q1 = remove. Dashboard Current Cash + Bank Balance tiles and Branch
  Monitoring "Cash balance" column gone (DashboardView, BranchMonitorTable); IDashboardSummary /
  IBranchMonitorRow drop currentCash/bankBalance/cashBalance; dashboard.services no longer reads
  cash_accounts (table kept, unused). Remaining 6 stat tiles are span "third" (2 rows of 3).
  Compiled only (F7 checks the layout).

- [x] F6a Q2-Q5 (v1.78): migration 20261009000021_voucher_resubmit_payment_verify.sql (NOT
  applied until the user runs it): vouchers.rejection_reason; guard lets rejected -> pending
  only; app.reopen_rejected_voucher called by update_transaction_with_voucher (resubmit);
  record_ledger_payment applies only self-verified payments, balance check counts pending
  (app.pending_allocated); new verify_payment RPC; reject_payment reverses verified only;
  backfill strips pending allocations from paid_amount. Frontend: voucher Reject = reason modal
  (voucher.list.hook rejectModal, VouchersTable, voucherRejectSchema); common/form/
  RejectionIntro (sale + disbursements); Expenses/Purchases rejected row "View reason" ->
  edit modal "Resubmit" (disbursement.list.hook editRejected/rejectedByName; locked = approved
  or printed); status tag hint = reason; Purchases Due date Rejected/Pending/date/Paid;
  paymentServices.verify -> verify_payment RPC. Pay modal still caps at amount - paid_amount
  (server rejects over-allocation incl. pending). Not harness-verified yet (F7).

- [x] F6b Q6 admins branch-limited (v1.79): decisions - empty access = none, only branch-bound
  records scoped (users/branches/master data stay global), creating admin is granted the new
  branch. Migration 20261010000022_admin_branch_scope.sql (NOT applied until the user runs it):
  app.branch_access() NULL for superadmin only, admins read users.branch_access live (security
  definer); app.manages_branch(branch) on tx/rcv/pay/vch/pmt manager policies, allocations follow
  their payment; verify_sale/reject_sale/set_voucher_breakdown/reopen_rejected_voucher branch
  checked; trigger branches_grant_creator; backfill admins = all branches. Frontend:
  selectBranchAccess null for superadmin only + addBranchAccess (account.store); branch.list.hook
  allBranchOptions + branchName over all; branch.scope.hook no manager bypass; branch.manage.hook
  grants the new slug; user.manage.hook all branches in the field, admins show names;
  account.request admin needs >= 1 branch. Not harness-verified yet (F7).
- [x] F6c role hierarchy developer > superadmin > admin > accountant/employee (v1.79, same
  migration 22): app.authorities (one developer cerejie1342@gmail.com, one superadmin
  cagapearlynmae@gmail.com, Supabase Auth; other email logins refused), app.authority_role /
  is_developer, is_superadmin = either authority, public.my_authority_role (login check),
  developer_set_superadmin_password (bcrypt into auth.users). Admins read all users, manage
  accountants/employees only (policies + admin_create_user/admin_set_password). Frontend:
  AuthorityRole enum, account.store setAuthoritySession(email, role), loginSuperAdmin checks
  role, permissions manageAdmins = superadmin/developer, manageSuperAdmin = developer,
  Users page "Superadmin password" button (menus/SuperAdminPasswordButton) + modal, admin rows
  read-only for admins. Developer is not in public.users, so never listed for the superadmin.
  SUPERSEDED by F6d (authority superadmin, password RPC and button all removed).
- [x] F6d A-C email accounts (v1.79, uncommitted): migration 22 reworked (NOT applied):
  user_role enum + 'superadmin' (role::text comparisons), users.email (unique lower) +
  pending_password_hash + password_reset_requested_at; authorities = developer only;
  app.user_role() + app.branch_access() read LIVE from approved public.users rows (all table
  users, not only admins); is_developer / is_superadmin; app.can_manage_role + users_manage_*
  policies (admins also read admins); admin_set_password on it; user_display_names includes
  superadmins; login_email, register_email, admin_create_user_email (app.username_from_email,
  app.assert_new_account), account_email_exists, request_password_reset,
  decide_password_reset, change_own_password; old login/register/admin_create_user revoked.
  Migration 20261011000023_fresh_users.sql (NOT applied) wipes public.users + non-developer
  auth.users - FK check pending (auto mode blocked the grep): if any table references
  public.users without on delete, 23 fails and needs set-null updates first.
  Frontend: role.enum (superadmin UserRole, AuthorityRole = developer, manageableRolesOf);
  permissions drop manageAdmins/manageSuperAdmin; account.store setDeveloperSession /
  developerEmail, superadmin = manager + all branches; accountServices.login (login_email,
  28P01 -> developer Supabase Auth); LoginView "Email"; user.services email columns +
  decidePasswordReset; user.manage.hook approve modal (userApproveModalKey,
  approveUserSchema), reject/reset-decision confirms, branch field hidden for superadmin;
  UsersTable email hint, "Reset requested" tag + actions. tsc + lint clean.

## Next
F6d - email-only accounts + role hierarchy (APPROVED 2026-09-30, implement A-C in one
conversation; D in the one after). Supersedes the F6c authority-superadmin design: the
superadmin is now a TABLE role, only the developer is a Supabase Auth account.
Locked decisions:
- Roles: developer (Supabase Auth, cerejie1342@gmail.com, app.authorities) > superadmin >
  admin > accountant/employee. Many superadmins allowed; developer adds/replaces/removes them.
- app.can_manage_role: developer -> superadmin/admin/accountant/employee; superadmin ->
  admin/accountant/employee; admin -> accountant/employee. Superadmin never sees the developer
  or other superadmins; admin sees admins read-only + manages accountant/employee.
- Email-only sign-in for everyone. username column kept (auto from email, never shown).
- Sign-up: email + full name + password + confirm -> pending; approver picks role (per
  hierarchy) + branches at approval. Designed success panel ("waiting for approval").
- Forgot password: /forgot-password, step 1 email (must exist), step 2 new + confirm password,
  success panel "Waiting for admin approval. Please contact your admin." Stored as
  users.pending_password_hash; someone above approves/rejects. No emails sent (free tier).
- Account settings (/account): profile + change own password (current + new + confirm).
- Delete every existing table user and every auth.users row except the developer.
A-C done (see Done). Remaining:
D. THIS conversation: RegisterView redesign + success panel, /forgot-password two-step flow
   (replace ForgotPasswordHint popover), /account settings page (profile card + change
   password; developer via supabase.auth.updateUser after re-verifying current password) +
   "Account settings" in ProtectedUserMenu. Auth flow step state in a zustand store.
   RPCs already in migration 22: register_email(p_email, p_full_name, p_password),
   account_email_exists(p_email) (approved only), request_password_reset(p_email,
   p_password), change_own_password(p_current_password, p_new_password). Profile edit
   (full name) has no RPC yet - add update_own_profile to migration 22 if the card edits it.
   Register still calls the revoked username `register` (registerSchema/usernameField in
   account.request, account.register.hook) - switch it to register_email and delete
   usernameField/USERNAME_REGEX once unused.
Then: user applies 22 + 23, signs up cagapearlynmae@gmail.com and approves her as Superadmin,
F7 live re-test.

## Audit harness (drives the real app, live Supabase)
- Dir: `C:/Users/CCLISO~1/AppData/Local/Temp/claude/c--Users-cclisondato-Documents-MyProgramming-
  Ejie-Business-TARTAR/fdf908ac-a5f4-4224-a10c-c56eaf659eb9/scratchpad/audit` (playwright-core
  installed there; copy scripts from `.claude/state/audit/` if it is gone). Dev server
  `yarn dev --port 5199 --strictPort` (often already running).
- `drive.mjs <steps.json>` = LIVE writes (no faking). Env: PROFILE (profile dir), TAG (shot
  prefix), W/H viewport. Logs HTTP >= 400, console errors, page errors. Step keys: login [user,pw]
  (signs in from "/"), goto, button (+page), click, row (+item menu, expand), fill {name|label|
  css: value}, pick {comboLabel: text} (typed text with no option = creatable new value), date
  [fieldText, "October 3, 2026"], submit (+confirm), confirmOnly, dump, text, count, expect,
  absent, url, toasts, popupItem / popupButton (print popups), name (screenshot), stop, always.
  Shots in shots/drive/. `safe-shot.mjs` = read-only (fakes writes) for screenshots.
- Profiles: `profile` = superadmin; `qa-qaadmin1`, `qa-qaadmin2` (Admin), `qa-qaacc1` (QA Test),
  `qa-qaacc2` (QA Test + LGC Hardware), `qa-qaemp1`, `qa-qaemp2` (Employee, QA Test), `qa-reg`
  (qareg1, self-registered then approved). All QA passwords `QaTest#2026`. Re-sign-in with a
  `[{"login":["qaemp1","QaTest#2026"]}]` step if a token expired.
- QA data (left for the user's reset): branch QA Test (qa_test, QAT, letterhead set), 7 QA users,
  QA Customer A, QA Supplier One, QA Power Co (x2 — B6), expense type QA Utilities (QAU), income
  source QA Consulting, bank QA Bank / QA Account 000111222, sales P1,000/P750/P520 verified +
  P333/P44 undeposited, purchases P1,120 (paid payable) + P300, expenses P250 (paid payable) /
  P100 rejected / P65 pending, receivable RCV-QAT-2609-0001 (P1,200 left), payments PMT-QAT-2609-
  0001..0004, customer payment P700.
- Auto mode may block running the harness; if so, give the user the PowerShell line
  `cd "<dir>"; node drive.mjs "<spec>"` and read the shots afterwards.

## State
Branch: development-overhaul · v1.78 committed · uncommitted: F6b + F6d A-C (suggested as
v1.79) · Migrations 22 + 23 written, NOT applied (apply after D), 21 applied · Last check:
npx tsc -b + yarn lint clean 2026-09-30.
