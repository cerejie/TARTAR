import {
  cashAccountLabels,
  cashAccountValues,
} from "../../../enums/transaction.enum";
import { bankAccountListKey, bankListKey } from "../../../keys/query.keys";
import bankServices from "../../../services/data/bank.services";
import { toOptions } from "../../../utils/option.utils";
import { useQuery } from "../../common/query.hook";
import type { CashAccount } from "../../../enums/transaction.enum";
import type {
  IFieldConfig,
  IFieldOption,
} from "../../../models/common/field.model";
import type { IPaymentAccountInput } from "../../../models/data/bank/bank.request";
import type {
  IBank,
  IBankAccount,
} from "../../../models/data/bank/bank.response";

type IPaymentRow = {
  cash_account: CashAccount | null;
  bank_account_id: string | null;
};

const accountLabel = (account: IBankAccount) =>
  `${account.bank?.name ?? ""} · ${account.account_name} · ${account.account_number}`;

const isBank = (values: IPaymentAccountInput) =>
  values.cash_account === "bank_account";

export const useBankAccountListHook = () => {
  const banksQuery = useQuery<IBank[]>(bankListKey, bankServices.getBanks);
  const accountsQuery = useQuery<IBankAccount[]>(
    bankAccountListKey,
    bankServices.getAccounts
  );

  const banks = banksQuery.data ?? [];
  const bankAccounts = accountsQuery.data ?? [];
  const accountById = new Map(
    bankAccounts.map((account) => [account.id, account])
  );

  const isOffered = (account: IBankAccount, values: IPaymentAccountInput) =>
    account.active || account.id === values.bank_account_id;

  const bankOptionsOf = (values: IPaymentAccountInput): IFieldOption[] =>
    banks
      .filter((bank) =>
        bankAccounts.some(
          (account) => account.bank_id === bank.id && isOffered(account, values)
        )
      )
      .map((bank) => ({ value: bank.id, label: bank.name }));

  const accountOptionsOf = (values: IPaymentAccountInput): IFieldOption[] =>
    bankAccounts
      .filter(
        (account) =>
          account.bank_id === values.bank_id && isOffered(account, values)
      )
      .map((account) => ({
        value: account.id,
        label: `${account.account_name} · ${account.account_number}`,
      }));

  const accountLabelOf = (id: string | null | undefined) => {
    const account = id ? accountById.get(id) : undefined;
    return account ? accountLabel(account) : null;
  };

  const paymentLabelOf = (row: IPaymentRow) =>
    accountLabelOf(row.bank_account_id) ??
    (row.cash_account ? cashAccountLabels[row.cash_account] : "—");

  const paymentDefaultsOf = (row: IPaymentRow): IPaymentAccountInput => ({
    cash_account: row.cash_account,
    bank_account_id: row.bank_account_id,
    bank_id: row.bank_account_id
      ? accountById.get(row.bank_account_id)?.bank_id ?? null
      : null,
  });

  const bankAccountFields = <TValues extends IPaymentAccountInput>(
    visible: (values: TValues) => boolean
  ): IFieldConfig<TValues>[] => {
    const fields: IFieldConfig<IPaymentAccountInput>[] = [
      {
        name: "bank_id",
        label: "Bank",
        type: "select",
        span: "half",
        required: true,
        optionsOf: bankOptionsOf,
        hidden: (values) => !visible(values as TValues),
      },
      {
        name: "bank_account_id",
        label: "Account",
        type: "select",
        span: "half",
        required: true,
        optionsOf: accountOptionsOf,
        hidden: (values) => !visible(values as TValues) || !values.bank_id,
      },
    ];

    return fields as unknown as IFieldConfig<TValues>[];
  };

  const paymentFields = <TValues extends IPaymentAccountInput>(
    label: string
  ): IFieldConfig<TValues>[] => {
    const cashAccountField: IFieldConfig<IPaymentAccountInput> = {
      name: "cash_account",
      label,
      type: "select",
      span: "half",
      allowClear: true,
      options: toOptions(cashAccountValues, cashAccountLabels),
    };

    return [
      cashAccountField as unknown as IFieldConfig<TValues>,
      ...bankAccountFields<TValues>(isBank),
    ];
  };

  return {
    banks,
    bankAccounts,
    loading: accountsQuery.isInitialLoading,
    refreshing: accountsQuery.isRefreshing || banksQuery.isRefreshing,
    error: accountsQuery.error ?? banksQuery.error,
    retry: () => {
      void banksQuery.refetch();
      void accountsQuery.refetch();
    },
    accountLabelOf,
    paymentLabelOf,
    paymentDefaultsOf,
    bankAccountFields,
    paymentFields,
  };
};
