import { describe, expect, it } from "vitest";
import {
  transactionTypeColorOf,
  transactionTypeLabelOf,
} from "./transaction.enum";

const retiredType = "collection";

describe("transactionTypeLabelOf", () => {
  it("labels a known type", () => {
    expect(transactionTypeLabelOf("customer_payment")).toBe("Customer Payment");
  });

  it("labels a type the client no longer knows as Other", () => {
    expect(transactionTypeLabelOf(retiredType)).toBe("Other");
  });
});

describe("transactionTypeColorOf", () => {
  it("colours a known type", () => {
    expect(transactionTypeColorOf("sale")).toBe("positive");
  });

  it("falls back to the default colour", () => {
    expect(transactionTypeColorOf(retiredType)).toBe("default");
  });
});
