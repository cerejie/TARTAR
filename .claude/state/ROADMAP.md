# ROADMAP — Native-feel mobile PWA (branch mobilel-app-native)
Updated: 2026-10-01 (M0 v2.02, M1 + M2 v2.03, M3 v2.04, M4 v2.05 committed; M5 automated pass DONE, not committed; fix roadmap in Next)

## Goal
The MAIN app feels like a native app on phones (iOS + Android), installs as an app on iOS,
Android and Windows, still works in a plain browser, keeps every offline guarantee of the
offline-hardening roadmap, and sends push notifications. `yarn build` + `yarn lint` clean after
each phase, then a user check on a real phone.

## Session protocol
1. New conversation: read this file, `git status --short`, start `Next` item 1. Load `build`
   (+ `tartar-shadcn` and `shadcn` docs for UI). Present the phase's file plan and WAIT for
   approval (global CLAUDE.md) before editing.
2. One phase per conversation. Never commit or merge unless asked.
3. Migrations: write the SQL file, show it, never apply it. Never drop/rename a column.
   Dev and production are the SAME Supabase project.
4. Close a phase: build + lint clean, tick Done with paths, rewrite Next, suggest commit
   (`git log --oneline --grep="^Development v" -1` + 0.1), tell the user to open a new conversation.

## Decisions locked (2026-10-01)
- D1 Delivery = installable PWA with native feel. No Capacitor, no React Native.
- D2 The MAIN app becomes native on phones (< 768px). Tablets/desktop keep the sidebar shell.
  REVISED 2026-10-01 (user): the main app on phones keeps the collapsible sidebar (menu button in the
  app bar opens it as a drawer) instead of a bottom tab bar. Only /admin (4 tabs) keeps the native
  bottom tab bar.
- D3 Platforms: iOS + Android + Windows installs, and a plain browser.
- D4 Push notifications: yes — all four events: daily 8 AM due digest (managers, accountants),
  voucher needs approval (managers), payment needs verification (managers), your record was
  decided (employee: voucher approved/rejected, sale verified).
- D5 `/admin` app is KEPT as a separate install (own manifest, scope /admin). Its primitives move
  to `components/common/` and both shells use them. One push subscription per device serves both.
- D6 Phone lists load the next server page on scroll; desktop keeps TablePagination.
- D7 Offline-hardening roadmap parked as done; its V4 visual pass folds into M5.
- L1 Every CLAUDE.md convention holds (no comments, no useState, class strings in *.styles.ts,
  tokens only in theme.css, useConfirm, writes through runWrite, Transactions is reference).

## Standards checklist (from the 2026-10-01 analysis; tick as phases land)
- Phone nav = sidebar drawer from the app bar menu button (main app, D2 revised); bottom tab bar = /admin only · large title collapsing (M1) · back on detail (M3) · per-tab scroll restore (M1)
- Android Back closes the open sheet/modal (M1) · toasts clear of the tab bar (M1)
- Touch targets >= 44px on coarse pointers · primary action in thumb reach (FAB)
- Forms as full-height sheets, Save above the keyboard, enterKeyHint/inputMode per field
- Detail in bottom sheet (M3) · filters/sort as sheets (M3) · confirm as action sheet (M3) · View Transitions (M3)
- Edge-to-edge + safe areas (M0) · status bar colour (M0) · splash (M0) · install UI (M0)
- Update prompt (M0) · push (M4)

## Phases
- M0 Platform baseline — DONE (see Done).
- M1 Phone shell (< 768px): role tab bar (manager Home·Transactions·Vouchers·Alerts; employee
  Sales·Expenses·Vouchers·Receivables; accountant Transactions·Receivables·Payables·Reports) +
  More (other pages, branch scope, theme, account, sign out); app bar with collapsing title, back,
  branch picker, sync; pull to refresh; per-tab scroll restore; Android Back closes sheets (history
  entry per open modal); sonner top with safe-area offset. Generalise AdminTabBar / AppSheet /
  ListCard / pull / swipe into components/common + hook/common; admin keeps using them.
- M2 Touch + forms: coarse-pointer sizing (inputs, buttons, icon buttons, pager >= 44px) via a
  `coarse` custom variant in theme.css applied from common wrappers (never edit components/ui);
  EntityFormModal as full-height sheet with sticky footer above the keyboard (visualViewport);
  enterKeyHint; extended FAB for the page primary action that shrinks on scroll.
- M3 Lists + detail: ListCard rows on phones; detail in AppSheet; FilterPopover/SortSelect as
  sheets; ConfirmationModal as bottom action sheet; View Transitions (reduced-motion safe);
  load-more on scroll over the existing server paging (D6).
- M4 Push: migration 27 `push_subscriptions` (user_id, endpoint unique, keys, user_agent,
  created_at; RLS owner-only; index on user_id); Edge Function `send-push` (web-push, VAPID keys
  as secrets set by the user); DB triggers for the event pushes + pg_cron 08:00 Asia/Manila digest
  via pg_net; switch vite-plugin-pwa to injectManifest (custom SW: precache + push +
  notificationclick deep link, scope-aware for /admin) — offline precache must survive; opt-in
  switch in Account settings + contextual prompt, never on load; iOS needs the app installed.
  New deps: workbox-precaching/routing (SW build). Show SQL, never apply.
- M5 Verification matrix: each role on iOS installed, Android installed, Windows Edge installed,
  plain browser; offline harness re-run (o11/o12 reads+writes, o6 replay) after the SW change;
  old V4 items (Pending sync tag, OfflineNotice, Sync panel, failed list, light + dark, phone).

## Done
- Offline hardening (O1-O4, C1-C5, V1-V3) done and verified 2026-09-30..10-01, committed through
  v1.94 + later; details in git history (Development v1.85-v1.94). Not done: V4 visual pass -> M5.
- M0 DONE 2026-10-01, committed as Development v2.02. Build + lint clean; precache 87 entries (splash/screenshots
  excluded); built SW waits for SKIP_WAITING (prompt mode). Not yet checked on a device.
  - index.html: viewport `viewport-fit=cover, interactive-widget=resizes-content`; theme-color
    #eef2fb (was red #c1121f); 32 apple-touch-startup-image tags (16 iPhone/iPad portrait sizes,
    light + dark) -> public/splash/*.png.
  - vite.config.ts: registerType prompt; manifest id/scope/start_url/lang/dir, display_override,
    categories, launch_handler navigate-existing, shortcuts Sales + Vouchers, screenshots
    (public/screenshots/narrow.png 780x1688, wide.png 1280x800 — the login page); globIgnores.
  - theme.css `p-safe-*` utility (max(spacing, env(safe-area-inset-*))); shell.styles shellRoot
    p-safe-3 / md:p-safe-4; public.styles authPage p-safe-0, errorPage p-safe-6.
  - src/hook/app/theme.color.hook.ts (useThemeColorHook(token), follows .dark): protected.hook +
    PublicLayout use --backdrop, admin.hook uses --panel; admin.manifest.hook lost its theme-color
    and viewport swaps (index.html carries the viewport now).
  - src/hook/app/update.hook.ts: registerSW prompt -> persistent toast "A new version of TARTAR is
    ready" + Reload; update check hourly and on return to the app.
  - Install: models/common/install.model.ts, store/common/install.store.ts,
    hook/common/install.hook.ts (useInstallPromptListener in app.hook, useInstallApp),
    components/account/cards/InstallAppCard.tsx in AccountView (install button / iOS steps /
    browser-menu note / installed), styles in account.styles.ts.
  - Splash + screenshots were rendered with the harness Chrome (scratchpad assets/gen.mjs), no dep.

- M1 DONE 2026-10-01, committed as Development v2.03. Build + lint clean; not yet checked on a device or in the
  harness (audit profiles are gone, so the harness needs a fresh sign-in first).
  - Phone shell (< 768px): layouts/ProtectedLayout.tsx renders components/common/layout/PhoneShell.tsx
    (AppBar + scroll main with pull to refresh + AppTabBar + PhoneMoreSheet + PhoneAlertsSheet);
    md+ keeps the sidebar shell. hook/layout/protected.phone.hook.ts (shell, tab bar, More, Alerts).
  - Role tabs: utils/route.utils.ts phoneTabPathsOf / phoneTabLabelOf ("/" shows as Home),
    isActiveRoutePath, dashboardPath. Manager gets an Alerts tab (sheet, not a route) with the
    due-alert count; More is active on any non-tab page.
  - Shared with admin: AppBar.tsx (branch picker, collapsing title, sync, trailing slot),
    AppTabBar.tsx (ITabItem in models/common/tab.model.ts, link or button tabs) replaces
    AdminTabBar; AccountSheetItems.tsx + AccountAvatar.tsx (admin user sheet and More);
    styles/app/app.bar.styles.ts (appBar*, appTab*, accountSheet*, moreSheet*);
    hook/common/scroll.hook.ts (useScrollRestore per pathname, useScrolledPast);
    hook/layout/app.bar.hook.ts (useAppBarHook, useBranchSheetHook; key branchSheetModalKey).
  - AppSheet closes itself when the pathname changes (hook/common/sheet.hook.ts).
  - Android Back: hook/app/back.hook.ts useOverlayBackHook in RouteRoot. Any visible modal-store
    modal or the confirm dialog marks one history entry (tartarOverlay "open", router state kept);
    Back closes the top overlay; closing from the UI marks the entry "spent"; stale/spent entries are
    skipped on the next Back. A running confirm ignores Back.
  - Toasts: App.tsx mobileOffset from styles/common/toast.styles.ts (safe-area top).
  - Removed: ProtectedNotifications popover + header hamburger (phones no longer use the header).
  - Deferred: back chevron on detail (no detail routes; detail sheets arrive in M3). Branch scope
    lives in the app bar, not in More.

- M2 DONE 2026-10-01, committed as Development v2.03. Build + lint clean; CSS verified emitted; not checked on a device.
  - Touch: theme.css base-layer `@media (pointer: coarse)` rule — min 44px on data-slot button (text
    sizes), input, input-group, select-trigger, combobox-chips; icon/icon-lg size 44; xs/icon-xs/
    icon-sm keep their look with a 44px ::after hit area. No `coarse` custom variant (nothing uses
    it); tabs-trigger left alone (fixed-height tabs-list).
  - Keyboard: hook/app/keyboard.hook.ts (useKeyboardInsetHook in app.hook) writes --keyboard-inset
    from visualViewport (0 on Android, keyboard height on iOS). modal.styles drawerContent lifts by it
    (all bottom sheets); drawerContentFill = full height minus top safe area; AppModal `fill` prop.
  - EntityFormModal: fill on phones, Cancel/Save are AppButton (loading). enterKeyHint "next", last
    keyboard field "done" (utils/field.utils.ts lastKeyboardFieldOf, threaded through FormFieldGrid /
    FormSection; FormField prop optional so direct users are unchanged). IFieldConfig.inputMode:
    tel on customer/supplier contact, email on user email.
  - FAB: components/common/button/PrimaryAction.tsx (icon, label, onPress) — md+ inline AppButton;
    phones portal to body, fixed above the tab bar, label collapses after 120px scroll
    (useFloatingActionHook in hook/layout/app.bar.hook.ts; styles floatingAction* in
    styles/app/app.styles.ts; phoneColumn pb-24 while one is on screen). Used by Transactions,
    Sales, Expenses, Purchases, Vouchers, LedgerRecords tables and Branch/User/BankAccount/
    ExpenseCategory/IncomeSource/Supplier create buttons.

- M4 DONE 2026-10-01, committed as Development v2.05. Build + lint clean; precache 88 entries (4 manifest icons listed twice,
  same revision). Migration 27 written, NOT applied; Edge Function not deployed; nothing checked on a device.
  - supabase/migrations/20261015000027_push_notifications.sql: push_subscriptions (owner select/delete RLS,
    endpoint unique, user_id index); save_push_subscription (endpoint moves to the signed-in user) +
    delete_push_subscription RPCs; app.settings push_function_url + push_secret; app.push_managers,
    app.peso, app.send_push (pg_net, skips the actor, no-op until settings are set); deferred constraint
    triggers vouchers_push (pending -> branch managers; approved/rejected -> creator), payments_push
    (pending -> branch managers), transactions_sale_push (verified/rejected -> creator, reason included);
    app.send_due_digest (open/partial receivables + payables due <= today Manila, per user's branches) on
    pg_cron 'tartar-due-digest' 0 0 * * * UTC.
  - supabase/functions/send-push/index.ts: x-push-secret check, service-role read, npm:web-push, deletes
    404/410 endpoints. Secrets VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT, PUSH_SECRET.
  - SW: vite.config.ts injectManifest (srcDir src, sw.ts); src/sw.ts precache + cleanup + index.html
    navigation fallback + SKIP_WAITING + push + notificationclick (focus a window in the same scope,
    /admin vs main, navigate; else openWindow); tsconfig.sw.json (WebWorker), excluded from tsconfig.app.
    devDeps workbox-precaching + workbox-routing ^7.4.1.
  - Client: models/common/push.model.ts, utils/push.utils.ts (VITE_VAPID_PUBLIC_KEY), services/data/
    push.services.ts (rpc, onlineOnly — not runWrite: device state needing the push service online),
    store/common/push.store.ts (promptDismissed persisted, key pushPromptStorageKey),
    hook/common/push.hook.ts (usePushStatusListener in app.hook, usePushNotifications, usePushPrompt,
    usePushOffer, releasePushSubscription in endSession after the stores clear).
  - UI: components/account/cards/NotificationsCard.tsx in AccountView (on/off, blocked, iOS needs install,
    unsupported, unconfigured); components/common/status/PushPromptNotice.tsx in PhoneAlertsSheet;
    usePushOffer toast ("Notify me" / "Not now", once per session, non-managers) after create in
    sale.form, voucher.list and disbursement.list (expenses + purchases) hooks.
  - Inbox (user request, same day): supabase/migrations/20261016000028_notification_inbox.sql (apply after 27):
    public.notifications (owner select RLS, realtime), mark_notifications_read(p_ids | null = all),
    app.notify = inbox rows for every recipient (minus actor) + send_push; the 3 event triggers use it;
    digest stays push-only; cron 'tartar-notification-cleanup' 16:30 UTC deletes read rows > 30 days.
    Client: models/data/inbox/inbox.response.ts, services/data/inbox.services.ts (markRead via runWrite rpc),
    hook/data/inbox/inbox.list.hook.ts, components/inbox/{lists/InboxFeed,menus/InboxBell}.tsx; inboxListKey
    in liveRefreshKeys; "notifications" in realtime liveTables. Desktop header bell (popover, all roles);
    phone: managers' Alerts tab (badge + unread) / app-bar bell for other roles -> PhoneAlertsSheet (Updates,
    then due list for managers); admin Notifications tab shows Updates on top, badge + Mark all read include
    it. ListCard: amount optional, icon prop.

- M3 DONE 2026-10-01, committed as Development v2.04. Build + lint clean; CSS verified emitted; not checked on a device.
  - Load more (D6): hook/common/query.hook.ts `keepPrevious` option (old rows stay, shown refreshing,
    while a new key loads) on the 6 paged list hooks; models/common/pagination.model.ts loadMoreStep 20 +
    grownPageSize (page 1, size = page x size + 20 — a growing window, no rows cached in a store);
    components/common/table/LoadMoreSentinel.tsx + hook/common/load.more.hook.ts (IntersectionObserver,
    re-armed when the loaded count changes; stops on error and shows Retry). DataTable renders it on
    phones when given pagination + onPageChange (the 8 paged tables now pass totalCount/onPageChange);
    TablePagination returns null on phones unless `visibleOnPhone` (DataTable's client pager passes it).
    A grown size carries over to desktop (size select shows blank until changed).
  - Detail sheet: DataTableCards opens RowDetailPanel in an AppSheet (title press or chevron) through
    the modal registry key rowDetailSheetModalKey(expansionKey ?? useId), so Android Back closes it;
    inline card expansion removed. DataTable `detailTitle?: (row) => string` (fallback "Details") —
    no table passes it yet.
  - Filters/sort: FilterPopover phone sheet moved to the modal registry (filterSheetModalKey(useId));
    SortSelect on phones = icon pill + AppSheet list of ghost buttons with a check (sortSheetModalKey).
  - Confirm: ConfirmationModal on phones = bottom Sheet action sheet (icon, title, message, full-width
    action over Cancel, not dismissable while running); desktop AlertDialog unchanged.
  - View Transitions: RouteRoot navigate passes `viewTransition` on phones; theme.css root crossfade
    180ms, off under prefers-reduced-motion; app bar + tab bar carry their own view-transition-name.

- M5 automated pass DONE 2026-10-01, NOT committed. Build + lint clean (precache 86). Chrome harness on a
  production build (vite preview :5199), phone 390x844 touch, tablet 820x1180, desktop 1440, landscape 844x390.
  - Phone shell change (D2 revised): PhoneShell = SidebarProvider + AppBar(leading SidebarToggle, trailing
    InboxBell with dueCount) + ProtectedSider account (drawer; pinned group + AccountSheetItems inside the
    scrolling content). Removed AppTabBar from the main app, PhoneMoreSheet, phone tab helpers in
    route.utils, moreSheet* styles; key sidebarMenuModalKey syncs the drawer with Android Back
    (useSidebarToggleHook in protected.hook). FAB dock now 1rem above the safe area.
  - Fixed while testing: (1) M1 regression: 768-1023px had an offcanvas sidebar with no trigger -> SidebarToggle
    in ProtectedHeader; (2) form sheet taller than the screen (title/close off-screen): drawerContentFill height
    lost to the registry's data-[side=bottom]:h-auto -> same variant; (3) update toast Reload did nothing on a
    first-visit (uncontrolled) tab -> reloadIntoUpdate in update.hook; (4) Sync panel was a popover on
    phones/tablets, Back left the page -> AppSheet via syncSheetModalKey; (5) push copy promised employees
    approvals + the digest -> pushSummaryOf(permissions); (6) .env.example carried the VAPID private key ->
    removed (key is in git history, see Next P0-1).
  - Passed: emp/acc/admin phone (every menu page renders, no x-overflow, drawer Back, Back after menu
    navigation, alerts sheet, FAB collapse, collapsing title, full-height form 831px, enterkeyhint/inputmode,
    Filters/Sort/detail sheets + Back, load more 8 -> 59/66, confirm action sheet, dark mode); tablet (menu
    button, drawer, Back); desktop admin + accountant (every route, primary dialog opens/fits/closes, dark,
    0 page errors); /admin phone (4 tabs, bottom bar) + desktop (side rail); landscape (no overflow).
  - Offline (new SW): o11-emp, o11-admin, o12-acc/emp/admin, o6 replay all green: offline reloads served by the
    SW, offline sale/expense/payment/master-data writes queued and replayed, failed list empty. Phone offline:
    Pending sync tag, "You are offline", Sync sheet lists the write, queue flushes on reconnect.
  - PWA: update toast + Reload (controlled and first-visit), manifest main + /admin found, no manifest errors.
  - Push client: SW push handler shows JSON / text / empty / admin-url payloads; subscribe in a real Chrome
    profile -> FCM endpoint + save_push_subscription 204; Turn off -> delete 204; sign-out releases the device;
    employee "Get a notification when it is decided?" toast after recording a sale. Account card shows
    "not set up" without VITE_VAPID_PUBLIC_KEY.
  - Static review: migrations 27/28 + send-push consistent with app.branch_access (empty array = no branch,
    superadmin/developer = all); actor skipped; RLS owner-only; digest 00:00 UTC = 08:00 Manila.
  - QA rows created this pass (add to reset): sales 911, 913, 341 (deposited), 520, 914 x2 (qaemp2);
    expense 904 "OFFLINE O6" + voucher; receivable payment 51 QA Customer A (PMT-QAT-2610-0005, pending);
    expense category "QA O12 Type" (QOT); bank "QA O12 Bank" again. Test push subscription already deleted.

## Next
Fix roadmap to 100% deployable. P0 = blocks deploy, P1 = fix before go-live, P2 = soon after, P3 = polish.

P0 — user actions (cannot be done from this machine: no Supabase CLI or service credentials)
1. VAPID key leak: commit d3382c5 (pushed to origin/mobilel-app-native) has VITE_VAPID_PRIVATE_KEY in
   .env.example. Treat that pair as burned: `npx web-push generate-vapid-keys` for a NEW pair; public key ->
   host env + .env.local VITE_VAPID_PUBLIC_KEY; private key -> function secret only. Working tree is cleaned.
2. DONE 2026-10-01: migration 28 applied (cron job 2 = tartar-notification-cleanup). Verified: inbox loads
   ("No updates yet"), offline banner back to "showing data saved ...". Was: apply 28 before deploying. Without it every page shows the
   inbox error in the bell/Alerts and the offline banner says "this page was not saved for offline".
3. Deploy push: secrets VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (mailto:), PUSH_SECRET;
   `supabase functions deploy send-push --no-verify-jwt`; `update app.settings set push_function_url =
   '<url>/functions/v1/send-push', push_secret = '<PUSH_SECRET>'`. First call: read the function log —
   npm:web-push needs node ECDH under Deno; if it throws, switch to jsr:@negrel/webpush.
4. Server push checks (2 devices): employee submits voucher -> manager push + inbox; approve/reject ->
   employee; employee payment -> manager; sale verify/reject -> employee; `select app.send_due_digest()`;
   tap opens the right page (main vs /admin window); sign-out stops pushes.
5. Real devices: iOS Safari -> Add to Home Screen (splash light/dark, status bar, push only when installed),
   Android Chrome install, Windows Edge install (taskbar shortcuts); keyboard keeps Save visible on iOS;
   drawer + Android Back; landscape notch.
6. Reset QA data (Done M5 list + the deployment checklist below), then deploy.

P1 — code, next session
7. Push key rotation: subscribeThisDevice reuses an existing subscription even if it was made with another
   VAPID key (devices subscribed before P0-1 would fail silently with 403). Compare
   subscription.options.applicationServerKey with vapidPublicKey and resubscribe when different
   (hook/common/push.hook.ts).
8. Offline banner: every mounted query counts (selectHasUnsavedWatched), so one failing shell query (inbox
   bell, due alerts) marks every page "not saved for offline". Let shell-level queries opt out of the
   page's offline status (query.hook option + query.store watchers).

P2 — UX
9. Master Data lists are client-paged at 8 with no search: a new category lands on page 2 out of sight.
   Add SearchInput + newest-first or a larger page (design plan item).
10. Touch: listbox/menu options are ~32px on coarse pointers; extend the theme.css coarse rule to select,
    combobox and menu items (>= 44px).
11. Dashboard "Sales Overview" head on phones: title wraps beside four pills, the last pill is clipped;
    stack the pills under the title below md.
12. ErrorState shows raw PostgREST text ("Could not find the table ... in the schema cache"); map server
    errors to plain copy, keep detail for the developer.

P3 — polish / tech debt
13. React Router view transitions throw "Transition was skipped" (unhandled rejection) on rapid navigation;
    harmless, but noisy in error tracking.
14. Tablet (768-1023): header InboxBell + other popovers are not in the modal registry, so Back leaves the page.
15. Landscape phones (>= 768 wide) get the tablet header shell; content height ~280px.
16. notifications retention deletes only read rows; unread rows grow forever.
17. Harness: o12-acc.json uses qaacc2 (no Dashboard/Vouchers, read-only) — align steps with the account.

Deployment checklist kept from the offline roadmap: user resets data (all QA rows incl.
offline test sales P901, P333, P341, P905, P906, P391, P392, P911, expenses 902/904/907/908/909,
purchase 393, payments 50/51/52, voucher approvals 908/909, emp sale 913,
bank "QA O12 Bank" (no delete in the UI); 2026-10-01 concurrency rows: sales 701, 702 (now
₱7,022), 711, 721, 801, 802, 803, 932, 933, 941, 943, 944-948, 951 (931 deleted, 942 lost), expense
712, purchases 811-818 payee "QA Race Payee" + their vouchers, receivables reference "C-RACE-*"
+ their payments; C2 rows: sales 1251 (deposited), 1253; C3: sale 961 on branch HARDWARE,
auto-verified because admin recorded it — not deletable in the UI; C4: sale 953; C5: sale 963 verified,
expense 964 + its rejected voucher; V3: expense 931, purchase 932 + vouchers,
bank "QA V3 Bank" + accounts "QA V3 One"/"QA V3 Two"), adds Banks + branch legal_name/address.
Then ask before deleting `.claude/state/audit/` and the old scratchpad audit dir
(f7-approve.json there holds the superadmin password in plain text).

## Path map
- phone shell: components/common/layout/{PhoneShell,AppBar,SidebarToggle,ProtectedSider,
  PhoneAlertsSheet,AccountSheetItems}.tsx (AppTabBar = /admin only) · hook/layout/{protected.phone,app.bar}.hook.ts ·
  styles/app/app.bar.styles.ts · styles/layout/shell.styles.ts (phone*) · hook/app/back.hook.ts
- admin shell: src/layouts/AdminAppLayout.tsx · components/common/layout/Admin*.tsx ·
  components/common/app/*.tsx · hook/layout/admin.hook.ts · styles/admin/admin.layout.styles.ts
- touch/form (M2): styles/common/theme.css (coarse rule) · hook/app/keyboard.hook.ts · components/common/button/PrimaryAction.tsx · utils/field.utils.ts
- modal on phones: components/common/modal/AppModal.tsx (Sheet below md) · form/EntityFormModal.tsx
- tables on phones: components/common/table/{DataTable,DataTableCards,LoadMoreSentinel}.tsx · hook/common/load.more.hook.ts
- PWA: vite.config.ts · src/sw.ts · public/{admin.webmanifest,splash,screenshots} · hook/app/update.hook.ts
- push: supabase/functions/send-push · migration 27 · hook/common/push.hook.ts · store/common/push.store.ts
- install: hook/common/install.hook.ts · store/common/install.store.ts
- offline (must survive M4): store/common/{sync,query}.store.ts · utils/{write,idb}.utils.ts
- harness: .claude/state/audit/ (drive.mjs, BASE default :5199; signed-in profiles are gone — run login.mjs first)

## State
Branch mobilel-app-native. M0-M4 committed through v2.05; M5 automated pass + its fixes uncommitted.
Migrations 27 and 28 are applied (28 verified in the app 2026-10-01). Edge Function send-push not deployed; app.settings push_* unset. Harness for this pass lives in the
session scratchpad (m5/*.mjs, playwright-core installed there); the repo harness is .claude/state/audit.
