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
import type {
  IPaginationRequest,
  IPaginationResponse,
} from "../../../models/common/pagination.model";
import type {
  IOfflineDerive,
  IQuerySpec,
} from "../../../models/common/query.model";
import type { ISortOption } from "../../../models/common/table.model";
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
import {
  datasetFiltersOf,
  datasetSourcesOf,
  derivedPage,
  derivedRows,
  isWithinDays,
  matchesLedgerFilters,
  withOfflineDerive,
} from "../../../utils/dataset.utils";
import { isDisbursementEditLocked } from "../../../utils/disbursement.utils";
import {
  filterPeriodLabel,
  pageFiltersOf,
  scopedFilters,
} from "../../../utils/filter.utils";
import { printReport } from "../../../utils/print.utils";
import {
  disbursementPrintDocument,
  purchasePrintDocument,
} from "../../../utils/report.utils";
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

const disbursementSummaryKeyOfKind =
  (kind: DisbursementKind) => (filters: ILedgerFilters) =>
    scopedKey(disbursementSummaryKeyOf(kind), JSON.stringify(filters));

const dateBasisOfKind = (kind: DisbursementKind, filters: ILedgerFilters) =>
  kind === "purchase" ? filters.dateBasis : undefined;

const matchesDisbursementFilters =
  (kind: DisbursementKind, filters: ILedgerFilters) =>
  (row: IDisbursement): boolean => {
    const basis = dateBasisOfKind(kind, filters);
    const needsVoucher = !!filters.voucherStatus || basis === "voucher";
    if (needsVoucher && !row.voucher) return false;
    if (filters.voucherStatus && row.voucher?.status !== filters.voucherStatus)
      return false;

    const txnFilters = basis
      ? { ...filters, dateFrom: undefined, dateTo: undefined }
      : filters;

    return (
      matchesLedgerFilters(row, txnFilters) &&
      (basis !== "voucher" ||
        isWithinDays(row.voucher?.created_at, filters.dateFrom, filters.dateTo))
    );
  };

const derivableBy =
  <T>(
    kind: DisbursementKind,
    filters: ILedgerFilters,
    derive: IOfflineDerive<T>
  ): IOfflineDerive<T> =>
  (read) =>
    dateBasisOfKind(kind, filters) === "paid" ? undefined : derive(read);

export const disbursementListQueryOf = (
  kind: DisbursementKind,
  filters: ILedgerFilters,
  pagination: IPaginationRequest,
  sortOption: ISortOption | undefined
): IQuerySpec<IPaginationResponse<IDisbursement>> => [
  scopedKey(
    disbursementScopeOf(kind),
    JSON.stringify(filters),
    pagination.pageNumber,
    pagination.pageSize,
    sortOption?.key
  ),
  withOfflineDerive(
    () =>
      transactionServices.getDisbursementList(kind, filters, {
        ...pagination,
        sort: sortOption,
      }),
    derivableBy(
      kind,
      filters,
      derivedPage(
        datasetSourcesOf(disbursementSummaryKeyOfKind(kind), [
          { ...filters, voucherStatus: undefined },
          datasetFiltersOf(filters),
        ]),
        filters,
        matchesDisbursementFilters(kind, filters),
        sortOption,
        pagination
      )
    )
  ),
];

export const disbursementSummaryQueryOf = (
  kind: DisbursementKind,
  filters: ILedgerFilters
): IQuerySpec<IDisbursement[]> => [
  disbursementSummaryKeyOfKind(kind)(filters),
  withOfflineDerive(
    () => transactionServices.getDisbursementAll(kind, filters),
    derivableBy(
      kind,
      filters,
      derivedRows(
        datasetSourcesOf(disbursementSummaryKeyOfKind(kind), [
          datasetFiltersOf(filters),
        ]),
        filters,
        matchesDisbursementFilters(kind, filters)
      )
    )
  ),
];

export const useDisbursementListHook = (
  kind: DisbursementKind,
  title: string
) => {
  const scope = disbursementScopeOf(kind);

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
  const { branch: scopeBranch, printScope } = useBranchScopeHook();
  const printModalKey = periodPrintModalKey(scope);
  const printModal = useModal(printModalKey);
  const form = useDisbursementFormHook(kind);

  const effectiveFilters = pageFiltersOf(filters, scopeBranch, "voucherStatus");

  const listQuery = useQuery(
    ...disbursementListQueryOf(kind, effectiveFilters, pagination, sortOption),
    { keepPrevious: true }
  );

  const summaryQuery = useQuery(
    ...disbursementSummaryQueryOf(kind, pageFiltersOf(filters, scopeBranch))
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

  const printPurchases = async (range: IDateRange) => {
    const rangeFilters = scopedFilters(
      { dateFrom: range.from, dateTo: range.to },
      scopeBranch
    );
    const [due, vouchered] = await Promise.all([
      transactionServices.getPurchasesDueAll(rangeFilters),
      transactionServices.getDisbursementAll(kind, {
        ...rangeFilters,
        dateBasis: "voucher",
      }),
    ]);
    printReport(purchasePrintDocument(due, vouchered, range, printScope));
  };

  const printPeriod = async (range: IDateRange) => {
    if (kind === "purchase") return printPurchases(range);

    const rows = await transactionServices.getDisbursementAll(
      kind,
      scopedFilters({ dateFrom: range.from, dateTo: range.to }, scopeBranch)
    );
    printReport(
      disbursementPrintDocument(kind, rows, range, printScope)
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
