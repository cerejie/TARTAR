export interface IPaginationRequest {
  pageNumber: number;
  pageSize: number;
  search?: string;
}

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
