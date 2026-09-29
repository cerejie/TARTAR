import type { IBankAccountInput } from "../../models/data/bank/bank.request";
import type {
  IBank,
  IBankAccount,
} from "../../models/data/bank/bank.response";
import { supabase, toError } from "../../utils/supabase.utils";

const bankTable = "banks";
const bankAccountTable = "bank_accounts";

const bankColumns = "id, name, created_at";
const bankAccountColumns =
  "id, bank_id, account_name, account_number, sort, active, created_at, bank:banks(name)";

const accountConflict = (): Error =>
  new Error("This bank already has an account with that number");

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

  createBank: async (id: string, name: string): Promise<void> => {
    const { error } = await supabase
      .from(bankTable)
      .insert({ id, name: name.trim() });

    if (error) throw toError(error);
  },

  getAccounts: async (): Promise<IBankAccount[]> => {
    const { data, error } = await supabase
      .from(bankAccountTable)
      .select(bankAccountColumns)
      .order("sort", { ascending: true })
      .order("account_name", { ascending: true });

    if (error) throw toError(error);

    return (data ?? []) as unknown as IBankAccount[];
  },

  createAccount: async (
    bankId: string,
    values: IBankAccountInput
  ): Promise<void> => {
    const { error } = await supabase
      .from(bankAccountTable)
      .insert({ ...toAccountValues(bankId, values), active: true });

    if (error) {
      if (error.code === "23505") throw accountConflict();
      throw toError(error);
    }
  },

  updateAccount: async (
    id: string,
    bankId: string,
    values: IBankAccountInput
  ): Promise<void> => {
    const { error } = await supabase
      .from(bankAccountTable)
      .update(toAccountValues(bankId, values))
      .eq("id", id);

    if (error) {
      if (error.code === "23505") throw accountConflict();
      throw toError(error);
    }
  },

  setAccountActive: async (id: string, active: boolean): Promise<void> => {
    const { error } = await supabase
      .from(bankAccountTable)
      .update({ active })
      .eq("id", id);

    if (error) throw toError(error);
  },

  deleteAccount: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from(bankAccountTable)
      .delete()
      .eq("id", id);

    if (error) {
      if (error.code === "23503")
        throw new Error(
          "This account is used by existing transactions — archive it instead"
        );
      throw toError(error);
    }
  },
};

export default bankServices;
