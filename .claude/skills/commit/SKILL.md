---
name: commit
description: "Write a commit message in this repo's house style — a short prefixed title and a body of 2-5 terse dash bullets. Invoked explicitly when the user types /commit, or loaded by /build at its commit step. Do not auto-invoke on ordinary prompts, and never commit on your own initiative."
---

# /commit — house-style commit messages

## Format

```
<Prefix>: <Short title>

- <what changed>
- <what changed>
```

**Title** — prefix, colon, space, then a title in Title Case. ≤60 characters total. No trailing period. No scope parentheses, no ticket numbers unless the user gives one.

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

If the target repository's history clearly uses a different convention, say so in one line and ask once which to follow — then stick to the answer.

**Body** — 2 to 5 lines, every line starting with `- `. Each bullet is one change, stated in the imperative or as a noun phrase, under ~70 characters. Facts only.

No paragraphs. No "This commit…". No restating the title. No bullet per file. No summary bullet. No emoji. If a change genuinely needs one bullet, use one; if it needs more than five, the commit is too big — say so.

## Example

```
Feature: Customer Ledger Payments

- Add payment allocation modal with partial settlement
- Track allocation history per ledger entry
- Invalidate receivable list after a verified payment
```

## Rules

- **Never commit unless asked.** Not after finishing a task, not "to be safe".
- **Never push, never create a PR, never switch or create a branch** unless asked.
- Check the current branch first. If it is the default branch, say so and ask before committing.
- Stage deliberately — the files the task touched, not `git add -A` over a dirty tree.
- Run `git status --short` and `git diff --stat` before writing the message. One `git log --oneline -10` if the prefix style needs confirming. Nothing else.
- Do not describe changes you did not make; do not omit changes you did.
- Keep the `Co-Authored-By` trailer required by the harness as a trailer, separated from the bullets by a blank line. It is not part of the body.
