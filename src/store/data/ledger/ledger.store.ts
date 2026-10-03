import type { LedgerPartyTab } from "../../../enums/ledger.enum";
import type {
  ICustomerLedgerKey,
  ILedgerPartyKey,
} from "../../../models/data/ledger/ledger.response";
import { create } from "../../common/reset.store";

type States = {
  ledgerCustomer: ICustomerLedgerKey | null;
  ledgerDetailOpen: boolean;
  ledgerSelection: string[];
  ledgerSelecting: boolean;
  ledgerPartyTab: LedgerPartyTab;
  ledgerSupplier: ILedgerPartyKey | null;
  supplierDetailOpen: boolean;
};

type Actions = {
  setLedgerCustomer: (customer: ICustomerLedgerKey | null) => void;
  closeLedgerDetail: () => void;
  setLedgerSelection: (ids: string[]) => void;
  setLedgerSelecting: (selecting: boolean) => void;
  setLedgerPartyTab: (tab: LedgerPartyTab) => void;
  setLedgerSupplier: (supplier: ILedgerPartyKey | null) => void;
  closeSupplierDetail: () => void;
};

const initialValues: States = {
  ledgerCustomer: null,
  ledgerDetailOpen: false,
  ledgerSelection: [],
  ledgerSelecting: false,
  ledgerPartyTab: "records",
  ledgerSupplier: null,
  supplierDetailOpen: false,
};

export const useLedgerStore = create<States & Actions>()((set) => ({
  ...initialValues,
  setLedgerCustomer: (ledgerCustomer) =>
    set({
      ledgerCustomer,
      ledgerDetailOpen: !!ledgerCustomer,
      ledgerSelection: [],
      ledgerSelecting: false,
      ledgerPartyTab: "records",
    }),
  closeLedgerDetail: () => set({ ledgerDetailOpen: false }),
  setLedgerSelection: (ledgerSelection) => set({ ledgerSelection }),
  setLedgerSelecting: (ledgerSelecting) =>
    set(
      ledgerSelecting
        ? { ledgerSelecting, ledgerPartyTab: "records" }
        : { ledgerSelecting, ledgerSelection: [] }
    ),
  setLedgerPartyTab: (ledgerPartyTab) =>
    set(
      ledgerPartyTab === "records"
        ? { ledgerPartyTab }
        : { ledgerPartyTab, ledgerSelecting: false, ledgerSelection: [] }
    ),
  setLedgerSupplier: (ledgerSupplier) =>
    set({
      ledgerSupplier,
      supplierDetailOpen: !!ledgerSupplier,
      ledgerPartyTab: "records",
    }),
  closeSupplierDetail: () => set({ supplierDetailOpen: false }),
}));
