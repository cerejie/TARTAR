import type { ReactNode } from "react";

export interface IDetailItem<TRecord> {
  key: string;
  label: string;
  render: (record: TRecord) => ReactNode;
  span?: number;
}
