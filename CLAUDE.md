# CLAUDE.md

Guidance for Claude Code when working in this repo. This file overrides the global
`~/.claude/CLAUDE.md` wherever the two disagree.

The reference implementation for every convention below is the DCWD project at
`D:\EJIE BUSINESS\EJIE WORK DCWD\dcwd_apps-csms-bca2` — specifically its JMS Tickets
and JMS Form modules. When a convention here is ambiguous, read the DCWD equivalent
and follow it. TARTAR is the same architecture over a different backend.

## Project

`tartar-system` — TARTAR BMS, a branch-scoped bookkeeping web client (transactions,
vouchers, receivables/payables, disbursements, reports). React 19 + TS + Vite,
Ant Design v6, vanilla-extract, Zustand, TanStack Query, Supabase, PWA/offline.
Full dependency list: package.json.

## Commands — yarn only (repo has yarn.lock; never npm)

```bash
yarn dev                # Vite dev server
yarn build              # tsc -b && vite build — must stay clean, this is the gate
yarn lint               # oxlint
```

Gate every change on `yarn build` and `yarn lint` both clean. This repo has no
pre-existing type errors and must not acquire any.

## Every session — `.claude/` first

`.claude/` is this repo's operating manual, and it applies to every prompt, not only the ones
that write code. Answering a question, locating a file and planning a change all run through
it, in this order — stop at the first file that answers:

1. `.claude/skills/build/references/pathfind.md` — turn the question into a path. Derive the
   path from the map; never scan the tree. Locating by exploration is the most expensive
   mistake available here.
2. `.claude/skills/build/references/lean.md` — token discipline. Ranges not whole files,
   greps scoped to a directory with `--include`, no file read twice, one verification command,
   replies under ten lines.
3. `.claude/skills/build/references/reference-module.md` — the Transactions module, the design
   reference for the whole app.
4. `.claude/skills/build/references/conventions.md` — folder law, file naming, naming inside
   files, the layer contract, the standard code shapes.
5. `.claude/skills/build/references/architecture.md` — which layer owns a piece of logic, when
   the layer contract does not settle it.

Never read more than two of them for one task, and never re-read one already read this session.

## Transactions is the reference module

Every screen copies Transactions — `pages/Transactions/TransactionsView.tsx`,
`components/transaction/tables/TransactionsTable.tsx`,
`components/transaction/cards/TransactionSummaryCards.tsx`,
`hook/data/transaction/transaction.list.hook.ts`. Its composition is the house design:
a `ContentView` page; `TablePanel` with a `FilterToolbar` toolbar and a `TablePagination`
footer around a `DataTable`; `EntityFormModal` for every form; `RowActionMenu` plus
`useConfirm` for row actions; `StatCard` in a `BentoGrid` for metrics; enum label and colour
maps for tags; `formatMoney` and `formatDate` for values.

Read the Transaction counterpart before writing a new component, modal, table, card or hook,
and mirror it. Where an existing screen disagrees with Transactions, Transactions wins:
convert the screen you were asked to touch, and leave the rest alone unless asked. Detail:
`.claude/skills/build/references/reference-module.md`.

## Before writing code — always

Any prompt that asks for implementation work in this repo runs the `build` skill's
pipeline, whether or not the user typed `/build`. A design revision, a spacing tweak or a
one-line style change counts: those are exactly the changes that look too small to warrant
it. Load `.claude/skills/build/references/` as the step calls for it — `conventions.md`
for folder and naming law, `stack.md` before touching antd or vanilla-extract,
`verification.md` before claiming a change is done.

Never report a visual change as working on the strength of `yarn build` alone. A build
proves the CSS compiled; it cannot prove the selector matches an element. Say it is
compiled and let the user confirm it renders.

## Structure (src/)

Layering is strict and one-directional:

```
service  ->  hook  ->  component  ->  page  ->  route
```

- `services/data/<feature>.services.ts` — the only place Supabase is touched. One
  default-exported object literal per feature. No React, no state, no antd.
- `hook/data/<domain>/<feature>.<kind>.hook.ts` — all data and behaviour. Components
  never call a service directly.
- `hook/common/` — cross-cutting hooks (modal, filter, query, search, pagination).
- `hook/account/`, `hook/app/`, `hook/layout/`, `hook/view/` — infra hooks.
- `models/common/` — flat, shared type contracts. `models/data/<domain>/` — one
  subfolder per domain, split `<feature>.request.ts` / `<feature>.response.ts`.
- `store/common/` — flat registries (modal, filter, query, network, sync, theme, view).
  `store/data/<domain>/<feature>.store.ts` — per-domain UI state.
- `components/common/<kind>/` — reusable primitives, grouped by kind (card, filter,
  form, guard, layout, modal, status, table, view).
- `components/<domain>/` — feature components, grouped by domain then by kind
  subfolder (`forms/`, `tables/`, `modal/`, `menus/`, `cards/`, `views/`).
- `pages/<Area>/<Name>View.tsx` — thin. A page composes `ContentView` and feature
  components and nothing else. No queries, no columns, no handlers in a page.
- `routes/` — route trees as plain data. `layouts/`, `keys/`, `enums/`, `utils/`,
  `styles/` as named.
- `supabase/migrations/` — SQL migrations, timestamp-prefixed.

Rules: no path aliases anywhere — deep relative imports only. No barrel `index.ts`
files. `common` folders stay flat; `data` folders get one subfolder per domain.

## Code style — this is the priority

Write code that reads as a plain statement of what it does.

- **No comments. None.** No `//`, no block comments, no JSDoc, no section banners,
  no `TODO`, no commented-out code. If a line needs explaining, rename the variable,
  extract a named function, or restructure until it does not. This is not negotiable
  and applies to `.ts`, `.tsx` and `.css.ts` alike. The only exception is the
  `/// <reference ... />` directives in `src/vite-env.d.ts` — those are compiler
  input, not prose, and deleting them breaks the build.
- No dead code. Delete rather than comment out. Delete unused props, exports, styles.
- Name things for what they are: `customerTypes`, `encodableTypes`, `effectiveFilters`,
  `handleRowDoubleClick`. Never `data2`, `tmp`, `handleThing`.
- Small units. A component that renders three unrelated blocks becomes three
  components. A hook past ~150 lines is doing two jobs.
- One default export per file, at the bottom, matching the filename.
- Import order: external packages, then internal modules, then types. Sort within
  each group by path. `import type` for every type-only import.
- Early return over nested `if`. Ternaries only when both arms are short.
- No `any`. Use `unknown` and narrow. No non-null assertions except where the value
  is provably present one line above. `readonly` on arrays that are never mutated.
- No inline `style={{ }}` objects. No magic numbers in JSX.
- Derive, do not duplicate: no state that can be computed from other state.
- **No `useState`, no `useReducer`.** Every piece of state lives in a zustand store
  under `store/common/` or `store/data/<domain>/`, read through a `select*` selector
  and a hook in `hook/common/`. A component holds no state of its own.

## Naming conventions

- Feature hooks: `<feature>.<kind>.hook.ts`, kind is `list` | `form` | `detail` |
  `manage` | `scope`. Exported as `use<Feature><Kind>Hook`.
- Cross-cutting hooks drop the kind: `modal.hook.ts` exports `useModal`.
- Services: `<feature>.services.ts`, default export `<feature>Services`.
- Stores: `<feature>.store.ts`, exporting `use<Feature>Store` plus `select*` selectors.
- Models: `<feature>.request.ts` (inputs, `I<Feature>Input`) and
  `<feature>.response.ts` (rows, `I<Feature>`).
- Components: `PascalCase.tsx`. Styles: `<area>.css.ts` under `src/styles/<area>/`.
- Keys are never inline string literals — they live in `keys/query.keys.ts`,
  `keys/modal.keys.ts`, `keys/storage.keys.ts`.
- Types: `I` prefix for interfaces and shared type aliases (`IRoute`, `ITransaction`,
  `IModalRequest`). Component prop types are always `type IProps = { ... }`, local to
  the file, never exported.

## Type contracts (models/common)

These are the reusable shapes. Extend them; do not fork them.

- `IResponse<T>` / `IError` — service result envelopes.
- `IPaginationRequest` / `IPaginationResponse<T>` — every paged list uses these.
- `IModalRequest<T>` (`{ visible: boolean; data?: T }`) and the `IModalFormValue<T>`
  class that supplies defaults through `Object.assign`.
- `IFieldConfig<TValues>` — declarative form field descriptors.
- `IRoute` — `RouteObject` plus `key`, `label`, `description`, `icon`, `group`,
  `can`, `isNotNav`, `children`.
- `ViewLayout`, `BentoSpan`, `CardTone`, `ModalSize` — the view vocabulary.

A form-value class (`IXFormValue implements IXRequest`) is the pattern for defaults:
fields initialised inline, `constructor(values?)` doing `Object.assign(this, values)`.

## Hooks

A page or component gets everything it renders from exactly one feature hook.

**List hook** (`<feature>.list.hook.ts`) owns: filters, the query, derived options,
column-feeding lookups, the modal handles, and the mutations. It returns a flat
object of primitives and handlers — never a nested bag.

**Form hook** (`<feature>.form.hook.ts`) owns: the modal state, the schema, the
default values, the create/update mutation, the delete mutation, and the submit and
confirm handlers.

Server state is TanStack Query. `useQuery` keyed off `keys/query.keys.ts` composed
through `scopedKey(...)`; `useMutation` with `queryClient.invalidateQueries` on
success. Never fetch in a component, never fetch in `useEffect`.

Zustand is the only state mechanism — `useState` and `useReducer` are banned. Stores
hold UI state only: open modals, pending confirmations, active filters, branch scope,
theme, sync queue. Never cache server rows in a store.

## Modals

One registry, generic over the record it carries:

```ts
const { modal, setModal } = useModal<ITransaction>(transactionFormModalKey);
```

`modal.visible` drives `open`; `modal.data` carries the whole record, not an id, so a
modal can be opened detached from the list that owns it. `useModal` is selector-scoped
per key — opening one modal must never re-render consumers of another.

Reusable modal components live in `components/common/modal/`:

- `AppModal` — the shell every modal is built on. Owns size, title block, footer.
- `DetailModal<T>` — read-only record view driven by a section/row descriptor.
- `ConfirmationModal` — mounted **once** in `App.tsx` and driven entirely by
  `store/common/confirm.store.ts`. Never mount a second one, never pass it props.

A feature modal composes these; it never reaches for antd `Modal` directly. Modal
width comes from `ModalSize`, never a hardcoded percentage.

Every destructive or committing action goes through the confirmation store — never
`Popconfirm`, never a bare `Modal.confirm`. A component asks for one with `useConfirm`:

```ts
const openConfirm = useConfirm();

openConfirm({
  kind: "delete",
  title: `Delete ${user.username}?`,
  onConfirm: () => removeMutation.mutate(user.id),
});
```

`kind` is `"confirm"` (lime badge, primary button) or `"delete"` (danger badge, danger
button). `title`, `message`, `okText` and `cancelText` all have sensible defaults. The
store keeps the dialog open with a spinner until an async `onConfirm` settles.

## Forms

Forms are react-hook-form + zod, driven declaratively — not antd `Form`. This is the
one deliberate divergence from DCWD, and it is intentional.

- The schema (zod) lives in `models/data/<domain>/<feature>.request.ts`.
- The field list is an `IFieldConfig<TValues>[]` built in the feature hook, with
  `hidden: (values) => boolean` for conditional fields.
- `EntityFormModal<TValues>` renders it. `FormField` is the only place a field type
  maps to an antd control — add a new `type` there, never a bespoke input in a page.
- Values are normalised in the hook before the mutation (see `normalize` in
  `transaction.list.hook.ts`), so the service receives a clean payload.

## Views, tables, filters

- Every page renders exactly one `ContentView` — it owns the title, subtitle, meta,
  actions, optional toolbar, body layout (`stack` | `bento`) and footer.
- Bento layouts use `BentoGrid` + `BentoCell` with named spans, never raw grid CSS.
- `SectionCard` is the content panel; `StatCard` the metric tile. A card with no
  title renders no head — use that for chrome-only panels.
- Never nest a card in a card. The content shell is already a surface; one card layer
  on top of it is the maximum.
- Filters are a bare row sitting directly on the content surface above the table, laid out
  by `FilterToolbar` with the primary action on the trailing edge — no card. Branch is not a
  filter field; the sider branch scope is the only branch control. Filter state lives in
  `store/common/filter.store.ts` via `useLedgerFilters(scope)` — never in component state.
- Tables are `DataTable<T>` only. Columns are declared in the feature component; cell
  renderers are extracted to `components/<domain>/table/cells/` when reused.
- Transactional tables are **server-paged**: the feature hook calls
  `usePagination(<key from keys/table.keys.ts>)`, threads `pagination` into both the
  query key and the service call, and hands `pagination`, `totalCount` and `goToPage`
  to `DataTable`. The service returns `IPaginationResponse<T>` built from a Supabase
  `.range()` plus `{ count: "exact" }`.
- Lookup lists stay unpaged: branches, expense categories, customers, suppliers and
  users feed selectors and name-resolution maps, so paging them would break lookups.
  A list that a report or export consumes gets a separate unpaged `getAll` on the
  service — `getList` stays paged, `getAll` is the one reports call.
- The table sits directly on the content surface — its rows are the cards.

## Styling

- All styling is vanilla-extract `*.css.ts`, centralized under `src/styles/<area>/`,
  never colocated with the component, never a `.css` file, never inline styles, never
  Tailwind or styled-components.
- `vite.config.ts` sets `vanillaExtractPlugin({ identifiers: 'short' })`. That option is
  load-bearing, not cosmetic: without it, dev class names are prefixed with the source
  filename and the dot in `protected.layout.css.ts` produces a selector that matches no
  element, silently killing every rule in the file while every build still passes. Do not
  remove it. Detail: `.claude/skills/build/references/stack.md`.
- All colours, spacing, radii, shadows and fonts come from the token contract in
  `src/styles/common/vars.css.ts` (`vars.color.*`, `vars.space.*`, `vars.radius.*`,
  `vars.shadow.*`, `vars.font.*`). Hardcoding any of them is a defect. The `palette`
  export is the only place a hex literal may appear.
- Semantic tones live in `styles/common/tone.css.ts`; money keeps green/red meaning,
  lime and lilac are decorative only, focus rings are always `accentAlt`.
- antd is restyled through `globalStyle` against its class names, scoped under a local
  class. Never patch an antd class globally without a scoping class.
- Before writing a custom element, check how the nearest existing screen composes antd
  and copy that composition. Never hand-roll a table, form, modal, drawer, date picker,
  select or notification antd already provides.
- The antd theme object lives in `store/common/theme.store.ts`. `colorPrimary` is ink,
  never lime.

## Routes

Route trees are plain data typed as `IRoute[]`, split per layout:
`protected.routes.ts` (the layout wrapper) then `protected.view.routes.ts` (the
entries), with the same pair for public. The sider menu, breadcrumbs and permission
guards are all derived from that same data — `label`, `description`, `icon`, `group`
and `can` are what the chrome reads. Adding a page means adding one entry, never
touching the menu.

Permission gating is `can` plus `permissionLoader` in `route.guard.ts`; in-page gating
is `RequirePermission`.

## Supabase

- Never run or generate a migration automatically — propose it and wait for explicit
  approval. Never drop or rename a column. Preserve production data.
- All access goes through `utils/supabase.utils.ts` (`supabase`, `toError`) and a
  service object. Never import the client into a hook or component.
- Writes route through `runWrite` (`store/common/sync.store.ts`) so the offline queue
  stays intact. A mutation that bypasses it breaks PWA offline mode.
- Consider RLS, indexes, foreign keys and constraints on every schema change.

## Do not

- Do not add comments. See Code style.
- Do not add path aliases, barrel files, or colocated `*.css.ts`.
- Do not call a service from a component, or Supabase from a hook.
- Do not hardcode a colour, spacing value, query key or modal key.
- Do not use `useState` or `useReducer` — state belongs in a zustand store.
- Do not use `Popconfirm` or `Modal.confirm` — use `useConfirm`.
- Do not introduce a new dependency without saying why the existing stack cannot do it.
- Do not leave `yarn build` or `yarn lint` failing.

## Migration in progress

The repo does not yet fully match this document. When you touch one of these, convert
it; do not convert them wholesale unprompted.

- **TanStack Query** is the target for server state. Currently `hook/common/query.hook.ts`
  and `mutation.hook.ts` are a hand-rolled equivalent over `store/common/query.store.ts`.
  The offline-queue behaviour in `mutation.hook.ts` must survive the switch.
- **Pagination** infrastructure is in place and proven on Transactions:
  `models/common/pagination.model.ts`, `store/common/pagination.store.ts`,
  `hook/common/pagination.hook.ts`, `keys/table.keys.ts`, and `DataTable`'s
  `pagination` / `totalCount` / `onPageChange` props. Still to convert, each the same
  shape as `transaction.services.getList` + `transaction.list.hook.ts`:
  `ledger.services.getList` (receivables and payables — also needs the `getAll` split
  for `report.hook.ts`), `voucher.services.getList`,
  `transaction.services.getDisbursementList` (purchases and expenses), and
  `payment.services.getList`. `DataTable` keeps its client-side pager for any table
  that passes no `pagination` prop, so unconverted tables keep working.
- **Comments** are fully stripped as of this document. Keep it that way.
