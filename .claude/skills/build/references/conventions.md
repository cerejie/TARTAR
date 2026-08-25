# Codebase conventions

Authoritative. When new code disagrees with this file, the new code is wrong.

## 1. Folder law

```
src/
  components/   common/<group>/*.tsx   +  <domain>/*.tsx
  enums/        <domain>.enum.ts                (flat)
  hook/         common/*.hook.ts  |  data/<domain>/*.hook.ts  |  app|view|layout|account/*.hook.ts
  keys/         query.keys.ts | modal.keys.ts | storage.keys.ts   (flat)
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

Adding a domain never adds a top-level folder. It adds one subfolder in `hook/data`, `models/data`, and `store/data` (only if it needs client state), plus one file in `services/data`, one in `enums` (only if it has a status), and one `pages/<Domain>/` folder.

## 2. File naming

| Kind | Pattern | Example |
|---|---|---|
| Component / page / layout | `PascalCase.tsx`, **default export** | `DataTable.tsx`, `BranchesView.tsx`, `ProtectedLayout.tsx` |
| Everything else | `<domain>.<purpose>.<kind>.ts`, lowercase, dot-separated | `customer.list.hook.ts`, `expense.category.manage.hook.ts` |
| Multi-word domain, in a filename | dots — never dashes, never camelCase | `expense.category.request.ts`, `farm.section.list.hook.ts` |
| Multi-word domain, as a folder | kebab-case | `hook/data/expense-category/` |
| Page | `PascalCase` folder, component suffixed `View` | `pages/MasterData/MasterDataView.tsx` |

`<kind>` is one of: `hook`, `services`, `store`, `keys`, `enum`, `utils`, `model`, `request`, `response`, `routes`, `css.ts`.

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

**Data hooks** — split by responsibility:

- `<d>.list.hook.ts` — read only. Wraps `useQuery`, returns `{ ...query, items, itemOptions }`.
- `<d>.manage.hook.ts` — the View's single dependency. Composes the list hook, the modals, the mutations and the form defaults, and returns them as one flat object. Also exports `<d>FormFields` when the View renders a generic form modal.

**View** — `pages/<D>/<D>View.tsx`. One hook call, the column definitions, the JSX. No fetching, no business arithmetic, and no `useState` for anything the hook could own.

## 7. TypeScript

`strict`, `noUnusedLocals`, `noUnusedParameters` and `verbatimModuleSyntax` are all on.

- `import type { X } from "..."` for every type-only import. `verbatimModuleSyntax` turns a miss into a build error.
- Relative imports only — **no path aliases are configured**, so `../../../models/...` is correct here.
- `as const` for literal tuples and lookup tables; `readonly` where a value must not be mutated.
- Derive instead of storing: `const total = rows.reduce(...)`, never a `useState` that mirrors props.
- `??` for defaults, not `||`, so `0` and `""` survive.

## 8. Style layer

- vanilla-extract only. One `*.css.ts` per visual group under `styles/`.
- Every value comes from `vars`: `vars.color.brand`, `vars.space.md`, `vars.radius.xl`, `vars.shadow.card`, `vars.font.heading`.
- Component-library internals are reached through a scoped `globalStyle` that starts from your own class, never by styling a library class globally on its own.
- Classes are applied through a template string on `className`, matching the existing components.
- No inline `style={{}}` except for a genuinely computed value such as a percentage width.

## 9. UX defaults

- Tables go through `DataTable`, cards through `SectionCard`, entity forms through `EntityFormModal` driven by an `IFieldConfig[]`, and every page opens with `PageHeader`.
- Destructive actions sit inside a `Popconfirm` whose description says what survives the action.
- Icon-only buttons carry both `aria-label` and a `Tooltip`.
- Tables set `emptyText` to a sentence that tells the user what to do next.
- Money columns are right-aligned and rendered with `formatMoney`.
