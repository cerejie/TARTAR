import type { DefaultValues } from "react-hook-form";
import {
  cashInflowTypes,
  cashOutflowTypes,
  transactionSortOptions,
  transactionTypeLabels,
  transactionTypeValues,
} from "../../../enums/transaction.enum";
import { transactionFormModalKey } from "../../../keys/modal.keys";
import {
  transactionPaginationKey,
  transactionSortKey,
} from "../../../keys/table.keys";
import {
  scopedKey,
  transactionListKey,
  transactionSummaryKey,
} from "../../../keys/query.keys";
import type { IFieldSection } from "../../../models/common/field.model";
import type { ILedgerFilters } from "../../../models/common/filter.model";
import type {
  IPaginationRequest,
  IPaginationResponse,
} from "../../../models/common/pagination.model";
import type { IQuerySpec } from "../../../models/common/query.model";
import type { ISortOption } from "../../../models/common/table.model";
import type { BranchSlug } from "../../../models/data/branch/branch.response";
import type { ITransactionInput } from "../../../models/data/transaction/transaction.request";
import { countedAmountOf } from "../../../models/data/transaction/transaction.response";
import type {
  IDisbursement,
  ITransaction,
  ITransactionSummary,
} from "../../../models/data/transaction/transaction.response";
import type { TransactionType } from "../../../enums/transaction.enum";
import transactionServices from "../../../services/data/transaction.services";
import {
  selectUserId,
  useAccountStore,
} from "../../../store/data/account/account.store";
import {
  datasetFiltersOf,
  datasetSourcesOf,
  derivedPage,
  derivedRows,
  matchesLedgerFilters,
  withOfflineDerive,
} from "../../../utils/dataset.utils";
import {
  filterPeriodLabel,
  pageFiltersOf,
  transactionFilterColumns,
} from "../../../utils/filter.utils";
import { todayIso } from "../../../utils/format.utils";
import { toOptions } from "../../../utils/option.utils";
import { derivePaymentValues } from "../../../utils/payment.utils";
import { usePermissions } from "../../account/account.permission.hook";
import { useLedgerFilters } from "../../common/filter.hook";
import { useModal } from "../../common/modal.hook";
import { usePagination } from "../../common/pagination.hook";
import { useMutation } from "../../common/mutation.hook";
import { useQuery } from "../../common/query.hook";
import { useSortOption } from "../../common/sort.hook";
import { useBankAccountListHook } from "../bank/bank.account.list.hook";
import { useBranchListHook } from "../branch/branch.list.hook";
import { useBranchScopeHook } from "../branch/branch.scope.hook";
import { useFarmSectionListHook } from "../farm-section/farm.section.list.hook";
import { useIncomeSourceListHook } from "../income-source/income.source.list.hook";
import { useCustomerListHook } from "../party/customer.list.hook";
import { useSupplierListHook } from "../party/supplier.list.hook";
import { useUserListHook } from "../user/user.list.hook";

const customerTypes = ["sale", "customer_payment"];
const supplierTypes = ["purchase", "supplier_payment"];

const sumAmount = (
  transactions: readonly IDisbursement[],
  types: readonly TransactionType[]
) =>
  transactions
    .filter((transaction) => types.includes(transaction.type))
    .reduce((total, transaction) => total + countedAmountOf(transaction), 0);

const summarize = (
  transactions: readonly IDisbursement[]
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

const normalize = (values: ITransactionInput): ITransactionInput => ({
  ...values,
  farm_section: values.branch === "farm" ? values.farm_section : null,
  income_source: values.type === "sale" ? values.income_source : null,
  expense_type: values.type === "expense" ? values.expense_type : null,
  customer_id: customerTypes.includes(values.type) ? values.customer_id : null,
  supplier_id: supplierTypes.includes(values.type) ? values.supplier_id : null,
});

const transactionSummaryKeyOf = (filters: ILedgerFilters) =>
  scopedKey(transactionSummaryKey, JSON.stringify(filters));

const matchesTransactionFilters =
  (filters: ILedgerFilters) =>
  <Row extends ITransaction>(row: Row) =>
    matchesLedgerFilters(row, filters, transactionFilterColumns);

export const transactionListQueryOf = (
  filters: ILedgerFilters,
  pagination: IPaginationRequest,
  sortOption: ISortOption | undefined
): IQuerySpec<IPaginationResponse<ITransaction>> => [
  scopedKey(
    transactionListKey,
    JSON.stringify(filters),
    pagination.pageNumber,
    pagination.pageSize,
    sortOption?.key
  ),
  withOfflineDerive(
    () =>
      transactionServices.getList(filters, { ...pagination, sort: sortOption }),
    derivedPage(
      datasetSourcesOf(transactionSummaryKeyOf, [
        filters,
        datasetFiltersOf(filters),
      ]),
      filters,
      matchesTransactionFilters(filters),
      sortOption,
      pagination
    )
  ),
];

export const transactionSummaryQueryOf = (
  filters: ILedgerFilters
): IQuerySpec<IDisbursement[]> => [
  transactionSummaryKeyOf(filters),
  withOfflineDerive(
    () => transactionServices.getAllWithVouchers(filters),
    derivedRows(
      datasetSourcesOf(transactionSummaryKeyOf, [datasetFiltersOf(filters)]),
      filters,
      matchesTransactionFilters(filters)
    )
  ),
];

export const useTransactionListHook = () => {
  const formModal = useModal(transactionFormModalKey);
  const { pagination, setPagination, goToPage } = usePagination(
    transactionPaginationKey
  );
  const { sortOption, sortKey, sortOptions, changeSort } = useSortOption(
    transactionSortKey,
    transactionSortOptions,
    () => setPagination({ pageNumber: 1 })
  );
  const permissions = usePermissions();
  const createdBy = useAccountStore(selectUserId);

  const { filters } = useLedgerFilters("page");
  const { branchOptions, branchName, defaultBranch } = useBranchListHook();
  const { farmSectionOptions } = useFarmSectionListHook();
  const { customerOptions } = useCustomerListHook();
  const { supplierOptions } = useSupplierListHook();
  const { userById, userNameOf } = useUserListHook();
  const { paymentFields, paymentLabelOf } = useBankAccountListHook();
  const { labelOf: incomeSourceLabelOf } = useIncomeSourceListHook();
  const { branch: scopeBranch } = useBranchScopeHook();

  const effectiveFilters = pageFiltersOf(filters, scopeBranch);
  const listQuery = useQuery(
    ...transactionListQueryOf(effectiveFilters, pagination, sortOption),
    { keepPrevious: true }
  );

  const summaryQuery = useQuery(...transactionSummaryQueryOf(effectiveFilters));

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
    (type) =>
      type !== "sale" &&
      type !== "purchase" &&
      type !== "expense" &&
      type !== "petty_cash"
  );

  const sections: IFieldSection<ITransactionInput>[] = [
    {
      key: "transaction",
      title: "Transaction",
      fields: [
        {
          name: "type",
          label: "Type",
          type: "select",
          span: "half",
          required: true,
          options: toOptions(encodableTypes, transactionTypeLabels),
        },
        {
          name: "branch",
          label: "Branch",
          type: "select",
          span: "half",
          required: true,
          options: branchOptions,
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
          name: "txn_date",
          label: "Date",
          type: "date",
          span: "half",
          required: true,
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
      key: "accounting",
      title: "Accounting",
      fields: [
        ...paymentFields<ITransactionInput>("Cash account"),
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
      ],
    },
  ];

  const defaults: DefaultValues<ITransactionInput> = {
    type: "customer_payment",
    branch: defaultBranch as BranchSlug,
    farm_section: null,
    txn_date: todayIso(),
    income_source: null,
    expense_type: null,
    customer_id: null,
    supplier_id: null,
    cash_account: null,
    bank_id: null,
    bank_account_id: null,
    reference_number: "",
    description: "",
  };

  return {
    permissions,
    transactions: listQuery.data?.data ?? [],
    totalCount: listQuery.data?.totalCount ?? 0,
    pagination,
    goToPage,
    sortKey,
    sortOptions,
    changeSort,
    loading: listQuery.isInitialLoading,
    refreshing: listQuery.isRefreshing,
    error: listQuery.error,
    retry: listQuery.refetch,
    summary: summarize(summaryQuery.data ?? []),
    summaryLoading: summaryQuery.isInitialLoading,
    summaryError: summaryQuery.error,
    retrySummary: summaryQuery.refetch,
    summaryPeriod: filterPeriodLabel(effectiveFilters),
    branchName,
    userById,
    userNameOf,
    paymentLabelOf,
    incomeSourceLabelOf,
    formModal,
    sections,
    defaults,
    createMutation,
    removeMutation,
    deriveFormValues: derivePaymentValues,
  };
};
