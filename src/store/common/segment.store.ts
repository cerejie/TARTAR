import { create } from "./reset.store";

type States = {
  segments: Record<string, string>;
};

type Actions = {
  setSegment: (key: string, segment: string) => void;
};

const initialValues: States = {
  segments: {},
};

export const useSegmentStore = create<States & Actions>()((set) => ({
  ...initialValues,
  setSegment: (key, segment) =>
    set((state) => ({ segments: { ...state.segments, [key]: segment } })),
}));

export const selectSegment = (key: string) => (state: States) =>
  state.segments[key] ?? null;
