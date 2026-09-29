import type { DefaultValues } from "react-hook-form";
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
  voucherBreakdownDefaults,
  voucherBreakdownOf,
} from "../../../utils/voucher.utils";
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
    breakdownSection,
    defaultBranch,
    editRow,
    paymentFields,
    paymentDefaultsOf,
    farmSectionOptions,
    summaryRows,
    supplierOptions,
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
          hint: "VAT inclusive.",
        },
        { name: "due_date", label: "Due date", type: "date", span: "half" },
      ],
    },
    {
      key: "payment",
      title: "Payment",
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
        ...paymentFields<IDisbursementInput>("Paid from"),
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
    breakdownSection,
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
        voucher_type: editRow.voucher?.type ?? null,
        supplier_id: editRow.supplier_id,
        payee: editRow.supplier_id ? "" : editRow.voucher?.payee ?? "",
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
