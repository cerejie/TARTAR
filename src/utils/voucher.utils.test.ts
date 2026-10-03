import { describe, expect, it } from "vitest";
import type { IVoucherBreakdownInput } from "../models/data/voucher/voucher.request";
import { voucherFixture } from "./fixture.utils";
import {
  breakdownTotalsOf,
  computeVoucherTotals,
  deriveVoucherValues,
  isOwnOpenVoucher,
  isVatableVoucher,
  voucherBreakdownDefaults,
  voucherBreakdownOf,
  voucherSummaryLines,
  voucherTotalsOf,
} from "./voucher.utils";

const breakdownOf = (
  values: Partial<IVoucherBreakdownInput>
): IVoucherBreakdownInput => ({ ...voucherBreakdownDefaults, ...values });

describe("computeVoucherTotals", () => {
  it("takes 12% VAT out of a VAT invoice before withholding 1%", () => {
    expect(
      computeVoucherTotals({
        invoice: 1120,
        ewtRate: 0.01,
        lessReturn: 0,
        vatable: true,
      })
    ).toEqual({
      invoice: 1120,
      lessReturn: 0,
      amountBeforeVat: 1000,
      vat: 120,
      ewt: 10,
      amountToPay: 1110,
    });
  });

  it("withholds on the full invoice when it is not VAT-registered", () => {
    expect(
      computeVoucherTotals({
        invoice: 1000,
        ewtRate: 0.01,
        lessReturn: 0,
        vatable: false,
      })
    ).toEqual({
      invoice: 1000,
      lessReturn: 0,
      amountBeforeVat: 1000,
      vat: 0,
      ewt: 10,
      amountToPay: 990,
    });
  });

  it("deducts the return before VAT and withholding", () => {
    expect(
      computeVoucherTotals({
        invoice: 1120,
        ewtRate: 0.02,
        lessReturn: 112,
        vatable: true,
      })
    ).toEqual({
      invoice: 1120,
      lessReturn: 112,
      amountBeforeVat: 900,
      vat: 108,
      ewt: 18,
      amountToPay: 990,
    });
  });

  it("withholds nothing at a zero rate", () => {
    const totals = computeVoucherTotals({
      invoice: 560,
      ewtRate: 0,
      lessReturn: 0,
      vatable: true,
    });

    expect(totals.ewt).toBe(0);
    expect(totals.amountToPay).toBe(560);
  });

  it("rounds every line to centavos", () => {
    expect(
      computeVoucherTotals({
        invoice: 100,
        ewtRate: 0.01,
        lessReturn: 0,
        vatable: true,
      })
    ).toEqual({
      invoice: 100,
      lessReturn: 0,
      amountBeforeVat: 89.29,
      vat: 10.71,
      ewt: 0.89,
      amountToPay: 99.11,
    });
  });

  it("keeps amount before VAT plus VAT equal to the invoice net of return", () => {
    const invoices = [100, 333.33, 999.99, 12345.67, 0.01];

    for (const invoice of invoices) {
      const totals = computeVoucherTotals({
        invoice,
        ewtRate: 0.02,
        lessReturn: 0,
        vatable: true,
      });

      expect(totals.amountBeforeVat + totals.vat).toBeCloseTo(invoice, 2);
      expect(totals.amountToPay + totals.ewt).toBeCloseTo(invoice, 2);
    }
  });

  it("uses the entered withholding amount over the rate", () => {
    const totals = computeVoucherTotals({
      invoice: 1120,
      ewtRate: 0.01,
      lessReturn: 0,
      vatable: true,
      ewtOverride: 25,
    });

    expect(totals.ewt).toBe(25);
    expect(totals.amountToPay).toBe(1095);
  });

  it("treats an entered withholding of zero as zero, not as missing", () => {
    const totals = computeVoucherTotals({
      invoice: 1120,
      ewtRate: 0.01,
      lessReturn: 0,
      vatable: true,
      ewtOverride: 0,
    });

    expect(totals.ewt).toBe(0);
    expect(totals.amountToPay).toBe(1120);
  });

  it("falls back to the rate when the entered withholding is null", () => {
    const totals = computeVoucherTotals({
      invoice: 1120,
      ewtRate: 0.01,
      lessReturn: 0,
      vatable: true,
      ewtOverride: null,
    });

    expect(totals.ewt).toBe(10);
  });

  it("rounds a half centavo up", () => {
    const totals = computeVoucherTotals({
      invoice: 100,
      ewtRate: 0,
      lessReturn: 0,
      vatable: false,
      ewtOverride: 1.005,
    });

    expect(totals.ewt).toBe(1.01);
  });
});

describe("breakdownTotalsOf", () => {
  it("ignores a typed withholding amount when withholding is none", () => {
    const totals = breakdownTotalsOf(
      breakdownOf({ amount: 1000, withholding: "none", ewt_amount: 50 })
    );

    expect(totals.ewt).toBe(0);
    expect(totals.amountToPay).toBe(1000);
  });

  it("uses the typed withholding amount when withholding applies", () => {
    const totals = breakdownTotalsOf(
      breakdownOf({ amount: 1000, withholding: "goods", ewt_amount: 15 })
    );

    expect(totals.ewt).toBe(15);
    expect(totals.amountToPay).toBe(985);
  });

  it("computes the withholding from the rate when none is typed", () => {
    const totals = breakdownTotalsOf(
      breakdownOf({
        amount: 1120,
        vatable: true,
        withholding: "services",
        ewt_amount: null,
      })
    );

    expect(totals.ewt).toBe(20);
    expect(totals.amountToPay).toBe(1100);
  });

  it("treats a missing invoice and return as zero", () => {
    expect(breakdownTotalsOf(breakdownOf({}))).toEqual({
      invoice: 0,
      lessReturn: 0,
      amountBeforeVat: 0,
      vat: 0,
      ewt: 0,
      amountToPay: 0,
    });
  });
});

describe("deriveVoucherValues", () => {
  const values = breakdownOf({
    amount: 1120,
    vatable: true,
    withholding: "goods",
    ewt_amount: 99,
  });

  it("recalculates the withholding when a field that feeds it changes", () => {
    for (const changed of ["amount", "withholding", "less_return", "vatable"]) {
      expect(deriveVoucherValues(changed, values)).toEqual({ ewt_amount: 10 });
    }
  });

  it("leaves the typed withholding alone when another field changes", () => {
    expect(deriveVoucherValues("ewt_amount", values)).toBeNull();
    expect(deriveVoucherValues("particulars", values)).toBeNull();
  });
});

describe("voucherTotalsOf", () => {
  it("has no breakdown for a missing voucher or one without a gross amount", () => {
    expect(voucherTotalsOf(null)).toBeNull();
    expect(voucherTotalsOf(undefined)).toBeNull();
    expect(voucherTotalsOf(voucherFixture({ gross_amount: null }))).toBeNull();
  });

  it("rebuilds the breakdown of a stored VAT purchase voucher", () => {
    expect(
      voucherTotalsOf(
        voucherFixture({
          category: "PUR",
          vatable: true,
          gross_amount: 1120,
          ewt_rate: 0.01,
          ewt_amount: 10,
          less_return: 0,
          amount: 1110,
        })
      )
    ).toEqual({
      invoice: 1120,
      lessReturn: 0,
      amountBeforeVat: 1000,
      vat: 120,
      ewt: 10,
      amountToPay: 1110,
    });
  });

  it("keeps the stored withholding amount over the stored rate", () => {
    const totals = voucherTotalsOf(
      voucherFixture({
        category: "PUR",
        vatable: true,
        gross_amount: 1120,
        ewt_rate: 0.01,
        ewt_amount: 12.5,
      })
    );

    expect(totals?.ewt).toBe(12.5);
    expect(totals?.amountToPay).toBe(1107.5);
  });

  it("takes no VAT out of an expense voucher even when flagged vatable", () => {
    const totals = voucherTotalsOf(
      voucherFixture({
        category: "EXP",
        vatable: true,
        gross_amount: 1120,
        ewt_rate: 0,
        ewt_amount: 0,
      })
    );

    expect(totals?.amountBeforeVat).toBe(1120);
    expect(totals?.vat).toBe(0);
  });
});

describe("isVatableVoucher", () => {
  it("is true only for a purchase voucher not marked non-VAT", () => {
    expect(
      isVatableVoucher(voucherFixture({ category: "PUR", vatable: true }))
    ).toBe(true);
    expect(
      isVatableVoucher(voucherFixture({ category: "PUR", vatable: false }))
    ).toBe(false);
    expect(
      isVatableVoucher(voucherFixture({ category: "EXP", vatable: true }))
    ).toBe(false);
  });
});

describe("isOwnOpenVoucher", () => {
  const voucher = voucherFixture({
    status: "approved",
    printed: false,
    created_by: "user-1",
  });

  it("is true for an approved, unprinted voucher the manager created", () => {
    expect(isOwnOpenVoucher(voucher, "user-1", true)).toBe(true);
  });

  it("is false for anyone else, a non-manager, or no user", () => {
    expect(isOwnOpenVoucher(voucher, "user-2", true)).toBe(false);
    expect(isOwnOpenVoucher(voucher, "user-1", false)).toBe(false);
    expect(isOwnOpenVoucher(voucher, null, true)).toBe(false);
  });

  it("is false once printed or when not approved", () => {
    expect(
      isOwnOpenVoucher({ ...voucher, printed: true }, "user-1", true)
    ).toBe(false);
    expect(
      isOwnOpenVoucher({ ...voucher, status: "pending" }, "user-1", true)
    ).toBe(false);
    expect(
      isOwnOpenVoucher({ ...voucher, status: "rejected" }, "user-1", true)
    ).toBe(false);
  });
});

describe("voucherBreakdownOf", () => {
  it("gives the defaults when there is no voucher", () => {
    expect(voucherBreakdownOf(null)).toEqual(voucherBreakdownDefaults);
  });

  it("maps a stored voucher back to form values", () => {
    expect(
      voucherBreakdownOf(
        voucherFixture({
          category: "PUR",
          vatable: true,
          ewt_rate: 0.02,
          ewt_amount: 20,
          less_return: 0,
          particulars: null,
        })
      )
    ).toEqual({
      vatable: true,
      withholding: "services",
      ewt_amount: 20,
      less_return: null,
      particulars: "",
    });
  });

  it("maps an unknown stored rate to no withholding", () => {
    expect(
      voucherBreakdownOf(voucherFixture({ ewt_rate: 0.05 })).withholding
    ).toBe("none");
  });
});

describe("voucherSummaryLines", () => {
  it("shows every line for a VAT invoice and emphasises the amount to pay", () => {
    const lines = voucherSummaryLines(
      breakdownOf({ amount: 1120, vatable: true })
    );

    expect(lines.map((line) => line.key)).toEqual([
      "invoice",
      "lessReturn",
      "amountBeforeVat",
      "vat",
      "ewt",
      "amountToPay",
    ]);
    expect(
      lines.filter((line) => line.emphasis).map((line) => line.key)
    ).toEqual(["amountToPay"]);
  });

  it("hides the VAT lines for a non-VAT invoice", () => {
    const lines = voucherSummaryLines(
      breakdownOf({ amount: 1120, vatable: false })
    );

    expect(lines.map((line) => line.key)).toEqual([
      "invoice",
      "lessReturn",
      "ewt",
      "amountToPay",
    ]);
  });
});
