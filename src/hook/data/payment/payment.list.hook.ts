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
import type { IPaginationResponse } from "../../../models/common/pagination.model";
import type {
  ILedgerPayment,
  IPartyFilter,
} from "../../../models/data/payment/payment.response";
import paymentServices from "../../../services/data/payment.services";
import {
  selectUserId,
  useAccountStore,
} from "../../../store/data/account/account.store";
import { usePermissions } from "../../account/account.permission.hook";
import { useConfirm } from "../../common/confirmation.hook";
import { useLedgerFilters } from "../../common/filter.hook";
import { useMutation } from "../../common/mutation.hook";
import { usePagination } from "../../common/pagination.hook";
import { useQuery } from "../../common/query.hook";
import { useSortOption } from "../../common/sort.hook";
import {
  paymentFilterScopeOf,
  scopedFilters,
} from "../../../utils/filter.utils";
import { formatDate, formatMoney } from "../../../utils/format.utils";
import { useBranchScopeHook } from "../branch/branch.scope.hook";
import { useUserListHook } from "../user/user.list.hook";

export const usePaymentListHook = (
  kind: PaymentKind,
  party?: { partyId: string | null; partyName: string }
) => {
  const permissions = usePermissions();
  const verifierId = useAccountStore(selectUserId);
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

  const listQuery = useQuery<IPaginationResponse<ILedgerPayment>>(
    scopedKey(
      paymentListKey,
      kind,
      JSON.stringify(effectiveFilters),
      pagination.pageNumber,
      pagination.pageSize,
      sortKey
    ),
    () =>
      paymentServices.getList(kind, effectiveFilters, {
        ...pagination,
        sort: sortOption,
      }),
    { enabled: !party }
  );

  const partyFilter: IPartyFilter = party
    ? party.partyId
      ? { partyId: party.partyId }
      : { partyName: party.partyName }
    : {};

  const partyQuery = useQuery<ILedgerPayment[]>(
    scopedKey(paymentListKey, kind, party?.partyId ?? party?.partyName),
    () => paymentServices.getAll(kind, partyFilter),
    { enabled: !!party }
  );

  const verifyMutation = useMutation(
    (id: string) => paymentServices.verify(id, verifierId),
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
      ? `${userNameOf(payment.verified_by)} · ${formatDate(payment.verified_at)}`
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

  return {
    permissions,
    payments: party ? partyQuery.data ?? [] : listQuery.data?.data ?? [],
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
