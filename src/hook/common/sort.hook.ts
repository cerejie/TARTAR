import { useMemo } from "react";
import type { ISortState } from "../../models/common/table.model";
import { selectSort, useSortStore } from "../../store/common/sort.store";

export const useSort = (key: string) => {
  const sort = useSortStore(selectSort(key));
  const setSortAt = useSortStore((state) => state.setSort);

  return useMemo(
    () => ({
      sort,
      setSort: (next: ISortState | null) => setSortAt(key, next),
    }),
    [sort, key, setSortAt]
  );
};
