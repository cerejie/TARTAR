import { create } from "./reset.store";

type States = {
  revealedFields: readonly string[];
};

type Actions = {
  setRevealed: (field: string, revealed: boolean) => void;
};

const initialValues: States = {
  revealedFields: [],
};

export const useRevealStore = create<States & Actions>()((set) => ({
  ...initialValues,
  setRevealed: (field, revealed) =>
    set((state) => {
      const others = state.revealedFields.filter((key) => key !== field);
      return { revealedFields: revealed ? [...others, field] : others };
    }),
}));

export const selectIsRevealed = (field: string) => (state: States) =>
  state.revealedFields.includes(field);
