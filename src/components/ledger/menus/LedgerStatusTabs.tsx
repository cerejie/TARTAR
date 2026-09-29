import StatusFilterTabs from "../../common/filter/StatusFilterTabs";
import {
  ledgerStatusFilterLabels,
  ledgerStatusFilterValues,
  payableStatusLabels,
  payableStatusValues,
} from "../../../enums/ledger.enum";
import { useFilterField } from "../../../hook/common/filter.hook";
import type { LedgerScope } from "../../../hook/data/ledger/ledger.scope.hook";
import { useLedgerViewHook } from "../../../hook/data/ledger/ledger.view.hook";
import { ledgerPaginationKey } from "../../../keys/table.keys";
import { ledgerFilterScopeOf } from "../../../utils/filter.utils";

type IProps = {
  scope: LedgerScope;
};

const LedgerStatusTabs = ({ scope }: IProps) => {
  const { view } = useLedgerViewHook(scope);
  const { value, changeValue } = useFilterField(
    ledgerFilterScopeOf(scope),
    "status",
    ledgerPaginationKey(scope)
  );

  if (view === "parties") return null;

  if (scope === "payables")
    return (
      <StatusFilterTabs
        value={payableStatusValues.find((status) => status === value)}
        values={payableStatusValues}
        labels={payableStatusLabels}
        onChange={changeValue}
      />
    );

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
