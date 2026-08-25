import type {
  ILedgerFilterScope,
  ILedgerFilters,
} from "../../models/common/filter.model";
import { create } from "./reset.store";

type States = {
  filters: Record<ILedgerFilterScope, ILedgerFilters>;
};

type Actions = {
  setFilters: (
    scope: ILedgerFilterScope,
    patch: Partial<ILedgerFilters>
  ) => void;
  resetFilters: (scope: ILedgerFilterScope) => void;
};

const initialValues: States = {
  filters: { page: {}, "customer-ledger": {} },
};

export const useFilterStore = create<States & Actions>()((set) => ({
  ...initialValues,
  setFilters: (scope, patch) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [scope]: { ...state.filters[scope], ...patch },
      },
    })),
  resetFilters: (scope) =>
    set((state) => ({ filters: { ...state.filters, [scope]: {} } })),
}));

export const selectFilters = (scope: ILedgerFilterScope) => (state: States) =>
  state.filters[scope];
