import { create } from "../../common/reset.store";

export type ResetStep = "email" | "password" | "done";

type States = {
  registered: boolean;
  resetStep: ResetStep;
  resetEmail: string;
};

type Actions = {
  setRegistered: () => void;
  setResetEmail: (email: string) => void;
  setResetDone: () => void;
  reset: () => void;
};

const initialValues: States = {
  registered: false,
  resetStep: "email",
  resetEmail: "",
};

export const useAuthFlowStore = create<States & Actions>()((set) => ({
  ...initialValues,
  setRegistered: () => set({ registered: true }),
  setResetEmail: (email) => set({ resetEmail: email, resetStep: "password" }),
  setResetDone: () => set({ resetStep: "done" }),
  reset: () => set({ ...initialValues }),
}));

export const selectRegistered = (state: States): boolean => state.registered;

export const selectResetStep = (state: States): ResetStep => state.resetStep;

export const selectResetEmail = (state: States): string => state.resetEmail;
