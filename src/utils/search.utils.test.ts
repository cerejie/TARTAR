import { describe, expect, it } from "vitest";
import { matchingRows, newestFirst } from "./search.utils";

type ISupplierRow = {
  name: string;
  contact: string | null;
  created_at: string;
};

const suppliers: readonly ISupplierRow[] = [
  { name: "Acme Feeds", contact: "Maria", created_at: "2026-01-10T00:00:00Z" },
  { name: "Bolt Hardware", contact: null, created_at: "2026-03-01T00:00:00Z" },
  { name: "Cedar Farm", contact: "ACME desk", created_at: "2026-02-01T00:00:00Z" },
];

const textsOf = (row: ISupplierRow) => [row.name, row.contact];

describe("matchingRows", () => {
  it("returns the same rows for a blank term", () => {
    expect(matchingRows(suppliers, "", textsOf)).toBe(suppliers);
    expect(matchingRows(suppliers, "   ", textsOf)).toBe(suppliers);
  });

  it("matches any offered text, ignoring case and outer spaces", () => {
    expect(
      matchingRows(suppliers, "  acme ", textsOf).map((row) => row.name)
    ).toEqual(["Acme Feeds", "Cedar Farm"]);
  });

  it("skips empty texts and returns nothing when no row matches", () => {
    expect(matchingRows(suppliers, "bolt", textsOf).map((row) => row.name)).toEqual([
      "Bolt Hardware",
    ]);
    expect(matchingRows(suppliers, "zzz", textsOf)).toEqual([]);
  });
});

describe("newestFirst", () => {
  it("orders by creation time, newest first, without touching the input", () => {
    const ordered = newestFirst(suppliers);

    expect(ordered.map((row) => row.name)).toEqual([
      "Bolt Hardware",
      "Cedar Farm",
      "Acme Feeds",
    ]);
    expect(suppliers[0].name).toBe("Acme Feeds");
  });
});
