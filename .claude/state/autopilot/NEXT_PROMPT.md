AUTOPILOT — continue the Collection removal, print fixes, offline completeness roadmap at .claude/state/ROADMAP.md,
start M2 Receivables / Payables Payments tab (Next item 1). Branch mobilel-app-native. Last commit Development v2.74 (M1 Mobile list rows instead of cards), pushed.
Follow the roadmap's session protocol: read only the paths M2 cites (Phases § M2: components/ledger/** tab definitions, LedgerRecordsTable.tsx, PayableRecordsTable.tsx, LedgerPaymentsTable.tsx, LedgerPartiesTable.tsx, hook/data/ledger/*.list.hook.ts, the tab enum, hook/app/prime.view.hook.ts).
Decide the file plan with decision-making; do not wait for a go.
M1 renamed DataTableCards → DataTableList and removed the `cardGrid` prop; mobile rows show no meta labels, so date metas need a `cardPrefix` to stay readable.
