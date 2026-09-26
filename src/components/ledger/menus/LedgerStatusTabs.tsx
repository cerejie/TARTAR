import StatusFilterTabs from "../../common/filter/StatusFilterTabs";
import {
  ledgerStatusFilterLabels,
  ledgerStatusFilterValues,
} from "../../../enums/ledger.enum";
import { useFilterField } from "../../../hook/common/filter.hook";
import type { LedgerScope } from "../../../hook/data/ledger/ledger.scope.hook";
import { useLedgerViewHook } from "../../../hook/data/ledger/ledger.view.hook";
import { ledgerPaginationKey } from "../../../keys/table.keys";

type IProps = {
  scope: LedgerScope;
};

const LedgerStatusTabs = ({ scope }: IProps) => {
  const { view } = useLedgerViewHook(scope);
  const { value, changeValue } = useFilterField(
    "ledger",
    "status",
    ledgerPaginationKey(scope)
  );

  if (view === "parties") return null;

  return (
    <StatusFilterTabs
      value={ledgerStatusFilterValues.find((status) => status === value)}
      values={ledgerStatusFilterValues}
      labels={ledgerStatusFilterLabels}
      onChange={changeValue}
    />
  );
};

export default LedgerStatusTabs;
