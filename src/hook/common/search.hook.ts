import { useLocation } from "react-router-dom";
import {
  selectSearch,
  selectSearchMode,
  useViewStore,
} from "../../store/common/view.store";

import type { ILedgerFilterScope } from "../../models/common/filter.model";

export const useSearch = (key: string) => {
  const search = useViewStore(selectSearch(key));
  const set = useViewStore((state) => state.setSearch);

  return { search, setSearch: (value: string) => set(key, value) };
};

export const useSearchMode = () => {
  const { pathname } = useLocation();
  const searchMode = useViewStore(selectSearchMode);
  const open = useViewStore((state) => state.openSearchMode);
  const closeSearchMode = useViewStore((state) => state.closeSearchMode);

  return {
    activeSearchMode: searchMode?.pathname === pathname ? searchMode : null,
    openSearchMode: (scope: ILedgerFilterScope, placeholder: string) =>
      open({ scope, placeholder, pathname }),
    closeSearchMode,
  };
};
