# Pathfinding — find the file, not the codebase

Most token waste is reading files that were never going to change. This skill removes that.

## Order of attack

Stop at the first step that answers the question.

### 1. Derive the path — zero reads

The layout is deterministic, so most paths are computable rather than discoverable. From the domain plus the concern:

| Need | Path |
|---|---|
| **A screen's UI — columns, buttons, toolbar, modals** | `src/components/<x>/tables/<X>Table.tsx` |
| **A screen's data, fields, defaults, mutations** | `src/hook/data/<x>/<x>.list.hook.ts` |
| What a page contains (rarely more than one line) | `src/pages/<X>/<X>View.tsx` |
| Database / API calls for `x` | `src/services/data/x.services.ts` |
| Panel-shaped screen instead of a table | `src/hook/data/x/x.manage.hook.ts` |
| Form validation for `x` | `src/models/data/x/x.request.ts` |
| Row shape for `x` | `src/models/data/x/x.response.ts` |
| Status values, labels, colours | `src/enums/x.enum.ts` |
| Cache / modal / storage / pagination keys | `src/keys/*.keys.ts` |
| Route, nav entry, permission gate | `src/routes/protected.view.routes.ts` |
| Client state for `x` | `src/store/data/x/x.store.ts` |
| Query, mutation, modal, confirm, filter, pagination, sync mechanics | `src/hook/common/`, `src/store/common/` |
| Shared primitives (`ContentView`, `DataTable`, `SectionCard`, `EntityFormModal`) | `src/components/common/<kind>/` |
| Formatting, schema fragments, data client | `src/utils/*.utils.ts` |
| **Look of a thing** | `src/styles/<area>/<area>.css.ts` — see the style map below |
| Colours, spacing, radii, shadows, fonts | `src/styles/common/vars.css.ts` |

**Style areas** — the `<area>` folder is the visual concern, not the domain:

| Looking at | File |
|---|---|
| Sider, header, nav, app shell | `styles/layout/protected.layout.css.ts` |
| Content shell, bento, page body | `styles/view/content/content.view.css.ts` |
| Cards and panels | `styles/card/card.css.ts` |
| Forms and fields | `styles/form/form.css.ts` |
| Filter bar | `styles/filter/filter.css.ts` |
| Tables | `styles/table/table.css.ts` |
| Modals | `styles/modal/modal.css.ts` |
| Stat tiles | `styles/stat/stat.css.ts` |
| Status pills and tags | `styles/status/status.css.ts` |
| Semantic tones (money, danger, focus) | `styles/common/tone.css.ts` |

Multi-word domain: dots in the filename, kebab-case in the folder — `hook/data/expense-category/expense.category.manage.hook.ts`.

Confirm a derived path with one `ls` of the domain folder, not a recursive find.


## Request router — the whole file set, before you open anything

Most prompts are one of these. Open the listed files and nothing else.

| The user says | Open |
|---|---|
| "add / change a column" | `components/x/tables/XTable.tsx` — plus `x.response.ts` and the service `columns` if the field is new |
| "change the form fields / validation" | `fields` and `defaults` in `x.list.hook.ts`, schema in `x.request.ts` |
| "restyle / re-lay-out *anything*" | `styles/<area>/<area>.css.ts` from the style map, then the component only if the markup must change |
| "add a button / action to a screen" | `components/x/tables/XTable.tsx` |
| "change the sider / header / menu" | `components/common/layout/*.tsx` + `styles/layout/protected.layout.css.ts` |
| "change the filter bar" | `components/common/filter/*.tsx` + `styles/filter/filter.css.ts` + `store/common/filter.store.ts` |
| "the modal looks wrong" | `styles/modal/modal.css.ts`, then `components/common/modal/AppModal.tsx` |
| "wrong / missing data" | `x.services.ts` first, then `x.list.hook.ts`. Not the component. |
| "add paging" | service `getList` + `usePagination` + `keys/table.keys.ts` |
| "add a confirmation" | `useConfirm` at the call site. Nothing else — the modal is already mounted. |
| "change a colour / spacing / radius" | `styles/common/vars.css.ts` **only** |
| "add a whole new page/domain" | `references/module-recipe.md` |

**The two-file rule.** Almost every change to an existing screen resolves to its feature
component and its list hook. Open those two, in that order, and stop. Reach for a third file
only when one of them names it.

Worked example — *"change the layout of the transaction form and button into this design"*:

1. Button and form modal live in the screen → `components/transaction/tables/TransactionsTable.tsx`
2. The field list behind that modal → `fields` in `hook/data/transaction/transaction.list.hook.ts`
3. Its appearance → `styles/form/form.css.ts`, tokens from `styles/common/vars.css.ts`

Three files, no searching. Note what is *not* opened: `TransactionsView.tsx` (it is one line),
the service, the models, the routes.

### 2. Symbol search — cheaper than reading

When serena's tools are available, use them before opening a file. Serena is an MCP server
and is often *not* connected — if a call fails or the server is still connecting, drop
straight to step 3 rather than waiting or retrying:

- `get_symbols_overview` on a file returns its shape without its body.
- `find_symbol` returns one function or type, not the file around it.
- `find_referencing_symbols` answers "what breaks if I change this" without a text search.

### 3. Narrow grep — names before bodies

```bash
grep -rln "useCustomerListHook" src --include=*.ts --include=*.tsx
grep -rn  "export const use" src/hook/data/party
```

Rules:

- `-l` first to find the file, `-n` second to find the line. Two cheap greps beat one wide one.
- Always scope to a directory and an `--include`. Never grep from the repository root.
- Search for the **declaration** (`export const x`, `interface IX`), not for a word that appears in prose.

### 4. Read a range, not a file

```bash
sed -n '40,90p' src/hook/data/party/supplier.manage.hook.ts
```

Whole-file reads are justified for a file you are about to rewrite, or one under ~80 lines. Otherwise take the range around the grep hit.

## Budget

A typical feature is located in **≤6 file reads**. A bug fix, in **≤3**. A change to an
existing screen is **2** — its feature component and its list hook. A pure restyle is **1** —
the `styles/<area>` file. Crossing the budget means the approach is wrong: go back to step 1
and derive.

## Never

- `find src -type f` or any recursive listing of the whole tree — the path map above already contains that answer.
- Reading `node_modules/`, `dist/`, `.history/`, `graphify-out/cache/`, `yarn.lock`, or `*.tsbuildinfo`. They are large and never the answer.
- Running graphify or re-indexing to answer a location question. Querying an existing `graphify-out/` is allowed when it is genuinely cheaper; regenerating it is not, ever, unless the user asks.
- Re-locating a file already found earlier in the session.
- Opening a file "for context" with no specific question in mind.

## Record what you found

When the task is large, keep the resolved paths in the plan or the checkpoint file. A path found once should never be searched for twice, in this session or the next.
