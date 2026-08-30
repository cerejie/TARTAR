import type { DefaultValues } from "react-hook-form";
import { cashAccountLabels, cashAccountValues } from "../../../enums/transaction.enum";
import type { DisbursementKind } from "../../../enums/transaction.enum";
import { voucherTypeLabels, voucherTypeValues } from "../../../enums/voucher.enum";
import {
  disbursementEditModalKey,
  disbursementFormModalKey,
  disbursementHistoryModalKey,
} from "../../../keys/modal.keys";
import {
  expenseListKey,
  purchaseListKey,
  scopedKey,
  voucherListKey,
} from "../../../keys/query.keys";
import type { IFieldConfig } from "../../../models/common/field.model";
import type { BranchSlug } from "../../../models/data/branch/branch.response";
import {
  expenseSchema,
  purchaseSchema,
  type IDisbursementInput,
} from "../../../models/data/transaction/transaction.request";
import type {
  IDisbursement,
  ITransactionAudit,
} from "../../../models/data/transaction/transaction.response";
import transactionServices from "../../../services/data/transaction.services";
import {
  selectUserId,
  useAccountStore,
} from "../../../store/data/account/account.store";
import { scopedFilters } from "../../../utils/filter.utils";
import { todayIso } from "../../../utils/format.utils";
import { toOptions } from "../../../utils/option.utils";
import { usePermissions } from "../../account/account.permission.hook";
import { useLedgerFilters } from "../../common/filter.hook";
import { useModal } from "../../common/modal.hook";
import { useMutation } from "../../common/mutation.hook";
import { useQuery } from "../../common/query.hook";
import { useBranchListHook } from "../branch/branch.list.hook";
import { useBranchScopeHook } from "../branch/branch.scope.hook";
import { useExpenseCategoryListHook } from "../expense-category/expense.category.list.hook";
import { useFarmSectionListHook } from "../farm-section/farm.section.list.hook";
import { useSupplierListHook } from "../party/supplier.list.hook";
import { useUserListHook } from "../user/user.list.hook";

export const isDisbursementLocked = (row: IDisbursement) =>
  !!row.voucher && (row.voucher.status !== "pending" || row.voucher.printed);

export const useDisbursementManagerHook = (
  kind: DisbursementKind,
  title: string
) => {
  const scope = kind === "purchase" ? purchaseListKey : expenseListKey;

  const formModal = useModal(disbursementFormModalKey(scope));
  const editModal = useModal<IDisbursement>(disbursementEditModalKey(scope));
  const historyModal = useModal<IDisbursement>(
    disbursementHistoryModalKey(scope)
  );

  const permissions = usePermissions();
  const createdBy = useAccountStore(selectUserId);

  const { filters } = useLedgerFilters("page");
  const { branchOptions, branchName, defaultBranch } = useBranchListHook();
  const { farmSectionOptions } = useFarmSectionListHook();
  const { supplierOptions } = useSupplierListHook();
  const { labelOf, optionsFor } = useExpenseCategoryListHook();
  const { userNameOf } = useUserListHook();
  const { branch: scopeBranch } = useBranchScopeHook();

  const effectiveFilters = scopedFilters(filters, scopeBranch);
  const listQuery = useQuery<IDisbursement[]>(
    scopedKey(scope, JSON.stringify(effectiveFilters)),
    () => transactionServices.getDisbursementList(kind, effectiveFilters)
  );

  const rows = listQuery.data ?? [];
  const editRow = editModal.modal.data;
  const historyRow = historyModal.modal.data;

  const auditQuery = useQuery<ITransactionAudit[]>(
    scopedKey(scope, "audit", historyRow?.id),
    () => transactionServices.getAudit(historyRow?.id as string),
    { enabled: historyModal.modal.visible && !!historyRow }
  );

  const invalidate = [scope, voucherListKey];

  const createMutation = useMutation(
    (values: IDisbursementInput) =>
      transactionServices.createDisbursement(kind, values, createdBy),
    {
      successMessage: `${title} recorded — voucher pending approval`,
      invalidate,
      onSuccess: formModal.closeModal,
    }
  );

  const updateMutation = useMutation(
    (payload: { id: string; values: IDisbursementInput }) =>
      transactionServices.updateDisbursement(payload.id, kind, payload.values),
    {
      successMessage: `${title} updated`,
      invalidate,
      onSuccess: editModal.closeModal,
    }
  );

  const removeMutation = useMutation(
    (id: string) => transactionServices.remove(id),
    { successMessage: `${title} deleted`, invalidate }
  );

  const fields: IFieldConfig<IDisbursementInput>[] = [
    { name: "branch", label: "Branch", type: "select", options: branchOptions },
    {
      name: "farm_section",
      label: "Farm section",
      type: "select",
      allowClear: true,
      options: farmSectionOptions,
      hidden: (values) => values.branch !== "farm",
    },
    { name: "txn_date", label: "Date", type: "date" },
    { name: "amount", label: "Amount", type: "number", prefix: "₱" },
    ...(kind === "purchase"
      ? [
          {
            name: "due_date",
            label: "Due date (leave empty if paid in full now)",
            type: "date",
          } satisfies IFieldConfig<IDisbursementInput>,
        ]
      : []),
    ...(kind === "expense"
      ? [
          {
            name: "expense_type",
            label: "Expense type",
            type: "select",
            options: optionsFor(editRow?.expense_type),
          } satisfies IFieldConfig<IDisbursementInput>,
        ]
      : []),
    {
      name: "supplier_id",
      label: "Supplier (payee)",
      type: "select",
      allowClear: true,
      options: supplierOptions,
    },
    {
      name: "payee",
      label: "Payee (if not a supplier)",
      type: "text",
      hidden: (values) => !!values.supplier_id,
    },
    {
      name: "cash_account",
      label: "Paid from",
      type: "select",
      allowClear: true,
      options: toOptions(cashAccountValues, cashAccountLabels),
    },
    {
      name: "voucher_type",
      label: "Voucher type",
      type: "select",
      options: toOptions(voucherTypeValues, voucherTypeLabels),
      hidden: (values) => !!values.cash_account,
    },
    ...(kind === "purchase"
      ? [
          {
            name: "reference_number",
            label: "Reference no.",
            type: "text",
          } satisfies IFieldConfig<IDisbursementInput>,
        ]
      : []),
    { name: "description", label: "Description", type: "textarea" },
  ];

  const createDefaults: DefaultValues<IDisbursementInput> = {
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
    ...(kind === "expense" ? { expense_type: undefined } : {}),
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
        expense_type: editRow.expense_type,
      }
    : null;

  return {
    permissions,
    rows,
    loading: listQuery.loading,
    branchName,
    expenseCategoryLabelOf: labelOf,
    userNameOf,
    formModal,
    editModal,
    historyModal,
    editRow,
    historyRow,
    audit: auditQuery.data ?? [],
    auditLoading: auditQuery.loading,
    schema: kind === "expense" ? expenseSchema : purchaseSchema,
    fields,
    createDefaults,
    editDefaults,
    createMutation,
    updateMutation,
    removeMutation,
  };
};
