import { describe, expect, it } from "vitest";
import { pageFiltersOf } from "./filter.utils";

describe("pageFiltersOf", () => {
  it("drops the status fields another screen left in the shared page scope", () => {
    const filters = { saleStatus: "verified", voucherStatus: "pending" } as const;

    expect(pageFiltersOf(filters, null)).toEqual({});
    expect(pageFiltersOf(filters, null, "saleStatus")).toEqual({
      saleStatus: "verified",
    });
    expect(pageFiltersOf(filters, null, "voucherStatus")).toEqual({
      voucherStatus: "pending",
    });
  });

  it("builds the same cache key whether or not a foreign status is set", () => {
    const clean = pageFiltersOf({ dateFrom: "2026-10-01" }, "hardware", "saleStatus");
    const polluted = pageFiltersOf(
      { voucherStatus: "approved", dateFrom: "2026-10-01" },
      "hardware",
      "saleStatus"
    );

    expect(JSON.stringify(polluted)).toBe(JSON.stringify(clean));
  });

  it("serialises an unset status tab the same as no status at all", () => {
    expect(
      JSON.stringify(pageFiltersOf({ saleStatus: undefined }, "farm", "saleStatus"))
    ).toBe(JSON.stringify({ branch: "farm" }));
  });

  it("keeps the shared fields and appends the branch scope", () => {
    expect(
      pageFiltersOf({ dateFrom: "2026-10-01", type: "sale" }, "farm")
    ).toEqual({ dateFrom: "2026-10-01", type: "sale", branch: "farm" });
  });
});
