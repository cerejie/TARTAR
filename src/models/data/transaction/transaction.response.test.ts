import { describe, expect, it } from "vitest";
import {
  amountToPayOf,
  countedAmountOf,
  isCountedDisbursement,
  isDisbursementType,
  sumCounted,
} from "./transaction.response";

describe("countedAmountOf", () => {
  it("counts a sale only once it is verified", () => {
    expect(
      countedAmountOf({
        type: "sale",
        amount: 500,
        sale_status: "verified",
        voucher: null,
      })
    ).toBe(500);

    for (const status of ["undeposited", "deposited", "rejected"] as const) {
      expect(
        countedAmountOf({
          type: "sale",
          amount: 500,
          sale_status: status,
          voucher: null,
        })
      ).toBe(0);
    }
  });

  it("does not count a sale with no status", () => {
    expect(countedAmountOf({ type: "sale", amount: 500, voucher: null })).toBe(0);
  });

  it("counts a disbursement at its voucher amount to pay", () => {
    expect(
      countedAmountOf({
        type: "purchase",
        amount: 1120,
        voucher: { status: "approved", amount: 1110 },
      })
    ).toBe(1110);
  });

  it("counts a pending voucher and skips a rejected one", () => {
    expect(
      countedAmountOf({
        type: "expense",
        amount: 300,
        voucher: { status: "pending", amount: 300 },
      })
    ).toBe(300);
    expect(
      countedAmountOf({
        type: "expense",
        amount: 300,
        voucher: { status: "rejected", amount: 300 },
      })
    ).toBe(0);
  });

  it("counts a disbursement with no voucher at its own amount", () => {
    expect(countedAmountOf({ type: "expense", amount: 75, voucher: null })).toBe(75);
  });

  it("counts every other type at its own amount", () => {
    for (const type of [
      "customer_payment",
      "supplier_payment",
      "cash_deposit",
      "petty_cash",
    ] as const) {
      expect(countedAmountOf({ type, amount: 40, voucher: null })).toBe(40);
    }
  });
});

describe("sumCounted", () => {
  it("is zero for no rows", () => {
    expect(sumCounted([])).toBe(0);
  });

  it("adds only the counted rows", () => {
    expect(
      sumCounted([
        { type: "sale", amount: 1000, sale_status: "verified", voucher: null },
        { type: "sale", amount: 500, sale_status: "deposited", voucher: null },
        {
          type: "expense",
          amount: 100,
          voucher: { status: "approved", amount: 90 },
        },
        {
          type: "expense",
          amount: 40,
          voucher: { status: "rejected", amount: 40 },
        },
        { type: "customer_payment", amount: 200, voucher: null },
      ])
    ).toBe(1290);
  });

  it("adds numeric strings as numbers", () => {
    const amountFromServer = "150.50" as unknown as number;

    expect(
      sumCounted([
        { type: "cash_deposit", amount: amountFromServer, voucher: null },
        { type: "cash_deposit", amount: amountFromServer, voucher: null },
      ])
    ).toBe(301);
  });

  it("stays within a centavo when adding fractional amounts", () => {
    expect(
      sumCounted([
        { type: "petty_cash", amount: 0.1, voucher: null },
        { type: "petty_cash", amount: 0.2, voucher: null },
      ])
    ).toBeCloseTo(0.3, 2);
  });
});

describe("disbursement helpers", () => {
  it("recognises purchases and expenses as disbursements", () => {
    expect(isDisbursementType("purchase")).toBe(true);
    expect(isDisbursementType("expense")).toBe(true);
    expect(isDisbursementType("sale")).toBe(false);
    expect(isDisbursementType("supplier_payment")).toBe(false);
  });

  it("counts every disbursement except a rejected voucher", () => {
    expect(isCountedDisbursement({ voucher: null })).toBe(true);
    expect(
      isCountedDisbursement({ voucher: { status: "pending", amount: 1 } })
    ).toBe(true);
    expect(
      isCountedDisbursement({ voucher: { status: "rejected", amount: 1 } })
    ).toBe(false);
  });

  it("prefers the voucher amount as the amount to pay", () => {
    expect(
      amountToPayOf({
        type: "purchase",
        amount: 1120,
        voucher: { status: "approved", amount: 1110 },
      })
    ).toBe(1110);
    expect(
      amountToPayOf({ type: "purchase", amount: 1120, voucher: null })
    ).toBe(1120);
  });
});
