# .claude — portable skill pack

One command. `/build` runs everything else itself.

## Copy to another project

Copy the whole `.claude/` folder into the other project's root. Nothing else is needed — the pack is self-contained and uses relative paths internally.

On a project with a different stack, `references/stack.md` checks `package.json` first and applies only the sections whose library is actually installed. `references/conventions.md` (naming, foldering, layering) applies everywhere.

## How to use it

```
/build add a discount module with CRUD and a report row
/build fix the payables total ignoring rejected payments
```

That is the whole interface. `/build` locates the files, asks about anything that needs a decision, proposes a plan for large changes, implements to the house conventions, verifies once, and reports — pulling in whichever reference it needs on its own.

Without `/build`, nothing fires. An ordinary prompt gets ordinary behaviour.

## What is registered

| Skill | When it runs |
|---|---|
| **build** | You type `/build`. |
| **commit** | You type `/commit`, or `/build` reaches its commit step because you asked for one. |
| **checkpoint** | You type `/checkpoint`. Also read automatically at session start *if* `.claude/state/ROADMAP.md` exists with unfinished work, so a cleared session resumes cold. |

Nothing else appears in the skill list, so nothing else can fire by accident.

## References — loaded by /build, never typed

Under `skills/build/references/`:

- `conventions.md` — folder law, file naming, naming inside files, globalization, layer contract, standard code shapes, TypeScript, styles, UX defaults. **The core document.**
- `pathfind.md` — locating files without scanning, when the path map in `SKILL.md` does not resolve it.
- `plan.md` — plan format and the decisions that must reach you.
- `architecture.md` — which layer owns which logic, caching, modals, permissions, migrations.
- `stack.md` — library rules, applied only when the library is installed.
- `module-recipe.md` — the twelve-step order for a new CRUD domain.
- `verification.md` — which check to run, and the longer list of checks not to run.

The most common tasks need none of them: `/build`'s own file carries the path map, the always-on rules, and the verification ladder inline.

## Standing policies

- **Plans before large changes.** New module, >3 files, migration, new dependency, route or permission change → a ≤15-line plan, then it waits for approval.
- **Ask, never invent.** Business rules, money semantics, permissions, destructive database work and new dependencies always come to you as a question.
- **Testing stays minimal.** One verification command per task at most; no test runner, no test files, no throwaway scripts unless you ask.
- **Graphify never runs automatically.** No update, no re-index, no regeneration — only when you type `/graphify` yourself.
- **Never commit, push, branch or migrate** unless asked.
- **No sub-agents**, no self-directed context clearing.

## Local state

`.claude/state/` holds the roadmap file `/checkpoint` writes. It is working state, not source — add it to `.gitignore` if you would rather not track it.
