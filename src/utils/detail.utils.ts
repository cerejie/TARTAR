import type { IDetailItem } from "../models/common/detail.model";

export const visibleDetailItems = <TRecord>(
  items: readonly IDetailItem<TRecord>[],
  record: TRecord
): IDetailItem<TRecord>[] => items.filter((item) => !item.hidden?.(record));
