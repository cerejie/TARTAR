import LedgerPartiesTable from "../tables/LedgerPartiesTable";
import LedgerRecordsTable from "../tables/LedgerRecordsTable";
import type { LedgerScope } from "../../../hook/data/ledger/ledger.scope.hook";
import { useLedgerViewHook } from "../../../hook/data/ledger/ledger.view.hook";

type IProps = {
  scope: LedgerScope;
};

const LedgerRecordsSection = ({ scope }: IProps) => {
  const { view } = useLedgerViewHook(scope);

  return view === "parties" ? (
    <LedgerPartiesTable scope={scope} />
  ) : (
    <LedgerRecordsTable scope={scope} />
  );
};

export default LedgerRecordsSection;
