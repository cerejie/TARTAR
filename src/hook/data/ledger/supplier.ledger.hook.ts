import { supplierLedgerModalKey } from "../../../keys/modal.keys";
import { ledgerPartyKey, scopedKey } from "../../../keys/query.keys";
import { payableServices } from "../../../services/data/ledger.services";
import { useLedgerStore } from "../../../store/data/ledger/ledger.store";
import { useModal } from "../../common/modal.hook";
import { useQuery } from "../../common/query.hook";
import { useSearch } from "../../common/search.hook";
import type {
  ILedgerPartyKey,
  ILedgerPartySummary,
} from "../../../models/data/ledger/ledger.response";

export const supplierSummaryKey = scopedKey(ledgerPartyKey, "payables");

export const useSupplierLedgerHook = () => {
  const ledgerModal = useModal(supplierLedgerModalKey);
  const { search, setSearch } = useSearch(supplierLedgerModalKey);

  const detailOpen = useLedgerStore((state) => state.supplierDetailOpen);
  const setLedgerSupplier = useLedgerStore((state) => state.setLedgerSupplier);

  const query = useQuery<ILedgerPartySummary[]>(
    supplierSummaryKey,
    payableServices.getPartySummaries,
    { enabled: ledgerModal.modal.visible }
  );

  const searchTerm = search.trim().toLowerCase();
  const suppliers = (query.data ?? []).filter((supplier) =>
    supplier.partyName.toLowerCase().includes(searchTerm)
  );

  const openSupplier = (supplier: ILedgerPartyKey) =>
    setLedgerSupplier({
      partyId: supplier.partyId,
      partyName: supplier.partyName,
    });

  const openSupplierLedger = (supplier: ILedgerPartyKey) => {
    ledgerModal.openModal();
    openSupplier(supplier);
  };

  const close = () => {
    ledgerModal.closeModal();
    setLedgerSupplier(null);
  };

  return {
    ledgerModal,
    detailOpen,
    suppliers,
    loading: query.loading,
    search,
    setSearch,
    openSupplier,
    openSupplierLedger,
    close,
  };
};
