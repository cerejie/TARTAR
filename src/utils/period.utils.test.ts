import { describe, expect, it } from "vitest";
import {
  monthYearOf,
  monthYearOfRange,
  monthYearRangeOf,
  rangeOfPeriod,
  recentYears,
  yearLabelsOf,
} from "./period.utils";

const printValues = {
  date: "2026-10-15",
  month: "02",
  year: "2024",
  date_from: "2026-10-01",
  date_to: "2026-10-03",
} as const;

describe("monthYearOf", () => {
  it("reads the month and year of a date", () => {
    expect(monthYearOf("2026-01-31")).toEqual({ month: "01", year: "2026" });
    expect(monthYearOf("2025-12-01")).toEqual({ month: "12", year: "2025" });
  });
});

describe("monthYearRangeOf", () => {
  it("covers the whole month", () => {
    expect(monthYearRangeOf({ month: "10", year: "2026" })).toEqual({
      from: "2026-10-01",
      to: "2026-10-31",
    });
  });

  it("ends February on the leap day", () => {
    expect(monthYearRangeOf({ month: "02", year: "2024" }).to).toBe("2024-02-29");
    expect(monthYearRangeOf({ month: "02", year: "2025" }).to).toBe("2025-02-28");
  });
});

describe("monthYearOfRange", () => {
  it("recognises a whole month", () => {
    expect(monthYearOfRange({ from: "2026-09-01", to: "2026-09-30" })).toEqual({
      month: "09",
      year: "2026",
    });
  });

  it("returns nothing for a partial or multi-month range", () => {
    expect(monthYearOfRange({ from: "2026-09-01", to: "2026-09-15" })).toBeUndefined();
    expect(monthYearOfRange({ from: "2026-09-01", to: "2026-10-31" })).toBeUndefined();
  });
});

describe("rangeOfPeriod", () => {
  it("prints the picked month and year when monthly", () => {
    expect(rangeOfPeriod({ ...printValues, period: "monthly" })).toEqual({
      from: "2024-02-01",
      to: "2024-02-29",
    });
  });

  it("prints Monday to Sunday of the date when weekly", () => {
    expect(rangeOfPeriod({ ...printValues, period: "weekly" })).toEqual({
      from: "2026-10-12",
      to: "2026-10-18",
    });
  });

  it("prints the date alone when daily and the range when custom", () => {
    expect(rangeOfPeriod({ ...printValues, period: "daily" })).toEqual({
      from: "2026-10-15",
      to: "2026-10-15",
    });
    expect(rangeOfPeriod({ ...printValues, period: "custom" })).toEqual({
      from: "2026-10-01",
      to: "2026-10-03",
    });
  });
});

describe("recentYears", () => {
  it("lists this year first, newest to oldest", () => {
    const years = recentYears();
    expect(years[0]).toBe(String(new Date().getFullYear()));
    expect(years.map(Number)).toEqual(years.map((_, index) => Number(years[0]) - index));
    expect(yearLabelsOf(years)[years[0] ?? ""]).toBe(years[0]);
  });
});
