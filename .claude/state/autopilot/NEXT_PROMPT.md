AUTOPILOT — continue the Audit fixes roadmap at .claude/state/ROADMAP.md, start F3 Complete reads
(Next item 1). Branch mobile-app-native-newlook. Last commit Development v2.46 (F2 Refetch scope + cache bound), pushed.
Follow the roadmap's session protocol: read only the audit sections F3 cites
(.claude/state/AUDIT-2026-10-03.md § DATA-01, lines 50-70). Decide the file plan with decision-making; do not wait for a go.
F2 left query.store.ts refetching only watched + primed keys and never persisting keys whose filter JSON carries a non-empty `"search"`; F3 changes services only and must not rename the `search` filter field or the query keys.
