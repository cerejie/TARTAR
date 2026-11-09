---
name: commit
description: "Write a commit message in this repo's house style — title `Development vX.Y`, description one `<Prefix>: <Title>` line per change. Two modes: suggest (after every response that changed files, end with a suggested message — no git commands run) and commit (only when the user types /commit or asks to commit). Never commit on your own initiative."
---

# /commit — house-style commit messages

## Two modes

- **Suggest** — after **every** response that changed files in this repo, end the reply with a
  suggested commit message in a fenced `txt` block, ready to copy. Always suggest; never run
  `git add` or `git commit` for it. Before every suggestion apply the version rule under
  **Title** — the user may have committed since the last one — so `vite.config.ts` and the
  title agree. Never reuse a version that is already committed. The
  description covers every uncommitted change, not only this turn's. If the change is not yet
  commit-worthy (build or lint failing), say so instead.
- **Commit** — only when the user types `/commit` or asks to commit. Follow the Rules below.

## Format

```
Development v<X.Y>

<Prefix>: <Short title>
```

**Title** — always `Development v<X.YY>`, nothing else. The number is the app version shown
under the TARTAR logo: `__APP_VERSION__` in `vite.config.ts`, always two decimals. Every commit
bumps it by 0.01 (`v1.00` -> `v1.01`, `v1.99` -> `v2.00`) and the title carries the same
number. Find the last committed one with `git log --oneline --grep="^Development v" -1`: if
`vite.config.ts` still holds that version, bump it by 0.01 as part of the change; otherwise it
was already bumped since the last commit, so keep it. The series restarted at `v1.00` on
2026-11-09 — the one-decimal commits up to `v2.92` are the previous series and never the base.
If the user names a version, use theirs and set `vite.config.ts` to match.

**Description** — one `<Prefix>: <Short title>` line per logical change, usually one. The
short title is Title Case, ≤60 characters, no trailing period. No bullets, no paragraphs.

**Prefixes used in this repo:**

| Prefix | For |
|---|---|
| `Feature:` | new capability |
| `Bug fix:` | corrected behaviour |
| `HotFix:` | urgent production correction |
| `ReDesign:` | reworked existing UI |
| `Design Implementation:` | new UI built to a design |
| `Refactor:` | structure changed, behaviour identical |
| `Milestone N:` | a delivery checkpoint |

## Example

```
Development v1.00

Feature: App Version Under Logo
```

## Rules

- **Never commit unless asked.** Not after finishing a task, not "to be safe". A `/autopilot`
  run counts as asked, and also authorizes `git push origin HEAD` on a non-default branch.
- **Never push, never create a PR, never switch or create a branch** unless asked.
- Check the current branch first. If it is the default branch, say so and ask before committing.
- Stage deliberately — the files the task touched, not `git add -A` over a dirty tree.
- Run `git status --short` and `git diff --stat` before writing the message. One `git log --oneline -10` if the prefix style needs confirming. Nothing else.
- Do not describe changes you did not make; do not omit changes you did.
- Keep the `Co-Authored-By` trailer required by the harness as a trailer, separated from the description by a blank line. It is not part of the description.
