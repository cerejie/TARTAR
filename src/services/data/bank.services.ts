import type { IQueuedWrite } from "../../models/common/write.model";
import type { IBankAccountInput } from "../../models/data/bank/bank.request";
import type {
  IBank,
  IBankAccount,
} from "../../models/data/bank/bank.response";
import { runWrite } from "../../store/common/sync.store";
import { supabase, toError } from "../../utils/supabase.utils";
import { queuedAtOf, queuedInsertOf } from "../../utils/write.utils";

const bankTable = "banks";
const bankAccountTable = "bank_accounts";

const bankColumns = "id, name, created_at";
const bankAccountColumns =
  "id, bank_id, account_name, account_number, sort, active, created_at, bank:banks(name)";

const accountErrors: Record<string, string> = {
  "23505": "This bank already has an account with that number",
  "23503": "This account is used by existing transactions — archive it instead",
};

const toAccountValues = (bankId: string, values: IBankAccountInput) => ({
  bank_id: bankId,
  account_name: values.account_name.trim(),
  account_number: values.account_number.trim(),
  sort: values.sort,
});

const bankServices = {
  getBanks: async (): Promise<IBank[]> => {
    const { data, error } = await supabase
      .from(bankTable)
      .select(bankColumns)
      .order("name", { ascending: true });

    if (error) throw toError(error);

    return (data ?? []) as IBank[];
  },

  createBank: (id: string, name: string) =>
    runWrite({
      label: `New bank "${name.trim()}"`,
      kind: "insert",
      table: bankTable,
      values: { id, name: name.trim() },
    }),

  getAccounts: async (): Promise<IBankAccount[]> => {
    const { data, error } = await supabase
      .from(bankAccountTable)
      .select(bankAccountColumns)
      .order("sort", { ascending: true })
      .order("account_name", { ascending: true });

    if (error) throw toError(error);

    return (data ?? []) as unknown as IBankAccount[];
  },

  createAccount: (bankId: string, values: IBankAccountInput) =>
    runWrite({
      label: `New bank account "${values.account_name.trim()}"`,
      kind: "insert",
      table: bankAccountTable,
      values: { ...toAccountValues(bankId, values), active: true },
      errors: accountErrors,
    }),

  updateAccount: (id: string, bankId: string, values: IBankAccountInput) =>
    runWrite({
      label: `Update bank account "${values.account_name.trim()}"`,
      kind: "update",
      table: bankAccountTable,
      values: toAccountValues(bankId, values),
      match: { id },
      errors: accountErrors,
    }),

  setAccountActive: (id: string, active: boolean) =>
    runWrite({
      label: active ? "Restore bank account" : "Archive bank account",
      kind: "update",
      table: bankAccountTable,
      values: { active },
      match: { id },
    }),

  deleteAccount: (id: string) =>
    runWrite({
      label: "Delete bank account",
      kind: "delete",
      table: bankAccountTable,
      match: { id },
      errors: accountErrors,
    }),

  pendingBankOf: (write: IQueuedWrite): IBank | null => {
    const values = queuedInsertOf(write, bankTable);
    if (!values) return null;

    return { created_at: queuedAtOf(write), ...values } as unknown as IBank;
  },

  pendingAccountOf: (
    write: IQueuedWrite,
    banks: readonly IBank[]
  ): IBankAccount | null => {
    const values = queuedInsertOf(write, bankAccountTable);
    if (!values) return null;

    const bank = banks.find((known) => known.id === values.bank_id);

    return {
      bank: bank ? { name: bank.name } : null,
      created_at: queuedAtOf(write),
      ...values,
    } as unknown as IBankAccount;
  },
};

export default bankServices;
