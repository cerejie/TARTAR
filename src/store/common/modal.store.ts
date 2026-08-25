import {
  IModalFormValue,
  type IModalRequest,
} from "../../models/common/modal.model";
import { create } from "./reset.store";

type States = {
  modals: Record<string, IModalRequest>;
};

type Actions = {
  openModal: (key: string, recordId?: string | null) => void;
  closeModal: (key: string) => void;
  resetModal: (key: string) => void;
};

const initialValues: States = {
  modals: {},
};

const closedModal = new IModalFormValue();

export const useModalStore = create<States & Actions>()((set) => ({
  ...initialValues,
  openModal: (key, recordId = null) =>
    set((state) => ({
      modals: { ...state.modals, [key]: { open: true, recordId } },
    })),
  closeModal: (key) =>
    set((state) => ({
      modals: { ...state.modals, [key]: { open: false, recordId: null } },
    })),
  resetModal: (key) =>
    set((state) => {
      const modals = { ...state.modals };
      delete modals[key];
      return { modals };
    }),
}));

export const selectModal = (key: string) => (state: States) =>
  state.modals[key] ?? closedModal;
