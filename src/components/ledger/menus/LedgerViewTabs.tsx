import ContextSwitch from "../../common/view/ContextSwitch";
import { ledgerViewLabels, ledgerViewValues } from "../../../enums/ledger.enum";
import { useLedgerViewHook } from "../../../hook/data/ledger/ledger.view.hook";
import { segmentOptionsOf } from "../../../utils/segment.utils";

const LedgerViewTabs = () => {
  const { view, setView } = useLedgerViewHook();

  return (
    <ContextSwitch
      label="View"
      value={view}
      options={segmentOptionsOf(ledgerViewValues, ledgerViewLabels)}
      onChange={setView}
    />
  );
};

export default LedgerViewTabs;
