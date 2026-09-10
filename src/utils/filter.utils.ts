import type {
  IFilterColumns,
  ILedgerFilters,
} from "../models/common/filter.model";
import { formatDate, todayIso } from "./format.utils";

interface IChainable {
  eq: (column: string, value: unknown) => unknown;
  gte: (column: string, value: unknown) => unknown;
  lte: (column: string, value: unknown) => unknown;
  ilike: (column: string, value: string) => unknown;
}

interface IStatusChainable {
  eq: (column: string, value: unknown) => unknown;
  neq: (column: string, value: unknown) => unknown;
  lt: (column: string, value: unknown) => unknown;
}

const defaultColumns: IFilterColumns = { date: "txn_date", amount: "amount" };

export const applyLedgerFilters = <T>(
  query: T,
  filters: ILedgerFilters,
  columns: IFilterColumns = defaultColumns
): T => {
  let scoped = query as IChainable;
  const chain = (next: unknown) => {
    scoped = next as IChainable;
  };

  if (filters.branch) chain(scoped.eq("branch", filters.branch));
  if (filters.farmSection) chain(scoped.eq("farm_section", filters.farmSection));
  if (filters.customerId) chain(scoped.eq("customer_id", filters.customerId));
  if (filters.supplierId) chain(scoped.eq("supplier_id", filters.supplierId));
  if (columns.type && filters.type) chain(scoped.eq(columns.type, filters.type));
  if (filters.referenceNumber)
    chain(scoped.ilike("reference_number", `%${filters.referenceNumber}%`));
  if (filters.dateFrom) chain(scoped.gte(columns.date, filters.dateFrom));
  if (filters.dateTo) chain(scoped.lte(columns.date, filters.dateTo));

  if (columns.amount) {
    if (filters.amountMin != null)
      chain(scoped.gte(columns.amount, filters.amountMin));
    if (filters.amountMax != null)
      chain(scoped.lte(columns.amount, filters.amountMax));
  }

  return scoped as T;
};

export const applyStatusFilter = <T>(
  query: T,
  status: ILedgerFilters["status"]
): T => {
  if (!status) return query;

  const chainable = query as IStatusChainable;

  if (status === "overdue") {
    const unpaid = chainable.neq("status", "paid") as IStatusChainable;
    return unpaid.lt("due_date", todayIso()) as T;
  }

  return chainable.eq("status", status) as T;
};

export const filterPeriodLabel = (filters: ILedgerFilters): string => {
  if (!filters.dateFrom && !filters.dateTo) return "All time";

  const from = filters.dateFrom ? formatDate(filters.dateFrom) : "Earliest";
  const to = filters.dateTo ? formatDate(filters.dateTo) : "Today";

  return `${from} – ${to}`;
};

export const scopedFilters = (
  filters: ILedgerFilters,
  branch: string | null
): ILedgerFilters => (branch ? { ...filters, branch } : filters);

export const scopeToBranch = <T>(query: T, branch?: string | null): T =>
  branch
    ? ((query as { eq: (column: string, value: unknown) => unknown }).eq(
        "branch",
        branch
      ) as T)
    : query;
