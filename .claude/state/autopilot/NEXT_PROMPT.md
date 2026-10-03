AUTOPILOT — continue the Audit fixes roadmap at .claude/state/ROADMAP.md, start F2 Refetch scope + cache bound
(Next item 1). Branch mobile-app-native-newlook. Last commit Development v2.45 (F1 Query ordering), pushed.
Follow the roadmap's session protocol: read only the audit sections F2 cites
(.claude/state/AUDIT-2026-10-03.md § PERF-01, PERF-02, lines 127-141). Decide the file plan with decision-making; do not wait for a go.
F1 left query.store.ts with `start` (always a new request) and `run` (joins the in-flight one), both tracked in the module `requests` map; F2 must keep `invalidate` / `refetchAll` on `start` and prune `fetchers` without touching that ordering.
