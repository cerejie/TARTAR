# ROADMAP — Flux redesign (phases 0–5)
Updated: 2026-08-29

## Goal
Move the whole app onto the flux visual language (ink sidebar, lime accent, floating
rounded shell, bento content) and route every page through one reusable `ContentView`.
Done = all 6 phases landed, `npx tsc -b` clean.

## Status: COMPLETE — all 6 phases landed. `tsc -b`, `vite build`, `oxlint` all clean. Nothing committed.

## Decisions locked
- Palette direction -> **Full flux, brown retired.** ink #16161A / lime #D6F25B / lilac #B9A5F5 / cloud #F2F3EE.
- antd `colorPrimary` -> **ink, never lime** (white-on-lime fails contrast). Lime is accent only.
- Money semantics -> green/red keep meaning; lime & lilac stay decorative.
- Font -> **system stack, no new dependency** (`Segoe UI Variable Display/Text`).
- `styles/scene/farm.scene.ts` -> **kept**; stroke repointed to `palette.limeSoft`, still drawn by
  `authHeroArt` on the ink auth hero (opacity dropped 0.4 -> 0.3 now that the stroke is lime).
- `SiderCallout` -> presentational; content from `useProtectedCalloutHook`.
- Menu badges -> **skipped** (needs a data source + polling).
- No global search / notification bell in the header — would be fake UI, feature does not exist.
- **Focus affordance -> lilac (`accentAlt`) everywhere.** Table keyboard outline, auth submit,
  auth links, auth input focus ring. Lime is reserved for identity/accent, never for focus.
- **Donut colours stay semantic, not `chartSeries`.** The original plan said drive the cash-flow
  donut off `chartSeries`; that would have indexed a categorical array for a green/red pair and
  broken the money-semantics rule. Instead `sliceColors` is one module-level const feeding both
  `scale.color.range` and the legend, so the two can no longer drift. `chartSeries` remains for
  genuinely categorical charts.

## Path map
- Tokens: `src/styles/common/vars.css.ts` (+ `chartSeries`, ink/accent keys, radius `xxl`/`shell`)
- Tones: `src/styles/common/tone.css.ts` (added `accent`, `info`)
- antd theme: `src/store/common/theme.store.ts`
- Globals: `src/styles/common/global.css.ts`
- Shell CSS: `src/styles/layout/protected.layout.css.ts`
- Shell: `src/layouts/ProtectedLayout.tsx`
- Chrome: `src/components/common/layout/{ProtectedHeader,ProtectedHeaderUser,ProtectedSider,ProtectedBranchScope,ProtectedFooter,SiderCallout}.tsx`
- Layout hooks: `src/hook/layout/protected.hook.ts` (`useProtectedHeaderUserHook`, `useProtectedCalloutHook`, `useProtectedFooterHook`)
- Shell view: `src/components/common/view/{ContentView,PageHeader,BentoGrid,BentoCell}.tsx`
- View CSS: `src/styles/view/content/content.view.css.ts`, `src/styles/view/common/common.view.css.ts`
- Cards: `src/components/common/card/{SectionCard,StatCard}.tsx` + `src/styles/card/card.css.ts` + `src/styles/stat/stat.css.ts`
- Status: `src/components/common/status/{StatDelta,ProgressRow}.tsx` + `src/styles/status/status.css.ts`
- Modals: `src/components/common/modal/{AppModal,DetailModal}.tsx` + `src/styles/modal/modal.css.ts`
  + `src/models/common/detail.model.ts`, `src/models/common/view.model.ts`
- Shared types: `src/models/common/view.model.ts` (`ViewLayout`, `BentoSpan`, `CardTone`, `ModalSize`, `modalWidths`)
- Public shell: `src/styles/layout/public.layout.css.ts` (auth + `errorPage`/`errorCard`),
  `src/components/auth/AuthShell.tsx`, `src/pages/Error/ErrorView.tsx`

## Done
- [x] **Phase 0 — tokens.** vars/tone/theme.store/global rewritten; `farm.scene.ts` stroke repointed.
- [x] **Phase 1 — chrome.** Floating shell, ink rail w/ pill nav, header utility bar (user chip + branch
      scope moved up from the sider), new `ProtectedFooter`, new `SiderCallout`.
      `ProtectedSiderUser.tsx` deleted → `ProtectedHeaderUser.tsx`.
- [x] **Phase 2 — primitives.** `ContentView` (title/subtitle/meta/actions/toolbar/layout/footer),
      `BentoGrid`+`BentoCell` (named spans), `PageHeader` reduced to the bare title block,
      `SectionCard` (+tone/menu/footer/dense), `StatCard` (+unit/chip/menu/children),
      `StatDelta` moved to `common/status` and now a pill, new `ProgressRow`,
      `AppModal` + generic `DetailModal<T>`, `EntityFormModal` rebuilt on `AppModal`.
- [x] **Phase 3 — migration.** All 9 `PageHeader` call sites now `ContentView`; `extra` → `actions`;
      Segmented moved into `toolbar` on Reports + MasterData; `reportSegmented` removed.
      Dashboard rebuilt on bento (8 stat cells, sales twoThirds, ink cash-flow third, alerts full).
- [x] **Phase 4 — tables, dashboard, filters.**
      - `table.css.ts` retoned (uppercase heads, pill icon buttons, lilac focus ring, tokenised overdue row).
      - `dashboard.view.css.ts`: dead `notificationColumn` + its two `globalStyle` rules deleted
        (its `card`/`cardBody` import swapped for `cardTone`); `cardTone.ink`-scoped overrides added for
        `donutCenterValue`, `donutCenterLabel`, `donutLegendKey`, `donutLegendValue`.
      - `card.css.ts`: ink-card overrides for `.ant-empty-description` and `.ant-spin-dot-item`
        (both were dark-on-dark inside `tone="ink"` — same defect class as the donut text).
      - `CashFlowDonut.tsx`: one `sliceColors` const feeds both the scale range and the legend;
        the net row moved `colors.brand` → `colors.accent` so it reads on ink.
      - `filter.css.ts` / `form.css.ts`: **no change needed** — both hold layout only (widths, margins),
        zero colour, nothing to retone. Left alone rather than invent styling.
- [x] **Phase 4b — modal shells adopted.**
      - `CustomerInfoModal` → `DetailModal<ICustomerInfo>`. **Not** `DetailModal<IParty>` as originally
        planned: a ledger customer can have no party row yet, and `DetailModal` renders `Empty` on a
        null record, which would have hidden the name + "Not filled" tag + "Fill in details" action in
        exactly the case that matters. `ICustomerInfo` = `{ name, party }`, so the record is non-null
        whenever a customer is selected. Per-item `loading ? "—"` guard dropped — `DetailModal`
        skeletons the whole body.
      - `CustomerLedgerModal` → `AppModal` size `xl` (1040, same width as before).
      - `PaymentAllocationModal` → `AppModal` size `lg` (640 → 760); `onOk`/`okText`/`okButtonProps`/
        `confirmLoading` replaced by an explicit footer matching `EntityFormModal`'s
        `<Flex justify="flex-end" gap={8}>`; `Record payment — {name}` split into title + subtitle.
      - Audit-history `Modal` in `DisbursementManager` → `AppModal` size `lg`; its summary `Paragraph`
        became the modal `subtitle` (so `Paragraph` dropped from the `Typography` destructure).
      - Side effect of the shell, app-wide: every migrated modal is now `maskClosable={false}` +
        `destroyOnHidden`. Ledger + history modals were previously mask-closable.
- [x] **Phase 5 — public shell.** `public.layout.css.ts` fully retoned; every hard-coded brown/cream
      rgba (`62,37,34` / `211,163,118` / `255,224,178` / `140,110,99` / `255,242,223`) replaced by a
      local `tint.{lime,lilac,ink}(alpha)` helper (vanilla-extract can't derive alpha from a hex token)
      or by a `vars` token. Notable fixes: `authHero` text was `accent` (lime body copy) → `onInk`;
      `authHeroIcon` was `brandLight`, which became ink-on-ink after phase 0 → now lime on
      `inkOverlay`/`inkBorder`; `authMark` now matches `siderLogoMark` exactly (lime block, ink letter,
      shadow dropped); blobs are lime/lilac/ink. `ErrorView` (the top-level `*` route, rendered outside
      both layouts) wrapped in new `errorPage`/`errorCard` so it sits on the flux ground.

## Next
- Nothing outstanding. Optional follow-ups, none blocking:
  1. Build warns three chunks >500 kB (`antd` 1.2 MB, `charts` 1.47 MB, `index` 592 kB).
     Pre-existing, unrelated to the redesign — would need `manualChunks` / dynamic import.
  2. Bundle CSS is 34.26 kB (6.54 kB gzip) — healthy, no action.

## Open
- None. The four original open questions were answered by the non-destructive defaults recorded
  under *Decisions locked*.

## State
Branch: development · Uncommitted: yes (nothing committed this session)
Last check: `npx tsc -b` clean · `npx vite build` clean (built in 38.7s) · `npx oxlint .` clean
