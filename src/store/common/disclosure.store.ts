import { create } from "./reset.store";

type States = {
  collapsedSections: Record<string, readonly string[]>;
};

type Actions = {
  setSectionCollapsed: (scope: string, section: string, collapsed: boolean) => void;
  resetSections: (scope: string) => void;
};

const initialValues: States = {
  collapsedSections: {},
};

const noCollapsedSections: readonly string[] = [];

export const useDisclosureStore = create<States & Actions>()((set) => ({
  ...initialValues,
  setSectionCollapsed: (scope, section, collapsed) =>
    set((state) => {
      const current = state.collapsedSections[scope] ?? noCollapsedSections;
      const others = current.filter((key) => key !== section);
      return {
        collapsedSections: {
          ...state.collapsedSections,
          [scope]: collapsed ? [...others, section] : others,
        },
      };
    }),
  resetSections: (scope) =>
    set((state) => {
      if (!state.collapsedSections[scope]) return state;
      const { [scope]: _cleared, ...rest } = state.collapsedSections;
      return { collapsedSections: rest };
    }),
}));

export const selectCollapsedSections = (scope: string) => (state: States) =>
  state.collapsedSections[scope] ?? noCollapsedSections;
