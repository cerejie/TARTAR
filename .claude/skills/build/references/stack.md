# Stack rules

**Detect before applying.** Read `package.json` once. Apply only the sections whose library is actually a dependency of the current project. If a section's library is absent, that section does not exist — follow `conventions.md` and the project's own existing code instead, and never introduce one of these libraries just because this file mentions it.

Reference stack: React 19, react-router-dom 7, antd 6, `@ant-design/icons`, `@ant-design/charts`, vanilla-extract, zustand 5, Supabase JS 2, react-hook-form 7 + `@hookform/resolvers`, zod 4, dayjs, vite, oxlint. No test runner is installed.

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

## antd 6

- Use the project's wrappers first: `DataTable`, `SectionCard`, `PageHeader`, `EntityFormModal`, `FormField`, `RowActions`, `NameCell`, `ColumnLabel`. Reach for a raw antd component only when no wrapper fits.
- Feedback comes from `App.useApp()` (`message`, `modal`, `notification`) so it inherits theme and context. Never import the static `message` singleton.
- Theme is configured once through `ConfigProvider` in `App.tsx`. Do not add a second provider.
- Table columns are typed `ColumnsType<T>`; give every column an explicit `width` or `align` when it holds a number or an action.

## vanilla-extract

- Styles are `*.css.ts` files under `styles/`, imported as values.
- All literals come from `vars`. Adding a new colour or spacing step means adding a token, not a hex code at the call site.
- Library internals are targeted with `globalStyle` scoped through your own generated class.
- Dynamic values that cannot be a token go through inline style or a `createVar`, not a new class per value.

### Generated class names — the dotted-filename trap

`vite.config.ts` passes `vanillaExtractPlugin({ identifiers: 'short' })`. **Do not remove
that option.** Without it, dev builds prefix every generated class with the source
filename, and vanilla-extract sanitizes only whitespace in that prefix — never dots.

A file named `protected.layout.css.ts` then produces:

```
element:  class="protected.layout_menuWrapper__1yh2jv38"   one class token containing "."
selector: .protected.layout_menuWrapper__1yh2jv38          parsed as .protected AND .layout_menuWrapper__…
```

The selector cannot match the element — the dot needed escaping and never gets it, so
**every rule in that file is silently dead in the dev server**. Production is unaffected,
because release builds emit hash-only identifiers. The failure is invisible to `tsc`,
`oxlint` and `yarn build` alike.

Seven of this project's stylesheets have a dotted base name and were affected:
`protected.layout`, `public.layout`, `common.view`, `content.view`, `dashboard.view`,
`ledger.view`, `report.view`. `identifiers: 'short'` fixes all of them at once and keeps
the `<area>.<kind>.css.ts` naming convention intact.

If a style edit provably reaches the compiled CSS but does not appear in the browser,
check this first: fetch the served class name and confirm it contains no dot.

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

## dayjs

- All formatting goes through `utils/format.utils.ts`. Do not call `dayjs().format()` at a call site.
- Dates crossing the service boundary are ISO `YYYY-MM-DD` strings, produced by `todayIso()` and validated by `isoDateField`.

## Tooling

- `yarn lint` runs oxlint. `npx tsc -b` type-checks. `yarn build` does both plus a bundle — reserve it for the cases in `verification.md`.
- No test runner is installed. Do not add one, and do not write test files, unless explicitly asked.
