AUTOPILOT — continue the Visual fixes roadmap at .claude/state/ROADMAP.md, start V8 Full re-sweep
(Next item 1). Branch mobilel-app-native. Last commit Development v2.63 (V7 ledger modals), pushed.
Follow the roadmap's session protocol: V8 changes no source — it runs the full sweep and reads the sheets; read only the audit
headings (.claude/state/AUDIT-VISUAL-2026-10-03.md § [UI-01] … [UI-17], lines 85-240; grep each heading for its range) to know what must be gone. Decide with decision-making; do not wait for a go.
Run the sweep with no ROLES / DEVICES filter and OUT=C:/Users/CER/AppData/Local/Temp/tartar-sweep-final, Bash run_in_background with timeout 7200000, then wait with an until-loop on an EXIT marker (the V7 two-route, two-device sweep took about 4 minutes; expect over an hour). sweep.mjs now waits `route.settle ?? 1500` after a tab click, so Reports tabs should be loaded. `yarn build` rewrites the tracked tsconfig.app.tsbuildinfo — restore it with git checkout, do not commit it.
A new defect found in V8 becomes a new phase before it in the roadmap (not a silent fix); if none, the roadmap's next item is USER DECISIONS — a hard-stop, so write STOP.
