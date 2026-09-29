import type {
  ICustomerLedgerKey,
  ILedgerPartyKey,
} from "../../../models/data/ledger/ledger.response";
import { create } from "../../common/reset.store";

type States = {
  ledgerCustomer: ICustomerLedgerKey | null;
  ledgerDetailOpen: boolean;
  ledgerSelection: string[];
  ledgerSupplier: ILedgerPartyKey | null;
  supplierDetailOpen: boolean;
};

type Actions = {
  setLedgerCustomer: (customer: ICustomerLedgerKey | null) => void;
  closeLedgerDetail: () => void;
  setLedgerSelection: (ids: string[]) => void;
  setLedgerSupplier: (supplier: ILedgerPartyKey | null) => void;
  closeSupplierDetail: () => void;
};

const initialValues: States = {
  ledgerCustomer: null,
  ledgerDetailOpen: false,
  ledgerSelection: [],
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
    }),
  closeLedgerDetail: () => set({ ledgerDetailOpen: false }),
  setLedgerSelection: (ledgerSelection) => set({ ledgerSelection }),
  setLedgerSupplier: (ledgerSupplier) =>
    set({ ledgerSupplier, supplierDetailOpen: !!ledgerSupplier }),
  closeSupplierDetail: () => set({ supplierDetailOpen: false }),
}));
