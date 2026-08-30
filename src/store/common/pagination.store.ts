import {
  IPaginationFormValue,
  type IPaginationRequest,
} from "../../models/common/pagination.model";
import { create } from "./reset.store";

type States = {
  pagination: Record<string, IPaginationRequest>;
};

type Actions = {
  setPagination: (key: string, patch: Partial<IPaginationRequest>) => void;
  resetPagination: (key: string) => void;
};

const initialValues: States = {
  pagination: {},
};

const defaultPagination = new IPaginationFormValue();

export const usePaginationStore = create<States & Actions>()((set) => ({
  ...initialValues,
  setPagination: (key, patch) =>
    set((state) => ({
      pagination: {
        ...state.pagination,
        [key]: { ...(state.pagination[key] ?? defaultPagination), ...patch },
      },
    })),
  resetPagination: (key) =>
    set((state) => ({
      pagination: { ...state.pagination, [key]: defaultPagination },
    })),
}));

export const selectPagination = (key: string) => (state: States) =>
  state.pagination[key] ?? defaultPagination;
