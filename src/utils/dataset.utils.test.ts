import { describe, expect, it } from "vitest";
import {
  coversFilters,
  datasetFiltersOf,
  datasetSourcesOf,
  derivedPage,
  derivedRows,
  isWithinDays,
  matchesLedgerFilters,
  matchesLedgerStatus,
  pageOfRows,
  sortRowsBy,
} from "./dataset.utils";
import { transactionFilterColumns } from "./filter.utils";
import type { ILedgerFilters } from "../models/common/filter.model";

type IRow = {
  id: string;
  branch: string;
  txn_date: string;
  amount: number;
  type: string;
  reference_number: string | null;
  created_at: string;
};

const rowOf = (id: string, values: Partial<IRow> = {}): IRow => ({
  id,
  branch: "feeds",
  txn_date: "2026-10-01",
  amount: 100,
  type: "sale",
  reference_number: null,
  created_at: "2026-10-01T08:00:00+00:00",
  ...values,
});

const rows: readonly IRow[] = [
  rowOf("a", { txn_date: "2026-09-15", amount: 300 }),
  rowOf("b", { txn_date: "2026-10-02", amount: 50, reference_number: "OR-12" }),
  rowOf("c", { branch: "hardware", txn_date: "2026-10-03", amount: 75 }),
  rowOf("d", { txn_date: "2026-10-02", amount: 50, type: "expense", created_at: "2026-10-02T09:00:00+00:00" }),
];

const firstPage = { pageNumber: 1, pageSize: 2 };

const keyOf = (filters: ILedgerFilters) => `summary:${JSON.stringify(filters)}`;

describe("coversFilters", () => {
  it("lets an unfiltered dataset serve any request", () => {
    expect(coversFilters({}, { dateFrom: "2026-10-01", search: "x" })).toBe(true);
  });

  it("requires the same branch", () => {
    expect(coversFilters({ branch: "feeds" }, { branch: "feeds" })).toBe(true);
    expect(coversFilters({ branch: "feeds" }, {})).toBe(false);
    expect(coversFilters({ branch: "feeds" }, { branch: "hardware" })).toBe(false);
  });

  it("requires the requested period to sit inside the dataset period", () => {
    const dataset = { dateFrom: "2026-10-01", dateTo: "2026-10-31" };

    expect(coversFilters(dataset, { dateFrom: "2026-10-05", dateTo: "2026-10-10" })).toBe(true);
    expect(coversFilters(dataset, { dateFrom: "2026-09-30", dateTo: "2026-10-10" })).toBe(false);
    expect(coversFilters(dataset, { dateFrom: "2026-10-05" })).toBe(false);
  });

  it("refuses a dated dataset for a different date basis", () => {
    expect(
      coversFilters(
        { dateFrom: "2026-10-01", dateTo: "2026-10-31" },
        { dateFrom: "2026-10-05", dateTo: "2026-10-10", dateBasis: "voucher" }
      )
    ).toBe(false);
  });
});

describe("matchesLedgerFilters", () => {
  it("applies branch, type, reference, date and amount like the server", () => {
    const matching = rows.filter((row) =>
      matchesLedgerFilters(
        row,
        { branch: "feeds", type: "sale", dateFrom: "2026-10-01", amountMax: 60 },
        transactionFilterColumns
      )
    );

    expect(matching.map((row) => row.id)).toEqual(["b"]);
  });

  it("matches a reference number case-insensitively by substring", () => {
    const matching = rows.filter((row) =>
      matchesLedgerFilters(row, { referenceNumber: "or-1" })
    );

    expect(matching.map((row) => row.id)).toEqual(["b"]);
  });

  it("ignores a type filter where the list has no type column", () => {
    expect(matchesLedgerFilters(rows[3], { type: "sale" })).toBe(true);
  });
});

describe("matchesLedgerStatus", () => {
  const today = "2026-10-04";
  const ledgerRow = (status: string, due_date: string | null) => ({ status, due_date });

  it("reads unpaid as anything not paid", () => {
    expect(matchesLedgerStatus(ledgerRow("partial", "2026-10-10"), "unpaid", today)).toBe(true);
    expect(matchesLedgerStatus(ledgerRow("paid", "2026-10-10"), "unpaid", today)).toBe(false);
  });

  it("splits open rows by due date", () => {
    expect(matchesLedgerStatus(ledgerRow("unpaid", "2026-10-03"), "overdue", today)).toBe(true);
    expect(matchesLedgerStatus(ledgerRow("unpaid", "2026-10-11"), "due_soon", today)).toBe(true);
    expect(matchesLedgerStatus(ledgerRow("unpaid", "2026-10-12"), "upcoming", today)).toBe(true);
    expect(matchesLedgerStatus(ledgerRow("paid", "2026-10-03"), "overdue", today)).toBe(false);
  });

  it("compares any other status directly", () => {
    expect(matchesLedgerStatus(ledgerRow("paid", null), "paid", today)).toBe(true);
  });
});

describe("isWithinDays", () => {
  it("keeps timestamps inside the whole first and last day", () => {
    expect(isWithinDays("2026-10-01T00:00:00", "2026-10-01", "2026-10-01")).toBe(true);
    expect(isWithinDays("2026-10-01T23:59:00", "2026-10-01", "2026-10-01")).toBe(true);
    expect(isWithinDays("2026-10-02T00:00:00", "2026-10-01", "2026-10-01")).toBe(false);
    expect(isWithinDays(null, "2026-10-01", undefined)).toBe(false);
  });
});

describe("sortRowsBy and pageOfRows", () => {
  it("sorts by the column, then newest created first", () => {
    const sorted = sortRowsBy(rows, { column: "amount", direction: "ascending" });

    expect(sorted.map((row) => row.id)).toEqual(["d", "b", "c", "a"]);
  });

  it("puts missing values last when ascending", () => {
    const sorted = sortRowsBy(
      [{ id: "x", due: null }, { id: "y", due: "2026-10-01" }],
      { column: "due", direction: "ascending" }
    );

    expect(sorted.map((row) => row.id)).toEqual(["y", "x"]);
  });

  it("slices the requested page and counts every match", () => {
    const page = pageOfRows(rows, { pageNumber: 2, pageSize: 3 });

    expect(page.data.map((row) => row.id)).toEqual(["d"]);
    expect(page.totalCount).toBe(4);
    expect(page.currentPage).toBe(2);
  });
});

describe("derived views", () => {
  const datasetFilters = datasetFiltersOf({ branch: "feeds", dateFrom: "2026-10-01" });
  const cache: Record<string, unknown> = { [keyOf({ branch: "feeds" })]: rows };
  const read = (key: string) => cache[key];

  it("narrows request filters to the branch dataset", () => {
    expect(datasetFilters).toEqual({ branch: "feeds" });
  });

  it("derives a filtered, sorted page from the covering dataset", () => {
    const request = { branch: "feeds", dateFrom: "2026-10-01" };
    const derive = derivedPage(
      datasetSourcesOf(keyOf, [request, datasetFiltersOf(request)]),
      request,
      (row: IRow) => matchesLedgerFilters(row, request),
      { column: "amount", direction: "ascending" },
      firstPage
    );

    const page = derive(read);

    expect(page?.data.map((row) => row.id)).toEqual(["d", "b"]);
    expect(page?.totalCount).toBe(2);
  });

  it("derives summary rows in dataset order", () => {
    const request = { branch: "feeds", type: "sale" as const };
    const derive = derivedRows(
      datasetSourcesOf(keyOf, [datasetFiltersOf(request)]),
      request,
      (row: IRow) => matchesLedgerFilters(row, request, transactionFilterColumns)
    );

    expect(derive(read)?.map((row) => row.id)).toEqual(["a", "b"]);
  });

  it("stays unsaved when no cached dataset covers the request", () => {
    const request = { branch: "hardware" };
    const derive = derivedRows(
      datasetSourcesOf(keyOf, [datasetFiltersOf(request)]),
      request,
      (row: IRow) => matchesLedgerFilters(row, request)
    );

    expect(derive(read)).toBeUndefined();
  });
});
