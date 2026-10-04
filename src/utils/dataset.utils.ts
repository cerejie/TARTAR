import dayjs from "dayjs";
import { dueSoonDays } from "../enums/ledger.enum";
import { pageRange } from "../models/common/pagination.model";
import { defaultFilterColumns } from "./filter.utils";
import type {
  IFilterColumns,
  ILedgerFilters,
} from "../models/common/filter.model";
import type {
  IPaginationRequest,
  IPaginationResponse,
} from "../models/common/pagination.model";
import type {
  IOfflineDerive,
  IQueryFetcher,
  IQueryReader,
} from "../models/common/query.model";
import type { ISortState } from "../models/common/table.model";
import type { ILedgerPartyKey } from "../models/data/ledger/ledger.response";

export interface IDatasetSource {
  key: string;
  filters: ILedgerFilters;
}

type IRowMatcher<Row> = (row: Row) => boolean;

const dateFields: readonly (keyof ILedgerFilters)[] = ["dateFrom", "dateTo"];

const allBranchesDataset: ILedgerFilters = {};

const fieldOf = (row: object, column: string): unknown =>
  (row as Record<string, unknown>)[column];

const isMissing = (value: unknown): value is null | undefined =>
  value === null || value === undefined;

const containsText = (value: unknown, term: string): boolean =>
  !isMissing(value) && String(value).toLowerCase().includes(term.toLowerCase());

const isEqualWhenSet = (value: unknown, expected: unknown): boolean =>
  expected === undefined || expected === "" || value === expected;

const isInDateRange = (value: unknown, filters: ILedgerFilters): boolean => {
  if (!filters.dateFrom && !filters.dateTo) return true;
  if (isMissing(value)) return false;

  const date = String(value);
  const fromOk = !filters.dateFrom || date >= filters.dateFrom;
  const toOk = !filters.dateTo || date <= filters.dateTo;

  return fromOk && toOk;
};

const isInAmountRange = (value: unknown, filters: ILedgerFilters): boolean => {
  const amount = Number(value);
  const minOk = filters.amountMin == null || amount >= filters.amountMin;
  const maxOk = filters.amountMax == null || amount <= filters.amountMax;

  return minOk && maxOk;
};

export const datasetSourcesOf = (
  keyOf: (filters: ILedgerFilters) => string,
  candidates: readonly ILedgerFilters[]
): IDatasetSource[] => {
  const sources = [...candidates, allBranchesDataset].map((filters) => ({
    key: keyOf(filters),
    filters,
  }));

  return sources.filter(
    (source, index) =>
      sources.findIndex((candidate) => candidate.key === source.key) === index
  );
};

export const datasetFiltersOf = (filters: ILedgerFilters): ILedgerFilters =>
  filters.branch ? { branch: filters.branch } : {};

export const coversFilters = (
  dataset: ILedgerFilters,
  request: ILedgerFilters
): boolean => {
  const { dateFrom, dateTo } = dataset;
  const fieldNames = Object.keys(dataset) as (keyof ILedgerFilters)[];
  const fieldsMatch = fieldNames
    .filter((field) => !dateFields.includes(field))
    .every(
      (field) => dataset[field] === undefined || request[field] === dataset[field]
    );
  const isDated = !!dateFrom || !!dateTo;
  const basisMatches = !isDated || request.dateBasis === dataset.dateBasis;
  const fromOk = !dateFrom || (!!request.dateFrom && request.dateFrom >= dateFrom);
  const toOk = !dateTo || (!!request.dateTo && request.dateTo <= dateTo);

  return fieldsMatch && basisMatches && fromOk && toOk;
};

export const matchesLedgerFilters = (
  row: object,
  filters: ILedgerFilters,
  columns: IFilterColumns = defaultFilterColumns
): boolean =>
  isEqualWhenSet(fieldOf(row, "branch"), filters.branch) &&
  isEqualWhenSet(fieldOf(row, "farm_section"), filters.farmSection) &&
  isEqualWhenSet(fieldOf(row, "customer_id"), filters.customerId) &&
  isEqualWhenSet(fieldOf(row, "supplier_id"), filters.supplierId) &&
  (!columns.type || isEqualWhenSet(fieldOf(row, columns.type), filters.type)) &&
  (!filters.referenceNumber ||
    containsText(fieldOf(row, "reference_number"), filters.referenceNumber)) &&
  (!columns.search ||
    !filters.search ||
    containsText(fieldOf(row, columns.search), filters.search)) &&
  isInDateRange(fieldOf(row, columns.date), filters) &&
  (!columns.amount || isInAmountRange(fieldOf(row, columns.amount), filters));

export const matchesParty = (
  row: object,
  idColumn: string,
  nameColumn: string,
  party: ILedgerPartyKey
): boolean =>
  party.partyId
    ? fieldOf(row, idColumn) === party.partyId
    : isMissing(fieldOf(row, idColumn)) &&
      fieldOf(row, nameColumn) === party.partyName;

export const matchesLedgerStatus = (
  row: { status: string; due_date: string | null },
  status: ILedgerFilters["status"],
  today: string
): boolean => {
  if (!status) return true;

  const isUnpaid = row.status !== "paid";
  if (status === "unpaid") return isUnpaid;

  const dueSoonLimit = dayjs(today).add(dueSoonDays, "day").format("YYYY-MM-DD");
  const due = row.due_date;
  const isOpenDue = isUnpaid && due !== null;

  if (status === "overdue") return isOpenDue && due < today;
  if (status === "upcoming") return isOpenDue && due > dueSoonLimit;
  if (status === "due_soon")
    return isOpenDue && due >= today && due <= dueSoonLimit;

  return row.status === status;
};

export const isWithinDays = (
  timestamp: string | null | undefined,
  dateFrom: string | undefined,
  dateTo: string | undefined
): boolean => {
  if (!dateFrom && !dateTo) return true;
  if (!timestamp) return false;

  const moment = dayjs(timestamp);
  const fromOk = !dateFrom || !moment.isBefore(dayjs(dateFrom).startOf("day"));
  const toOk = !dateTo || !moment.isAfter(dayjs(dateTo).endOf("day"));

  return fromOk && toOk;
};

const ascendingOf = (first: unknown, second: unknown): number => {
  if (isMissing(first) || isMissing(second))
    return Number(isMissing(first)) - Number(isMissing(second));
  if (typeof first === "number" && typeof second === "number")
    return first - second;

  const firstText = String(first);
  const secondText = String(second);
  if (firstText === secondText) return 0;

  return firstText < secondText ? -1 : 1;
};

export const sortRowsBy = <Row extends object>(
  rows: readonly Row[],
  sort: ISortState
): Row[] => {
  const direction = sort.direction === "ascending" ? 1 : -1;

  return [...rows].sort(
    (first, second) =>
      direction *
        ascendingOf(fieldOf(first, sort.column), fieldOf(second, sort.column)) ||
      ascendingOf(fieldOf(second, "created_at"), fieldOf(first, "created_at"))
  );
};

export const pageOfRows = <Row>(
  rows: readonly Row[],
  pagination: IPaginationRequest
): IPaginationResponse<Row> => {
  const { from, to } = pageRange(pagination);

  return {
    data: rows.slice(from, to + 1),
    currentPage: pagination.pageNumber,
    pageSize: pagination.pageSize,
    totalCount: rows.length,
  };
};

export const datasetRowsOf = <Row>(
  read: IQueryReader,
  sources: readonly IDatasetSource[],
  request: ILedgerFilters
): Row[] | undefined => {
  const source = sources.find(
    (candidate) =>
      coversFilters(candidate.filters, request) &&
      Array.isArray(read(candidate.key))
  );

  return source ? (read(source.key) as Row[]) : undefined;
};

export const derivedRows =
  <Row>(
    sources: readonly IDatasetSource[],
    request: ILedgerFilters,
    matches: IRowMatcher<Row>
  ): IOfflineDerive<Row[]> =>
  (read) =>
    datasetRowsOf<Row>(read, sources, request)?.filter(matches);

export const derivedPage =
  <Row extends object>(
    sources: readonly IDatasetSource[],
    request: ILedgerFilters,
    matches: IRowMatcher<Row>,
    sort: ISortState | undefined,
    pagination: IPaginationRequest
  ): IOfflineDerive<IPaginationResponse<Row>> =>
  (read) => {
    const rows = derivedRows(sources, request, matches)(read);
    if (!rows) return undefined;

    return pageOfRows(sort ? sortRowsBy(rows, sort) : rows, pagination);
  };

export const withOfflineDerive = <T>(
  fetcher: () => Promise<T>,
  offline: IOfflineDerive<T>
): IQueryFetcher<T> => Object.assign(fetcher, { offline });
