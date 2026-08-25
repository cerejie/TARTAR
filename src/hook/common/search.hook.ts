import {
  selectSearch,
  useViewStore,
} from "../../store/common/view.store";

export const useSearch = (key: string) => {
  const search = useViewStore(selectSearch(key));
  const set = useViewStore((state) => state.setSearch);

  return { search, setSearch: (value: string) => set(key, value) };
};
