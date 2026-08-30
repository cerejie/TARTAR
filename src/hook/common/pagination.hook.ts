import { useMemo } from "react";
import type { IPaginationRequest } from "../../models/common/pagination.model";
import {
  selectPagination,
  usePaginationStore,
} from "../../store/common/pagination.store";

export const usePagination = (key: string) => {
  const pagination = usePaginationStore(selectPagination(key));
  const setPaginationAt = usePaginationStore((state) => state.setPagination);
  const resetPaginationAt = usePaginationStore(
    (state) => state.resetPagination
  );

  return useMemo(
    () => ({
      pagination,
      setPagination: (patch: Partial<IPaginationRequest>) =>
        setPaginationAt(key, patch),
      goToPage: (pageNumber: number, pageSize: number) =>
        setPaginationAt(key, { pageNumber, pageSize }),
      resetPagination: () => resetPaginationAt(key),
    }),
    [pagination, key, setPaginationAt, resetPaginationAt]
  );
};
