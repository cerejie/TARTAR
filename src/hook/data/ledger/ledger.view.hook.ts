import { ledgerViewValues, type LedgerView } from "../../../enums/ledger.enum";
import { useSearchParam } from "../../common/search.param.hook";

export const useLedgerViewHook = () => {
  const { value: view, setValue: setView } = useSearchParam<LedgerView>(
    "view",
    ledgerViewValues,
    "records"
  );

  return { view, setView };
};
