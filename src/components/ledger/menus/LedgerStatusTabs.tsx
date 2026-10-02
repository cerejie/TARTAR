import ContextSwitch from "../../common/view/ContextSwitch";
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
import {
  allSegmentKey,
  statusOfSegment,
  statusSegmentOptionsOf,
} from "../../../utils/segment.utils";

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
      <ContextSwitch
        label="Status"
        value={payableStatusValues.find((status) => status === value) ?? allSegmentKey}
        options={statusSegmentOptionsOf(payableStatusValues, payableStatusLabels)}
        onChange={(key) => changeValue(statusOfSegment(key, payableStatusValues))}
      />
    );

  return (
    <ContextSwitch
      label="Status"
      value={ledgerStatusFilterValues.find((status) => status === value) ?? allSegmentKey}
      options={statusSegmentOptionsOf(ledgerStatusFilterValues, ledgerStatusFilterLabels)}
      onChange={(key) => changeValue(statusOfSegment(key, ledgerStatusFilterValues))}
    />
  );
};

export default LedgerStatusTabs;
