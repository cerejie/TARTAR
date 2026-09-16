import {
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
import { paymentPaginationKey } from "../../../keys/table.keys";
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
import { useLedgerFilters } from "../../common/filter.hook";
import { useMutation } from "../../common/mutation.hook";
import { usePagination } from "../../common/pagination.hook";
import { useQuery } from "../../common/query.hook";
import { useUserListHook } from "../user/user.list.hook";

export const usePaymentListHook = (
  kind: PaymentKind,
  party?: { partyId: string | null; partyName: string }
) => {
  const permissions = usePermissions();
  const verifierId = useAccountStore(selectUserId);
  const { userNameOf } = useUserListHook();
  const { filters } = useLedgerFilters("payments");
  const { pagination, goToPage } = usePagination(paymentPaginationKey(kind));

  const ledgerKey = kind === "receivable" ? receivableListKey : payableListKey;
  const invalidate = [paymentListKey, ledgerKey, ledgerSummaryKey, ledgerPartyKey];

  const listQuery = useQuery<IPaginationResponse<ILedgerPayment>>(
    scopedKey(
      paymentListKey,
      kind,
      JSON.stringify(filters),
      pagination.pageNumber,
      pagination.pageSize
    ),
    () => paymentServices.getList(kind, filters, pagination),
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

  return {
    permissions,
    payments: party ? partyQuery.data ?? [] : listQuery.data?.data ?? [],
    totalCount: listQuery.data?.totalCount ?? 0,
    pagination,
    goToPage,
    loading: party ? partyQuery.loading : listQuery.loading,
    statusLabels: paymentStatusLabels(kind),
    verb: kind === "receivable" ? "Verify" : "Approve",
    userNameOf,
    verifyMutation,
    rejectMutation,
  };
};
