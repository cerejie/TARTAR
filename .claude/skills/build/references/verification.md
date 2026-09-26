# Verification policy

Verification exists to catch real breakage, not to perform diligence. Every extra command costs tokens and wall-clock time for no added confidence.

## The ladder — run the cheapest step that covers the change, and stop there

| Change | Command | Why |
|---|---|---|
| Copy, labels, comments | **nothing** | The compiler cannot be wrong about text. |
| A `*.styles.ts` or `theme.css` edit | **nothing**, but see *Style changes* below | A build proves the CSS was emitted. It never proves the class reaches the element. |
| One file, no new imports or types | **nothing** | The edit tool already confirmed it applied. |
| New/changed types, models, schemas, service signatures, or more than one file | `npx tsc -b` | Catches every cross-file break in one pass. |
| Style-only concerns after a large edit | `yarn lint` | oxlint, seconds. |
| Build config, vite, PWA, dependency, or entry-point change | `yarn build` | The only case where a full bundle earns its cost. |

**One command per task.** If `tsc -b` passes, do not also run lint "to be safe". If it fails, fix and re-run only that command.

## Never, unless explicitly asked

- Add a test runner, a test config, or any `*.test.*` / `*.spec.*` file. **No test framework is installed in this project.**
- Write a throwaway script to "prove" a function works. Read the function instead.
- Start the dev server or a preview server. It blocks, it produces no verdict, and its output cannot be read for a browser-rendered result. Querying a dev server the user *already* has running is not covered by this rule — see *Style changes*.
- Re-run a command that already passed.
- Re-read a file you just edited to confirm the edit. The tool errors if an edit fails.
- Loop: run → fail → tweak → run. Two failures of the same command means stop and read the code.

## Style changes

A passing `yarn build` says the rule was compiled. It says nothing about whether the rule
*applies* — a selector that matches no element is valid CSS and ships clean. So never
report a visual change as done on the strength of a build alone; say the CSS is in place
and let the user confirm it renders.

When the user reports that a style change did not show up, do not guess at caching or
re-edit the rule. Establish, in order, where the chain breaks:

1. **Is the class on the element?** Read the component's `className` — it must be a
   constant from `styles/<area>/*.styles.ts`, and `cn()` must not be dropping it
   (`tailwind-merge` keeps the last of two conflicting utilities).
2. **Is the class a whole string Tailwind can see?** A class built by concatenation is
   never generated. `grep` the emitted CSS in `dist/assets/*.css` for it.
3. **Does the token resolve?** A utility like `bg-brand-mist` exists only if `--color-brand-mist`
   is in the `@theme` block of `theme.css`; a semantic colour needs both its `:root` and
   `.dark` values.
4. **Is a `ui` component's own class winning?** Its variant classes apply first; a layout
   `className` on it merges through `cn()`, colour does not belong there.

Only after all four does caching or a stale service worker become the likely answer.

## When the user asks for tests

Then write them — properly, and say what runner is being added and why. Cover the branch logic and the boundaries, not the getters. Do not add a runner as a side effect of some other task.

## Reporting

State the outcome plainly. If the check failed, paste the relevant lines of output — not the whole log. If a check was skipped because the ladder says to skip it, do not mention it at all; if it was skipped for any other reason, say so.
