import type { DefaultValues } from "react-hook-form";
import type { IFieldSection } from "../../../models/common/field.model";
import type { BranchSlug } from "../../../models/data/branch/branch.response";
import type { IDisbursementInput } from "../../../models/data/transaction/transaction.request";
import type {
  IDisbursement,
  IExpenseCategoryTotal,
  IExpenseSummary,
} from "../../../models/data/transaction/transaction.response";
import { todayIso } from "../../../utils/format.utils";
import { voucherBreakdownDefaults } from "../../../utils/voucher.utils";
import {
  pendingVoucherCount,
  sumDisbursements,
  useDisbursementListHook,
} from "../disbursement/disbursement.list.hook";
import { useExpenseCategoryListHook } from "../expense-category/expense.category.list.hook";

const topCategoryOf = (
  rows: readonly IDisbursement[],
  labelOf: (slug: string | null | undefined) => string
): IExpenseCategoryTotal | null => {
  const totalBySlug = new Map<string, number>();

  for (const row of rows) {
    const slug = row.expense_type ?? "";
    totalBySlug.set(slug, (totalBySlug.get(slug) ?? 0) + row.amount);
  }

  let top: IExpenseCategoryTotal | null = null;

  for (const [slug, amount] of totalBySlug) {
    if (!top || amount > top.amount) top = { label: labelOf(slug), amount };
  }

  return top;
};

const summarize = (
  rows: readonly IDisbursement[],
  labelOf: (slug: string | null | undefined) => string
): IExpenseSummary => ({
  total: sumDisbursements(rows),
  topCategory: topCategoryOf(rows, labelOf),
  records: rows.length,
  pendingVouchers: pendingVoucherCount(rows),
});

export const useExpenseListHook = () => {
  const disbursement = useDisbursementListHook("expense", "Expense");

  const {
    branchOptions,
    defaultBranch,
    editRow,
    disbursementPaymentFields,
    paymentDefaultsOf,
    farmSectionOptions,
    summaryRows,
    payeeOptions,
  } = disbursement;

  const { labelOf, optionsFor } = useExpenseCategoryListHook();

  const sections: IFieldSection<IDisbursementInput>[] = [
    {
      key: "expense",
      title: "Expense",
      fields: [
        {
          name: "branch",
          label: "Branch",
          type: "select",
          span: "half",
          required: true,
          options: branchOptions,
        },
        {
          name: "txn_date",
          label: "Date",
          type: "date",
          span: "half",
          required: true,
        },
        {
          name: "farm_section",
          label: "Farm section",
          type: "select",
          allowClear: true,
          options: farmSectionOptions,
          hidden: (values) => values.branch !== "farm",
        },
        {
          name: "expense_type",
          label: "Expense type",
          type: "creatable",
          span: "half",
          required: true,
          options: optionsFor(editRow?.expense_type),
        },
        {
          name: "amount",
          label: "Amount",
          type: "amount",
          span: "half",
          required: true,
          prefix: "₱",
        },
        { name: "due_date", label: "Due date", type: "date", span: "half" },
        { name: "particulars", label: "Particular", type: "textarea" },
      ],
    },
    {
      key: "payment",
      title: "Payment",
      fields: [
        {
          name: "payee",
          label: "Payee",
          type: "creatable",
          required: true,
          options: payeeOptions,
        },
        ...disbursementPaymentFields,
      ],
    },
  ];

  const defaults: DefaultValues<IDisbursementInput> = {
    ...voucherBreakdownDefaults,
    branch: defaultBranch as BranchSlug,
    farm_section: null,
    txn_date: todayIso(),
    due_date: null,
    cash_account: "cash_drawer",
    bank_id: null,
    bank_account_id: null,
    voucher_type: null,
    supplier_id: null,
    payee: "",
    description: "",
    expense_type: "",
  };

  const editDefaults: DefaultValues<IDisbursementInput> | null = editRow
    ? {
        ...voucherBreakdownDefaults,
        particulars: editRow.voucher?.particulars ?? "",
        branch: editRow.branch as BranchSlug,
        farm_section:
          editRow.farm_section as IDisbursementInput["farm_section"],
        txn_date: editRow.txn_date,
        amount: editRow.amount,
        due_date: editRow.due_date,
        ...paymentDefaultsOf(editRow),
        voucher_type: null,
        supplier_id: editRow.supplier_id,
        payee: editRow.supplier?.name ?? editRow.voucher?.payee ?? "",
        description: editRow.description ?? "",
        expense_type: editRow.expense_type ? labelOf(editRow.expense_type) : "",
      }
    : null;

  return {
    ...disbursement,
    summary: summarize(summaryRows, labelOf),
    expenseCategoryLabelOf: labelOf,
    formSummary: undefined,
    sections,
    defaults,
    editDefaults,
  };
};
