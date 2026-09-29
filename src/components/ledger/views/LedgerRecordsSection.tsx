import LedgerPartiesTable from "../tables/LedgerPartiesTable";
import LedgerRecordsTable from "../tables/LedgerRecordsTable";
import PayableRecordsTable from "../tables/PayableRecordsTable";
import type { LedgerScope } from "../../../hook/data/ledger/ledger.scope.hook";
import { useLedgerViewHook } from "../../../hook/data/ledger/ledger.view.hook";

type IProps = {
  scope: LedgerScope;
};

const LedgerRecordsSection = ({ scope }: IProps) => {
  const { view } = useLedgerViewHook(scope);

  if (view === "parties") return <LedgerPartiesTable scope={scope} />;

  return scope === "payables" ? (
    <PayableRecordsTable />
  ) : (
    <LedgerRecordsTable scope={scope} />
  );
};

export default LedgerRecordsSection;
