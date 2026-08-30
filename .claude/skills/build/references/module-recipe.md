# New module recipe

For a new domain `x` with list + create + edit + delete. Build in this order — each step compiles against the previous one, so nothing needs revisiting.

Substitute `x` for the domain (`discount`), `X` for its Pascal form (`Discount`), and use dots inside filenames for a multi-word domain (`expense.category`) with kebab-case for its folder (`expense-category`).

| # | File | Contents |
|---|---|---|
| 1 | `src/models/data/x/x.request.ts` | zod `xSchema` + `export type IXInput = z.infer<typeof xSchema>` |
| 2 | `src/models/data/x/x.response.ts` | `IX` row interface mirroring the table; pure derive helpers |
| 3 | `src/enums/x.enum.ts` | only if the domain has a status or kind — values, schema, type, labels, colours |
| 4 | `src/keys/query.keys.ts` | `export const xListKey = "xs";` |
| 5 | `src/keys/modal.keys.ts` | `xFormModalKey` |
| 6 | `src/keys/table.keys.ts` | `xPaginationKey` — only for a transactional, server-paged list |
| 7 | `src/services/data/x.services.ts` | `columns` const, `toValues()`, `xServices` with `getList`/`create`/`update`/`remove`; paged `getList` returns `IPaginationResponse<T>`, plus `getAll` if a report consumes it |
| 8 | `src/hook/data/x/x.list.hook.ts` | `useXListHook` — filters, paged query, options, lookup maps, modal handle, `fields`, `defaults`, `normalize`, mutations; returns one flat object |
| 9 | `src/components/x/tables/XTable.tsx` | the screen: one hook call, `ColumnsType<IX>`, `FilterToolbar`, `DataTable`, `EntityFormModal`, `useConfirm` for delete |
| 10 | `src/pages/X/XView.tsx` | `<ContentView><XTable /></ContentView>` — nothing else |
| 11 | `src/routes/protected.view.routes.ts` | register the route: `key`, `path`, `label`, `description`, `icon`, `group`, `can`, `Component` |
| 12 | `supabase/migrations/<ts>_x.sql` | only when the schema changes — additive, with keys, indexes and RLS |
| 13 | `src/styles/...` | only when no existing style group fits |

Steps 3, 6, 12 and 13 are skipped unless the domain actually needs them. Skipping is the default.

Step 9 is the one people get wrong: the columns and the modals belong in the feature
component under `components/x/`, **not** in the page. The page never grows past step 10.

## Read-only module

Steps 1 (response model only), 4, 7 (`getList` only), 8, 9, 10, 11. No modal keys, no
mutations — the feature component consumes the list hook and renders a `DataTable`.

## Adding a field to an existing domain

Touch, in order: migration → `*.response.ts` → `*.request.ts` → service `columns` and
`toValues` → the list hook's `defaults`, `fields` and `normalize` → the feature component's
columns. Missing one of these is the usual cause of "the value saves but does not show".

## Before you write anything

Read **Transactions** end to end — `transaction.services.ts`, `transaction.list.hook.ts`,
`TransactionsTable.tsx`, `TransactionsView.tsx`. It is the complete, current expression of
this recipe, and a paged transactional domain is largely mechanical once you have it in
view. For a simple CRUD domain, `party` or `branch` is the closer analogue. Copy the shape
and change the nouns rather than composing from scratch, then remove what your domain does
not need; do not carry over dead options.

For how a full domain is organised once it outgrows one table, read DCWD's
`src/components/jms/` — `cards`, `forms`, `modal`, `table`, `views` as sibling kind folders.
