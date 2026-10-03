AUTOPILOT — continue the Audit fixes roadmap at .claude/state/ROADMAP.md, start F8 Unit tests
(Next item 1). Branch mobile-app-native-newlook. Last commit Development v2.51 (F7 Master Data search), pushed.
Follow the roadmap's session protocol: read only the audit sections F8 cites
(.claude/state/AUDIT-2026-10-03.md § TEST-01 lines 151-156). Decide the file plan with decision-making; do not wait for a go.
F8 adds vitest as a devDependency (locked decision; yarn only) and a `yarn test` script; pure utils only. F7 added `src/utils/search.utils.ts` (`matchingRows`, `newestFirst`) — pure, a cheap extra test target.
