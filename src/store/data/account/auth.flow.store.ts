import { create } from "../../common/reset.store";

export type ResetStep = "email" | "done";

type States = {
  registered: boolean;
  resetStep: ResetStep;
};

type Actions = {
  setRegistered: () => void;
  setResetDone: () => void;
  reset: () => void;
};

const initialValues: States = {
  registered: false,
  resetStep: "email",
};

export const useAuthFlowStore = create<States & Actions>()((set) => ({
  ...initialValues,
  setRegistered: () => set({ registered: true }),
  setResetDone: () => set({ resetStep: "done" }),
  reset: () => set({ ...initialValues }),
}));

export const selectRegistered = (state: States): boolean => state.registered;

export const selectResetStep = (state: States): ResetStep => state.resetStep;
