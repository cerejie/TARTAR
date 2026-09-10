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
  IPurchaseSummary,
} from "../../../models/data/transaction/transaction.response";
import { todayIso } from "../../../utils/format.utils";
import { toOptions } from "../../../utils/option.utils";
import {
  pendingVoucherCount,
  sumDisbursements,
  useDisbursementListHook,
} from "../disbursement/disbursement.list.hook";

const summarize = (rows: readonly IDisbursement[]): IPurchaseSummary => {
  const outstanding = rows.filter((row) => !!row.due_date);

  return {
    total: sumDisbursements(rows),
    outstanding: sumDisbursements(outstanding),
    paid: sumDisbursements(rows.filter((row) => !row.due_date)),
    pendingVouchers: pendingVoucherCount(rows),
  };
};

export const usePurchaseListHook = () => {
  const disbursement = useDisbursementListHook("purchase", "Purchase");

  const {
    branchOptions,
    defaultBranch,
    editRow,
    farmSectionOptions,
    summaryRows,
    supplierOptions,
  } = disbursement;

  const sections: IFieldSection<IDisbursementInput>[] = [
    {
      key: "purchase",
      title: "Purchase",
      description: "Basic information about this purchase.",
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
          label: "Amount",
          type: "amount",
          span: "half",
          required: true,
          prefix: "₱",
        },
        { name: "due_date", label: "Due date", type: "date", span: "half" },
      ],
    },
    {
      key: "payment",
      title: "Payment",
      description:
        "Who is paid and how. Leave the due date empty when this purchase is paid in full now.",
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
      description: "Add reference number or notes (optional).",
      fields: [
        { name: "reference_number", label: "Reference no.", type: "text" },
        { name: "description", label: "Description", type: "textarea" },
      ],
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
    reference_number: "",
    description: "",
  };

  const editDefaults: DefaultValues<IDisbursementInput> | null = editRow
    ? {
        branch: editRow.branch as BranchSlug,
        farm_section:
          editRow.farm_section as IDisbursementInput["farm_section"],
        txn_date: editRow.txn_date,
        amount: editRow.amount,
        due_date: editRow.due_date,
        cash_account: editRow.cash_account,
        voucher_type: editRow.voucher?.type ?? null,
        supplier_id: editRow.supplier_id,
        payee: editRow.supplier_id ? "" : editRow.voucher?.payee ?? "",
        reference_number: editRow.reference_number ?? "",
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
