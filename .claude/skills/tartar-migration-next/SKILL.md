---
name: tartar-migration-next
description: Resume the TARTAR antd + vanilla-extract -> Tailwind v4 + shadcn (aria-vega) migration. Load automatically when a conversation opens with "continue", "next", "next phase", "resume", "go", "continue the migration" or "what's left of the migration", or whenever .claude/state/ROADMAP.md exists at session start. It runs exactly one phase per conversation from the roadmap, then closes the phase and hands off to a new conversation.
---

# TARTAR migration — next phase

1. Read `.claude/state/ROADMAP.md` first, by itself. If it is missing, the migration is
   complete — say so in one line and load `build` for any new work.
2. `git status --short`. Nothing else to re-derive: trust the roadmap's Path map and never
   re-ask a question under *Decisions locked*.
3. State in one line which phase you are starting, then run it through the `build` skill
   (plan already approved — skip steps 3–4 unless the phase raises a new *Must ask* decision).
   For any UI in the phase, load `tartar-shadcn` and `shadcn` too.
4. Work only that phase. Stop at its end even if context remains.
5. Close the phase:
   - `yarn build` and `yarn lint` clean.
   - Update the roadmap: tick *Done* with the paths touched, rewrite *Next* so item 1 is the
     next phase, add new paths to *Path map*, refresh *State*.
   - Report as **compiled**, list the screens the user must click through.
   - Suggest the commit (`commit` skill, suggest mode): `Development v<X.Y>` with the version
     +0.1 on the last `Development v` commit, description `<Prefix>: <Title>`.
   - Tell the user to open a new conversation and type "continue".
6. After the final phase, delete `.claude/state/ROADMAP.md` and `.claude/skills/tartar-migration-next/`
   (ask first for the skill folder).
