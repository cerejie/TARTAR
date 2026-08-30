---
name: build
description: "The single entry point for implementation work in this codebase — new module, feature, bug fix, refactor, UI or schema change. Load this automatically whenever a prompt asks for implementation work in this codebase, whether or not the user types /build — a styling or design revision counts, however small it looks. It runs the whole pipeline itself (locate, decide, plan, implement, verify, report) and loads whatever references it needs — pathfinding, planning, conventions, stack rules, verification — without the user naming them."
---

# /build

You are running the pipeline. Follow it in order. Do not narrate the steps back to the user.

Everything you need is in this file or in `references/`. Load a reference yourself when the step says to — the user will not ask for it by name.

## Always-on rules

These apply for the whole task without reading anything further.

1. **Reuse before creating.** Grep for an existing component, hook, or util first. Duplication is a defect here.
2. **No `any`.** `unknown` plus narrowing. `as unknown as T` only at the data-source boundary.
3. **`import type` for every type-only import** — `verbatimModuleSyntax` makes a miss a build error.
4. **Minimal diff.** No drive-by refactors, no reformatting untouched lines, no renaming what works.
5. **Never invent a business rule.** Ask instead — see step 3.
6. **No test runner, no `*.test.*`, no throwaway verification scripts** unless the user asks.
7. **Never run graphify**, re-index, or regenerate any derived artefact. Only when the user types `/graphify` themselves.
8. **Never commit, push, branch, or migrate** unless asked.
9. **Read ranges, not files** (`sed -n '40,90p'`). Never read a file twice. Never re-read a file you just edited.
10. **Do not spawn sub-agents.** They start cold and re-derive context that already exists here.
11. **Reply in under ten lines**, no preamble, no pasting back code you just wrote — cite `path.ts:42`.

Full detail, only if a situation is genuinely unclear: `references/lean.md`.

## Step 1 — Locate

Derive the paths; do not search for them. This map resolves most tasks with zero reads:

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

Almost every change to an existing screen is its feature component plus its list hook. Open
those two and stop. The full request router is in `references/pathfind.md`.

Budget: **≤6 file reads for a feature, ≤3 for a fix.** Confirm a derived path with one `ls`, never a recursive `find`. If the map does not resolve it, read `references/pathfind.md` for symbol search and narrow-grep technique.

## Step 2 — Classify

- **Small** — ≤3 files, one layer, no new dependency, no migration, no route change → skip to step 5.
- **Large** — anything else → step 3.

## Step 3 — Decide

Anything on this list goes to the user as a question, via `AskUserQuestion`: at most 3 questions, at most 4 options each, recommended option first and labelled.

Business rules · money, rounding, tax · status transitions · what a column means · permissions and roles · destructive database work · adding a dependency · breaking an existing flow, route, or public shape · two designs with genuine trade-offs.

Everything else is your call. Make it, state it in one line, keep going.

## Step 4 — Plan (large changes only)

Read `references/plan.md`. Produce a plan of at most 15 lines — exact paths, `+` for new and `~` for modified, in build order, plus the single biggest risk. Then **stop and wait for approval**. Do not start implementing a plan that has not been approved.

## Step 5 — Implement

Read `references/conventions.md` unless the change is confined to a file you have already
read in this session, **or** it is a pure restyle of an existing element — editing a
`styles/<area>/*.css.ts` with no new file and no markup change needs only the token rule,
which `CLAUDE.md` already carries. It is otherwise the authority on folder law, file naming,
naming inside files, globalization, the layer contract, and the standard code shapes.

Also read, only when it applies:

- `references/stack.md` — touching antd, vanilla-extract, zustand, Supabase, zod, or react-hook-form.
- `references/module-recipe.md` — creating a whole new domain end to end.
- `references/architecture.md` — unsure which layer owns the logic.

Never read more than two references in one task.

## Step 6 — Verify

**One** command, the cheapest that covers the change:

- Copy, labels, styles, or a single file with no new types → **nothing**. A build never
  proves a style change is *visible*; report it as compiled, not as confirmed.
- New or changed types, models, services, or more than one file → `npx tsc -b`.
- Build config, vite, PWA, or a dependency change → `yarn build`.

If it passes, stop. Do not also run lint. Two failures of the same command means stop and read the code. Detail: `references/verification.md`.

## Step 7 — Report

Under ten lines: what changed (clickable paths), what you assumed, what is left. No code dumps, no step-by-step narration.

## Step 8 — Commit

Only if the user asked. Then follow `../commit/SKILL.md` — prefixed short title, 2–5 dash bullets.

## If the session runs long

Say in one line that `/checkpoint` would preserve the state. Do not checkpoint, compact, or clear on your own.
