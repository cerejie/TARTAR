import {
  bankAccountCreateModalKey,
  bankAccountEditModalKey,
} from "../../../keys/modal.keys";
import { bankAccountListKey, bankListKey } from "../../../keys/query.keys";
import bankServices from "../../../services/data/bank.services";
import { nameKey } from "../../../utils/fuzzy.utils";
import { useConfirm } from "../../common/confirmation.hook";
import { useModal } from "../../common/modal.hook";
import { useMutation } from "../../common/mutation.hook";
import { useWithPendingRows } from "../../common/pending.hook";
import { useBankAccountListHook } from "./bank.account.list.hook";
import type { DefaultValues } from "react-hook-form";
import type { IFieldConfig } from "../../../models/common/field.model";
import type { IBankAccountInput } from "../../../models/data/bank/bank.request";
import type { IBankAccount } from "../../../models/data/bank/bank.response";

export const useBankAccountManageHook = () => {
  const createModal = useModal(bankAccountCreateModalKey);
  const editModal = useModal<IBankAccount>(bankAccountEditModalKey);
  const openConfirm = useConfirm();
  const { banks, bankAccounts, loading, refreshing, error, retry } =
    useBankAccountListHook();
  const knownBanks = useWithPendingRows(banks, bankServices.pendingBankOf, {
    enabled: true,
  });

  const invalidate = [bankListKey, bankAccountListKey];
  const editing = editModal.modal.data;
  const nextSort =
    bankAccounts.reduce((max, account) => Math.max(max, account.sort), 0) + 1;

  const fields: IFieldConfig<IBankAccountInput>[] = [
    {
      name: "bank_name",
      label: "Bank",
      type: "creatable",
      required: true,
      placeholder: "e.g. BDO",
      options: knownBanks.map((bank) => ({ value: bank.id, label: bank.name })),
    },
    {
      name: "account_name",
      label: "Account name",
      type: "text",
      required: true,
      placeholder: "e.g. Operations",
    },
    {
      name: "account_number",
      label: "Account number",
      type: "text",
      span: "half",
      required: true,
    },
    {
      name: "sort",
      label: "Sort order",
      type: "number",
      span: "half",
      required: true,
    },
  ];

  const resolveBankId = async (typed: string) => {
    const existing = knownBanks.find(
      (bank) => nameKey(bank.name) === nameKey(typed)
    );
    if (existing) return existing.id;

    const id = crypto.randomUUID();
    await bankServices.createBank(id, typed);
    return id;
  };

  const createMutation = useMutation(
    async (values: IBankAccountInput) =>
      bankServices.createAccount(await resolveBankId(values.bank_name), values),
    {
      successMessage: "Bank account added",
      invalidate,
      onSuccess: createModal.closeModal,
    }
  );

  const updateMutation = useMutation(
    async (payload: { id: string; values: IBankAccountInput }) =>
      bankServices.updateAccount(
        payload.id,
        await resolveBankId(payload.values.bank_name),
        payload.values
      ),
    {
      successMessage: "Bank account updated",
      invalidate,
      onSuccess: editModal.closeModal,
    }
  );

  const setActiveMutation = useMutation(
    (payload: { id: string; active: boolean }) =>
      bankServices.setAccountActive(payload.id, payload.active),
    { successMessage: "Bank account updated", invalidate }
  );

  const removeMutation = useMutation(
    (id: string) => bankServices.deleteAccount(id),
    { successMessage: "Bank account deleted", invalidate }
  );

  const confirmArchive = (account: IBankAccount) =>
    openConfirm({
      title: `Archive ${account.account_name}?`,
      message:
        "It stops appearing in payment pickers but past transactions keep it.",
      okText: "Archive",
      onConfirm: () =>
        setActiveMutation.mutate({ id: account.id, active: false }),
    });

  const confirmRestore = (account: IBankAccount) =>
    openConfirm({
      title: `Restore ${account.account_name}?`,
      message: "It appears in payment pickers again.",
      okText: "Restore",
      onConfirm: () =>
        setActiveMutation.mutate({ id: account.id, active: true }),
    });

  const confirmRemove = (account: IBankAccount) =>
    openConfirm({
      kind: "delete",
      title: `Delete ${account.account_name}?`,
      message:
        "Only possible while no transaction uses it — otherwise archive it.",
      onConfirm: () => removeMutation.mutate(account.id),
    });

  const createDefaults: DefaultValues<IBankAccountInput> = {
    bank_name: "",
    account_name: "",
    account_number: "",
    sort: nextSort,
  };

  const editDefaults: DefaultValues<IBankAccountInput> = {
    bank_name: editing?.bank?.name ?? "",
    account_name: editing?.account_name ?? "",
    account_number: editing?.account_number ?? "",
    sort: editing?.sort ?? nextSort,
  };

  const rows = useWithPendingRows(
    bankAccounts,
    (write) => bankServices.pendingAccountOf(write, knownBanks),
    { enabled: true }
  );

  return {
    bankAccounts: rows,
    loading,
    refreshing,
    error,
    retry,
    editing,
    fields,
    createModal,
    editModal,
    createDefaults,
    editDefaults,
    createMutation,
    updateMutation,
    confirmArchive,
    confirmRestore,
    confirmRemove,
  };
};
