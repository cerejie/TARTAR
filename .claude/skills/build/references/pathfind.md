# Pathfinding — find the file, not the codebase

Most token waste is reading files that were never going to change. This skill removes that.

## Order of attack

Stop at the first step that answers the question.

### 1. Derive the path — zero reads

The layout is deterministic, so most paths are computable rather than discoverable. From the domain plus the concern:

| Need | Path |
|---|---|
| Table/API calls for `x` | `src/services/data/x.services.ts` |
| Screen logic for `x` | `src/hook/data/x/x.manage.hook.ts` |
| Read-only fetch for `x` | `src/hook/data/x/x.list.hook.ts` |
| Form validation for `x` | `src/models/data/x/x.request.ts` |
| Row shape for `x` | `src/models/data/x/x.response.ts` |
| Status values, labels, colours | `src/enums/x.enum.ts` |
| The screen | `src/pages/X/XView.tsx` |
| Cache / modal / storage key | `src/keys/*.keys.ts` |
| Route, nav entry, permission gate | `src/routes/protected.view.routes.ts` |
| Client state for `x` | `src/store/data/x/x.store.ts` |
| Cross-cutting mechanics (query, mutation, modal, sync, network) | `src/hook/common/`, `src/store/common/` |
| Formatting, schema fragments, data client | `src/utils/*.utils.ts` |
| Design tokens | `src/styles/common/vars.css.ts` |

Multi-word domain: dots in the filename, kebab-case in the folder — `hook/data/expense-category/expense.category.manage.hook.ts`.

Confirm a derived path with one `ls` of the domain folder, not a recursive find.

### 2. Symbol search — cheaper than reading

When serena's tools are available, use them before opening a file:

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

A typical feature is located in **≤6 file reads**. A bug fix, in **≤3**. Crossing that means the approach is wrong: go back to step 1 and derive.

## Never

- `find src -type f` or any recursive listing of the whole tree — the path map above already contains that answer.
- Reading `node_modules/`, `dist/`, `.history/`, `graphify-out/cache/`, `yarn.lock`, or `*.tsbuildinfo`. They are large and never the answer.
- Running graphify or re-indexing to answer a location question. Querying an existing `graphify-out/` is allowed when it is genuinely cheaper; regenerating it is not, ever, unless the user asks.
- Re-locating a file already found earlier in the session.
- Opening a file "for context" with no specific question in mind.

## Record what you found

When the task is large, keep the resolved paths in the plan or the checkpoint file. A path found once should never be searched for twice, in this session or the next.
