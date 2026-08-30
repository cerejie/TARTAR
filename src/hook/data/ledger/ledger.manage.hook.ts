import type { FieldValues } from "react-hook-form";
import { paymentListKey, scopedKey } from "../../../keys/query.keys";
import {
  ledgerFormModalKey,
  ledgerSettleModalKey,
} from "../../../keys/modal.keys";
import type { ILedgerFilters } from "../../../models/common/filter.model";
import type { IMutationResult } from "../../../models/common/query.model";
import type { ILedgerRow } from "../../../models/data/ledger/ledger.response";
import {
  selectUserId,
  useAccountStore,
} from "../../../store/data/account/account.store";
import { scopedFilters } from "../../../utils/filter.utils";
import { useLedgerFilters } from "../../common/filter.hook";
import { useModal } from "../../common/modal.hook";
import { useMutation } from "../../common/mutation.hook";
import { useQuery } from "../../common/query.hook";
import { useBranchListHook } from "../branch/branch.list.hook";
import { useBranchScopeHook } from "../branch/branch.scope.hook";

export interface ILedgerManagerConfig<
  Row extends ILedgerRow,
  Input extends FieldValues,
> {
  scope: "receivables" | "payables";
  title: string;
  getList: (filters: ILedgerFilters) => Promise<Row[]>;
  create: (values: Input, createdBy: string | null) => Promise<IMutationResult>;
  settle: (
    row: Row,
    amount: number,
    createdBy: string | null
  ) => Promise<IMutationResult>;
  remove: (id: string) => Promise<IMutationResult>;
}

export const useLedgerManagerHook = <
  Row extends ILedgerRow,
  Input extends FieldValues,
>(
  config: ILedgerManagerConfig<Row, Input>
) => {
  const formModal = useModal(ledgerFormModalKey(config.scope));
  const settleModal = useModal<Row>(ledgerSettleModalKey(config.scope));
  const createdBy = useAccountStore(selectUserId);

  const { filters } = useLedgerFilters("page");
  const { branchName } = useBranchListHook();
  const { branch: scopeBranch } = useBranchScopeHook();

  const effectiveFilters = scopedFilters(filters, scopeBranch);
  const listKey = scopedKey(config.scope, JSON.stringify(effectiveFilters));
  const query = useQuery<Row[]>(listKey, () =>
    config.getList(effectiveFilters)
  );

  const rows = query.data ?? [];
  const settleRow = settleModal.modal.data;

  const createMutation = useMutation(
    (values: Input) => config.create(values, createdBy),
    {
      successMessage: `${config.title} added`,
      invalidate: [config.scope],
      onSuccess: formModal.closeModal,
    }
  );

  const settleMutation = useMutation(
    (payload: { row: Row; amount: number }) =>
      config.settle(payload.row, payload.amount, createdBy),
    {
      successMessage: "Payment recorded",
      invalidate: [config.scope, paymentListKey],
      onSuccess: settleModal.closeModal,
    }
  );

  const removeMutation = useMutation((id: string) => config.remove(id), {
    successMessage: `${config.title} deleted`,
    invalidate: [config.scope],
  });

  return {
    rows,
    loading: query.loading,
    branchName,
    formModal,
    settleModal,
    settleRow,
    createMutation,
    settleMutation,
    removeMutation,
  };
};
