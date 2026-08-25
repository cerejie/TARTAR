# New module recipe

For a new domain `x` with list + create + edit + delete. Build in this order — each step compiles against the previous one, so nothing needs revisiting.

Substitute `x` for the domain (`discount`), `X` for its Pascal form (`Discount`), and use dots inside filenames for a multi-word domain (`expense.category`) with kebab-case for its folder (`expense-category`).

| # | File | Contents |
|---|---|---|
| 1 | `src/models/data/x/x.request.ts` | zod `xSchema` + `export type IXInput = z.infer<typeof xSchema>` |
| 2 | `src/models/data/x/x.response.ts` | `IX` row interface mirroring the table; pure derive helpers |
| 3 | `src/enums/x.enum.ts` | only if the domain has a status or kind — values, schema, type, labels, colours |
| 4 | `src/keys/query.keys.ts` | `export const xListKey = "xs";` |
| 5 | `src/keys/modal.keys.ts` | `xCreateModalKey`, `xEditModalKey` |
| 6 | `src/services/data/x.services.ts` | `columns` const, `toValues()`, `xServices` with `getList`/`create`/`update`/`remove` |
| 7 | `src/hook/data/x/x.list.hook.ts` | `useXListHook` — wraps `useQuery`, returns `{ ...query, xs, xOptions }` |
| 8 | `src/hook/data/x/x.manage.hook.ts` | `useXManageHook` + `xFormFields` — modals, mutations, defaults, `editing` |
| 9 | `src/pages/X/XView.tsx` | `PageHeader`, `SectionCard`, `DataTable`, two `EntityFormModal`s |
| 10 | `src/routes/protected.view.routes.ts` | register the route: `key`, `path`, `label`, `description`, `icon`, `group`, `can`, `Component` |
| 11 | `supabase/migrations/<ts>_x.sql` | only when the schema changes — additive, with keys, indexes and RLS |
| 12 | `src/styles/...` | only when no existing style group fits |

Steps 3, 11 and 12 are skipped unless the domain actually needs them. Skipping is the default.

## Read-only module

Steps 1 (response model only), 4, 6 (`getList` only), 7, 9, 10. No modal keys, no mutations, no manage hook — the View consumes the list hook directly.

## Adding a field to an existing domain

Touch, in order: migration → `*.response.ts` → `*.request.ts` → service `columns` and `toValues` → manage hook defaults → `xFormFields` → the View's columns. Missing one of these is the usual cause of "the value saves but does not show".

## Before you write anything

Grep the existing domains for the closest analogue and mirror it. A CRUD domain here is largely mechanical — copying the shape of `party` or `branch` and changing the nouns is faster, cheaper, and more correct than composing from scratch. Then remove what your domain does not need; do not carry over dead options.
