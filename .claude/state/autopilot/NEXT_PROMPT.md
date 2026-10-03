AUTOPILOT — continue the Audit fixes roadmap at .claude/state/ROADMAP.md, start F5 Failure experience
(Next item 1). Branch mobile-app-native-newlook. Last commit Development v2.48 (F4 Client security hardening), pushed.
Follow the roadmap's session protocol: read only the audit sections F5 cites
(.claude/state/AUDIT-2026-10-03.md § QA-03 lines 120-124, § UX-01 and UX-03 inside lines 158-168). Decide the file plan with decision-making; do not wait for a go.
F4 shipped the CSP as report-only in vercel.json; nothing in F5 depends on it. F5's error copy must not invent business rules — map known server error codes to plain wording only.
