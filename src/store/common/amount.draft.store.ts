import { create } from "./reset.store";

type IAmountDraft = {
  field: string;
  text: string;
};

type States = {
  draft: IAmountDraft | null;
};

type Actions = {
  setDraft: (field: string, text: string) => void;
  clearDraft: (field: string) => void;
};

const initialValues: States = {
  draft: null,
};

export const useAmountDraftStore = create<States & Actions>()((set) => ({
  ...initialValues,
  setDraft: (field, text) => set({ draft: { field, text } }),
  clearDraft: (field) =>
    set((state) => (state.draft?.field === field ? { draft: null } : state)),
}));

export const selectAmountDraft = (field: string) => (state: States) =>
  state.draft?.field === field ? state.draft.text : null;
