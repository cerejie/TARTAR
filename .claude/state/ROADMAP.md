# ROADMAP — Native-feel mobile PWA (branch mobilel-app-native)
Updated: 2026-10-01 (M0 v2.02, M1 + M2 v2.03 committed; M3 done, not committed; M4 next)

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
- Bottom tab bar per role + More (M1) · large title collapsing (M1) · back on detail (M3) · per-tab scroll restore (M1)
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

- M3 DONE 2026-10-01, NOT committed. Build + lint clean; CSS verified emitted; not checked on a device.
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

## Next
1. User check of M0 + M1 + M2 on devices. M2: inputs/buttons 44px on a phone, form opens full height,
   Save stays above the keyboard on iOS and Android, keyboard Next/Done, tel/email keypads, FAB above
   the tab bar shrinking on scroll and hidden under sheets, desktop buttons unchanged. M1: each role's tabs, More lists the remaining pages + account,
   Alerts badge/sheet (manager), title collapses into the app bar on scroll, scroll position kept per
   tab, pull to refresh, Android Back closes sheet -> modal -> confirm in order and then leaves the
   page normally, toasts below the notch, admin app unchanged (tabs, side rail, user sheet).
   M0: install on Android (Chrome), iOS (Safari -> Add to Home Screen:
   splash light/dark, status bar), Windows (Edge -> Install; shortcuts on the taskbar icon);
   landscape iPhone keeps content out of the notch; deploy twice to see the update toast.
   M3: phone lists load the next rows at the bottom ("n of N", spinner, Retry offline) without
   skeleton flashes; tap a card title/chevron -> detail sheet, Back closes it; Filters and Sort sheets
   close on Back; delete/confirm shows as a bottom action sheet; tab switches crossfade (none with
   reduced motion); desktop paging, popover, sort select and alert dialog unchanged.
2. M4 push — present the file plan (migration 27 SQL shown, never applied), wait for approval.
3. Deployment checklist kept from the offline roadmap: user resets data (all QA rows incl.
   offline test sales P901, P333, P341, P905, P906, P391, P392, P911, expenses 902/904/907/908/909,
   purchase 393, payments 50/51/52, voucher approvals 908/909, emp sale 913,
   bank "QA O12 Bank" (no delete in the UI); 2026-10-01 concurrency rows: sales 701, 702 (now
   ₱7,022), 711, 721, 801, 802, 803, 932, 933, 941, 943, 944-948, 951 (931 deleted, 942 lost), expense
   712, purchases 811-818 payee "QA Race Payee" + their vouchers, receivables reference "C-RACE-*"
   + their payments; C2 rows: sales 1251 (deposited), 1253; C3: sale 961 on branch HARDWARE,
   auto-verified because admin recorded it — not deletable in the UI; C4: sale 953; C5: sale 963 verified, expense 964 + its rejected voucher; V3: expense 931, purchase 932 + vouchers,
   bank "QA V3 Bank" + accounts "QA V3 One"/"QA V3 Two"), adds Banks + branch legal_name/address.
   Then ask before deleting `.claude/state/audit/` and the old scratchpad audit dir
   (f7-approve.json there holds the superadmin password in plain text).

## Path map
- phone shell: components/common/layout/{PhoneShell,AppBar,AppTabBar,PhoneMoreSheet,
  PhoneAlertsSheet,AccountSheetItems}.tsx · hook/layout/{protected.phone,app.bar}.hook.ts ·
  styles/app/app.bar.styles.ts · styles/layout/shell.styles.ts (phone*) · hook/app/back.hook.ts
- admin shell: src/layouts/AdminAppLayout.tsx · components/common/layout/Admin*.tsx ·
  components/common/app/*.tsx · hook/layout/admin.hook.ts · styles/admin/admin.layout.styles.ts
- touch/form (M2): styles/common/theme.css (coarse rule) · hook/app/keyboard.hook.ts · components/common/button/PrimaryAction.tsx · utils/field.utils.ts
- modal on phones: components/common/modal/AppModal.tsx (Sheet below md) · form/EntityFormModal.tsx
- tables on phones: components/common/table/{DataTable,DataTableCards,LoadMoreSentinel}.tsx · hook/common/load.more.hook.ts
- PWA: vite.config.ts · public/{admin.webmanifest,splash,screenshots} · hook/app/update.hook.ts
- install: hook/common/install.hook.ts · store/common/install.store.ts
- offline (must survive M4): store/common/{sync,query}.store.ts · utils/{write,idb}.utils.ts
- harness: .claude/state/audit/ (drive.mjs, BASE default :5199; signed-in profiles are gone — run login.mjs first)

## State
Branch mobilel-app-native. M0 v2.02, M1 + M2 v2.03 committed; M3 uncommitted. Migrations through 26 applied.
