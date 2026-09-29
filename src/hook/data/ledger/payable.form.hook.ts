import { payableMarkPaidModalKey } from "../../../keys/modal.keys";
import {
  ledgerPartyKey,
  ledgerSummaryKey,
  payableListKey,
  paymentListKey,
} from "../../../keys/query.keys";
import { markPaidSchema } from "../../../models/data/ledger/ledger.request";
import { ledgerBalance } from "../../../models/data/ledger/ledger.response";
import { payableServices } from "../../../services/data/ledger.services";
import {
  selectUserId,
  useAccountStore,
} from "../../../store/data/account/account.store";
import { todayIso } from "../../../utils/format.utils";
import { derivePaymentValues } from "../../../utils/payment.utils";
import { useModal } from "../../common/modal.hook";
import { useMutation } from "../../common/mutation.hook";
import { useBankAccountListHook } from "../bank/bank.account.list.hook";
import type { DefaultValues } from "react-hook-form";
import type { IFieldConfig } from "../../../models/common/field.model";
import type { IMarkPaidInput } from "../../../models/data/ledger/ledger.request";
import type { IPayable } from "../../../models/data/ledger/ledger.response";

const markPaidDefaultsOf = (): DefaultValues<IMarkPaidInput> => ({
  paid_at: todayIso(),
  cash_account: null,
  bank_id: null,
  bank_account_id: null,
});

export const usePayableFormHook = () => {
  const markPaidModal = useModal<IPayable>(payableMarkPaidModalKey);
  const createdBy = useAccountStore(selectUserId);
  const { paymentFields } = useBankAccountListHook();

  const payable = markPaidModal.modal.data ?? null;

  const markPaidMutation = useMutation(
    (target: IPayable, values: IMarkPaidInput) =>
      payableServices.markPaid(target, values, createdBy),
    {
      successMessage: "Payable marked paid",
      invalidate: [
        payableListKey,
        ledgerSummaryKey,
        ledgerPartyKey,
        paymentListKey,
      ],
      onSuccess: markPaidModal.closeModal,
    }
  );

  const markPaidFields: IFieldConfig<IMarkPaidInput>[] = [
    {
      name: "paid_at",
      label: "Date paid",
      type: "date",
      span: "half",
      required: true,
    },
    ...paymentFields<IMarkPaidInput>("Paid from").map((field) =>
      field.name === "cash_account"
        ? { ...field, required: true, allowClear: false }
        : field
    ),
  ];

  const submitMarkPaid = (values: IMarkPaidInput) => {
    if (!payable) return;
    void markPaidMutation.mutate(payable, values);
  };

  return {
    markPaidModal,
    payable,
    amountToPay: payable ? ledgerBalance(payable) : 0,
    markPaidSchema,
    markPaidFields,
    markPaidDefaults: markPaidDefaultsOf(),
    deriveMarkPaidValues: derivePaymentValues,
    submitting: markPaidMutation.loading,
    submitMarkPaid,
    openMarkPaid: markPaidModal.openModal,
  };
};
