import type { DefaultValues } from "react-hook-form";
import {
  customerListKey,
  paymentListKey,
  receivableListKey,
} from "../../../keys/query.keys";
import type { IQueryOptions } from "../../../models/common/query.model";
import type { ICustomerLedgerKey } from "../../../models/data/ledger/ledger.response";
import type { IPartyInput } from "../../../models/data/party/party.request";
import {
  customerServices,
  findCustomerRecord,
} from "../../../services/data/party.services";
import { useMutation } from "../../common/mutation.hook";
import { useCustomerListHook } from "./customer.list.hook";

export const useCustomerRecordHook = (
  ledger: ICustomerLedgerKey | null,
  options?: IQueryOptions
) => {
  const query = useCustomerListHook(options);

  return {
    ...query,
    record: findCustomerRecord(query.customers, ledger),
    recordFor: (customer: ICustomerLedgerKey) =>
      findCustomerRecord(query.customers, customer),
  };
};

export const useCustomerDetailsHook = (
  ledger: ICustomerLedgerKey | null,
  onClose: () => void
) => {
  const { record, updatedAt } = useCustomerRecordHook(ledger);

  const saveMutation = useMutation(
    (payload: { ledger: ICustomerLedgerKey; values: IPartyInput }) =>
      customerServices.saveDetails(payload.ledger, payload.values),
    {
      successMessage: "Customer details saved",
      invalidate: [customerListKey, receivableListKey, paymentListKey],
      onSuccess: onClose,
    }
  );

  const defaults: DefaultValues<IPartyInput> = {
    name: record?.name ?? ledger?.customerName ?? "",
    contact_person: record?.contact_person ?? "",
    contact: record?.contact ?? "",
    address: record?.address ?? "",
  };

  return { record, ready: updatedAt > 0, defaults, saveMutation };
};
