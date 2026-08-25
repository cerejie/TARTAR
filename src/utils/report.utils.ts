import dayjs from "dayjs";
import { ledgerStatusLabels } from "../enums/ledger.enum";
import {
  cashInflowTypes,
  cashOutflowTypes,
  transactionTypeLabels,
} from "../enums/transaction.enum";
import type { IExpenseCategory } from "../models/data/expense-category/expense.category.response";
import {
  isLedgerOverdue,
  ledgerBalance,
  type IPayable,
  type IReceivable,
} from "../models/data/ledger/ledger.response";
import type {
  ICashFlowRow,
  IExpenseRow,
  IReportData,
  ReportType,
} from "../models/data/report/report.response";
import type { ITransaction } from "../models/data/transaction/transaction.response";
import { formatDate, formatMoney, todayIso } from "./format.utils";
import type { IPrintReportDocument, IPrintTable } from "./print.utils";

export const sumBy = (
  transactions: ITransaction[],
  predicate: (transaction: ITransaction) => boolean
) =>
  transactions
    .filter(predicate)
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

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
  transactions: ITransaction[]
): ICashFlowRow[] =>
  [...cashInflowTypes, ...cashOutflowTypes].map((type) => ({
    key: type,
    label: transactionTypeLabels[type],
    direction: cashInflowTypes.includes(type) ? "Inflow" : "Outflow",
    total: sumBy(transactions, (transaction) => transaction.type === type),
  }));

export const expenseRows = (
  transactions: ITransaction[],
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
      row.branch,
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
    const inflow = sumBy(data.transactions, (transaction) =>
      cashInflowTypes.includes(transaction.type)
    );
    const outflow = sumBy(data.transactions, (transaction) =>
      cashOutflowTypes.includes(transaction.type)
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
          rows: cashFlowRows(data.transactions).map((row) => [
            row.label,
            row.direction,
            formatMoney(row.total),
          ]),
        },
      ],
    };
  }

  const sales = sumBy(
    data.transactions,
    (transaction) => transaction.type === "sale"
  );
  const expenses = sumBy(
    data.transactions,
    (transaction) => transaction.type === "expense"
  );

  return {
    stats: [
      { label: "Sales", value: formatMoney(sales) },
      { label: "Expenses", value: formatMoney(expenses) },
      { label: "Net", value: formatMoney(sales - expenses) },
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
          transactionTypeLabels[transaction.type],
          transaction.branch,
          transaction.reference_number ?? "—",
          formatMoney(transaction.amount),
        ]),
        emptyText: "No transactions in this period",
      },
    ],
  };
};
