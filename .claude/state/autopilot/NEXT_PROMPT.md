AUTOPILOT — continue the Visual fixes roadmap at .claude/state/ROADMAP.md, start V7 Ledger modals
(Next item 1). Branch mobilel-app-native. Last commit Development v2.62 (V6 reports), pushed.
Follow the roadmap's session protocol: read only the audit findings V7 cites (.claude/state/AUDIT-VISUAL-2026-10-03.md
§ [UI-14] line 224, [UI-15] 229, [UI-16]; grep each heading for its range). Decide the file plan with decision-making; do not wait for a go.
Close the phase with the protocol's step 5 visual check (ROLES=admin DEVICES=desk,phone; to keep it short, point the sweep at a temporary copy of sweep.config.json in the OUT folder listing only /receivables; run it with Bash run_in_background and timeout 3600000, then wait with an until-loop on an EXIT marker — the V6 one-route sweep took about 3 minutes; the sweep launches Chrome with channel "chrome"). `yarn build` rewrites the tracked tsconfig.app.tsbuildinfo — restore it with git checkout, do not commit it.
