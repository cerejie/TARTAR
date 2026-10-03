AUTOPILOT — continue the Audit fixes roadmap at .claude/state/ROADMAP.md, start F4 Client security hardening
(Next item 1). Branch mobile-app-native-newlook. Last commit Development v2.47 (F3 Complete reads), pushed.
Follow the roadmap's session protocol: read only the audit sections F4 cites
(.claude/state/AUDIT-2026-10-03.md § SEC-01 lines 28-49, § SEC-03 lines 86-94, § SEC-04 lines 95-98). Decide the file plan with decision-making; do not wait for a go.
F3 added src/utils/page.utils.ts (`everyRow`, `everyRowIn`) and every aggregate / report read now goes through it; F4's `ilike` escaping belongs in utils/filter.utils.ts `applyLedgerFilters` and must not change the `search` filter field or the query keys.
