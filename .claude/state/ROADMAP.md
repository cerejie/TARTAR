# ROADMAP — Native-feel mobile PWA (branch mobilel-app-native)
Updated: 2026-10-01 (M0 done, not committed; M1 next)

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
- Bottom tab bar per role + More · large title collapsing · back on detail · per-tab scroll restore
- Android Back closes the open sheet/modal · toasts clear of the tab bar
- Touch targets >= 44px on coarse pointers · primary action in thumb reach (FAB)
- Forms as full-height sheets, Save above the keyboard, enterKeyHint/inputMode per field
- Detail in bottom sheet · filters/sort as sheets · confirm as action sheet · View Transitions
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
- M0 DONE 2026-10-01, NOT committed. Build + lint clean; precache 87 entries (splash/screenshots
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

## Next
1. User check of M0 on devices: install on Android (Chrome), iOS (Safari -> Add to Home Screen:
   splash light/dark, status bar), Windows (Edge -> Install; shortcuts on the taskbar icon);
   landscape iPhone keeps content out of the notch; deploy twice to see the update toast.
2. M1 phone shell — present the file plan, wait for approval.
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
- phone shell today: src/layouts/ProtectedLayout.tsx · styles/layout/shell.styles.ts ·
  components/common/layout/Protected*.tsx · hook/layout/protected.hook.ts
- admin shell (primitives to generalise): src/layouts/AdminAppLayout.tsx · components/common/layout/
  Admin*.tsx · components/common/app/*.tsx · hook/layout/admin.hook.ts · hook/common/{pull,swipe,
  breakpoint}.hook.ts · styles/admin/admin.layout.styles.ts · styles/app/app.styles.ts
- modal on phones: components/common/modal/AppModal.tsx (Sheet below md) · form/EntityFormModal.tsx
- tables on phones: components/common/table/{DataTable,DataTableCards}.tsx
- PWA: vite.config.ts · public/{admin.webmanifest,splash,screenshots} · hook/app/update.hook.ts
- install: hook/common/install.hook.ts · store/common/install.store.ts
- offline (must survive M4): store/common/{sync,query}.store.ts · utils/{write,idb}.utils.ts
- harness: .claude/state/audit/ (drive.mjs; run against `yarn preview --port 4199 --strictPort`)

## State
Branch mobilel-app-native (= main at v2.01). M0 uncommitted. Migrations through 26 applied.
