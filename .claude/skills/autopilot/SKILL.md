---
name: autopilot
description: "Hands-off roadmap runner that stands in for the user. /autopilot runs every remaining roadmap phase back to back: each phase goes to a fresh worker sub-agent (a clean context, the equivalent of /clear), which decides with the decision-making skill, gates on yarn build + yarn lint, commits in house style and pushes the current branch; the conductor then starts the next phase. Stops when the roadmap is complete or a worker hard-stops. Use only when the user types /autopilot or the prompt starts with 'AUTOPILOT'. Never auto-invoke on an ordinary prompt."
---

# /autopilot — the user's stand-in for the whole roadmap

Invoking this skill is the user's **standing authorization** to decide, commit and push on the
current branch without asking, phase after phase, and to spawn one worker sub-agent per phase.
It overrides, for this run only: the roadmap's "present the plan and WAIT for the user's go" and
"ONE phase per conversation, then tell the user to open a new one", the `commit` skill's "never
commit / never push unless asked", CLAUDE.md's "always suggest; never commit", and the `build`
skill's "do not spawn sub-agents" (for the conductor only). Every other rule in CLAUDE.md still
binds.

State lives in `.claude/state/autopilot/`:

| File | Purpose |
|---|---|
| `NEXT_PROMPT.md` | The prompt the next worker starts from. Rewritten by every worker. |
| `LOG.md` | One entry per phase: decisions taken, commit, push result. Append only. |
| `STOP` | Exists = autopilot refuses to run. Holds the reason. Only the user deletes it. |

Two roles. The session the user typed `/autopilot` in is the **conductor**. Each phase runs in a
**worker** — a sub-agent the conductor spawns, starting from a clean context.

## Conductor — the session that received /autopilot

The conductor never implements, plans or reads source itself. Its context holds only the worker
reports, so it stays small however many phases run.

1. **Check.** If `.claude/state/autopilot/STOP` exists, report its reason and end. Run
   `git rev-parse --abbrev-ref HEAD`; on `main`/`master`, write `STOP` and end.
2. **Dispatch.** Spawn one worker with the `Agent` tool: `subagent_type: "general-purpose"`,
   `run_in_background: false`, description `Autopilot phase <n>`, and this prompt:

   > AUTOPILOT WORKER. Read `.claude/skills/autopilot/SKILL.md` and run its **Worker** section
   > exactly once, starting from `.claude/state/autopilot/NEXT_PROMPT.md`. You are the user's
   > stand-in: decide, commit and push without asking. Load skills with the Skill tool; if it is
   > unavailable, read `.claude/skills/<name>/SKILL.md` directly. Your final message is your
   > report to the conductor, in the Worker report shape.

3. **Confirm.** When the worker returns, check the result, not the claim:
   `git status --short`, `git log --oneline -1`, `git status -sb` (no `ahead`). If the worker
   reported a commit that is not there, the tree is dirty without a `STOP`, or the push did not
   land, write `STOP` with what you saw and end.
4. **Next.** Print one line: `<phase> → Development v<X.Y>, pushed`. If `STOP` now exists, end.
   Otherwise go back to step 1 for the next phase.
5. **Cap.** At most 12 workers per conductor run; at the cap, end with the next phase named.

End the run with: a table of phases run (phase, version, one-line summary), the `STOP` reason
(roadmap complete, or the blocker and what the user must decide), and "visuals unconfirmed —
check on a phone".

## Worker — one phase, in order, no skipping

1. **Orient.** Read `.claude/state/ROADMAP.md` (it is the resume point; do not re-explore) and
   `.claude/state/autopilot/NEXT_PROMPT.md`. Run `git status --short` and
   `git rev-parse --abbrev-ref HEAD`. If `STOP` exists, report its reason and end.
2. **Guard.** Hard-stop (step 9) if the branch is `main`/`master`, if the roadmap has no `Next`
   item, or if `Next` item 1 is a merge, a production deploy, or a step that needs a physical
   device.
3. **Settle leftovers.** If the tree is dirty before any work, it is the previous run's or the
   user's uncommitted work: verify (`yarn build`, `yarn lint`), commit it as its own version
   (step 7), push, then continue.
4. **Plan.** Follow the roadmap's session protocol for `Next` item 1: load `build` (and
   `tartar-shadcn` + `shadcn` docs for UI), read only the sections the phase cites, write the
   file plan down before implementing.
5. **Decide instead of asking.** Run the `decision-making` skill on the file plan, and again on
   every point where you would otherwise ask the user — a design choice, an ambiguity, a
   trade-off. Decide as the user, from memory, the roadmap's locked decisions and CLAUDE.md.
   Tier it by Step 0 of that skill; most code choices are Simple. Never print the role
   transcript. Record each verdict as one line in `LOG.md`: `- <question> → <pick> (<reason>)`.
   Never call `AskUserQuestion`. **Never decide these — hard-stop instead (step 9):**
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
8. **Push and hand off.** Rewrite `NEXT_PROMPT.md` (shape below) and append the phase's
   `LOG.md` entry *before* committing, so both ride in the phase commit. `git push origin HEAD`.
   A rejected push is a hard-stop — never force, never pull-rebase on your own. If the roadmap
   is now finished, write `STOP` with `roadmap complete` instead of a next prompt, and commit it.
9. **Hard-stop.** Write `STOP` with one paragraph: what blocked, what was done, what the user
   must decide. Commit and push only work that is already build- and lint-clean; leave the rest
   uncommitted.

One phase per worker. Never start a second phase — the conductor spawns a fresh worker for it.

### Worker report — the final message, at most 8 lines

```
Phase: <phase>
Commit: Development v<X.Y> (<short hash>) | none
Push: ok | rejected | skipped
STOP: none | <reason>
Summary: <one or two lines of what changed>
Decisions: <count> logged in LOG.md
```

## NEXT_PROMPT.md shape

```
AUTOPILOT — continue the <roadmap name> roadmap at .claude/state/ROADMAP.md, start <phase>
(Next item 1). Branch <branch>. Last commit Development v<X.Y> (<phase just done>), pushed.
Follow the roadmap's session protocol: read only the audit sections <phase> cites
(<section refs with line ranges>). Decide the file plan with decision-making; do not wait for a go.
```

Carry forward any state the next worker must know (an unresolved Open item, a decision this
phase made that the next one depends on) as one extra line. Nothing else.
