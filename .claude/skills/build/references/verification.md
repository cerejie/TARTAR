# Verification policy

Verification exists to catch real breakage, not to perform diligence. Every extra command costs tokens and wall-clock time for no added confidence.

## The ladder — run the cheapest step that covers the change, and stop there

| Change | Command | Why |
|---|---|---|
| Copy, labels, comments | **nothing** | The compiler cannot be wrong about text. |
| A `*.css.ts` edit | **nothing**, but see *Style changes* below | A build proves the CSS was emitted. It never proves the selector matches anything. |
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

1. **Is the rule in the compiled output?** `grep` the emitted CSS in `dist/assets/*.css`.
2. **Is it in what the browser is actually served?** If a dev server is already running,
   `curl` the module and its `.vanilla.css`. This is cheap and decisive — no browser needed.
3. **Does the selector match the element?** Compare the class name the module *exports*
   against the selector the CSS *uses*. They can differ. See the dotted-filename trap in
   `stack.md`, which broke seven stylesheets in dev while every build passed.
4. **Is the class on the element you think it is?** Read the component's `className`.

Only after all four does caching or a stale service worker become the likely answer.

## When the user asks for tests

Then write them — properly, and say what runner is being added and why. Cover the branch logic and the boundaries, not the getters. Do not add a runner as a side effect of some other task.

## Reporting

State the outcome plainly. If the check failed, paste the relevant lines of output — not the whole log. If a check was skipped because the ladder says to skip it, do not mention it at all; if it was skipped for any other reason, say so.
