import {
  IModalFormValue,
  type IModalRequest,
} from "../../models/common/modal.model";
import { create } from "./reset.store";

type States = {
  modals: Record<string, IModalRequest>;
};

type Actions = {
  setModal: <T>(key: string, value: IModalRequest<T>) => void;
  resetModal: (key: string) => void;
  removeModal: (key: string) => void;
};

const initialValues: States = {
  modals: {},
};

const closedModal = new IModalFormValue();

export const useModalStore = create<States & Actions>()((set) => ({
  ...initialValues,
  setModal: (key, value) =>
    set((state) => ({
      modals: { ...state.modals, [key]: value as IModalRequest },
    })),
  resetModal: (key) =>
    set((state) => ({
      modals: { ...state.modals, [key]: closedModal },
    })),
  removeModal: (key) =>
    set((state) => {
      const modals = { ...state.modals };
      delete modals[key];
      return { modals };
    }),
}));

export const selectModal = (key: string) => (state: States) =>
  state.modals[key] ?? closedModal;
