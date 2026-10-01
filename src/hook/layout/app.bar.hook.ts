import { useIsMobile } from "@/hook/use-mobile";
import { branchSheetModalKey } from "../../keys/modal.keys";
import { useIsTabletUp } from "../common/breakpoint.hook";
import { useModal } from "../common/modal.hook";
import { useScrolledPast } from "../common/scroll.hook";

const compactTitleOffset = 44;
const collapseActionOffset = 120;

export const useAppBarHook = () => {
  const isPhone = !useIsTabletUp();
  const scrolled = useScrolledPast(compactTitleOffset);

  return { scrolled, compact: isPhone && scrolled };
};

export const useFloatingActionHook = () => {
  const floating = !useIsTabletUp();
  const scrolled = useScrolledPast(collapseActionOffset);

  return { floating, collapsed: floating && scrolled };
};

export const useBranchSheetHook = () => {
  const isMobile = useIsMobile();
  const { modal, openModal, closeModal } = useModal(branchSheetModalKey);

  return {
    showSheet: isMobile,
    sheetOpen: modal.visible,
    openSheet: () => openModal(),
    closeSheet: closeModal,
  };
};
