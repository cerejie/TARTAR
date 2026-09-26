import { ledgerViewValues, type LedgerView } from "../../../enums/ledger.enum";
import { useSearchParam } from "../../common/search.param.hook";
import type { LedgerScope } from "./ledger.scope.hook";

export const useLedgerViewHook = (scope: LedgerScope) => {
  const { value: view, setValue: setView } = useSearchParam<LedgerView>(
    "view",
    ledgerViewValues,
    "records"
  );

  const labels: Record<LedgerView, string> = {
    records: "Records",
    parties: scope === "receivables" ? "By customer" : "By supplier",
  };

  return { view, setView, labels };
};
