import ViewSwitch from "../../common/view/ViewSwitch";
import { ledgerViewValues } from "../../../enums/ledger.enum";
import type { LedgerScope } from "../../../hook/data/ledger/ledger.scope.hook";
import { useLedgerViewHook } from "../../../hook/data/ledger/ledger.view.hook";

type IProps = {
  scope: LedgerScope;
};

const LedgerViewTabs = ({ scope }: IProps) => {
  const { view, setView, labels } = useLedgerViewHook(scope);

  return (
    <ViewSwitch
      value={view}
      values={ledgerViewValues}
      labels={labels}
      onChange={setView}
    />
  );
};

export default LedgerViewTabs;
