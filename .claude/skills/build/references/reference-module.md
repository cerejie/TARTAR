# The reference module — Transactions

Transactions is the canonical screen. Every other screen copies its shape, so the app reads
as one product instead of a dozen dialects. When a request touches UI — a page, a table, a
modal, a form, a card, a filter row, a row action — open the matching Transaction file and
mirror it. Never invent a second way to do something Transactions already does.

Where an existing screen disagrees with Transactions, **Transactions wins**: bring the screen
you were asked to touch into line, and leave the others alone unless asked.

## The five files

| Layer | File |
|---|---|
| Page | `src/pages/Transactions/TransactionsView.tsx` |
| Metric tiles | `src/components/transaction/cards/TransactionSummaryCards.tsx` |
| Table, toolbar, modal, row actions | `src/components/transaction/tables/TransactionsTable.tsx` |
| Data, fields, defaults, mutations | `src/hook/data/transaction/transaction.list.hook.ts` |
| Schema and row shape | `src/models/data/transaction/transaction.request.ts` · `.response.ts` |

Open only the one or two that match the change. The summaries below are usually enough on
their own — a restyle needs none of them.

## The shapes

**Page** — `ContentView` wrapping feature components and nothing else. No props, no state, no
queries, about fifteen lines.

**Metric tiles** — `statGrid` class → `BentoGrid` → one `BentoCell span="quarter"` per
`StatCard`. Each card takes `title`, `value`, `loading`, `variant`
(`positive` | `negative` | `brand`), `icon`, `caption`. The values come from the same list
hook the table uses; a card component never runs its own query.

**Table** — `TablePanel` is the shell:

- `toolbar` → `FilterToolbar` whose `actions` slot holds the primary `Button type="primary"`
  with an icon, wrapped in `RequirePermission`; its children are the filter bar.
- `footer` → `TablePagination` fed `pagination`, `totalCount`, `onPageChange`.
- children → `DataTable<T>` with `columns`, `data`, `loading`, `pagination`,
  `detachedPagination`, `expansionKey` from `keys/table.keys.ts`, `detailSections`, `emptyText`.
- sibling → `EntityFormModal<TInput>` with `open`, `title`, `subtitle`, `size`, `sections`,
  `schema`, `defaultValues`, `submitting`, `submitText`, `onSubmit`, `onClose`.

**Columns** — `dataIndex` plus `render`. `nowrapCell` on dates, amounts and actions. Money
through `formatMoney`, `align: "right"`. Dates and times through `formatDate` / `formatTime`.
Type and status through an enum label and colour map from `enums/<x>.enum.ts`, rendered as an
antd `Tag` with `variant="outlined"` and the `typeTag` class. A permission-gated column is
spread in conditionally: `...(permissions.isManager ? [...] : [])`.

**Row actions** — an `actionsOf(row): IRowAction[]` builder rendered by `RowActionMenu` in a
trailing column. A destructive entry sets `danger: true` and opens `useConfirm` with
`kind: "delete"`, a question title and a sentence naming what is lost.

**Expanded row** — `IDetailSection[]` with `key`, `title`, `icon` and `items` of
`{ key, label, render }`, falling back to `"—"`.

**List hook** — returns one flat object, no nesting: `permissions`, the rows, `totalCount`,
`pagination`, `goToPage`, `loading`, summary fields, lookup maps, the modal handle,
`sections`, `defaults`, and the mutations. Inside: `usePagination` keyed from
`keys/table.keys.ts`, `useLedgerFilters` for filter state, `useModal` keyed from
`keys/modal.keys.ts`, query keys composed with `scopedKey`, `sections` as
`IFieldSection[]` with `hidden: (values) => boolean` for conditional fields, and `defaults`
typed `DefaultValues<TInput>`.

## Checklist before reporting done

- Page is `ContentView` plus feature components, nothing else.
- Table sits in `TablePanel` with a `FilterToolbar` toolbar and a `TablePagination` footer.
- Primary action is a `type="primary"` antd button with an icon, inside `RequirePermission`,
  on the toolbar's trailing edge.
- Form is `EntityFormModal` + zod schema + `IFieldSection[]` — never antd `Form`, never a
  hand-rolled modal, never antd `Modal` directly.
- Every destructive action goes through `useConfirm`.
- Labels, colours, money and dates come from the enum maps and `utils/format.utils.ts`.
- Query, modal, storage, table keys come from `keys/*.keys.ts`.
- Styling reuses the classes Transactions uses; a genuinely new rule goes in the same
  `styles/<area>/*.css.ts` file, built from `vars` tokens.

## When Transactions does not cover it

A panel-shaped screen with no table is the `*.manage.hook.ts` pattern —
`src/hook/data/user/user.manage.hook.ts` is the closest analogue. Everything else about it
still follows the rules above: same shell, same modal, same confirm, same tokens.
