---
name: autopilot
description: "Roadmap runner that stands in for the user. Runs ONE roadmap phase, answers every question it would have asked the user with the decision-making skill, gates on yarn build + yarn lint, commits in house style, pushes the current branch, and writes the next-run prompt so /clear then /autopilot continues the roadmap. Use only when the user types /autopilot or the prompt starts with 'AUTOPILOT'. Never auto-invoke on an ordinary prompt."
---

# /autopilot — the user's stand-in for one roadmap phase

Invoking this skill is the user's **standing authorization** to decide, commit and push on the
current branch without asking. It overrides, for this run only: the roadmap's "present the plan
and WAIT for the user's go", the `commit` skill's "never commit / never push unless asked", and
CLAUDE.md's "always suggest; never commit". Every other rule in CLAUDE.md still binds.

State lives in `.claude/state/autopilot/`:

| File | Purpose |
|---|---|
| `NEXT_PROMPT.md` | The prompt the next fresh run starts from. Rewritten at the end of every run. |
| `LOG.md` | One entry per run: phase, decisions taken, commit, push result. Append only. |
| `STOP` | Exists = autopilot refuses to run. Holds the reason. Only the user deletes it. |

## Run — in this order, no skipping

1. **Orient.** Read `.claude/state/ROADMAP.md` (it is the resume point; do not re-explore) and
   `.claude/state/autopilot/NEXT_PROMPT.md`. Run `git status --short` and
   `git rev-parse --abbrev-ref HEAD`. If `STOP` exists, report its reason and end the run.
2. **Guard.** Hard-stop (step 9) if the branch is `main`/`master`, if the roadmap has no `Next`
   item, or if `Next` item 1 is a merge, a production deploy, or a step that needs a physical
   device.
3. **Settle leftovers.** If the tree is dirty before any work, it is the previous run's or the
   user's uncommitted work: verify (`yarn build`, `yarn lint`), commit it as its own version
   (step 7), push, then continue.
4. **Plan.** Follow the roadmap's session protocol for `Next` item 1: load `build` (and
   `tartar-shadcn` + `shadcn` docs for UI), read only the sections the phase cites, write the
   file plan in your reply.
5. **Decide instead of asking.** Run the `decision-making` skill on the file plan, and again on
   every point where you would otherwise ask the user — a design choice, an ambiguity, a
   trade-off. Decide as the user, from memory, the roadmap's locked decisions and CLAUDE.md.
   Tier it by Step 0 of that skill; most code choices are Simple. Never print the role
   transcript. Record each verdict as one line in `LOG.md`: `- <question> → <pick> (<reason>)`.
   **Never decide these — hard-stop instead (step 9):**
   - a Supabase migration or schema change (CLAUDE.md requires explicit approval);
   - a new business rule — money math, accounting treatment, permissions, RLS — that memory
     and the roadmap do not already settle;
   - deleting or renaming a column, dropping data, force-pushing, rewriting history, switching
     or creating a branch.
6. **Implement and verify.** Implement the decided plan. Run `yarn build` and `yarn lint`;
   fix until both are clean. If they still fail after a genuine root-cause fix attempt, do not
   commit — hard-stop with the failing output. Visuals are unverified by definition: log
   "compiled, visuals unconfirmed", never "renders".
7. **Commit.** Update the roadmap (tick Done with paths, rewrite Next, update State) first so it
   rides in the same commit. Then, per the `commit` skill's Format:
   - version = `git log --oneline --grep="^Development v" -1` + 0.1;
   - stage only the paths this run touched plus the roadmap and `.claude/state/autopilot/` —
     never `git add -A`;
   - title `Development v<X.Y>`, blank line, one `<Prefix>: <Title>` line per change, blank
     line, the harness `Co-Authored-By` trailer. Pass the message through a heredoc / `-F`
     file so lines survive.
8. **Push and hand off.** `git push origin HEAD`. A rejected push is a hard-stop — never
   force, never pull-rebase on your own. Then rewrite `NEXT_PROMPT.md` (shape below), append
   the run's `LOG.md` entry, and end the reply with the commit message in a `txt` block and the
   next prompt in a second block. If the roadmap is now finished, write `STOP` with
   `roadmap complete` instead of a next prompt.
9. **Hard-stop.** Write `STOP` with one paragraph: what blocked, what was done, what the user
   must decide. Commit and push only work that is already build- and lint-clean; leave the rest
   uncommitted. End the reply with the same paragraph.

One phase per run. Never start a second phase in the same context — the fresh context is the
whole point.

## NEXT_PROMPT.md shape

```
AUTOPILOT — continue the <roadmap name> roadmap at .claude/state/ROADMAP.md, start <phase>
(Next item 1). Branch <branch>. Last commit Development v<X.Y> (<phase just done>), pushed.
Follow the roadmap's session protocol: read only the audit sections <phase> cites
(<section refs with line ranges>). Decide the file plan with decision-making; do not wait for a go.
```

Carry forward any state the next run must know (an unresolved Open item, a decision this run
made that the next phase depends on) as one extra line. Nothing else.

## Between phases

Claude cannot run `/clear`. The user runs `/clear`, then `/autopilot`; the skill reads
`NEXT_PROMPT.md` itself, so nothing needs pasting.
