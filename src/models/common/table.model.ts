import type { ReactNode } from "react";

export type IColumnAlign = "left" | "center" | "right";

export type IColumnSkeleton = "text" | "avatar";

export type IColumnMobileRole =
  | "title"
  | "subtitle"
  | "amount"
  | "status"
  | "meta"
  | "actions"
  | "hidden";

export type IColumnCollapse = "xl" | "2xl";

export type ISortDirection = "ascending" | "descending";

export interface ISortState {
  column: string;
  direction: ISortDirection;
}

export interface IDataTableColumn<T> {
  key?: string;
  title?: ReactNode;
  dataIndex?: keyof T & string;
  align?: IColumnAlign;
  width?: number | string;
  className?: string;
  skeleton?: IColumnSkeleton;
  mobile?: IColumnMobileRole;
  cardPrefix?: string;
  collapse?: IColumnCollapse;
  sorter?: (left: T, right: T) => number;
  render?(value: unknown, row: T, index: number): ReactNode;
  listHidden?: boolean;
  listRender?(row: T): ReactNode;
}

export interface ICardField {
  id: string;
  title: ReactNode;
  content: ReactNode;
}

export interface ICardFields {
  titles: ICardField[];
  subtitles: ICardField[];
  amounts: ICardField[];
  statuses: ICardField[];
  metas: ICardField[];
  actions: ICardField[];
}

export interface IDataTableSelection<T> {
  selectedRowKeys: readonly string[];
  onChange: (keys: string[]) => void;
  getCheckboxProps?: (row: T) => { disabled?: boolean };
}

export interface ISortOption extends ISortState {
  key: string;
  label: string;
}

export const filteredEmptyHint = "Clear a filter or change the period to see more.";

export const searchEmptyHint = "Check the spelling or clear the search.";

export const firstRecordHint = "Add the first one and it will be available in every form that uses it.";
