import { todayIso } from "./format.utils";
import {
  isOwnOpenVoucher,
  voucherBreakdownDefaults,
  voucherBreakdownFields,
  voucherBreakdownOf,
} from "./voucher.utils";

import type { DefaultValues } from "react-hook-form";
import type { DisbursementKind } from "../enums/transaction.enum";
import type {
  IFieldConfig,
  IFieldOption,
  IFieldSection,
} from "../models/common/field.model";
import type { IPaymentAccountInput } from "../models/data/bank/bank.request";
import type { BranchSlug } from "../models/data/branch/branch.response";
import type { IDisbursementInput } from "../models/data/transaction/transaction.request";
import type { IDisbursement } from "../models/data/transaction/transaction.response";

type IDisbursementLookups = {
  branchOptions: IFieldOption[];
  farmSectionOptions: IFieldOption[];
  payeeOptions: IFieldOption[];
  expenseTypeOptions: IFieldOption[];
  paymentFields: IFieldConfig<IDisbursementInput>[];
};

type IDisbursementEditLookups = {
  expenseTypeLabelOf: (slug: string | null | undefined) => string;
  paymentDefaults: IPaymentAccountInput;
};

export const isDisbursementLocked = (row: IDisbursement) =>
  !!row.voucher && (row.voucher.status === "approved" || row.voucher.printed);

export const isDisbursementRejected = (row: IDisbursement) =>
  row.voucher?.status === "rejected";

export const isDisbursementEditLocked = (
  row: IDisbursement,
  userId: string | null,
  isManager: boolean
) =>
  isDisbursementLocked(row) &&
  !(row.voucher && isOwnOpenVoucher(row.voucher, userId, isManager));

const headFields = (
  lookups: IDisbursementLookups
): IFieldConfig<IDisbursementInput>[] => [
  {
    name: "branch",
    label: "Branch",
    type: "select",
    span: "half",
    required: true,
    options: lookups.branchOptions,
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
    options: lookups.farmSectionOptions,
    hidden: (values) => values.branch !== "farm",
  },
];

const dueDateField: IFieldConfig<IDisbursementInput> = {
  name: "due_date",
  label: "Due date",
  type: "date",
  span: "half",
};

const checkNumberField: IFieldConfig<IDisbursementInput> = {
  name: "check_number",
  label: "Check number",
  type: "text",
  spanOf: (values) =>
    values.cash_account === "bank_account" && !values.bank_id ? "full" : "half",
  hint: "Optional",
};

const paymentSection = (
  lookups: IDisbursementLookups,
  payeeLabel: string,
  trailingFields: readonly IFieldConfig<IDisbursementInput>[] = []
): IFieldSection<IDisbursementInput> => ({
  key: "payment",
  title: "Payment",
  fields: [
    {
      name: "payee",
      label: payeeLabel,
      type: "creatable",
      required: true,
      options: lookups.payeeOptions,
    },
    ...lookups.paymentFields,
    ...trailingFields,
  ],
});

const expenseSections = (
  lookups: IDisbursementLookups
): IFieldSection<IDisbursementInput>[] => [
  {
    key: "expense",
    title: "Expense",
    fields: [
      ...headFields(lookups),
      {
        name: "expense_type",
        label: "Expense type",
        type: "creatable",
        span: "half",
        required: true,
        options: lookups.expenseTypeOptions,
      },
      {
        name: "amount",
        label: "Amount",
        type: "amount",
        span: "half",
        required: true,
        prefix: "₱",
      },
      dueDateField,
      { name: "particulars", label: "Particular", type: "textarea" },
    ],
  },
  paymentSection(lookups, "Payee"),
];

const purchaseSections = (
  lookups: IDisbursementLookups
): IFieldSection<IDisbursementInput>[] => [
  {
    key: "purchase",
    title: "Purchase",
    fields: [
      ...headFields(lookups),
      {
        name: "amount",
        label: "Invoice amount",
        type: "amount",
        span: "half",
        required: true,
        prefix: "₱",
        hint: "Invoice total as billed.",
      },
      dueDateField,
    ],
  },
  paymentSection(lookups, "Supplier", [checkNumberField]),
  {
    key: "breakdown",
    title: "Voucher breakdown",
    fields: voucherBreakdownFields<IDisbursementInput>(),
  },
];

export const disbursementSectionsOf = (
  kind: DisbursementKind,
  lookups: IDisbursementLookups
) => (kind === "purchase" ? purchaseSections(lookups) : expenseSections(lookups));

export const disbursementDefaultsOf = (
  kind: DisbursementKind,
  defaultBranch: string | null | undefined
): DefaultValues<IDisbursementInput> => {
  const blank: DefaultValues<IDisbursementInput> = {
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

  return kind === "purchase"
    ? { ...blank, vatable: true, check_number: "" }
    : { ...blank, expense_type: "" };
};

export const disbursementEditDefaultsOf = (
  kind: DisbursementKind,
  row: IDisbursement,
  lookups: IDisbursementEditLookups
): DefaultValues<IDisbursementInput> => {
  const recorded: DefaultValues<IDisbursementInput> = {
    branch: row.branch as BranchSlug,
    farm_section: row.farm_section as IDisbursementInput["farm_section"],
    txn_date: row.txn_date,
    amount: row.amount,
    due_date: row.due_date,
    ...lookups.paymentDefaults,
    voucher_type: null,
    supplier_id: row.supplier_id,
    payee: row.supplier?.name ?? row.voucher?.payee ?? "",
    description: row.description ?? "",
  };

  if (kind === "purchase") {
    return {
      ...voucherBreakdownOf(row.voucher),
      ...recorded,
      check_number: row.voucher?.check_number ?? "",
    };
  }

  return {
    ...voucherBreakdownDefaults,
    particulars: row.voucher?.particulars ?? "",
    ...recorded,
    expense_type: row.expense_type
      ? lookups.expenseTypeLabelOf(row.expense_type)
      : "",
  };
};

export const withCheckNumberChange = (
  row: IDisbursement,
  values: IDisbursementInput
): IDisbursementInput =>
  values.check_number === undefined ||
  (values.check_number ?? "") === (row.voucher?.check_number ?? "")
    ? { ...values, check_number: undefined }
    : { ...values, check_number: values.check_number ?? "" };
