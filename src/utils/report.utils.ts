import dayjs from "dayjs";
import { ledgerStatusLabels } from "../enums/ledger.enum";
import { saleStatusLabels } from "../enums/sale.enum";
import {
  cashInflowTypes,
  cashOutflowTypes,
  transactionTypeLabelOf,
  transactionTypeLabels,
  type DisbursementKind,
  type TransactionType,
} from "../enums/transaction.enum";
import { voucherStatusLabels } from "../enums/voucher.enum";
import type { IDateRange } from "../models/common/period.model";
import type { IExpenseCategory } from "../models/data/expense-category/expense.category.response";
import {
  isLedgerOverdue,
  ledgerBalance,
  type IPayable,
  type IReceivable,
} from "../models/data/ledger/ledger.response";
import {
  sumCountedPayments,
  type ILedgerPayment,
} from "../models/data/payment/payment.response";
import {
  isPendingSale,
  isVerifiedSale,
  type ISale,
} from "../models/data/sale/sale.response";
import {
  amountToPayOf,
  isCountedDisbursement,
  sumCounted,
  type IDisbursement,
  type ITransaction,
} from "../models/data/transaction/transaction.response";
import type {
  IBranchSummaryData,
  IBranchSummaryRow,
  IBranchSummaryTotals,
  ICashFlowRow,
  ICashFlowTotals,
  IExpenseRow,
  IReportData,
  ReportType,
} from "../models/data/report/report.response";
import { formatDate, formatMoney, todayIso } from "./format.utils";
import { dateRangeLabel } from "./period.utils";
import type { IPrintReportDocument, IPrintTable } from "./print.utils";

export const sumBy = (
  transactions: readonly IDisbursement[],
  predicate: (transaction: IDisbursement) => boolean
) => sumCounted(transactions.filter(predicate));

const ledgerPaymentsOfType = (
  type: TransactionType,
  customerPayments: readonly ILedgerPayment[]
) => (type === "customer_payment" ? sumCountedPayments(customerPayments) : 0);

export const cashFlowTotals = (
  transactions: readonly IDisbursement[],
  customerPayments: readonly ILedgerPayment[]
): ICashFlowTotals => ({
  inflow:
    sumBy(transactions, (transaction) =>
      cashInflowTypes.includes(transaction.type)
    ) + sumCountedPayments(customerPayments),
  outflow: sumBy(transactions, (transaction) =>
    cashOutflowTypes.includes(transaction.type)
  ),
});

export const periodTotals = (
  transactions: readonly IDisbursement[]
): IBranchSummaryTotals => {
  const ofType = (type: ITransaction["type"]) =>
    transactions.filter((transaction) => transaction.type === type);

  return branchSummaryTotals(
    branchSummaryRows(
      {
        sales: ofType("sale"),
        purchases: ofType("purchase"),
        expenses: ofType("expense"),
      },
      (branch) => branch
    )
  );
};

export const rangeFor = (type: ReportType): { from: string; to: string } => {
  const to = todayIso();
  if (type === "daily") return { from: to, to };
  if (type === "weekly")
    return { from: dayjs().startOf("week").format("YYYY-MM-DD"), to };
  return { from: dayjs().startOf("month").format("YYYY-MM-DD"), to };
};

export const periodLabel = (
  type: ReportType,
  from: string,
  to: string
): string => {
  if (type === "receivables" || type === "payables")
    return `As of ${formatDate(to)}`;
  return from === to
    ? formatDate(to)
    : `${formatDate(from)} – ${formatDate(to)}`;
};

export const cashFlowRows = (
  transactions: readonly IDisbursement[],
  customerPayments: readonly ILedgerPayment[]
): ICashFlowRow[] =>
  [...cashInflowTypes, ...cashOutflowTypes].map((type) => ({
    key: type,
    label: transactionTypeLabels[type],
    direction: cashInflowTypes.includes(type) ? "Inflow" : "Outflow",
    total:
      sumBy(transactions, (transaction) => transaction.type === type) +
      ledgerPaymentsOfType(type, customerPayments),
  }));

export const expenseRows = (
  transactions: readonly IDisbursement[],
  categories: IExpenseCategory[]
): IExpenseRow[] => {
  const expenses = transactions.filter(
    (transaction) => transaction.type === "expense"
  );

  return categories
    .map((category) => ({
      key: category.slug,
      label: category.name,
      active: category.active,
      total: sumBy(
        expenses,
        (transaction) => transaction.expense_type === category.slug
      ),
    }))
    .filter((row) => row.active || row.total > 0);
};

export const orderedLedger = <Row extends IReceivable | IPayable>(
  rows: Row[]
): Row[] => [
  ...rows.filter(isLedgerOverdue),
  ...rows.filter((row) => !isLedgerOverdue(row)),
];

const ledgerReportBody = (
  type: "receivables" | "payables",
  data: IReportData
): Pick<IPrintReportDocument, "stats" | "tables"> => {
  const isReceivable = type === "receivables";
  const rows: (IReceivable | IPayable)[] = isReceivable
    ? data.receivables
    : data.payables;
  const label = isReceivable ? "Customer" : "Supplier";
  const ordered = orderedLedger(rows);
  const overdue = ordered.filter(isLedgerOverdue);

  const table: IPrintTable = {
    title: `Outstanding ${label}s`,
    subtitle: "Overdue items first",
    columns: [
      { title: "Due date" },
      { title: label },
      { title: "Branch" },
      { title: "Amount", numeric: true },
      { title: "Balance", numeric: true },
      { title: "Status" },
    ],
    rows: ordered.map((row) => [
      formatDate(row.due_date),
      "customer_name" in row ? row.customer_name : row.supplier_name,
      data.branchNameOf(row.branch),
      formatMoney(row.amount),
      formatMoney(ledgerBalance(row)),
      isLedgerOverdue(row) ? "Overdue" : ledgerStatusLabels[row.status],
    ]),
    emptyText: "Nothing outstanding",
    highlightRows: overdue.map((_, index) => index),
  };

  return {
    stats: [
      {
        label: "Total outstanding",
        value: formatMoney(
          ordered.reduce((total, row) => total + ledgerBalance(row), 0)
        ),
      },
      {
        label: "Overdue balance",
        value: formatMoney(
          overdue.reduce((total, row) => total + ledgerBalance(row), 0)
        ),
      },
      { label: "Overdue records", value: String(overdue.length) },
    ],
    tables: [table],
  };
};

export const reportBody = (
  type: ReportType,
  data: IReportData
): Pick<IPrintReportDocument, "stats" | "tables"> => {
  if (type === "receivables" || type === "payables")
    return ledgerReportBody(type, data);

  if (type === "expenses") {
    const rows = expenseRows(data.transactions, data.categories);
    return {
      stats: [
        {
          label: "Total expenses",
          value: formatMoney(rows.reduce((total, row) => total + row.total, 0)),
        },
      ],
      tables: [
        {
          title: "Expenses by Type",
          columns: [{ title: "Expense type" }, { title: "Total", numeric: true }],
          rows: rows.map((row) => [row.label, formatMoney(row.total)]),
          emptyText: "No expenses in this period",
        },
      ],
    };
  }

  if (type === "cashflow") {
    const { inflow, outflow } = cashFlowTotals(
      data.transactions,
      data.customerPayments
    );

    return {
      stats: [
        { label: "Cash In", value: formatMoney(inflow) },
        { label: "Cash Out", value: formatMoney(outflow) },
        { label: "Net Cash Flow", value: formatMoney(inflow - outflow) },
      ],
      tables: [
        {
          title: "Cash Flow by Category",
          subtitle: "Inflows and outflows by transaction type",
          columns: [
            { title: "Category" },
            { title: "Direction" },
            { title: "Total", numeric: true },
          ],
          rows: cashFlowRows(data.transactions, data.customerPayments).map(
            (row) => [row.label, row.direction, formatMoney(row.total)]
          ),
        },
      ],
    };
  }

  const totals = periodTotals(data.transactions);

  return {
    stats: [
      { label: "Sales", value: formatMoney(totals.sales) },
      { label: "Pending verification", value: formatMoney(totals.pendingSales) },
      { label: "Expenses", value: formatMoney(totals.expenses) },
      { label: "Purchases", value: formatMoney(totals.purchases) },
      { label: "Net", value: formatMoney(totals.net) },
    ],
    tables: [
      {
        title: "Transactions",
        subtitle: "Every movement in the selected period",
        columns: [
          { title: "Date" },
          { title: "Type" },
          { title: "Branch" },
          { title: "Reference" },
          { title: "Amount", numeric: true },
        ],
        rows: data.transactions.map((transaction) => [
          formatDate(transaction.txn_date),
          transactionTypeLabelOf(transaction.type),
          data.branchNameOf(transaction.branch),
          transaction.reference_number ?? "—",
          formatMoney(transaction.amount),
        ]),
        emptyText: "No transactions in this period",
      },
    ],
  };
};

const sumAmounts = <Row>(rows: readonly Row[], amountOf: (row: Row) => number) =>
  rows.reduce((total, row) => total + Number(amountOf(row)), 0);

export const salesPrintDocument = (
  sales: readonly ISale[],
  range: IDateRange,
  scope: string
): IPrintReportDocument => ({
  title: "Sales",
  period: dateRangeLabel(range),
  scope,
  stats: [
    { label: "Sales recorded", value: String(sales.length) },
    { label: "Total sales", value: formatMoney(sumAmounts(sales, (sale) => sale.amount)) },
    {
      label: "Verified",
      value: formatMoney(sumAmounts(sales.filter(isVerifiedSale), (sale) => sale.amount)),
    },
    {
      label: "Pending verification",
      value: formatMoney(sumAmounts(sales.filter(isPendingSale), (sale) => sale.amount)),
    },
  ],
  tables: [
    {
      title: "Sales",
      columns: [
        { title: "Date" },
        { title: "Reference" },
        { title: "Customer" },
        { title: "Status" },
        { title: "Amount", numeric: true },
      ],
      rows: sales.map((sale) => [
        formatDate(sale.txn_date),
        sale.reference_number ?? "—",
        sale.customer?.name ?? "—",
        saleStatusLabels[sale.sale_status],
        formatMoney(sale.amount),
      ]),
      emptyText: "No sales in this period",
    },
  ],
});

const disbursementTitles: Record<DisbursementKind, string> = {
  purchase: "Purchases",
  expense: "Expenses",
};

export const disbursementPrintDocument = (
  kind: DisbursementKind,
  rows: readonly IDisbursement[],
  range: IDateRange,
  scope: string
): IPrintReportDocument => ({
  title: disbursementTitles[kind],
  period: dateRangeLabel(range),
  scope,
  stats: [
    { label: "Records", value: String(rows.length) },
    ...(kind === "purchase"
      ? [{ label: "Gross total", value: formatMoney(sumAmounts(rows, (row) => row.amount)) }]
      : []),
    { label: "Amount to pay", value: formatMoney(sumAmounts(rows, amountToPayOf)) },
  ],
  tables: [
    {
      title: disbursementTitles[kind],
      columns: [
        { title: "Date" },
        { title: "Voucher No." },
        { title: kind === "purchase" ? "Supplier" : "Payee" },
        { title: "Voucher status" },
        { title: "Amount to pay", numeric: true },
      ],
      rows: rows.map((row) => [
        formatDate(row.txn_date),
        row.voucher?.voucher_no ?? "—",
        row.voucher?.payee ?? row.supplier?.name ?? "—",
        row.voucher ? voucherStatusLabels[row.voucher.status] : "—",
        formatMoney(amountToPayOf(row)),
      ]),
      emptyText: `No ${disbursementTitles[kind].toLowerCase()} in this period`,
    },
  ],
});

const voucherNoOf = (row: IDisbursement) => row.voucher?.voucher_no ?? "—";

const supplierOf = (row: IDisbursement) =>
  row.voucher?.payee ?? row.supplier?.name ?? "—";

export const purchasePrintDocument = (
  due: readonly IDisbursement[],
  vouchered: readonly IDisbursement[],
  range: IDateRange,
  scope: string
): IPrintReportDocument => ({
  title: disbursementTitles.purchase,
  period: dateRangeLabel(range),
  scope,
  stats: [
    { label: "Purchases due", value: String(due.length) },
    { label: "Due total", value: formatMoney(sumAmounts(due, amountToPayOf)) },
    { label: "Vouchers", value: String(vouchered.length) },
    {
      label: "Voucher total",
      value: formatMoney(sumAmounts(vouchered, amountToPayOf)),
    },
  ],
  tables: [
    {
      title: "Purchases due",
      columns: [
        { title: "Due date" },
        { title: "Supplier" },
        { title: "Voucher No." },
        { title: "Payment" },
        { title: "Amount to pay", numeric: true },
      ],
      rows: due.map((row) => [
        formatDate(row.due_date),
        supplierOf(row),
        voucherNoOf(row),
        row.payable ? ledgerStatusLabels[row.payable.status] : "—",
        formatMoney(amountToPayOf(row)),
      ]),
      emptyText: "No purchases due in this period",
    },
    {
      title: "Purchase vouchers",
      columns: [
        { title: "Voucher date" },
        { title: "Voucher No." },
        { title: "Supplier" },
        { title: "Voucher status" },
        { title: "Amount to pay", numeric: true },
      ],
      rows: vouchered.map((row) => [
        formatDate(row.voucher?.created_at),
        voucherNoOf(row),
        supplierOf(row),
        row.voucher ? voucherStatusLabels[row.voucher.status] : "—",
        formatMoney(amountToPayOf(row)),
      ]),
      emptyText: "No purchase vouchers created in this period",
    },
  ],
});

export const branchSummaryRows = (
  data: IBranchSummaryData,
  branchNameOf: (slug: string) => string
): IBranchSummaryRow[] => {
  const purchases = data.purchases.filter(isCountedDisbursement);
  const expenses = data.expenses.filter(isCountedDisbursement);
  const branches = new Set(
    [...data.sales, ...purchases, ...expenses].map((row) => row.branch)
  );

  return [...branches]
    .map((branch) => {
      const inBranch = <Row extends ITransaction>(rows: readonly Row[]) =>
        rows.filter((row) => row.branch === branch);
      const branchSales = inBranch(data.sales);
      const sales = sumAmounts(branchSales.filter(isVerifiedSale), (row) => row.amount);
      const expenseTotal = sumAmounts(inBranch(expenses), amountToPayOf);
      const purchaseTotal = sumAmounts(inBranch(purchases), amountToPayOf);

      return {
        branch,
        branchName: branchNameOf(branch),
        sales,
        pendingSales: sumAmounts(branchSales.filter(isPendingSale), (row) => row.amount),
        expenses: expenseTotal,
        purchases: purchaseTotal,
        net: sales - expenseTotal - purchaseTotal,
      };
    })
    .sort((left, right) => left.branchName.localeCompare(right.branchName));
};

export const branchSummaryTotals = (
  rows: readonly IBranchSummaryRow[]
): IBranchSummaryTotals => ({
  sales: sumAmounts(rows, (row) => row.sales),
  pendingSales: sumAmounts(rows, (row) => row.pendingSales),
  expenses: sumAmounts(rows, (row) => row.expenses),
  purchases: sumAmounts(rows, (row) => row.purchases),
  net: sumAmounts(rows, (row) => row.net),
});

export const branchSummaryNet = (data: IBranchSummaryData): number =>
  branchSummaryTotals(branchSummaryRows(data, (branch) => branch)).net;

const branchSummaryCells = (label: string, totals: IBranchSummaryTotals) => [
  label,
  formatMoney(totals.sales),
  formatMoney(totals.expenses),
  formatMoney(totals.purchases),
  formatMoney(totals.net),
];

export const branchSummaryPrintDocument = (
  rows: readonly IBranchSummaryRow[],
  totals: IBranchSummaryTotals,
  range: IDateRange,
  scope: string
): IPrintReportDocument => ({
  title: "Branch Summary",
  period: dateRangeLabel(range),
  scope,
  stats: [
    { label: "Sales", value: formatMoney(totals.sales) },
    { label: "Expenses", value: formatMoney(totals.expenses) },
    { label: "Purchases", value: formatMoney(totals.purchases) },
    { label: "Net", value: formatMoney(totals.net) },
    { label: "Pending verification", value: formatMoney(totals.pendingSales) },
  ],
  tables: [
    {
      title: "Totals by Branch",
      subtitle: "Verified sales; expenses and purchases at amount to pay",
      columns: [
        { title: "Branch" },
        { title: "Sales", numeric: true },
        { title: "Expenses", numeric: true },
        { title: "Purchases", numeric: true },
        { title: "Net", numeric: true },
      ],
      rows: rows.length
        ? [
            ...rows.map((row) => branchSummaryCells(row.branchName, row)),
            branchSummaryCells("Total", totals),
          ]
        : [],
      emptyText: "No activity in this period",
    },
  ],
});
