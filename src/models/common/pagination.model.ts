import type { ISortState } from "./table.model";

export interface IPaginationRequest {
  pageNumber: number;
  pageSize: number;
  search?: string;
  sort?: ISortState;
}

export type IPageItem = number | "gap-start" | "gap-end";

export class IPaginationFormValue implements IPaginationRequest {
  pageNumber: number = 1;
  pageSize: number = 10;
  search?: string;

  constructor(values?: Partial<IPaginationRequest>) {
    Object.assign(this, values);
  }
}

export interface IPaginationResponse<T> {
  data: T[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
}

export const pageRange = (pagination: IPaginationRequest) => {
  const from = (pagination.pageNumber - 1) * pagination.pageSize;

  return { from, to: from + pagination.pageSize - 1 };
};

export const emptyPage = <T>(
  pagination: IPaginationRequest
): IPaginationResponse<T> => ({
  data: [],
  currentPage: pagination.pageNumber,
  pageSize: pagination.pageSize,
  totalCount: 0,
});

export const pageItems = (current: number, last: number): IPageItem[] => {
  const siblings = [current - 1, current, current + 1].filter(
    (page) => page > 1 && page < last
  );
  const first = siblings.at(0);
  const final = siblings.at(-1);
  const items: IPageItem[] = [1];

  if (first !== undefined && first > 2) items.push("gap-start");
  items.push(...siblings);
  if (final !== undefined && final < last - 1) items.push("gap-end");
  if (last > 1) items.push(last);

  return items;
};
