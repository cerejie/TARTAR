import { describe, expect, it } from "vitest";
import { isKeyUnder, saleListKey, saleSummaryKey, scopedKey } from "./query.keys";

describe("isKeyUnder", () => {
  it("matches the bare key and every scoped variant of it", () => {
    expect(isKeyUnder(saleListKey, saleListKey)).toBe(true);
    expect(isKeyUnder(scopedKey(saleListKey, "{}", 1, 8, "newest"), saleListKey)).toBe(true);
  });

  it("does not match a different key that only shares leading characters", () => {
    expect(isKeyUnder(scopedKey(saleSummaryKey, "{}"), "sale")).toBe(false);
    expect(isKeyUnder("sales-archive", saleListKey)).toBe(false);
  });
});
