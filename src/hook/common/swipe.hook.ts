import { useRef } from "react";

import type { PointerEvent } from "react";

const swipeCloseDistance = 96;
const sheetPanelSelector = '[data-slot="sheet-content"]';

const sheetPanelOf = (target: HTMLElement) =>
  target.closest<HTMLElement>(sheetPanelSelector);

export const useSwipeToClose = (onClose: () => void) => {
  const startY = useRef<number | null>(null);

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    startY.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
    sheetPanelOf(event.currentTarget)?.style.setProperty("transition", "none");
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (startY.current === null) return;
    const offset = Math.max(0, event.clientY - startY.current);
    sheetPanelOf(event.currentTarget)?.style.setProperty("translate", `0 ${offset}px`);
  };

  const handlePointerEnd = (event: PointerEvent<HTMLElement>) => {
    if (startY.current === null) return;
    const offset = event.clientY - startY.current;
    startY.current = null;
    const panel = sheetPanelOf(event.currentTarget);
    panel?.style.removeProperty("transition");

    if (offset > swipeCloseDistance) {
      onClose();
      return;
    }

    panel?.style.removeProperty("translate");
  };

  return {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerEnd,
    onPointerCancel: handlePointerEnd,
  };
};
