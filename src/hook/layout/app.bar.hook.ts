import { branchSheetModalKey } from "../../keys/modal.keys";
import { useIsCompact } from "../common/breakpoint.hook";
import { useLedgerFilters } from "../common/filter.hook";
import { useModal } from "../common/modal.hook";
import { useScrolledPast } from "../common/scroll.hook";
import { useSearchMode } from "../common/search.hook";

import type { ISearchMode } from "../../models/common/view.model";

const compactTitleOffset = 44;
const collapseActionOffset = 120;

export const useAppBarHook = (floating: boolean) => {
  const scrolled = useScrolledPast(compactTitleOffset);

  return { scrolled, compact: !floating && scrolled };
};

export const useFloatingActionHook = () => {
  const floating = useIsCompact();
  const scrolled = useScrolledPast(collapseActionOffset);

  return { floating, collapsed: floating && scrolled };
};

export const useBranchSheetHook = (floating: boolean) => {
  const { modal, openModal, closeModal } = useModal(branchSheetModalKey);

  return {
    showSheet: !floating,
    sheetOpen: modal.visible,
    openSheet: () => openModal(),
    closeSheet: closeModal,
  };
};

export const useAppBarSearchHook = (searchMode: ISearchMode) => {
  const { filters, setFilters } = useLedgerFilters(searchMode.scope);
  const { closeSearchMode } = useSearchMode();

  return {
    value: filters.search,
    placeholder: searchMode.placeholder,
    changeSearch: (search: string | undefined) => setFilters({ search }),
    closeSearch: () => {
      setFilters({ search: undefined });
      closeSearchMode();
    },
  };
};
