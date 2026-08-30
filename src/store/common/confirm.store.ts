import type { IConfirmRequest } from "../../models/common/modal.model";
import { create } from "./reset.store";

type States = {
  confirm: IConfirmRequest;
  running: boolean;
};

type Actions = {
  openConfirm: (value: Omit<IConfirmRequest, "visible">) => void;
  closeConfirm: () => void;
  runConfirm: () => Promise<void>;
};

const closedConfirm: IConfirmRequest = { visible: false };

const initialValues: States = {
  confirm: closedConfirm,
  running: false,
};

export const useConfirmStore = create<States & Actions>()((set, get) => ({
  ...initialValues,
  openConfirm: (value) => set({ confirm: { ...value, visible: true } }),
  closeConfirm: () => set({ confirm: closedConfirm, running: false }),
  runConfirm: async () => {
    const action = get().confirm.onConfirm;

    if (action) {
      set({ running: true });
      await action();
    }

    set({ confirm: closedConfirm, running: false });
  },
}));

export const selectConfirm = (state: States) => state.confirm;

export const selectConfirmRunning = (state: States) => state.running;
