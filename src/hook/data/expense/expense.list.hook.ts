import type { DefaultValues } from "react-hook-form";
import {
  cashAccountLabels,
  cashAccountValues,
} from "../../../enums/transaction.enum";
import {
  voucherTypeLabels,
  voucherTypeValues,
} from "../../../enums/voucher.enum";
import type { IFieldSection } from "../../../models/common/field.model";
import type { BranchSlug } from "../../../models/data/branch/branch.response";
import type { IDisbursementInput } from "../../../models/data/transaction/transaction.request";
import type {
  IDisbursement,
  IExpenseCategoryTotal,
  IExpenseSummary,
} from "../../../models/data/transaction/transaction.response";
import { todayIso } from "../../../utils/format.utils";
import { toOptions } from "../../../utils/option.utils";
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
    farmSectionOptions,
    summaryRows,
    supplierOptions,
  } = disbursement;

  const { labelOf, optionsFor } = useExpenseCategoryListHook();

  const sections: IFieldSection<IDisbursementInput>[] = [
    {
      key: "expense",
      title: "Expense",
      description: "Basic information about this expense.",
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
          type: "select",
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
      ],
    },
    {
      key: "payment",
      title: "Payment",
      description: "Who is paid and how.",
      fields: [
        {
          name: "supplier_id",
          label: "Supplier",
          type: "select",
          span: "half",
          allowClear: true,
          options: supplierOptions,
        },
        {
          name: "payee",
          label: "Payee",
          type: "text",
          span: "half",
          hidden: (values) => !!values.supplier_id,
        },
        {
          name: "cash_account",
          label: "Paid from",
          type: "select",
          span: "half",
          allowClear: true,
          options: toOptions(cashAccountValues, cashAccountLabels),
        },
        {
          name: "voucher_type",
          label: "Voucher type",
          type: "select",
          span: "half",
          options: toOptions(voucherTypeValues, voucherTypeLabels),
          hidden: (values) => !!values.cash_account,
        },
      ],
    },
    {
      key: "details",
      title: "Additional details",
      description: "Add notes about this expense (optional).",
      fields: [{ name: "description", label: "Description", type: "textarea" }],
    },
  ];

  const defaults: DefaultValues<IDisbursementInput> = {
    branch: defaultBranch as BranchSlug,
    farm_section: null,
    txn_date: todayIso(),
    due_date: null,
    cash_account: "cash_drawer",
    voucher_type: null,
    supplier_id: null,
    payee: "",
    description: "",
    expense_type: undefined,
  };

  const editDefaults: DefaultValues<IDisbursementInput> | null = editRow
    ? {
        branch: editRow.branch as BranchSlug,
        farm_section:
          editRow.farm_section as IDisbursementInput["farm_section"],
        txn_date: editRow.txn_date,
        amount: editRow.amount,
        cash_account: editRow.cash_account,
        voucher_type: editRow.voucher?.type ?? null,
        supplier_id: editRow.supplier_id,
        payee: editRow.supplier_id ? "" : editRow.voucher?.payee ?? "",
        description: editRow.description ?? "",
        expense_type: editRow.expense_type,
      }
    : null;

  return {
    ...disbursement,
    summary: summarize(summaryRows, labelOf),
    expenseCategoryLabelOf: labelOf,
    sections,
    defaults,
    editDefaults,
  };
};
