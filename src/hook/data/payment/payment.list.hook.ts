import {
  paymentSortOptions,
  paymentStatusLabels,
  type PaymentKind,
} from "../../../enums/ledger.enum";
import {
  ledgerPartyKey,
  ledgerSummaryKey,
  payableListKey,
  paymentListKey,
  receivableListKey,
  scopedKey,
} from "../../../keys/query.keys";
import {
  paymentPaginationKey,
  paymentSortKey,
} from "../../../keys/table.keys";
import type {
  IFilterColumns,
  ILedgerFilters,
} from "../../../models/common/filter.model";
import type {
  IPaginationRequest,
  IPaginationResponse,
} from "../../../models/common/pagination.model";
import type {
  IQueryFetcher,
  IQuerySpec,
} from "../../../models/common/query.model";
import type {
  ISortOption,
  ISortState,
} from "../../../models/common/table.model";
import type { ILedgerPartyKey } from "../../../models/data/ledger/ledger.response";
import type {
  ILedgerPayment,
  IPartyFilter,
} from "../../../models/data/payment/payment.response";
import paymentServices from "../../../services/data/payment.services";
import { usePermissions } from "../../account/account.permission.hook";
import { useConfirm } from "../../common/confirmation.hook";
import { useLedgerFilters } from "../../common/filter.hook";
import { useMutation } from "../../common/mutation.hook";
import { usePagination } from "../../common/pagination.hook";
import { useWithPendingRows } from "../../common/pending.hook";
import { useQuery } from "../../common/query.hook";
import { useSortOption } from "../../common/sort.hook";
import {
  datasetFiltersOf,
  datasetSourcesOf,
  derivedPage,
  derivedRows,
  matchesLedgerFilters,
  matchesParty,
  sortRowsBy,
  withOfflineDerive,
} from "../../../utils/dataset.utils";
import {
  paymentFilterScopeOf,
  scopedFilters,
} from "../../../utils/filter.utils";
import { isEmptyDetailValue, joinDetailParts } from "../../../utils/detail.utils";
import { formatDate, formatMoney } from "../../../utils/format.utils";
import { useBranchScopeHook } from "../branch/branch.scope.hook";
import { useUserListHook } from "../user/user.list.hook";

const paymentFilterColumns: IFilterColumns = { date: "paid_at" };

export const paymentDatasetKeyOf =
  (kind: PaymentKind) => (filters: ILedgerFilters) =>
    scopedKey(paymentListKey, kind, "dataset", JSON.stringify(filters));

export const matchesPaymentFilters =
  (filters: ILedgerFilters) => (row: ILedgerPayment) =>
    matchesLedgerFilters(
      row,
      { branch: filters.branch, dateFrom: filters.dateFrom, dateTo: filters.dateTo },
      paymentFilterColumns
    ) &&
    (!filters.paymentStatus || row.status === filters.paymentStatus);

const latestPaidFirst: ISortState = { column: "paid_at", direction: "descending" };

const partyIdColumnOf = (kind: PaymentKind) =>
  kind === "receivable" ? "customer_id" : "supplier_id";

const partyFilterOf = (party: ILedgerPartyKey): IPartyFilter =>
  party.partyId ? { partyId: party.partyId } : { partyName: party.partyName };

export const partyPaymentsFetcherOf = (
  kind: PaymentKind,
  party: ILedgerPartyKey
): IQueryFetcher<ILedgerPayment[]> =>
  withOfflineDerive(
    () => paymentServices.getAll(kind, partyFilterOf(party)),
    (read) => {
      const rows = derivedRows(
        datasetSourcesOf(paymentDatasetKeyOf(kind), []),
        {},
        (row: ILedgerPayment) =>
          matchesParty(row, partyIdColumnOf(kind), "party_name", party)
      )(read);

      return rows && sortRowsBy(rows, latestPaidFirst);
    }
  );

export const paymentDatasetQueryOf = (
  kind: PaymentKind,
  branch: string | null
): IQuerySpec<ILedgerPayment[]> => {
  const filters = scopedFilters({}, branch);

  return [
    paymentDatasetKeyOf(kind)(filters),
    () => paymentServices.getAllInPeriod(kind, filters),
  ];
};

export const paymentListQueryOf = (
  kind: PaymentKind,
  filters: ILedgerFilters,
  pagination: IPaginationRequest,
  sortOption: ISortOption | undefined
): IQuerySpec<IPaginationResponse<ILedgerPayment>> => [
  scopedKey(
    paymentListKey,
    kind,
    JSON.stringify(filters),
    pagination.pageNumber,
    pagination.pageSize,
    sortOption?.key
  ),
  withOfflineDerive(
    () =>
      paymentServices.getList(kind, filters, { ...pagination, sort: sortOption }),
    derivedPage(
      datasetSourcesOf(paymentDatasetKeyOf(kind), [datasetFiltersOf(filters)]),
      filters,
      matchesPaymentFilters(filters),
      sortOption,
      pagination
    )
  ),
];

export const usePaymentListHook = (
  kind: PaymentKind,
  party?: { partyId: string | null; partyName: string }
) => {
  const permissions = usePermissions();
  const { userNameOf } = useUserListHook();
  const openConfirm = useConfirm();
  const { filters } = useLedgerFilters(paymentFilterScopeOf(kind));
  const { branch: scopeBranch } = useBranchScopeHook();
  const effectiveFilters = scopedFilters(filters, scopeBranch);
  const { pagination, setPagination, goToPage } = usePagination(
    paymentPaginationKey(kind)
  );
  const { sortOption, sortKey, sortOptions, changeSort } = useSortOption(
    paymentSortKey(kind),
    paymentSortOptions,
    () => setPagination({ pageNumber: 1 })
  );

  const ledgerKey = kind === "receivable" ? receivableListKey : payableListKey;
  const invalidate = [paymentListKey, ledgerKey, ledgerSummaryKey, ledgerPartyKey];

  const listQuery = useQuery(
    ...paymentListQueryOf(kind, effectiveFilters, pagination, sortOption),
    { enabled: !party, keepPrevious: true }
  );

  const partyQuery = useQuery<ILedgerPayment[]>(
    scopedKey(paymentListKey, kind, party?.partyId ?? party?.partyName),
    party ? partyPaymentsFetcherOf(kind, party) : () => Promise.resolve([]),
    { enabled: !!party }
  );

  const pendingPayments = useWithPendingRows(
    listQuery.data?.data ?? [],
    (write) => paymentServices.pendingOf(kind, write),
    {
      enabled:
        !party &&
        pagination.pageNumber === 1 &&
        (!effectiveFilters.paymentStatus ||
          effectiveFilters.paymentStatus === "pending"),
      branch: scopeBranch,
    }
  );

  const verifyMutation = useMutation(
    (id: string) => paymentServices.verify(id),
    {
      successMessage: `Payment ${
        kind === "receivable" ? "verified" : "approved"
      }`,
      invalidate,
    }
  );

  const rejectMutation = useMutation((id: string) =>
    paymentServices.reject(id), {
    successMessage: "Payment rejected — balances restored",
    invalidate,
  });

  const verifiedHintOf = (payment: ILedgerPayment) =>
    payment.verified_by && payment.status !== "pending"
      ? joinDetailParts([
          userNameOf(payment.verified_by),
          formatDate(payment.verified_at),
        ])
      : undefined;

  const approvePayment = (payment: ILedgerPayment) => {
    if (kind === "receivable") {
      openConfirm({
        kind: "confirm",
        title: "Verify payment?",
        message: `Confirm the ${formatMoney(payment.amount)} payment from ${payment.party_name} was received.`,
        okText: "Verify",
        onConfirm: () => verifyMutation.mutate(payment.id),
      });
      return;
    }

    openConfirm({
      kind: "confirm",
      title: "Approve payment?",
      message: `Approve payment of ${formatMoney(payment.amount)} to ${payment.party_name}?`,
      okText: "Approve",
      onConfirm: () => verifyMutation.mutate(payment.id),
    });
  };

  const rejectPayment = (payment: ILedgerPayment) =>
    openConfirm({
      kind: "delete",
      title: "Reject payment?",
      message: `Rejecting this ${formatMoney(payment.amount)} payment restores the balances it settled.`,
      okText: "Reject",
      onConfirm: () => rejectMutation.mutate(payment.id),
    });

  const payments = party ? partyQuery.data ?? [] : pendingPayments;
  const showRecordedBy = payments.some(
    (payment) => !isEmptyDetailValue(userNameOf(payment.created_by))
  );

  return {
    permissions,
    payments,
    showRecordedBy,
    totalCount: listQuery.data?.totalCount ?? 0,
    pagination,
    goToPage,
    sortKey,
    sortOptions,
    changeSort,
    loading: party ? partyQuery.isInitialLoading : listQuery.isInitialLoading,
    refreshing: party ? partyQuery.isRefreshing : listQuery.isRefreshing,
    error: party ? partyQuery.error : listQuery.error,
    retry: party ? partyQuery.refetch : listQuery.refetch,
    statusLabels: paymentStatusLabels(kind),
    verb: kind === "receivable" ? "Verify" : "Approve",
    userNameOf,
    verifiedHintOf,
    approvePayment,
    rejectPayment,
  };
};
