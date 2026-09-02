import type { ReactNode } from "react";

export interface IDetailItem<TRecord> {
  key: string;
  label: string;
  render: (record: TRecord) => ReactNode;
  span?: number;
}

export interface IDetailSection<TRecord> {
  key: string;
  title: string;
  icon?: ReactNode;
  items: IDetailItem<TRecord>[];
}
