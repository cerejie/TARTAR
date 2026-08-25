import type {
  ILedgerFilterScope,
  ILedgerFilters,
} from "../../models/common/filter.model";
import {
  selectFilters,
  useFilterStore,
} from "../../store/common/filter.store";

export const useLedgerFilters = (scope: ILedgerFilterScope = "page") => {
  const filters = useFilterStore(selectFilters(scope));
  const set = useFilterStore((state) => state.setFilters);
  const reset = useFilterStore((state) => state.resetFilters);

  return {
    filters,
    setFilters: (patch: Partial<ILedgerFilters>) => set(scope, patch),
    resetFilters: () => reset(scope),
  };
};
