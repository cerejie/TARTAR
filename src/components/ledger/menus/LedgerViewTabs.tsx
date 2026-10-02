import ContextSwitch from "../../common/view/ContextSwitch";
import { ledgerViewValues } from "../../../enums/ledger.enum";
import type { LedgerScope } from "../../../hook/data/ledger/ledger.scope.hook";
import { useLedgerViewHook } from "../../../hook/data/ledger/ledger.view.hook";
import { segmentOptionsOf } from "../../../utils/segment.utils";

type IProps = {
  scope: LedgerScope;
};

const LedgerViewTabs = ({ scope }: IProps) => {
  const { view, setView, labels } = useLedgerViewHook(scope);

  return (
    <ContextSwitch
      label="View"
      value={view}
      options={segmentOptionsOf(ledgerViewValues, labels)}
      onChange={setView}
    />
  );
};

export default LedgerViewTabs;
