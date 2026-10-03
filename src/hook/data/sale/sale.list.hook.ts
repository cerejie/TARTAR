import type { SaleStatus } from "../../../enums/sale.enum";
import { transactionSortOptions } from "../../../enums/transaction.enum";
import {
  saleDepositModalKey,
  saleEditModalKey,
  saleFormModalKey,
  saleHistoryModalKey,
  salePrintModalKey,
  saleRejectModalKey,
  saleResubmitModalKey,
} from "../../../keys/modal.keys";
import {
  saleListKey,
  saleSummaryKey,
  scopedKey,
  transactionListKey,
  transactionSummaryKey,
} from "../../../keys/query.keys";
import { salePaginationKey, saleSortKey } from "../../../keys/table.keys";
import type { ILedgerFilters } from "../../../models/common/filter.model";
import type { IDateRange } from "../../../models/common/period.model";
import type {
  IPaginationRequest,
  IPaginationResponse,
} from "../../../models/common/pagination.model";
import type { IQuerySpec } from "../../../models/common/query.model";
import type { ISortOption } from "../../../models/common/table.model";
import type { ISale, ISaleSummary } from "../../../models/data/sale/sale.response";
import type { ITransactionAudit } from "../../../models/data/transaction/transaction.response";
import saleServices from "../../../services/data/sale.services";
import transactionServices from "../../../services/data/transaction.services";
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
  scopedFilters,
} from "../../../utils/filter.utils";
import { formatMoney } from "../../../utils/format.utils";
import { printReport } from "../../../utils/print.utils";
import { salesPrintDocument } from "../../../utils/report.utils";
import { usePermissions } from "../../account/account.permission.hook";
import { useConfirm } from "../../common/confirmation.hook";
import { useLedgerFilters } from "../../common/filter.hook";
import { useModal } from "../../common/modal.hook";
import { useMutation } from "../../common/mutation.hook";
import { usePagination } from "../../common/pagination.hook";
import { useWithPendingRows } from "../../common/pending.hook";
import { useQuery } from "../../common/query.hook";
import { useSortOption } from "../../common/sort.hook";
import { useBankAccountListHook } from "../bank/bank.account.list.hook";
import { useBranchListHook } from "../branch/branch.list.hook";
import { useBranchScopeHook } from "../branch/branch.scope.hook";
import { useIncomeSourceListHook } from "../income-source/income.source.list.hook";
import { useUserListHook } from "../user/user.list.hook";

export const saleInvalidateKeys = [
  saleListKey,
  saleSummaryKey,
  transactionListKey,
  transactionSummaryKey,
];

const sumSales = (rows: readonly ISale[], statuses: readonly SaleStatus[]) =>
  rows
    .filter((row) => statuses.includes(row.sale_status))
    .reduce((total, row) => total + row.amount, 0);

const summarize = (rows: readonly ISale[]): ISaleSummary => ({
  verified: sumSales(rows, ["verified"]),
  pendingVerification: sumSales(rows, ["deposited"]),
  undeposited: sumSales(rows, ["undeposited", "rejected"]),
  rejected: rows.filter((row) => row.sale_status === "rejected").length,
});

const saleSummaryKeyOf = (filters: ILedgerFilters) =>
  scopedKey(saleSummaryKey, JSON.stringify(filters));

const matchesSaleFilters = (filters: ILedgerFilters) => (row: ISale) =>
  matchesLedgerFilters(row, filters) &&
  (!filters.saleStatus || row.sale_status === filters.saleStatus);

export const saleListQueryOf = (
  filters: ILedgerFilters,
  pagination: IPaginationRequest,
  sortOption: ISortOption | undefined
): IQuerySpec<IPaginationResponse<ISale>> => [
  scopedKey(
    saleListKey,
    JSON.stringify(filters),
    pagination.pageNumber,
    pagination.pageSize,
    sortOption?.key
  ),
  withOfflineDerive(
    () => saleServices.getList(filters, { ...pagination, sort: sortOption }),
    derivedPage(
      datasetSourcesOf(saleSummaryKeyOf, [
        { ...filters, saleStatus: undefined },
        datasetFiltersOf(filters),
      ]),
      filters,
      matchesSaleFilters(filters),
      sortOption,
      pagination
    )
  ),
];

export const saleSummaryQueryOf = (
  filters: ILedgerFilters
): IQuerySpec<ISale[]> => [
  saleSummaryKeyOf(filters),
  withOfflineDerive(
    () => saleServices.getAll(filters),
    derivedRows(
      datasetSourcesOf(saleSummaryKeyOf, [datasetFiltersOf(filters)]),
      filters,
      matchesSaleFilters(filters)
    )
  ),
];

export const useSaleListHook = () => {
  const formModal = useModal(saleFormModalKey);
  const editModal = useModal<ISale>(saleEditModalKey);
  const historyModal = useModal<ISale>(saleHistoryModalKey);
  const depositModal = useModal<ISale>(saleDepositModalKey);
  const rejectModal = useModal<ISale>(saleRejectModalKey);
  const resubmitModal = useModal<ISale>(saleResubmitModalKey);

  const { pagination, setPagination, goToPage } = usePagination(salePaginationKey);
  const { sortOption, sortKey, sortOptions, changeSort } = useSortOption(
    saleSortKey,
    transactionSortOptions,
    () => setPagination({ pageNumber: 1 })
  );
  const permissions = usePermissions();
  const openConfirm = useConfirm();

  const { filters } = useLedgerFilters("page");
  const { branchName } = useBranchListHook();
  const { userById, userNameOf } = useUserListHook();
  const { paymentLabelOf } = useBankAccountListHook();
  const { labelOf: incomeSourceLabelOf } = useIncomeSourceListHook();
  const { branch: scopeBranch, printScope } = useBranchScopeHook();
  const printModal = useModal(salePrintModalKey);

  const effectiveFilters = pageFiltersOf(filters, scopeBranch, "saleStatus");

  const listQuery = useQuery(
    ...saleListQueryOf(effectiveFilters, pagination, sortOption),
    { keepPrevious: true }
  );

  const summaryQuery = useQuery(
    ...saleSummaryQueryOf(pageFiltersOf(filters, scopeBranch))
  );

  const rows = useWithPendingRows(
    listQuery.data?.data ?? [],
    saleServices.pendingOf,
    {
      enabled:
        pagination.pageNumber === 1 &&
        (!effectiveFilters.saleStatus || effectiveFilters.saleStatus === "undeposited"),
      branch: scopeBranch,
    }
  );

  const historyRow = historyModal.modal.data;

  const auditQuery = useQuery<ITransactionAudit[]>(
    scopedKey(saleListKey, "audit", historyRow?.id),
    () => transactionServices.getAudit(historyRow?.id as string),
    { enabled: historyModal.modal.visible && !!historyRow }
  );

  const verifyMutation = useMutation((id: string) => saleServices.verify(id), {
    successMessage: "Sale verified",
    invalidate: saleInvalidateKeys,
  });

  const removeMutation = useMutation(
    (id: string) => transactionServices.remove(id),
    { successMessage: "Sale deleted", invalidate: saleInvalidateKeys }
  );

  const verifySale = (sale: ISale) =>
    openConfirm({
      kind: "confirm",
      title: "Verify sale?",
      message: `Confirm the ${formatMoney(sale.amount)} deposit reached the bank. A verified sale is locked and counts in actual sales.`,
      okText: "Verify",
      onConfirm: () => verifyMutation.mutate(sale.id),
    });

  const deleteSale = (sale: ISale) =>
    openConfirm({
      kind: "delete",
      title: "Delete sale?",
      message: `Deleting this sale of ${formatMoney(sale.amount)} cannot be undone.`,
      onConfirm: () => removeMutation.mutate(sale.id),
    });

  const printPeriod = async (range: IDateRange) => {
    const sales = await saleServices.getAll(
      scopedFilters({ dateFrom: range.from, dateTo: range.to }, scopeBranch)
    );
    printReport(salesPrintDocument(sales, range, printScope));
  };

  return {
    permissions,
    rows,
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
    editModal,
    historyModal,
    depositModal,
    rejectModal,
    resubmitModal,
    historyRow,
    audit: auditQuery.data ?? [],
    auditLoading: auditQuery.isInitialLoading,
    verifySale,
    deleteSale,
    printModalKey: salePrintModalKey,
    openPrint: () => printModal.openModal(),
    printPeriod,
  };
};
