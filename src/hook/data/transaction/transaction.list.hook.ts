import type { DefaultValues } from "react-hook-form";
import {
  cashAccountLabels,
  cashAccountValues,
  cashInflowTypes,
  cashOutflowTypes,
  incomeSourceLabels,
  incomeSourceValues,
  transactionTypeLabels,
  transactionTypeValues,
} from "../../../enums/transaction.enum";
import { transactionFormModalKey } from "../../../keys/modal.keys";
import { transactionPaginationKey } from "../../../keys/table.keys";
import {
  scopedKey,
  transactionListKey,
  transactionSummaryKey,
} from "../../../keys/query.keys";
import type { IFieldConfig } from "../../../models/common/field.model";
import type { IPaginationResponse } from "../../../models/common/pagination.model";
import type { BranchSlug } from "../../../models/data/branch/branch.response";
import type { ITransactionInput } from "../../../models/data/transaction/transaction.request";
import type {
  ITransaction,
  ITransactionSummary,
} from "../../../models/data/transaction/transaction.response";
import type { TransactionType } from "../../../enums/transaction.enum";
import type { ILedgerFilters } from "../../../models/common/filter.model";
import transactionServices from "../../../services/data/transaction.services";
import {
  selectUserId,
  useAccountStore,
} from "../../../store/data/account/account.store";
import { scopedFilters } from "../../../utils/filter.utils";
import { formatDate, todayIso } from "../../../utils/format.utils";
import { toOptions } from "../../../utils/option.utils";
import { usePermissions } from "../../account/account.permission.hook";
import { useLedgerFilters } from "../../common/filter.hook";
import { useModal } from "../../common/modal.hook";
import { usePagination } from "../../common/pagination.hook";
import { useMutation } from "../../common/mutation.hook";
import { useQuery } from "../../common/query.hook";
import { useBranchListHook } from "../branch/branch.list.hook";
import { useBranchScopeHook } from "../branch/branch.scope.hook";
import { useFarmSectionListHook } from "../farm-section/farm.section.list.hook";
import { useCustomerListHook } from "../party/customer.list.hook";
import { useSupplierListHook } from "../party/supplier.list.hook";
import { useUserListHook } from "../user/user.list.hook";

const customerTypes = ["sale", "customer_payment", "collection"];
const supplierTypes = ["purchase", "supplier_payment"];

const sumAmount = (
  transactions: readonly ITransaction[],
  types: readonly TransactionType[]
) =>
  transactions
    .filter((transaction) => types.includes(transaction.type))
    .reduce((total, transaction) => total + transaction.amount, 0);

const summarize = (
  transactions: readonly ITransaction[]
): ITransactionSummary => {
  const cashIn = sumAmount(transactions, cashInflowTypes);
  const cashOut = sumAmount(transactions, cashOutflowTypes);

  return {
    cashIn,
    cashOut,
    net: cashIn - cashOut,
    sales: sumAmount(transactions, ["sale"]),
  };
};

const periodLabel = (filters: ILedgerFilters) => {
  if (!filters.dateFrom && !filters.dateTo) return "All time";

  const from = filters.dateFrom ? formatDate(filters.dateFrom) : "Earliest";
  const to = filters.dateTo ? formatDate(filters.dateTo) : "Today";

  return `${from} – ${to}`;
};

const normalize = (values: ITransactionInput): ITransactionInput => ({
  ...values,
  farm_section: values.branch === "farm" ? values.farm_section : null,
  income_source: values.type === "sale" ? values.income_source : null,
  expense_type: values.type === "expense" ? values.expense_type : null,
  customer_id: customerTypes.includes(values.type) ? values.customer_id : null,
  supplier_id: supplierTypes.includes(values.type) ? values.supplier_id : null,
});

export const useTransactionListHook = () => {
  const formModal = useModal(transactionFormModalKey);
  const { pagination, setPagination, goToPage } = usePagination(
    transactionPaginationKey
  );
  const permissions = usePermissions();
  const createdBy = useAccountStore(selectUserId);

  const { filters } = useLedgerFilters("page");
  const { branchOptions, branchName, defaultBranch } = useBranchListHook();
  const { farmSectionOptions } = useFarmSectionListHook();
  const { customerOptions } = useCustomerListHook();
  const { supplierOptions } = useSupplierListHook();
  const { userById } = useUserListHook();
  const { branch: scopeBranch } = useBranchScopeHook();

  const effectiveFilters = scopedFilters(filters, scopeBranch);
  const listQuery = useQuery<IPaginationResponse<ITransaction>>(
    scopedKey(
      transactionListKey,
      JSON.stringify(effectiveFilters),
      pagination.pageNumber,
      pagination.pageSize
    ),
    () => transactionServices.getList(effectiveFilters, pagination)
  );

  const summaryQuery = useQuery<ITransaction[]>(
    scopedKey(transactionSummaryKey, JSON.stringify(effectiveFilters)),
    () => transactionServices.getAll(effectiveFilters)
  );

  const createMutation = useMutation(
    (values: ITransactionInput) =>
      transactionServices.create(normalize(values), createdBy),
    {
      successMessage: "Transaction recorded",
      invalidate: [transactionListKey, transactionSummaryKey],
      onSuccess: () => {
        formModal.closeModal();
        setPagination({ pageNumber: 1 });
      },
    }
  );

  const removeMutation = useMutation(
    (id: string) => transactionServices.remove(id),
    {
      successMessage: "Transaction deleted",
      invalidate: [transactionListKey, transactionSummaryKey],
    }
  );

  const encodableTypes = transactionTypeValues.filter(
    (type) => type !== "purchase" && type !== "expense"
  );

  const fields: IFieldConfig<ITransactionInput>[] = [
    {
      name: "type",
      label: "Type",
      type: "select",
      options: toOptions(encodableTypes, transactionTypeLabels),
    },
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
    {
      name: "income_source",
      label: "Income source",
      type: "select",
      options: toOptions(incomeSourceValues, incomeSourceLabels),
      hidden: (values) => values.type !== "sale",
    },
    {
      name: "customer_id",
      label: "Customer",
      type: "select",
      allowClear: true,
      options: customerOptions,
      hidden: (values) => !customerTypes.includes(values.type),
    },
    {
      name: "supplier_id",
      label: "Supplier",
      type: "select",
      allowClear: true,
      options: supplierOptions,
      hidden: (values) => !supplierTypes.includes(values.type),
    },
    {
      name: "cash_account",
      label: "Cash account",
      type: "select",
      allowClear: true,
      options: toOptions(cashAccountValues, cashAccountLabels),
    },
    { name: "reference_number", label: "Reference no.", type: "text" },
    { name: "description", label: "Description", type: "textarea" },
  ];

  const defaults: DefaultValues<ITransactionInput> = {
    type: "sale",
    branch: defaultBranch as BranchSlug,
    farm_section: null,
    txn_date: todayIso(),
    income_source: "product_sales",
    expense_type: null,
    customer_id: null,
    supplier_id: null,
    cash_account: null,
    reference_number: "",
    description: "",
  };

  return {
    permissions,
    transactions: listQuery.data?.data ?? [],
    totalCount: listQuery.data?.totalCount ?? 0,
    pagination,
    goToPage,
    loading: listQuery.loading,
    summary: summarize(summaryQuery.data ?? []),
    summaryLoading: summaryQuery.loading,
    summaryPeriod: periodLabel(effectiveFilters),
    branchName,
    userById,
    formModal,
    fields,
    defaults,
    createMutation,
    removeMutation,
  };
};
