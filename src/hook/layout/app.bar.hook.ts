import { branchSheetModalKey } from "../../keys/modal.keys";
import { useIsCompact } from "../common/breakpoint.hook";
import { useModal } from "../common/modal.hook";
import { useScrolledPast } from "../common/scroll.hook";

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

