import { useMemo } from "react";
import type { ISortOption, ISortState } from "../../models/common/table.model";
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

export const useSortOption = (
  key: string,
  options: readonly ISortOption[],
  onChange: () => void
) => {
  const { sort, setSort } = useSort(key);

  const sortOption =
    options.find(
      (option) =>
        option.column === sort?.column && option.direction === sort.direction
    ) ?? options.at(0);

  const changeSort = (optionKey: string) => {
    const option = options.find((item) => item.key === optionKey);
    if (!option) return;
    setSort({ column: option.column, direction: option.direction });
    onChange();
  };

  return {
    sortOption,
    sortKey: sortOption?.key ?? "",
    sortOptions: options,
    changeSort,
  };
};
