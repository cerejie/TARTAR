import type { IPaymentAccountInput } from "../models/data/bank/bank.request";

export const derivePaymentValues = (
  changed: string,
  values: IPaymentAccountInput
): Partial<IPaymentAccountInput> | null => {
  if (changed === "cash_account" && values.cash_account !== "bank_account")
    return { bank_id: null, bank_account_id: null };
  if (changed === "bank_id") return { bank_account_id: null };

  return null;
};
