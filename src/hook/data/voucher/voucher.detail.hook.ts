import {
  voucherReasonModalKey,
  voucherSourceModalKey,
} from "../../../keys/modal.keys";
import { disbursementDetailKey, scopedKey } from "../../../keys/query.keys";
import { voucherDisbursementKind } from "../../../models/data/voucher/voucher.response";
import transactionServices from "../../../services/data/transaction.services";
import { useModal } from "../../common/modal.hook";
import { useQuery } from "../../common/query.hook";
import { useUserListHook } from "../user/user.list.hook";

import type { IDisbursement } from "../../../models/data/transaction/transaction.response";
import type { IVoucher } from "../../../models/data/voucher/voucher.response";

export const useVoucherDetailHook = () => {
  const sourceModal = useModal<IVoucher>(voucherSourceModalKey);
  const reasonModal = useModal<IVoucher>(voucherReasonModalKey);
  const { userNameOf } = useUserListHook();

  const sourceVoucher = sourceModal.modal.data;
  const transactionId = sourceVoucher?.transaction_id ?? null;
  const isSourceOpen = sourceModal.modal.visible && !!transactionId;

  const sourceQuery = useQuery<IDisbursement | null>(
    scopedKey(disbursementDetailKey, transactionId),
    () => transactionServices.getDisbursement(transactionId as string),
    { enabled: isSourceOpen }
  );

  const reasonVoucher = reasonModal.modal.data;

  return {
    sourceModal,
    sourceKind: voucherDisbursementKind(sourceVoucher ?? { category: "" }),
    sourceRow: isSourceOpen ? sourceQuery.data ?? null : null,
    sourceError: isSourceOpen ? sourceQuery.error : null,
    retrySource: sourceQuery.refetch,
    reasonModal,
    reasonVoucher,
    reasonRejectedBy: userNameOf(reasonVoucher?.approved_by ?? null),
  };
};
