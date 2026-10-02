import type { DefaultValues } from "react-hook-form";
import type { IFieldSection } from "../../../models/common/field.model";
import type { BranchSlug } from "../../../models/data/branch/branch.response";
import type { IDisbursementInput } from "../../../models/data/transaction/transaction.request";
import {
  countedAmountOf,
  isCountedDisbursement,
  type IDisbursement,
  type IPurchaseSummary,
} from "../../../models/data/transaction/transaction.response";
import { todayIso } from "../../../utils/format.utils";
import {
  voucherBreakdownDefaults,
  voucherBreakdownOf,
} from "../../../utils/voucher.utils";
import {
  pendingVoucherCount,
  sumDisbursements,
  useDisbursementListHook,
} from "../disbursement/disbursement.list.hook";

const paidAmountOf = (row: IDisbursement) => {
  if (!row.due_date) return countedAmountOf(row);
  return row.payable ? Number(row.payable.paid_amount) : 0;
};

const outstandingAmountOf = (row: IDisbursement) =>
  countedAmountOf(row) - paidAmountOf(row);

const sumOf = (
  rows: readonly IDisbursement[],
  amountOf: (row: IDisbursement) => number
) => rows.reduce((total, row) => total + amountOf(row), 0);

const summarize = (rows: readonly IDisbursement[]): IPurchaseSummary => {
  const counted = rows.filter(isCountedDisbursement);

  return {
    total: sumDisbursements(counted),
    outstanding: sumOf(counted, outstandingAmountOf),
    paid: sumOf(counted, paidAmountOf),
    pendingVouchers: pendingVoucherCount(rows),
  };
};

export const usePurchaseListHook = () => {
  const disbursement = useDisbursementListHook("purchase", "Purchase");

  const {
    branchOptions,
    breakdownSection,
    defaultBranch,
    editRow,
    disbursementPaymentFields,
    paymentDefaultsOf,
    farmSectionOptions,
    summaryRows,
    payeeOptions,
  } = disbursement;

  const sections: IFieldSection<IDisbursementInput>[] = [
    {
      key: "purchase",
      title: "Purchase",
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
          name: "amount",
          label: "Invoice amount",
          type: "amount",
          span: "half",
          required: true,
          prefix: "₱",
          hint: "Invoice total as billed.",
        },
        { name: "due_date", label: "Due date", type: "date", span: "half" },
      ],
    },
    {
      key: "payment",
      title: "Payment",
      fields: [
        {
          name: "payee",
          label: "Supplier",
          type: "creatable",
          required: true,
          options: payeeOptions,
        },
        ...disbursementPaymentFields,
      ],
    },
    breakdownSection,
  ];

  const defaults: DefaultValues<IDisbursementInput> = {
    ...voucherBreakdownDefaults,
    vatable: true,
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
  };

  const editDefaults: DefaultValues<IDisbursementInput> | null = editRow
    ? {
        ...voucherBreakdownOf(editRow.voucher),
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
      }
    : null;

  return {
    ...disbursement,
    summary: summarize(summaryRows),
    sections,
    defaults,
    editDefaults,
  };
};
