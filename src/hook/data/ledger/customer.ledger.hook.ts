import {
  customerDetailsModalKey,
  customerInfoModalKey,
  customerLedgerModalKey,
} from "../../../keys/modal.keys";
import { receivableListKey, scopedKey } from "../../../keys/query.keys";
import type { ICustomerReceivableSummary } from "../../../models/data/ledger/ledger.response";
import { ledgerKeyOf } from "../../../models/data/ledger/ledger.response";
import { receivableServices } from "../../../services/data/ledger.services";
import { useLedgerStore } from "../../../store/data/ledger/ledger.store";
import { useModal, useModalActions } from "../../common/modal.hook";
import { useQuery } from "../../common/query.hook";
import { useSearch } from "../../common/search.hook";
import { useCustomerRecordHook } from "../party/customer.record.hook";

export const customerSummaryKey = scopedKey(receivableListKey, "customers");

export const useCustomerLedgerHook = () => {
  const ledgerModal = useModal(customerLedgerModalKey);
  const detailsModal = useModal(customerDetailsModalKey);
  const { closeModal } = useModalActions();
  const { search, setSearch } = useSearch(customerLedgerModalKey);

  const detailOpen = useLedgerStore((state) => state.ledgerDetailOpen);
  const setLedgerCustomer = useLedgerStore((state) => state.setLedgerCustomer);

  const query = useQuery<ICustomerReceivableSummary[]>(
    customerSummaryKey,
    receivableServices.getCustomerSummaries,
    { enabled: ledgerModal.modal.open }
  );

  const summaries = query.data ?? [];
  const customers = summaries.filter((customer) =>
    customer.customerName.toLowerCase().includes(search.trim().toLowerCase())
  );

  const { recordFor } = useCustomerRecordHook(null, {
    enabled: ledgerModal.modal.open,
  });

  const detailsTarget =
    summaries.find(
      (customer) => ledgerKeyOf(customer) === detailsModal.modal.recordId
    ) ?? null;

  const close = () => {
    closeModal(customerLedgerModalKey);
    closeModal(customerDetailsModalKey);
    closeModal(customerInfoModalKey);
    setLedgerCustomer(null);
  };

  return {
    ledgerModal,
    detailsModal,
    detailsTarget,
    detailOpen,
    customers,
    loading: query.loading,
    search,
    setSearch,
    recordFor,
    openCustomer: setLedgerCustomer,
    close,
  };
};
