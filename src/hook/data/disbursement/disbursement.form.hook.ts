import {
  transactionTypeLabels,
  type DisbursementKind,
} from "../../../enums/transaction.enum";
import {
  disbursementDetailKey,
  disbursementScopeOf,
  disbursementSummaryKeyOf,
  expenseCategoryListKey,
  payableListKey,
  supplierListKey,
  transactionAuditKey,
  voucherListKey,
} from "../../../keys/query.keys";
import {
  expenseSchema,
  purchaseSchema,
} from "../../../models/data/transaction/transaction.request";
import { supplierServices } from "../../../services/data/party.services";
import referenceServices from "../../../services/data/reference.services";
import transactionServices from "../../../services/data/transaction.services";
import {
  disbursementDefaultsOf,
  disbursementEditDefaultsOf,
  disbursementSectionsOf,
  isDisbursementRejected,
  withCheckNumberChange,
} from "../../../utils/disbursement.utils";
import { nameKey } from "../../../utils/fuzzy.utils";
import { resolveParty } from "../../../utils/party.utils";
import { derivePaymentValues } from "../../../utils/payment.utils";
import { slugify } from "../../../utils/slug.utils";
import {
  deriveVoucherValues,
  voucherSummaryLines,
} from "../../../utils/voucher.utils";
import { useMutation } from "../../common/mutation.hook";
import { useBankAccountListHook } from "../bank/bank.account.list.hook";
import { useBranchListHook } from "../branch/branch.list.hook";
import { useExpenseCategoryListHook } from "../expense-category/expense.category.list.hook";
import { useFarmSectionListHook } from "../farm-section/farm.section.list.hook";
import { useSupplierListHook } from "../party/supplier.list.hook";
import { useUserListHook } from "../user/user.list.hook";

import type { Path } from "react-hook-form";
import type { IExpenseCategory } from "../../../models/data/expense-category/expense.category.response";
import type { IDisbursementInput } from "../../../models/data/transaction/transaction.request";
import type { IDisbursement } from "../../../models/data/transaction/transaction.response";

export const disbursementInvalidateKeys = (kind: DisbursementKind) => [
  disbursementScopeOf(kind),
  disbursementSummaryKeyOf(kind),
  voucherListKey,
  payableListKey,
  supplierListKey,
  expenseCategoryListKey,
  disbursementDetailKey,
  transactionAuditKey,
];

const deriveDisbursementValues = (
  changed: Path<IDisbursementInput>,
  values: IDisbursementInput
): Partial<IDisbursementInput> => ({
  ...deriveVoucherValues(changed, values),
  ...derivePaymentValues(changed, values),
});

const resolveExpenseType = async (
  categories: readonly IExpenseCategory[],
  typed: string
): Promise<string> => {
  const name = typed.trim();
  const slug = slugify(name);
  const existing = categories.find(
    (category) =>
      nameKey(category.name) === nameKey(name) || category.slug === slug
  );
  if (existing) return existing.slug;

  return referenceServices.ensureExpenseCategory(name);
};

export const useDisbursementFormHook = (
  kind: DisbursementKind,
  row?: IDisbursement | null,
  onSaved?: () => void
) => {
  const { suppliers, supplierOptions } = useSupplierListHook();
  const { expenseCategories, labelOf, optionsFor } = useExpenseCategoryListHook();
  const { branchOptions, defaultBranch } = useBranchListHook();
  const { farmSectionOptions } = useFarmSectionListHook();
  const { paymentFields, paymentDefaultsOf } = useBankAccountListHook();
  const { userNameOf } = useUserListHook();

  const label = transactionTypeLabels[kind];
  const editRejected = !!row && isDisbursementRejected(row);

  const resolveExpenseTypeOf = async (values: IDisbursementInput) =>
    kind === "expense" && values.expense_type
      ? resolveExpenseType(expenseCategories, values.expense_type)
      : values.expense_type;

  const prepare = async (
    values: IDisbursementInput
  ): Promise<IDisbursementInput> => {
    const supplier = await resolveParty(
      suppliers,
      values.payee ?? "",
      supplierServices.create
    );

    return {
      ...values,
      supplier_id: supplier.id,
      payee: supplier.name,
      expense_type: await resolveExpenseTypeOf(values),
    };
  };

  const disbursementPaymentFields = paymentFields<IDisbursementInput>(
    "Paid from"
  ).map((field) =>
    field.name === "cash_account"
      ? { ...field, required: true, allowClear: false }
      : field
  );

  const sections = disbursementSectionsOf(kind, {
    branchOptions,
    farmSectionOptions,
    payeeOptions: supplierOptions,
    expenseTypeOptions: optionsFor(row?.expense_type),
    paymentFields: disbursementPaymentFields,
  });

  const updateMutation = useMutation(
    async (payload: { row: IDisbursement; values: IDisbursementInput }) =>
      transactionServices.updateDisbursement(
        payload.row.id,
        kind,
        withCheckNumberChange(payload.row, await prepare(payload.values)),
        payload.row.version ?? 0,
        payload.row.voucher?.status ?? null
      ),
    {
      successMessage: editRejected
        ? `${label} resubmitted — voucher pending approval`
        : `${label} updated`,
      invalidate: disbursementInvalidateKeys(kind),
      onSuccess: onSaved,
    }
  );

  return {
    payeeOptions: supplierOptions,
    prepare,
    sections,
    defaults: disbursementDefaultsOf(kind, defaultBranch),
    editDefaults: row
      ? disbursementEditDefaultsOf(kind, row, {
          expenseTypeLabelOf: labelOf,
          paymentDefaults: paymentDefaultsOf(row),
        })
      : null,
    schema: kind === "purchase" ? purchaseSchema : expenseSchema,
    formSummary: kind === "purchase" ? voucherSummaryLines : undefined,
    deriveFormValues: deriveDisbursementValues,
    updateMutation,
    editRejected,
    rejectedByName: userNameOf(row?.voucher?.approved_by ?? null),
    expenseCategoryLabelOf: labelOf,
  };
};
