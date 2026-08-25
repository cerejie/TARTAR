import {
  paymentStatusLabels,
  type PaymentKind,
} from "../../../enums/ledger.enum";
import {
  payableListKey,
  paymentListKey,
  receivableListKey,
  scopedKey,
} from "../../../keys/query.keys";
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
import { useMutation } from "../../common/mutation.hook";
import { useQuery } from "../../common/query.hook";
import { useUserListHook } from "../user/user.list.hook";

export const usePaymentListHook = (
  kind: PaymentKind,
  party?: { partyId: string | null; partyName: string }
) => {
  const permissions = usePermissions();
  const verifierId = useAccountStore(selectUserId);
  const { userNameOf } = useUserListHook();

  const ledgerKey = kind === "receivable" ? receivableListKey : payableListKey;
  const invalidate = [paymentListKey, ledgerKey];

  const filters: IPartyFilter = party
    ? party.partyId
      ? { partyId: party.partyId }
      : { partyName: party.partyName }
    : {};

  const listKey = scopedKey(
    paymentListKey,
    kind,
    party ? party.partyId ?? party.partyName : null
  );

  const query = useQuery<ILedgerPayment[]>(listKey, () =>
    paymentServices.getList(kind, filters)
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
    payments: query.data ?? [],
    loading: query.loading,
    statusLabels: paymentStatusLabels(kind),
    verb: kind === "receivable" ? "Verify" : "Approve",
    userNameOf,
    verifyMutation,
    rejectMutation,
  };
};
