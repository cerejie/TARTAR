# ROADMAP — Migrate TARTAR from antd + vanilla-extract to Tailwind v4 + shadcn (aria-vega)
Updated: 2026-09-26

## Goal
No `antd`, `@ant-design/*` or `@vanilla-extract/*` left in package.json or src; every screen on
shadcn aria-vega components + Tailwind; `yarn build` and `yarn lint` clean; CLAUDE.md and
`.claude/skills/build/references/` describe the new stack. Stop after each phase for user review.

## Session protocol — one phase per conversation
1. New conversation (skill `tartar-migration-next` auto-loads): read this file, `git status --short`, then start `Next` item 1. The user may just say "continue".
2. Do only that phase. Stop at its end even if context remains.
3. Close the phase: yarn build + yarn lint clean; update Done / Next / State here (add any new paths to Path map); suggest the commit (`Development v<X.Y>`, +0.1 per phase); tell the user to open a new conversation.
4. When P5 is done, delete this file.

## Decisions locked
- Design -> shadcn default design, TARTAR colours only (tokens in theme.css)
- Primitives -> React Aria, shadcn style `aria-vega` (same as reference)
- Imports -> adopt `@/` alias (update CLAUDE.md in P5 to allow it)
- Commit format -> title `Development v<X.Y>`, description `<Prefix>: <Title>` lines; migration series starts at v1.0 (see .claude/skills/commit/SKILL.md). Suggest after every change, never commit unless asked.
- Kept from TARTAR conventions: no comments (components/ui/ exempt, generated), no useState/useReducer, zustand, rhf+zod, useConfirm, pagination, runWrite offline queue, one default export per file
- Charts -> recharts via shadcn `chart`; icons -> lucide-react
- Styles -> cn/cva class constants in `src/styles/<area>/<area>.styles.ts` (reference pattern), replacing each `*.css.ts`; no Tailwind class strings in JSX

## Path map
- Reference repo: D:/EJIE BUSINESS/EJIE WORK DCWD/dcwd_apps-crm-customer2 (its `src/components/common/*`, `src/styles/*/*.styles.ts`, `src/styles/common/theme.css`, `docs/tailwind-shadcn-migration-plan.md`)
- Tokens: src/styles/common/theme.css (new) ; old: src/styles/common/vars.css.ts, tone.css.ts, global.css.ts
- cn: src/utils/cn.utils.ts ; shadcn config: components.json ; ui: src/components/ui/ (43 files) ; src/hook/use-mobile.ts
- Old style areas: src/styles/{card,filter,form,layout,modal,scene,stat,status,table,view}/ (17 *.css.ts total; scene/farm.scene.ts uses `palette`)
- Common primitives (P1): src/components/common/card/{SectionCard,StatCard}, filter/{FilterToolbar,LedgerFilterBar,SearchInput}, form/{EntityFormModal,FormField,FormFieldGrid,FormSection}, guard/RequirePermission, modal/{AppModal,ConfirmationModal,DetailModal}, status/{ProgressRow,StatDelta,StatusTag,SyncIndicator}, table/{DataTable,RowActionMenu,RowDetailPanel,TableDecor,TablePagination,TablePanel}, view/{BentoCell,BentoGrid,ContentView,ViewSwitch}
- Shell (P2): src/components/common/layout/{ProtectedBranchScope,ProtectedFooter,ProtectedHeader,ProtectedMenu,ProtectedSider,ProtectedSiderUser}, src/layouts/, src/hook/layout/, src/store/common/theme.store.ts (antd theme object)
- Features (P3), antd importers: components/{transaction/tables, ledger(5)+ledger/tables(3), payment, disbursement/modal, purchase/tables, expense/tables, master-data(2), report(4), dashboard(2), auth}; charts: components/dashboard/CashFlowDonut.tsx + pages/Dashboard/DashboardView.tsx (@ant-design/charts); pages importing antd: Auth(2), Branches, Dashboard, Error, Receivables, Reports, Users, Vouchers; also src/App.tsx, hook/common (1), store/common (1)
- P1 new: models/common/table.model.ts (IDataTableColumn, IDataTableSelection, ISortState) ; store/common/sort.store.ts + hook/common/sort.hook.ts ; common/filter/{FilterSelect,DateRangeFilter}.tsx ; styles/{common/tone,card/card,stat/stat,status/status,filter/filter,form/form,modal/modal,table/table,view/view}.styles.ts ; @internationalized/date now a direct dep
- Old *.css.ts still imported by features (P3 converts, P4 deletes): card.css(1), stat.css(5), filter.css(1), form.css(2), table.css (iconButton, nowrapCell, slugTag), tone.css (NotificationsPanel, dashboard.view.css)
- P2 new: components/common/layout/RouteRoot.tsx (aria RouterProvider, parent route in protected/public.routes.ts) ; styles/layout/{shell,header,sidebar}.styles.ts ; theme.store `mode` + `toggleMode` (persisted, `themeStorageKey`), `.dark` class synced in hook/app/app.hook.ts ; IRoute.icon is `LucideIcon` ; antd `theme` object still in theme.store for ConfigProvider until P4
- P3a new: components/common/button/AppButton.tsx (ui Button/LinkButton + loading/disabled/href; feature buttons use it with `onPress` and a lucide child icon) ; table.styles.ts `nowrapCell`, `tagRow` ; styles/disbursement/disbursement.styles.ts (audit list)
- Old style areas still live: styles/layout/public.layout.css.ts (AuthShell, LoginView, RegisterView, ErrorView -> P3)
- Config: vite.config.ts (tailwindcss plugin + alias added; still has vanillaExtractPlugin + antd/charts manualChunks), tsconfig.app.json + tsconfig.json (paths), src/main.tsx (imports global.css then theme.css)

## Done
- [x] P0 setup — deps added (tailwindcss, @tailwindcss/vite, react-aria-components, cva, clsx, tailwind-merge, lucide-react, recharts; dev shadcn, tw-animate-css); theme.css token bridge (preflight OFF: split theme/utilities import so antd is untouched until P4); components.json; cn.utils.ts; 43 aria-vega ui files copied from reference (no carousel/input-otp); use-mobile.ts. yarn build + lint clean.
- [x] P1 common primitives — card/{SectionCard,StatCard}, filter/{FilterToolbar,LedgerFilterBar,SearchInput,+FilterSelect,+DateRangeFilter}, form/{EntityFormModal,FormField,FormFieldGrid,FormSection}, guard/RequirePermission, modal/{AppModal,ConfirmationModal,DetailModal}, status/{ProgressRow,StatDelta,StatusTag,SyncIndicator}, table/{DataTable,RowActionMenu,RowDetailPanel,TableDecor,TablePagination,TablePanel}, view/{BentoCell,BentoGrid,ContentView,ViewSwitch} on components/ui; props kept (unused `menu` dropped from SectionCard/StatCard). DataTable: own column model replaces antd ColumnsType in 20 features (import swap only), sorting/selection/client paging via zustand keyed by useId. Deleted status.css.ts, modal.css.ts, view/content/content.view.css.ts, modalWidths. FormField: select -> searchable combobox, password has no reveal toggle yet. yarn build + lint clean.
- [x] P2 shell — ProtectedLayout on SidebarProvider/SidebarInset; common/layout/{ProtectedSider (collapsible icon rail + SidebarRail), ProtectedMenu (SidebarGroup per route group, aria href links), ProtectedBranchScope (MenuTrigger + Popover + Command search, "Manage branches" item), ProtectedSiderUser (avatar + dropdown: dark-mode toggle, sign out), ProtectedHeader (SidebarTrigger + h1 + SyncIndicator), ProtectedFooter} ; +RouteRoot ; hook/layout/protected.hook.ts (menu returns groups, no antd) ; branch.scope.hook drops visibleBranches (Autocomplete filters) ; route icons -> lucide ; deleted styles/layout/protected.layout.css.ts. antd screens stay light in dark mode until P3. yarn build + lint clean.
- [x] P3a transaction family — transaction/{tables/TransactionsTable,cards/TransactionSummaryCards}, purchase/{tables/PurchasesTable,cards/PurchaseSummaryCards}, expense/{tables/ExpensesTable,cards/ExpenseSummaryCards}, disbursement/modal/DisbursementHistoryModal off antd/@ant-design/icons/*.css.ts (lucide icons, AppButton, statGrid wrapper dropped — it was an empty style). yarn build + lint clean.
- [x] Commit skill: suggest mode + `Development vX.Y` format (.claude/skills/commit/SKILL.md, build/SKILL.md step 7, CLAUDE.md section)

## Next
1. If P3a is still uncommitted, remind the user once (`Development v1.4` / `Refactor: Transaction Screens On Shadcn`), then continue P3.
2. P3b ledger domain — components/ledger/{CustomerInfoModal,CustomerLedgerModal,CustomerLedgerView,LedgerManager,PaymentAllocationModal,cards/LedgerSummaryCards,modal/RecordPaymentModal,tables/(3)}, hook/data/ledger/ledger.list.hook.ts, models/data/ledger/ledger.response.ts, pages/Receivables, payment/PaymentsPanel, styles/view/ledger/ledger.view.css.ts. Use AppButton for buttons.
3. P3c master-data (2) + pages Branches, Users, Vouchers · P3d dashboard (CashFlowDonut + NotificationsPanel + DashboardView -> shadcn `chart`) + report (4) + pages Reports · P3e Auth (AuthShell, Login, Register), Error, public.layout.css.ts; then utils/{format,print,report}.utils + services/dashboard (dayjs/antd check) and the toast question (Open).
4. P4 remove antd/@ant-design/vanilla-extract, delete *.css.ts, drop antd `theme` object from theme.store + ConfigProvider in App.tsx, switch theme.css to full `@import "tailwindcss"` (preflight on), drop vanillaExtractPlugin + manualChunks, add oxlint restricted-imports guard · P5 rewrite CLAUDE.md + build references.

## Open
- Toasts: antd `message` in src/hook/common/mutation.hook.ts needs a replacement — `sonner` (shadcn registry) is a new dependency; ask the user when P1/P3 reaches it.

## State
Branch: development-overhaul · Uncommitted: yes (P2) · Last check: yarn build + yarn lint clean after P2
