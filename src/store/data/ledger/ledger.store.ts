import type { ICustomerLedgerKey } from "../../../models/data/ledger/ledger.response";
import { create } from "../../common/reset.store";

type States = {
  ledgerCustomer: ICustomerLedgerKey | null;
  ledgerDetailOpen: boolean;
  ledgerSelection: string[];
};

type Actions = {
  setLedgerCustomer: (customer: ICustomerLedgerKey | null) => void;
  closeLedgerDetail: () => void;
  setLedgerSelection: (ids: string[]) => void;
};

const initialValues: States = {
  ledgerCustomer: null,
  ledgerDetailOpen: false,
  ledgerSelection: [],
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
}));
