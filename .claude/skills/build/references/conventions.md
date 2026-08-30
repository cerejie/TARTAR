# Codebase conventions

Authoritative for how this repo is written. `CLAUDE.md` outranks this file; where the two
disagree, `CLAUDE.md` wins and this file is the bug.

**The pattern to copy is Transactions.** `transaction.list.hook.ts`, `TransactionsTable.tsx`
and `TransactionsView.tsx` are the current, complete expression of every rule below —
server paging, declarative form, confirm store, permission-gated columns. Read them before
writing a new module.

**The structural reference is DCWD**, at `D:/EJIE BUSINESS/EJIE WORK DCWD/dcwd_apps-csms-bca2`,
specifically `src/components/jms/`, `src/hook/data/jms/` and `src/models/data/jms/`. Copy its
*folder and file organisation*. Do **not** copy its code style: DCWD carries comments, calls
antd `notification` directly, and hand-rolls forms. TARTAR diverges from all three on purpose
(see §10).

## 1. Folder law

```
src/
  components/   common/<kind>/*.tsx   +  <domain>/<kind>/*.tsx
  enums/        <domain>.enum.ts                (flat)
  hook/         common/*.hook.ts  |  data/<domain>/*.hook.ts  |  app|view|layout|account/*.hook.ts
  keys/         query.keys.ts | modal.keys.ts | storage.keys.ts | table.keys.ts   (flat)
  layouts/      <Name>Layout.tsx
  models/       common/*.model.ts  |  data/<domain>/<domain>.request.ts + .response.ts
  pages/        <Domain>/<Domain>View.tsx
  routes/       <scope>.routes.ts | <scope>.view.routes.ts | route.guard.ts
  services/     data/<domain>.services.ts       (flat inside data/)
  store/        common/*.store.ts  |  data/<domain>/<domain>.store.ts
  styles/       <group>/<name>.css.ts
  utils/        <topic>.utils.ts                (flat)
```

**The rule that generates it:** shared / cross-domain code is **flat** inside a `common/` folder (or a flat top-level folder); domain code lives under `data/<domain>/`. `services/` is the one exception — `data/` holds flat files, one per domain.

`components/` is grouped by **kind**, twice over. Shared primitives sit in
`common/<kind>/` — `card`, `filter`, `form`, `guard`, `layout`, `modal`, `status`, `table`,
`view`. Feature components sit in `<domain>/<kind>/` — `tables/`, `forms/`, `modal/`,
`cards/`, `menus/`, `views/`. `components/transaction/tables/TransactionsTable.tsx` is the
shape; DCWD's `components/jms/` is the same idea at full size. A feature component never
sits loose at the root of its domain folder.

Adding a domain never adds a top-level folder. It adds one subfolder in `hook/data`, `models/data`, and `store/data` (only if it needs client state), plus one file in `services/data`, one in `enums` (only if it has a status), and one `pages/<Domain>/` folder.

## 2. File naming

| Kind | Pattern | Example |
|---|---|---|
| Component / page / layout | `PascalCase.tsx`, **default export** | `DataTable.tsx`, `BranchesView.tsx`, `ProtectedLayout.tsx` |
| Everything else | `<domain>.<purpose>.<kind>.ts`, lowercase, dot-separated | `customer.list.hook.ts`, `expense.category.manage.hook.ts` |
| Multi-word domain, in a filename | dots — never dashes, never camelCase | `expense.category.request.ts`, `farm.section.list.hook.ts` |
| Multi-word domain, as a folder | kebab-case | `hook/data/expense-category/` |
| Page | `PascalCase` folder, component suffixed `View` | `pages/MasterData/MasterDataView.tsx` |
| Feature component | `components/<domain>/<kind>/PascalCase.tsx` | `components/transaction/tables/TransactionsTable.tsx` |
| Reusable cell renderer | `components/<domain>/table/cells/PascalCase.tsx` | only once a second table reuses it |

`<kind>` is one of: `hook`, `services`, `store`, `keys`, `enum`, `utils`, `model`, `request`, `response`, `routes`, `css.ts`.

A hook filename also carries its **purpose** before `.hook`: `list`, `manage`, `form`,
`detail` or `scope` — `transaction.list.hook.ts`, `branch.scope.hook.ts`,
`customer.detail.hook.ts`. A domain-wide hook that is none of these drops the purpose
(`report.hook.ts`, `dashboard.hook.ts`). Never camelCase inside a filename, even though
some DCWD files do (`jmsTickets.request.ts`) — dots and lowercase here.

## 3. Naming inside files

- **Interfaces take an `I` prefix** — `IParty`, `IQueryEntry`, `IRoute`, `IFieldConfig`.
- **Component props are always `type IProps<T> = { ... }`** — declared locally, never exported.
- **Zod-inferred input types are `I<Domain>Input`** — `IPartyInput`, `IBranchInput`.
- **Union / literal types take no prefix** — `LedgerStatus`, `PaymentKind`, `PartyInfoState`.
- **Hooks in `hook/common/` are plain `useX`** — `useQuery`, `useMutation`, `useModal`.
- **Every other hook is `use<Domain><Purpose>Hook`** — `useCustomerListHook`, `useSupplierManageHook`, `useAppHook`.
- **Services export a `<domain>Services` object** — `customerServices.getList()`.
- **Stores are `use<Domain>Store`**; their selectors are `select<Thing>`.
- **Keys are `<thing>ListKey`, `<thing>CreateModalKey`, `<thing>StorageKey`.**
- Local names spell the noun out: `customer`, not `c`; `branch`, not `b`.

## 4. Globalization — one source of truth

Any value used in **two or more places** moves to its home. Never inline these:

| Value | Home |
|---|---|
| Query cache key | `keys/query.keys.ts` |
| Modal key | `keys/modal.keys.ts` — a function when the modal is per-scope |
| localStorage key | `keys/storage.keys.ts` |
| A status/kind literal, its label, and its colour | `enums/<domain>.enum.ts` |
| Colour, spacing, radius, shadow, font | `styles/common/vars.css.ts`, read as `vars.color.*` |
| Money / date / time formatting | `utils/format.utils.ts` — `formatMoney`, `formatDate`, `todayIso` |
| A reusable zod field | `utils/schema.utils.ts` — `amountField`, `isoDateField`, `optionalText(n)` |
| Any string the user sees in two places | the enum label map, or a module-top `const` |

A hardcoded hex colour, a `"16px"`, a `toFixed(2)`, a bare `dayjs().format(...)`, or a raw `"customers"` cache key sitting in a component is a defect, not a style preference.

## 5. Layer contract

```
pages/  ->  hook/data  ->  services/data  ->  utils/<datasource>
                 \->  keys, models, enums, store/common
components/  ->  models, styles, utils        (never services, never data stores)
utils/  ->  nothing app-specific (pure, no React)
```

Enforced:

- A **View imports no service and no data store.** It destructures exactly one `*.manage.hook` (plus a read-only list hook when that is genuinely all it needs) and renders.
- A **hook imports no component.**
- A **service imports no hook and no React.**
- A **util is pure** — no React, no store, no side effects beyond its stated job.
- Cycles are forbidden. When two modules need each other, the shared part belongs one layer down.

## 6. Standard shapes

**Store** — `store/**/*.store.ts`

```ts
type States = { ... };
type Actions = { ... };
const initialValues: States = { ... };

export const useXStore = create<States & Actions>()((set) => ({
  ...initialValues,
  setThing: (thing) => set({ thing }),
}));

export const selectThing = (key: string) => (state: States) =>
  state.things[key] ?? emptyThing;
```

Selectors are exported separately so a component subscribes to one slice instead of the whole store.

**Request model** — `models/data/<d>/<d>.request.ts`. A zod schema plus its inferred type. Nothing else.

```ts
export const xSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(160),
});
export type IXInput = z.infer<typeof xSchema>;
```

Validation messages are written for the end user: sentence case, no trailing period.

**Response model** — `models/data/<d>/<d>.response.ts`. Row interfaces mirroring the database (keep `snake_case` column names, nullable columns typed `string | null`), plus pure derive helpers such as `partyInfoState(party)`.

**Enum** — `enums/<d>.enum.ts`

```ts
export const xStatusValues = ["open", "paid"] as const;
export const xStatusSchema = z.enum(xStatusValues);
export type XStatus = z.infer<typeof xStatusSchema>;
export const xStatusLabels: Record<XStatus, string> = { ... };
export const xStatusColors: Record<XStatus, string> = { ... };
```

**Service** — `services/data/<d>.services.ts`. One exported object with `getList` / `create` / `update` / `remove`; a module-level `const columns = "id, name, ..."`; a `toValues()` mapper when the stored payload differs from the form shape. When two tables share a shape, write a `make<X>Services(table)` factory instead of copying the object.

A paged `getList` takes `(filters, pagination: IPaginationRequest)` and returns
`IPaginationResponse<T>` built from `pageRange(pagination)` plus `{ count: "exact" }`:

```ts
const base = supabase.from(table).select(columns, { count: "exact" });
const query = applyLedgerFilters(base, filters, transactionColumns);
const { from, to } = pageRange(pagination);
const { data, error, count } = await query.order("txn_date", { ascending: false }).range(from, to);
if (error) throw toError(error);
return { data: data ?? [], currentPage: pagination.pageNumber, pageSize: pagination.pageSize, totalCount: count ?? 0 };
```

Writes go through `runWrite` from `store/common/sync.store.ts` so the offline queue survives.
A mutation that bypasses it breaks PWA offline mode.

**Data hooks** — split by responsibility:

- `<d>.list.hook.ts` — the feature component's single dependency. It owns the filters, the
  paged query, the derived options, the lookup maps the columns read, the modal handle, the
  field descriptors, the defaults and the mutations. It returns **one flat object** of
  primitives and handlers, never a nested bag. `transaction.list.hook.ts` is the model.
- `<d>.manage.hook.ts` — same role for a domain whose screen is a panel rather than a table
  (`supplier.manage.hook.ts`, `user.manage.hook.ts`).
- `<d>.scope.hook.ts` / `<d>.detail.hook.ts` — branch scope, single-record reads.

A lookup list (branches, customers, suppliers, users, expense categories) stays **unpaged**:
its hook feeds selectors and name-resolution maps, and paging it would break them. A
transactional list is **server-paged** — the hook calls `usePagination(<key from
keys/table.keys.ts>)`, threads `pagination` into both the query key and the service call,
and returns `pagination`, `totalCount` and `goToPage`. A list a report or export consumes
gets a separate unpaged `getAll` on the service; `getList` stays paged.

Values are normalised in the hook before the mutation — a module-level `normalize(values)`
that nulls out the fields the chosen type does not use — so the service receives a clean
payload.

**Feature component** — `components/<domain>/<kind>/<X>Table.tsx`. This is where a screen is
actually built. It calls exactly one feature hook, declares the `ColumnsType<T>`, and
composes the shared primitives. Permission-varying columns are spread in conditionally
(`...(permissions.isManager ? [col] : [])`), never hidden with CSS. Destructive row actions
call `useConfirm`. `TransactionsTable.tsx` is the model.

**View** — `pages/<D>/<D>View.tsx`. Thin to the point of boring: one `ContentView` wrapping
the feature components, and nothing else. No queries, no columns, no handlers, no state.

```tsx
const TransactionsView = () => {
  return (
    <ContentView>
      <TransactionsTable />
    </ContentView>
  );
};
```

If a page has grown a column definition or a mutation, the work belongs in a feature
component and its hook.

## 7. TypeScript

`strict`, `noUnusedLocals`, `noUnusedParameters` and `verbatimModuleSyntax` are all on.

- `import type { X } from "..."` for every type-only import. `verbatimModuleSyntax` turns a miss into a build error.
- Relative imports only — **no path aliases are configured**, so `../../../models/...` is correct here.
- `as const` for literal tuples and lookup tables; `readonly` where a value must not be mutated.
- **`useState` and `useReducer` are banned.** Not "avoided" — banned. Every piece of state
  lives in a zustand store under `store/common/` or `store/data/<domain>/`, reached through a
  `select*` selector and a hook in `hook/common/`. A component holds no state of its own.
  Server data is query state, not component state.
- Derive instead of storing: `const total = rows.reduce(...)`, never state that mirrors props.
- `??` for defaults, not `||`, so `0` and `""` survive.

## 8. Style layer

- vanilla-extract only. One `*.css.ts` per visual group under `styles/`. Dotted base names
  (`content.view.css.ts`) are fine only because `vite.config.ts` sets
  `identifiers: 'short'` — see the dotted-filename trap in `stack.md` before changing that.
- Every value comes from `vars`: `vars.color.brand`, `vars.space.md`, `vars.radius.xl`, `vars.shadow.card`, `vars.font.heading`.
- Component-library internals are reached through a scoped `globalStyle` that starts from your own class, never by styling a library class globally on its own.
- Classes are applied through a template string on `className`, matching the existing components.
- No inline `style={{}}` except for a genuinely computed value such as a percentage width.

## 9. UX defaults

- Every page renders exactly one **`ContentView`** — it owns the title, subtitle, meta,
  actions, optional toolbar, body layout (`stack` | `bento`) and footer. There is no
  `PageHeader` component; it was deleted.
- Tables go through `DataTable<T>`, content panels through `SectionCard`, metric tiles
  through `StatCard`, entity forms through `EntityFormModal` driven by an `IFieldConfig[]`.
- Bento layouts use `BentoGrid` + `BentoCell` with named spans, never raw grid CSS.
- **Never nest a card in a card.** The content shell is already a surface; one card layer on
  top of it is the maximum. The table sits directly on the content surface — its rows are
  the cards.
- Filters are a bar inside a `SectionCard dense`, above the table, wrapped in
  `FilterToolbar` when the screen also has a primary action. Filter state lives in
  `store/common/filter.store.ts` via `useLedgerFilters(scope)` — never in the component.
- **Every destructive or committing action goes through `useConfirm`.** Never `Popconfirm`,
  never `Modal.confirm`. `ConfirmationModal` is mounted once in `App.tsx` and driven by
  `store/common/confirm.store.ts`; never mount a second one, never pass it props.

  ```ts
  openConfirm({ kind: "delete", title: "Delete transaction?", message: "...", onConfirm: () => removeMutation.mutate(row.id) });
  ```

  `kind` is `"confirm"` or `"delete"`. The store holds the dialog open with a spinner until
  an async `onConfirm` settles.
- Permission gating in a screen is `RequirePermission can="..."`; route gating is `can` plus
  `permissionLoader`. Never gate by hiding with CSS.
- Icon-only buttons carry both `aria-label` and a `Tooltip`.
- Tables set `emptyText` to a sentence that tells the user what to do next.
- Money columns are right-aligned and rendered with `formatMoney`.
- Modal width comes from `ModalSize`, never a hardcoded percentage.

## 10. Where TARTAR deliberately diverges from DCWD

Copy DCWD's structure, not these four habits:

| DCWD | TARTAR |
|---|---|
| Comments throughout | **Zero comments.** No `//`, no JSDoc, no banners, no commented-out code. If a line needs explaining, rename or extract until it does not. The only exception is `/// <reference />` in `src/vite-env.d.ts`. |
| antd `Form` and bespoke inputs | react-hook-form + zod, rendered declaratively by `EntityFormModal` from an `IFieldConfig[]`. A new field *type* is added to `FormField`, never as a bespoke input in a page. |
| antd `notification` imported directly | `App.useApp()` so feedback inherits theme and context. |
| `useState` for local UI state | zustand only. |

DCWD already uses TanStack Query directly; TARTAR is mid-migration behind
`hook/common/query.hook.ts` and `mutation.hook.ts`. Follow the existing TARTAR wrappers, and
preserve the offline-queue behaviour in `mutation.hook.ts` if you convert one.
