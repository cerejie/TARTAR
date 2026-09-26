---
name: tartar-shadcn
description: Component and styling standard for the TARTAR BMS frontend on Tailwind v4 + shadcn/ui aria-vega. Load automatically whenever writing, migrating or changing any UI in this repo - a page, table, filter row, form field, modal, confirm, card, stat tile, badge, chart, empty/loading/error state, sidebar or header - and whenever adding or editing anything under src/styles/ or src/components/ui/. Maps every UI need to the exact shadcn component and the TARTAR common primitive that wraps it, forbids hand-rolled equivalents, carries the registry workflow (search / docs / view / add + fixups), the components/ui vs components/common layer rule, the rule that class strings live in src/styles/<area>/<area>.styles.ts and never in JSX, and the TARTAR token contract in theme.css.
---

# TARTAR shadcn/ui Standard

Stack: Tailwind v4 + shadcn/ui **`aria-vega`** (React Aria Components) + lucide-react +
recharts. Tokens: `src/styles/common/theme.css`. Ported from the reference repo
`D:\EJIE BUSINESS\EJIE WORK DCWD\dcwd_apps-crm-customer2` — when this file is silent, read
that repo's equivalent `src/components/common/<kind>/` and `src/styles/<area>/` and mirror it.

The migration from antd + vanilla-extract is complete. `theme.css` imports the full
`tailwindcss` (preflight on), and `.oxlintrc.json` fails the lint on any retired import.

Retired imports (never in any code): `antd`, `@ant-design/icons`,
`@ant-design/charts`, `@vanilla-extract/*`, `dayjs` in UI code where `@internationalized/date`
is required, and any Radix / Base UI package (`radix-ui`, `@radix-ui/*`, `@base-ui/react`,
`vaul`, `cmdk`, `react-day-picker`).

## React Aria, not Radix

- `components.json` → `"style": "aria-vega"`. Never `--base base` / `-b radix`. A registry
  item that pulls in Radix or Base UI is not added — compose from aria components and say so.
- **shadcn's default design, TARTAR colours.** Components render as the registry ships them.
  The only override is colour, via tokens in `theme.css`. `className` on a shadcn component
  is layout only (flex/grid/gap/width/position).
- Before composing a component, load the **`shadcn`** skill and run
  `npx shadcn@latest docs <component>`; read the **React Aria** tab.
- API: `onPress` (wrappers also accept `onClick`), `isDisabled`, `isOpen` / `onOpenChange`,
  `selectedKey` / `onSelectionChange`, `isSelected`. No `asChild` — custom triggers go inside
  the aria `*Trigger`; links take `href`. `className` may be a string or a render-prop function.
- Aria buttons default to `type="button"`. Submit says `type="submit"`; outside its `<form>`
  add `form={formId}` (see `EntityFormModal`).
- Style aria state attributes: `data-selected:`, `data-open:`, `data-disabled:`,
  `in-aria-expanded:`, `w-(--trigger-width)`. Radix `data-[state=…]` matches nothing.
- The aria `table` is a grid: `TableHead`s sit directly under `TableHeader` (no `TableRow`),
  the first is `isRowHeader`, `Table` needs `aria-label` (`DataTable` takes a `label`), each
  row's cells add up to the column count, a clickable row uses `onAction`.
- The aria `calendar` uses `@internationalized/date` (`CalendarDate`): `parseDate(iso)` in,
  `value.toString()` out — convert at the hook edge, never in the service.
- Forms stay react-hook-form + zod: `FormField` renders RHF `Controller` + `Field` /
  `FieldLabel` / `FieldDescription` / `FieldError`, passing `id` and `aria-invalid`.

## The rule

**Never write a custom component when shadcn has one.** Before any UI:

1. Check the decision table below.
2. Not there → search the registry, never guess:
   `npx shadcn@latest search @shadcn -q "<keyword>"`
3. Read the real API: `npx shadcn@latest docs <component>` / `npx shadcn@latest view @shadcn/<component>`
4. Not installed → `npx shadcn@latest add -y <component>`, then the fixups below.
5. Registry has nothing → compose from shadcn primitives and name them in the summary.

## After every `shadcn add` — mandatory fixups

```bash
sed -i 's|from "cn"|from "@/utils/cn.utils"|g' src/components/ui/*.tsx
git diff src/styles/common/theme.css
sed -i '/^import \* as React from "react"\r\?$/d' src/components/ui/label.tsx
sed -i '/type DialogProps as AlertDialogPrimitiveProps,/d' src/components/ui/alert-dialog.tsx
```

- "already exists, overwrite?" → re-run with `--overwrite`, then the `sed` again.
- If `add` appends `:root` blocks to `theme.css`, rewrite the values to TARTAR colours; never
  keep shadcn's neutral defaults, never let it overwrite `theme.css` wholesale.
- If `package.json` gains a `"cn"` dependency, `yarn remove cn`.
- If files land in a literal `@/` folder at the root, root `tsconfig.json` lost its `paths`
  entry — restore it, move the files to `src/components/ui/`, delete the folder.
- A damaged file in `src/components/ui/` is regenerated with `add -y --overwrite`, never hand-repaired.
- `tw-animate-css` must stay imported in `theme.css`, or overlays never animate.

## Two layers — never collapse them

| Layer | Path | Rule |
|---|---|---|
| Generated | `src/components/ui/`, `src/hook/use-mobile.ts` | shadcn output. Never hand-edited. Exempt from the no-comments rule. |
| App primitives | `src/components/common/<kind>/` | The only importers of `@/components/ui/*`. Fix TARTAR variants, copy, behaviour. |
| Feature code | `src/components/<domain>/<kind>/`, `src/pages/` | Import **only** `components/common/`. |

## Decision table

| Need | Use | Never |
|---|---|---|
| Page shell, title, meta, actions, toolbar | `common/view/ContentView` | a per-page header block |
| Bento metrics layout | `common/view/BentoGrid` + `BentoCell` | raw grid CSS |
| Content panel | `card` via `common/card/SectionCard` | a styled bordered `<div>`; a card in a card |
| Metric tile | `card` via `common/card/StatCard` | a bespoke tile |
| Records table | `table` via `common/table/DataTable` in `TablePanel` | a custom grid or `<table>` |
| Paging | `pagination` via `common/table/TablePagination` | hand-built prev/next |
| Filter row | `common/filter/FilterToolbar` (+ `SearchInput`) | a card around filters |
| Row actions | `dropdown-menu` via `common/table/RowActionMenu` | a popover of buttons |
| Status / type chip | `badge` via `common/status/StatusTag` + enum label/colour maps | a styled `<span>` |
| Form modal | `dialog` via `common/form/EntityFormModal` on `common/modal/AppModal` | antd `Modal`, a custom overlay |
| Read-only record | `common/modal/DetailModal` | a bespoke dialog |
| Destructive / committing confirm | `alert-dialog` via the single `ConfirmationModal` + `useConfirm` | `Popconfirm`, `window.confirm`, a 2nd `ConfirmationModal` |
| Side panel / phone modal | `sheet` (bottom on phones) | a slide-in built on `dialog` |
| Sidebar, collapse, off-canvas | `sidebar` via `common/layout/ProtectedSider` | a hand-rolled nav |
| Text / number input | `input`; adornments `input-group` | a styled `<input>` |
| Long text | `textarea` | a styled `<textarea>` |
| Short list choice | `select` | a styled `<select>` |
| Long / searchable choice | `combobox` | a filtered custom list |
| Either-or / segmented | `toggle-group` | buttons with manual active state |
| On/off, form value / immediate | `checkbox` / `switch` | a styled checkbox |
| Date | `calendar` inside `popover` | a custom date picker |
| Button | `button` | a styled `<button>` / `<a>` |
| Tooltip / anchored panel / command list | `tooltip` / `popover` / `command` | `title` attr, absolute positioning |
| Tabs / breadcrumb / separator / progress | `tabs` / `breadcrumb` / `separator` / `progress` | manual equivalents |
| Charts | `chart` (recharts), series `--chart-1..6` | `@ant-design/charts`, hand SVG |
| Icons | `lucide-react` | `@ant-design/icons` |
| Loading (layout known) / inline | `skeleton` / `spinner` | a spinner replacing content |
| Empty / error / notice | `empty` / `alert` (`destructive`) / `alert` | styled placeholder divs |

**Toasts** — `sonner` (`components/ui/sonner.tsx`, theme from `theme.store`), `<Toaster>`
mounted once in `App.tsx`. `hook/common/mutation.hook.ts` toasts success and queued writes;
call `toast` directly only for feedback that is not a mutation.

## Styles live in `src/styles/`, never in JSX

A component file holds structure and behaviour only. Every class string is a named export
in `src/styles/<area>/<area>.styles.ts` (or `<area>/<name>.styles.ts` when an area splits),
combined with `cn()` from `src/utils/cn.utils.ts`. Areas mirror today's folders: `common`,
`card`, `chart`, `filter`, `form`, `layout`, `modal`, `stat`, `status`, `table`, `view`, plus
a domain folder for a style only one screen uses (`dashboard`, `ledger`, `disbursement`,
`print`). Never a `.css` or `.css.ts` file (the oxlint guard rejects both),
never colocated, never `style={{}}` except a computed value such as a percentage width.

```ts
export const cardRoot = "rounded-xl border bg-card shadow-card";
export const cardHeader = "flex items-start justify-between gap-3 p-4";
```

Anything that varies is `cva`, so variants are typed:

```ts
import { cva } from "class-variance-authority";

export const moneyValue = cva("font-medium tabular-nums", {
  variants: { tone: { positive: "text-positive", negative: "text-danger", neutral: "text-foreground" } },
  defaultVariants: { tone: "neutral" },
});
```

| Allowed | Not allowed |
|---|---|
| `className={cardRoot}` | `className="rounded-xl border bg-card"` |
| `className={cn(cardRoot, isActive && cardActive)}` | a template string of classes |
| `className={moneyValue({ tone })}` | a prop switching between inline strings |

## Tokens — never hardcode

All values come from `theme.css`; a hex, px or rgba literal in a component or styles module
is a defect — add a token instead.

- shadcn set: `bg-background`, `text-foreground`, `bg-card`, `bg-primary` (ink),
  `text-primary-foreground`, `bg-secondary` / `bg-muted` (cloud), `text-muted-foreground`,
  `bg-accent` (lime mist), `text-destructive`, `border-border`, `ring-ring` (lilac).
- TARTAR extras: `ink`, `ink-deep`, `ink-soft`, `ink-lift`, `on-ink`, `on-ink-muted`, `lime`,
  `lime-deep`, `lime-soft`, `lime-mist`, `lime-wash`, `lilac`, `lilac-soft`, `cloud`, `mist`,
  `border-subtle`, `positive`, `positive-bright`, `warning`, `danger`, `danger-bg`,
  `danger-border` — as `bg-*`, `text-*`, `border-*`.
- Radii `rounded-sm|md|lg|xl|shell|pill`; shadows `shadow-card|raised|pop`; fonts
  `font-sans`, `font-heading`. Sidebar: `--sidebar-*` (dark ink rail, lime active).
- Meaning: money keeps green/red (`positive` / `danger`); lime and lilac are decorative only;
  focus rings are always lilac (`ring`); primary is ink, never lime.
- A new token goes in `theme.css` (`@layer base :root` for shadcn slots, `@theme` for
  extras) and, for a shadow or radius, in `cn.utils.ts`'s `extendTailwindMerge` too.

## Layout, mobile, accessibility

- `md` (768px) is the divide: `useIsMobile()` when the component must change (`AppModal`:
  dialog at `md+`, bottom `sheet` below), Tailwind variants when only layout changes.
- Height `h-dvh`, never `100vh`. Icon-only buttons `size="icon"` with `aria-label` + `tooltip`.
- Every dialog / sheet / alert-dialog has a title (visually hidden if the design has none).
- Never gate by hiding with CSS — render conditionally (`RequirePermission`).
- The PWA never caches Supabase data in the service worker; offline writes go through `runWrite`.

## Checklist before reporting a UI change

- Every element came from the table or a registry search.
- Nothing outside `src/components/common/` imports `@/components/ui/*`.
- No class strings in component files; no hex / px / rgba literals; no retired import.
- Loading, empty, error and success states render.
- `yarn build` + `yarn lint` clean — and reported as **compiled**, not confirmed visually.
