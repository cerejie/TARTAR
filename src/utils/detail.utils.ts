import type { IDetailItem, IDetailSection } from "../models/common/detail.model";

export const visibleDetailItems = <TRecord>(
  items: readonly IDetailItem<TRecord>[],
  record: TRecord
): IDetailItem<TRecord>[] => items.filter((item) => !item.hidden?.(record));

export const visibleDetailSections = <TRecord>(
  sections: readonly IDetailSection<TRecord>[],
  record: TRecord
): IDetailSection<TRecord>[] =>
  sections.filter((section) => visibleDetailItems(section.items, record).length > 0);
