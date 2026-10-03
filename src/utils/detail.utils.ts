import type { ReactNode } from "react";

import type { IDetailItem, IDetailSection } from "../models/common/detail.model";

const emptyValuePlaceholder = "—";

export const isEmptyDetailValue = (value: ReactNode): boolean =>
  value === null ||
  value === undefined ||
  value === false ||
  (typeof value === "string" &&
    (value.trim() === "" || value.trim() === emptyValuePlaceholder));

export const joinDetailParts = (
  parts: readonly (string | null | undefined)[]
): string =>
  parts
    .filter((part) => !isEmptyDetailValue(part))
    .join(" · ");

export const keepTogether = (value: string): string => value.replace(/ /g, " ");

export const visibleDetailItems = <TRecord>(
  items: readonly IDetailItem<TRecord>[],
  record: TRecord
): IDetailItem<TRecord>[] =>
  items.filter(
    (item) => !item.hidden?.(record) && !isEmptyDetailValue(item.render(record))
  );

export const visibleDetailSections = <TRecord>(
  sections: readonly IDetailSection<TRecord>[],
  record: TRecord
): IDetailSection<TRecord>[] =>
  sections.filter((section) => visibleDetailItems(section.items, record).length > 0);
