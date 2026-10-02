import type {
  ILedgerFilterScope,
  ILedgerFilters,
} from "../../models/common/filter.model";
import {
  defaultFiltersOf,
  selectFilters,
  useFilterStore,
} from "../../store/common/filter.store";
import { usePagination } from "./pagination.hook";

export const useLedgerFilters = (scope: ILedgerFilterScope = "page") => {
  const filters = useFilterStore(selectFilters(scope));
  const set = useFilterStore((state) => state.setFilters);
  const reset = useFilterStore((state) => state.resetFilters);

  return {
    filters,
    defaults: defaultFiltersOf(scope),
    setFilters: (patch: Partial<ILedgerFilters>) => set(scope, patch),
    resetFilters: () => reset(scope),
  };
};

export const useFilterField = <K extends keyof ILedgerFilters>(
  scope: ILedgerFilterScope,
  field: K,
  paginationKey: string
) => {
  const { filters, setFilters } = useLedgerFilters(scope);
  const { setPagination } = usePagination(paginationKey);

  const changeValue = (value: ILedgerFilters[K]) => {
    const patch: Partial<ILedgerFilters> = {};
    patch[field] = value;
    setFilters(patch);
    setPagination({ pageNumber: 1 });
  };

  return { value: filters[field], changeValue };
};
