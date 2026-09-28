import type { SaleStatus } from "../../../enums/sale.enum";
import { transactionSortOptions } from "../../../enums/transaction.enum";
import {
  saleDepositModalKey,
  saleEditModalKey,
  saleFormModalKey,
  saleHistoryModalKey,
  saleRejectModalKey,
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
import type { IPaginationResponse } from "../../../models/common/pagination.model";
import type { ISale, ISaleSummary } from "../../../models/data/sale/sale.response";
import type { ITransactionAudit } from "../../../models/data/transaction/transaction.response";
import saleServices from "../../../services/data/sale.services";
import transactionServices from "../../../services/data/transaction.services";
import { filterPeriodLabel, scopedFilters } from "../../../utils/filter.utils";
import { formatMoney } from "../../../utils/format.utils";
import { usePermissions } from "../../account/account.permission.hook";
import { useConfirm } from "../../common/confirmation.hook";
import { useLedgerFilters } from "../../common/filter.hook";
import { useModal } from "../../common/modal.hook";
import { useMutation } from "../../common/mutation.hook";
import { usePagination } from "../../common/pagination.hook";
import { useQuery } from "../../common/query.hook";
import { useSortOption } from "../../common/sort.hook";
import { useBranchListHook } from "../branch/branch.list.hook";
import { useBranchScopeHook } from "../branch/branch.scope.hook";
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

export const useSaleListHook = () => {
  const formModal = useModal(saleFormModalKey);
  const editModal = useModal<ISale>(saleEditModalKey);
  const historyModal = useModal<ISale>(saleHistoryModalKey);
  const depositModal = useModal<ISale>(saleDepositModalKey);
  const rejectModal = useModal<ISale>(saleRejectModalKey);

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
  const { branch: scopeBranch } = useBranchScopeHook();

  const effectiveFilters = scopedFilters(filters, scopeBranch);
  const summaryFilters: ILedgerFilters = {
    ...effectiveFilters,
    saleStatus: undefined,
  };
  const pageRequest = { ...pagination, sort: sortOption };

  const listQuery = useQuery<IPaginationResponse<ISale>>(
    scopedKey(
      saleListKey,
      JSON.stringify(effectiveFilters),
      pagination.pageNumber,
      pagination.pageSize,
      sortKey
    ),
    () => saleServices.getList(effectiveFilters, pageRequest)
  );

  const summaryQuery = useQuery<ISale[]>(
    scopedKey(saleSummaryKey, JSON.stringify(summaryFilters)),
    () => saleServices.getAll(summaryFilters)
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

  return {
    permissions,
    rows: listQuery.data?.data ?? [],
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
    formModal,
    editModal,
    historyModal,
    depositModal,
    rejectModal,
    historyRow,
    audit: auditQuery.data ?? [],
    auditLoading: auditQuery.isInitialLoading,
    verifySale,
    deleteSale,
  };
};
