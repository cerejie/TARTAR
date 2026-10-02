import { useNavigate } from "react-router-dom";
import {
  transactionSortOptions,
  type DisbursementKind,
} from "../../../enums/transaction.enum";
import {
  disbursementEditModalKey,
  disbursementFormModalKey,
  disbursementHistoryModalKey,
  periodPrintModalKey,
} from "../../../keys/modal.keys";
import {
  disbursementScopeOf,
  disbursementSummaryKeyOf,
  scopedKey,
} from "../../../keys/query.keys";
import {
  disbursementPaginationKey,
  disbursementSortKey,
  voucherPaginationKey,
} from "../../../keys/table.keys";
import type { ILedgerFilters } from "../../../models/common/filter.model";
import type { IPaginationResponse } from "../../../models/common/pagination.model";
import type { IDateRange } from "../../../models/common/period.model";
import type { IDisbursementInput } from "../../../models/data/transaction/transaction.request";
import {
  sumCounted,
  type IDisbursement,
  type ITransactionAudit,
} from "../../../models/data/transaction/transaction.response";
import type { IVoucher } from "../../../models/data/voucher/voucher.response";
import transactionServices from "../../../services/data/transaction.services";
import {
  selectUserId,
  useAccountStore,
} from "../../../store/data/account/account.store";
import { isDisbursementEditLocked } from "../../../utils/disbursement.utils";
import { filterPeriodLabel, scopedFilters } from "../../../utils/filter.utils";
import { printReport } from "../../../utils/print.utils";
import { disbursementPrintDocument } from "../../../utils/report.utils";
import { vouchersPath } from "../../../utils/route.utils";
import { usePermissions } from "../../account/account.permission.hook";
import { useLedgerFilters } from "../../common/filter.hook";
import { useModal } from "../../common/modal.hook";
import { useMutation } from "../../common/mutation.hook";
import { usePagination } from "../../common/pagination.hook";
import { useWithPendingRows } from "../../common/pending.hook";
import { usePushOffer } from "../../common/push.hook";
import { useQuery } from "../../common/query.hook";
import { useSortOption } from "../../common/sort.hook";
import { useBankAccountListHook } from "../bank/bank.account.list.hook";
import { useBranchListHook } from "../branch/branch.list.hook";
import { useBranchScopeHook } from "../branch/branch.scope.hook";
import {
  disbursementInvalidateKeys,
  useDisbursementFormHook,
} from "./disbursement.form.hook";
import { useUserListHook } from "../user/user.list.hook";

export const pendingVoucherCount = (rows: readonly IDisbursement[]) =>
  rows.filter((row) => row.voucher?.status === "pending").length;

export const sumDisbursements = (rows: readonly IDisbursement[]) =>
  sumCounted(rows);

export const useDisbursementListHook = (
  kind: DisbursementKind,
  title: string
) => {
  const scope = disbursementScopeOf(kind);
  const summaryScope = disbursementSummaryKeyOf(kind);

  const formModal = useModal(disbursementFormModalKey(scope));
  const editModal = useModal<IDisbursement>(disbursementEditModalKey(scope));
  const historyModal = useModal<IDisbursement>(
    disbursementHistoryModalKey(scope)
  );

  const { pagination, setPagination, goToPage } = usePagination(
    disbursementPaginationKey(scope)
  );
  const { sortOption, sortKey, sortOptions, changeSort } = useSortOption(
    disbursementSortKey(scope),
    transactionSortOptions,
    () => setPagination({ pageNumber: 1 })
  );
  const permissions = usePermissions();
  const createdBy = useAccountStore(selectUserId);
  const offerPush = usePushOffer();

  const { filters } = useLedgerFilters("page");
  const voucherFilters = useLedgerFilters("vouchers");
  const voucherPagination = usePagination(voucherPaginationKey);
  const navigate = useNavigate();
  const { branchName } = useBranchListHook();
  const { userById, userNameOf } = useUserListHook();
  const { paymentLabelOf } = useBankAccountListHook();
  const { branch: scopeBranch, branchName: scopeName } = useBranchScopeHook();
  const printModalKey = periodPrintModalKey(scope);
  const printModal = useModal(printModalKey);
  const form = useDisbursementFormHook(kind);

  const effectiveFilters = scopedFilters(filters, scopeBranch);
  const summaryFilters: ILedgerFilters = {
    ...effectiveFilters,
    voucherStatus: undefined,
  };
  const pageRequest = { ...pagination, sort: sortOption };

  const listQuery = useQuery<IPaginationResponse<IDisbursement>>(
    scopedKey(
      scope,
      JSON.stringify(effectiveFilters),
      pagination.pageNumber,
      pagination.pageSize,
      sortKey
    ),
    () =>
      transactionServices.getDisbursementList(kind, effectiveFilters, pageRequest),
    { keepPrevious: true }
  );

  const summaryQuery = useQuery<IDisbursement[]>(
    scopedKey(summaryScope, JSON.stringify(summaryFilters)),
    () => transactionServices.getDisbursementAll(kind, summaryFilters)
  );

  const rows = useWithPendingRows(
    listQuery.data?.data ?? [],
    (write) => transactionServices.pendingDisbursementOf(kind, write),
    {
      enabled: pagination.pageNumber === 1 && !effectiveFilters.voucherStatus,
      branch: scopeBranch,
    }
  );

  const historyRow = historyModal.modal.data;

  const auditQuery = useQuery<ITransactionAudit[]>(
    scopedKey(scope, "audit", historyRow?.id),
    () => transactionServices.getAudit(historyRow?.id as string),
    { enabled: historyModal.modal.visible && !!historyRow }
  );

  const invalidate = disbursementInvalidateKeys(kind);

  const createMutation = useMutation(
    async (values: IDisbursementInput) =>
      transactionServices.createDisbursement(
        kind,
        await form.prepare(values),
        createdBy
      ),
    {
      successMessage: permissions.isManager
        ? `${title} recorded — voucher approved`
        : `${title} recorded — voucher pending approval`,
      invalidate,
      onSuccess: () => {
        formModal.closeModal();
        setPagination({ pageNumber: 1 });
        offerPush();
      },
    }
  );

  const removeMutation = useMutation(
    (id: string) => transactionServices.remove(id),
    { successMessage: `${title} deleted`, invalidate }
  );

  const printPeriod = async (range: IDateRange) => {
    const rows = await transactionServices.getDisbursementAll(
      kind,
      scopedFilters({ dateFrom: range.from, dateTo: range.to }, scopeBranch)
    );
    printReport(
      disbursementPrintDocument(kind, rows, range, scopeName ?? "All branches")
    );
  };

  const openVoucher = (voucher: IVoucher) => {
    voucherFilters.resetFilters();
    voucherFilters.setFilters({
      search: voucher.payee,
      voucherStatus: voucher.status,
    });
    voucherPagination.setPagination({ pageNumber: 1 });
    navigate(vouchersPath);
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
    summaryRows: summaryQuery.data ?? [],
    summaryLoading: summaryQuery.isInitialLoading,
    summaryError: summaryQuery.error,
    retrySummary: summaryQuery.refetch,
    summaryPeriod: filterPeriodLabel(effectiveFilters),
    branchName,
    userById,
    userNameOf,
    paymentLabelOf,
    formModal,
    editModal,
    historyModal,
    editRow: editModal.modal.data,
    editLockedOf: (row: IDisbursement) =>
      isDisbursementEditLocked(row, createdBy, permissions.isManager),
    historyRow,
    audit: auditQuery.data ?? [],
    auditLoading: auditQuery.isInitialLoading,
    createMutation,
    removeMutation,
    sections: form.sections,
    defaults: form.defaults,
    schema: form.schema,
    formSummary: form.formSummary,
    deriveFormValues: form.deriveFormValues,
    expenseCategoryLabelOf: form.expenseCategoryLabelOf,
    printModalKey,
    openPrint: () => printModal.openModal(),
    printPeriod,
    openVoucher,
  };
};
