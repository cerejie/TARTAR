# Stack rules

**Detect before applying.** Read `package.json` once. Apply only the sections whose library is actually a dependency of the current project. If a section's library is absent, that section does not exist — follow `conventions.md` and the project's own existing code instead, and never introduce one of these libraries just because this file mentions it.

Reference stack: React 19, react-router-dom 7, Tailwind v4 (`@tailwindcss/vite`), shadcn/ui `aria-vega` over `react-aria-components`, `class-variance-authority` + `clsx` + `tailwind-merge`, lucide-react, recharts, sonner, `@internationalized/date`, zustand 5, Supabase JS 2, react-hook-form 7 + `@hookform/resolvers`, zod 4, dayjs, vite, oxlint. No test runner is installed.

---

## React 19

- Function components only, default export, props typed by a local `IProps`.
- Effects are for synchronisation with the outside world, not for deriving values. If a value can be computed during render, compute it during render.
- `useMemo` / `useCallback` only where a measured cost or a referential-identity contract justifies it. Wrapping every handler is noise.
- When an effect must read the latest props without re-subscribing, hold them in a ref that a bare effect updates — the pattern already used in `useMutation`.
- Keys on lists come from stable ids, never the array index.

## react-router-dom 7

- Routes are data objects typed `IRoute`, declared in `routes/`, assembled by scope (public vs protected). Components are referenced as `Component:`, not `element:`.
- Access control belongs in a `loader`, not in a `useEffect` redirect.

## shadcn/ui aria-vega (React Aria)

- Use the project's primitives first: `ContentView`, `DataTable`, `SectionCard`, `StatCard`,
  `InfoCard`, `SectionHeading`, `BentoGrid` / `BentoCell`, `ViewSwitch`, `EntityFormModal`,
  `FormField`, `AppModal`, `DetailModal`, `FilterToolbar`, `FilterPopover`, `SortSelect`,
  `StatusFilterTabs`, `FilterSelect`, `DateRangeFilter`, `AvatarCell`, `ProgressCell`,
  `RowActionMenu`, `AppButton`, `StatusTag`, `EmptyState`, `ErrorState`, `PageSkeleton`,
  `AppBarChart` / `AppDonutChart`, `RequirePermission`. Reach for a raw `components/ui` file
  only when no primitive fits, and prefer extending the primitive.
- `components/ui/` is registry output. Add with `npx shadcn@latest add <name>` (style comes
  from `components.json`), never hand-edit to restyle — colour is a token change in
  `theme.css`. A registry item that pulls in Radix, Base UI, `vaul`, `cmdk` or
  `react-day-picker` is not added.
- Events are React Aria: `onPress` not `onClick` on buttons, `onOpenChange`, `isDisabled`,
  `selectedKey`. Tooltips do not fire on a disabled button — give the disabled state an
  `aria-label` or visible text that explains it.
- Links inside the app are aria `href`s, routed by `RouteRoot` (aria `RouterProvider`).
- Feedback is `toast` from `sonner`; `<Toaster>` is mounted once in `App.tsx`.
  `useMutation` already toasts success and queued writes — do not toast again.
- Confirmations come from `useConfirm` and the confirm store. See `conventions.md` §9.
- Table columns are `IDataTableColumn<T>` from `models/common/table.model.ts`, declared in
  the **feature component**, with `align` and `className: nowrapCell` on numbers, dates and
  actions. Columns that depend on a permission are spread in conditionally, not hidden.
- Charts are recharts through `components/common/chart/`, coloured by `chartColor` tones
  mapped to `--chart-N`. Icons are `lucide-react`; `IRoute.icon` is a `LucideIcon`.

## Tailwind v4

- `src/styles/common/theme.css` is the whole CSS entry: `@import "tailwindcss"` (preflight
  on), `tw-animate-css`, `shadcn/tailwind.css`, the `dark` custom variant, `:root` / `.dark`
  semantic variables, the `@theme` token palette, a small base layer and a few `@utility`
  gradients. It is imported once, by `src/main.tsx`.
- Class strings live in `src/styles/<area>/<area>.styles.ts` as named exports — plain
  strings, or `cva` when something varies so variants are typed. Components combine them
  with `cn()`. JSX never carries a literal class string.
- Every colour is a token utility (`bg-brand`, `text-on-brand-muted`, `bg-brand-soft`,
  `rounded-panel`, `shadow-panel`). Arbitrary values (`bg-[#...]`, `p-[13px]`) are a defect; add a token.
- Dynamic values that cannot be a class (a computed percentage width) are the one case for
  `style={{}}`.
- Tailwind only sees classes it can find as whole strings — never build one by
  concatenation (`"text-" + tone`). Map through `cva` or a lookup of full class names.

## zustand 5

- `type States` + `type Actions` + `initialValues`, as in `conventions.md`.
- Components subscribe through an exported selector so they re-render on one slice only.
- `persist` is used only for state that must survive a reload, and its name comes from `keys/storage.keys.ts`.
- Stores that must be wiped on logout are created through the project's reset-aware `create` wrapper rather than zustand's `create` directly.

## Supabase

- One client, created in `utils/supabase.utils.ts`. Never construct a second one.
- Reads: `supabase.from(table).select(columns)` with an explicit column list — never `select("*")`.
- Every read checks `error` and throws `toError(error)` so constraint codes become human sentences.
- Writes go through the shared write path so they can be queued offline.
- Multi-step transactional work is a database function invoked over `rpc`, with `p_`-prefixed argument names.
- Secrets come from `import.meta.env.VITE_*`, are validated at module load, and never appear in a committed file.

## react-hook-form + zod

- The schema is the single source of validation truth; the resolver adapts it. There is no second layer of manual `if` checks in the submit handler.
- Forms that are just a list of fields are declared as `IFieldConfig[]` and rendered by `EntityFormModal`. Write bespoke JSX only for a form with real layout requirements.
- `defaultValues` are typed `DefaultValues<TInput>` and supplied by the manage hook — an `emptyX` constant for create, a mapped record for edit.
- Reset the form when the modal opens, not when the record changes.

## Dates

- Date pickers speak `@internationalized/date` (`CalendarDate`); convert to and from ISO strings at the primitive, not in a feature.
- dayjs is non-UI only (`utils/`, services, the ledger hook/model) — never imported by a component.
- All formatting goes through `utils/format.utils.ts`. Do not call `dayjs().format()` at a call site.
- Dates crossing the service boundary are ISO `YYYY-MM-DD` strings, produced by `todayIso()` and validated by `isoDateField`.

## Tooling

- `yarn lint` runs oxlint. `npx tsc -b` type-checks. `yarn build` does both plus a bundle — reserve it for the cases in `verification.md`.
- No test runner is installed. Do not add one, and do not write test files, unless explicitly asked.
