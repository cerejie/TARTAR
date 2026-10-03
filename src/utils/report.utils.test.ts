import { describe, expect, it } from "vitest";
import type { IBranchSummaryData } from "../models/data/report/report.response";
import type { IDisbursement } from "../models/data/transaction/transaction.response";
import {
  customerPaymentFixture,
  disbursementFixture,
  expenseCategoryFixture,
  payableFixture,
  voucherFixture,
} from "./fixture.utils";
import {
  branchSummaryNet,
  branchSummaryRows,
  branchSummaryTotals,
  cashFlowRows,
  cashFlowTotals,
  expenseRows,
  orderedLedger,
  periodTotals,
  purchasePrintDocument,
  sumBy,
} from "./report.utils";
import { formatMoney } from "./format.utils";

const longPastDue = "2000-01-01";
const farFutureDue = "2999-01-01";

const periodTransactions: readonly IDisbursement[] = [
  disbursementFixture({ type: "sale", amount: 1000, sale_status: "verified" }),
  disbursementFixture({ type: "sale", amount: 500, sale_status: "undeposited" }),
  disbursementFixture({ type: "customer_payment", amount: 200 }),
  disbursementFixture({ type: "cash_deposit", amount: 300 }),
  disbursementFixture({
    type: "expense",
    amount: 100,
    voucher: voucherFixture({ status: "approved", amount: 90 }),
  }),
  disbursementFixture({
    type: "expense",
    amount: 40,
    voucher: voucherFixture({ status: "rejected", amount: 40 }),
  }),
  disbursementFixture({ type: "purchase", amount: 1120 }),
  disbursementFixture({ type: "supplier_payment", amount: 60 }),
  disbursementFixture({ type: "petty_cash", amount: 20 }),
];

describe("sumBy", () => {
  it("adds the counted amount of the rows that match", () => {
    expect(
      sumBy(periodTransactions, (transaction) => transaction.type === "expense")
    ).toBe(90);
  });
});

const periodCustomerPayments = [
  customerPaymentFixture({ amount: 400, status: "verified" }),
  customerPaymentFixture({ amount: 70, status: "pending" }),
  customerPaymentFixture({ amount: 30, status: "rejected" }),
];

describe("cashFlowTotals", () => {
  it("splits counted amounts into inflow and outflow", () => {
    expect(cashFlowTotals(periodTransactions, [])).toEqual({
      inflow: 1500,
      outflow: 1290,
    });
  });

  it("counts verified customer payments as inflow", () => {
    expect(cashFlowTotals(periodTransactions, periodCustomerPayments)).toEqual({
      inflow: 1900,
      outflow: 1290,
    });
  });

  it("is zero both ways for no transactions", () => {
    expect(cashFlowTotals([], [])).toEqual({ inflow: 0, outflow: 0 });
  });
});

describe("cashFlowRows", () => {
  const rows = cashFlowRows(periodTransactions, periodCustomerPayments);

  it("lists inflow types then outflow types", () => {
    expect(rows.map((row) => [row.key, row.direction])).toEqual([
      ["sale", "Inflow"],
      ["customer_payment", "Inflow"],
      ["cash_deposit", "Inflow"],
      ["expense", "Outflow"],
      ["supplier_payment", "Outflow"],
      ["purchase", "Outflow"],
      ["petty_cash", "Outflow"],
    ]);
  });

  it("totals each type at its counted amount", () => {
    expect(rows.map((row) => row.total)).toEqual([
      1000, 600, 300, 90, 60, 1120, 20,
    ]);
  });

  it("adds up to the inflow total", () => {
    const inflowRowsTotal = rows
      .filter((row) => row.direction === "Inflow")
      .reduce((total, row) => total + row.total, 0);

    expect(inflowRowsTotal).toBe(1900);
    expect(
      cashFlowTotals(periodTransactions, periodCustomerPayments).inflow
    ).toBe(inflowRowsTotal);
  });
});

describe("periodTotals", () => {
  it("nets verified sales against counted expenses and purchases", () => {
    expect(periodTotals(periodTransactions)).toEqual({
      sales: 1000,
      pendingSales: 500,
      expenses: 90,
      purchases: 1120,
      net: -210,
    });
  });

  it("is all zero for no transactions", () => {
    expect(periodTotals([])).toEqual({
      sales: 0,
      pendingSales: 0,
      expenses: 0,
      purchases: 0,
      net: 0,
    });
  });
});

describe("expenseRows", () => {
  const categories = [
    expenseCategoryFixture({ slug: "fuel", name: "Fuel" }),
    expenseCategoryFixture({ slug: "rent", name: "Rent" }),
    expenseCategoryFixture({ slug: "retired", name: "Retired", active: false }),
    expenseCategoryFixture({ slug: "unused", name: "Unused", active: false }),
  ];
  const expenses = [
    disbursementFixture({ amount: 100, expense_type: "fuel" }),
    disbursementFixture({
      amount: 60,
      expense_type: "fuel",
      voucher: voucherFixture({ status: "approved", amount: 55 }),
    }),
    disbursementFixture({
      amount: 999,
      expense_type: "fuel",
      voucher: voucherFixture({ status: "rejected", amount: 999 }),
    }),
    disbursementFixture({ amount: 30, expense_type: "retired" }),
    disbursementFixture({ type: "purchase", amount: 700, expense_type: "fuel" }),
  ];

  it("totals expenses per category, in category order", () => {
    expect(
      expenseRows(expenses, categories).map((row) => [row.key, row.total])
    ).toEqual([
      ["fuel", 155],
      ["rent", 0],
      ["retired", 30],
    ]);
  });

  it("keeps an inactive category only when it has expenses", () => {
    const keys = expenseRows(expenses, categories).map((row) => row.key);

    expect(keys).toContain("retired");
    expect(keys).not.toContain("unused");
  });
});

describe("orderedLedger", () => {
  it("puts overdue rows first and keeps the order within each group", () => {
    const rows = [
      payableFixture({ id: "upcoming-1", due_date: farFutureDue }),
      payableFixture({ id: "overdue-1", due_date: longPastDue }),
      payableFixture({ id: "paid-late", due_date: longPastDue, status: "paid" }),
      payableFixture({ id: "overdue-2", due_date: longPastDue, status: "partial" }),
    ];

    expect(orderedLedger(rows).map((row) => row.id)).toEqual([
      "overdue-1",
      "overdue-2",
      "upcoming-1",
      "paid-late",
    ]);
  });
});

describe("branch summary", () => {
  const branchNames: Record<string, string> = {
    north: "Zeta North",
    south: "Alpha South",
  };
  const branchNameOf = (slug: string) => branchNames[slug] ?? slug;

  const data: IBranchSummaryData = {
    sales: [
      disbursementFixture({
        type: "sale",
        branch: "north",
        amount: 1000,
        sale_status: "verified",
      }),
      disbursementFixture({
        type: "sale",
        branch: "north",
        amount: 250,
        sale_status: "deposited",
      }),
      disbursementFixture({
        type: "sale",
        branch: "north",
        amount: 75,
        sale_status: "rejected",
      }),
      disbursementFixture({
        type: "sale",
        branch: "south",
        amount: 400,
        sale_status: "verified",
      }),
    ],
    purchases: [
      disbursementFixture({
        type: "purchase",
        branch: "north",
        amount: 1120,
        voucher: voucherFixture({ status: "approved", amount: 1110 }),
      }),
      disbursementFixture({
        type: "purchase",
        branch: "south",
        amount: 500,
        voucher: voucherFixture({ status: "rejected", amount: 500 }),
      }),
    ],
    expenses: [
      disbursementFixture({ branch: "north", amount: 100 }),
      disbursementFixture({
        branch: "south",
        amount: 80,
        voucher: voucherFixture({ status: "pending", amount: 80 }),
      }),
    ],
  };

  it("totals each branch and sorts by branch name", () => {
    expect(branchSummaryRows(data, branchNameOf)).toEqual([
      {
        branch: "south",
        branchName: "Alpha South",
        sales: 400,
        pendingSales: 0,
        expenses: 80,
        purchases: 0,
        net: 320,
      },
      {
        branch: "north",
        branchName: "Zeta North",
        sales: 1000,
        pendingSales: 250,
        expenses: 100,
        purchases: 1110,
        net: -210,
      },
    ]);
  });

  it("omits a branch whose only activity is a rejected voucher", () => {
    const rows = branchSummaryRows(
      {
        sales: [],
        purchases: [],
        expenses: [
          disbursementFixture({
            branch: "north",
            amount: 80,
            voucher: voucherFixture({ status: "rejected", amount: 80 }),
          }),
        ],
      },
      branchNameOf
    );

    expect(rows).toEqual([]);
  });

  it("adds the branch rows into one total", () => {
    expect(branchSummaryTotals(branchSummaryRows(data, branchNameOf))).toEqual({
      sales: 1400,
      pendingSales: 250,
      expenses: 180,
      purchases: 1110,
      net: 110,
    });
  });

  it("nets the whole data set", () => {
    expect(branchSummaryNet(data)).toBe(110);
    expect(branchSummaryNet({ sales: [], purchases: [], expenses: [] })).toBe(0);
  });
});

describe("purchasePrintDocument", () => {
  const range = { from: "2026-10-01", to: "2026-10-31" };
  const due = [
    disbursementFixture({
      type: "purchase",
      amount: 500,
      due_date: "2026-10-20",
      voucher: voucherFixture({ voucher_no: "PV-1", amount: 450 }),
      payable: { status: "partial", amount: 450, paid_amount: 100 },
    }),
  ];
  const vouchered = [
    disbursementFixture({
      type: "purchase",
      amount: 300,
      voucher: voucherFixture({ voucher_no: "PV-2", amount: 300, status: "pending" }),
    }),
    disbursementFixture({ type: "purchase", amount: 200 }),
  ];

  it("prints the due purchases and the vouchers as two tables", () => {
    const document_ = purchasePrintDocument(due, vouchered, range, "Main");

    expect(document_.scope).toBe("Main");
    expect(document_.tables.map((table) => table.title)).toEqual([
      "Purchases due",
      "Purchase vouchers",
    ]);
    expect(document_.tables[0]?.rows).toEqual([
      ["Oct 20, 2026", "Payee", "PV-1", "Partial", formatMoney(450)],
    ]);
    expect(document_.tables[1]?.rows.map((row) => row[1])).toEqual(["PV-2", "—"]);
  });

  it("totals each section by the amount to pay", () => {
    expect(
      purchasePrintDocument(due, vouchered, range, "Main").stats
    ).toEqual([
      { label: "Purchases due", value: "1" },
      { label: "Due total", value: formatMoney(450) },
      { label: "Vouchers", value: "2" },
      { label: "Voucher total", value: formatMoney(500) },
    ]);
  });

  it("says when a section is empty", () => {
    const document_ = purchasePrintDocument([], [], range, "Main");
    expect(document_.tables.every((table) => table.rows.length === 0)).toBe(true);
    expect(document_.tables[0]?.emptyText).toBe("No purchases due in this period");
  });
});
