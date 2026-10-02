import type { ReactNode } from "react";

export interface IDetailItem<TRecord> {
  key: string;
  label: string;
  render: (record: TRecord) => ReactNode;
  span?: number;
  hidden?: (record: TRecord) => boolean;
}

export type IDetailDisclosure = "expanded" | "collapsed";

export interface IDetailSection<TRecord> {
  key: string;
  title: string;
  icon?: ReactNode;
  disclosure?: IDetailDisclosure;
  items: IDetailItem<TRecord>[];
}
