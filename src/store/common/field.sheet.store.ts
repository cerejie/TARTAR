import { create } from "./reset.store";

type States = {
  openSheetId: string | null;
  draft: string;
};

type Actions = {
  openSheet: (sheetId: string, draft: string) => void;
  setDraft: (draft: string) => void;
  closeSheet: () => void;
};

const initialValues: States = {
  openSheetId: null,
  draft: "",
};

export const useFieldSheetStore = create<States & Actions>()((set) => ({
  ...initialValues,
  openSheet: (sheetId, draft) => set({ openSheetId: sheetId, draft }),
  setDraft: (draft) => set({ draft }),
  closeSheet: () => set(initialValues),
}));

export const selectIsSheetOpen = (sheetId: string) => (state: States) =>
  state.openSheetId === sheetId;

export const selectSheetDraft = (sheetId: string) => (state: States) =>
  state.openSheetId === sheetId ? state.draft : "";
