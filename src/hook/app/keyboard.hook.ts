import { useEffect } from "react";
import { isTextEntry } from "../../utils/keyboard.utils";

const keyboardInsetToken = "--keyboard-inset";
const visualHeightToken = "--visual-viewport-height";
const keyboardOpenAttribute = "data-keyboard-open";
const coarsePointerQuery = "(pointer: coarse)";

const isTouchTyping = (element: unknown): element is HTMLElement =>
  window.matchMedia(coarsePointerQuery).matches && isTextEntry(element);

const revealField = (element: unknown) => {
  if (!isTouchTyping(element)) return;
  requestAnimationFrame(() => element.scrollIntoView({ block: "nearest" }));
};

const markKeyboard = (element: unknown) =>
  document.documentElement.toggleAttribute(
    keyboardOpenAttribute,
    isTouchTyping(element),
  );

export const useKeyboardInsetHook = () => {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const root = document.documentElement;

    const applyKeyboardInset = () => {
      const covered = window.innerHeight - viewport.height - viewport.offsetTop;
      root.style.setProperty(
        keyboardInsetToken,
        `${Math.max(0, Math.round(covered))}px`,
      );
      root.style.setProperty(visualHeightToken, `${Math.round(viewport.height)}px`);
    };

    const handleResize = () => {
      applyKeyboardInset();
      revealField(document.activeElement);
    };

    const handleFocusIn = (event: FocusEvent) => {
      markKeyboard(event.target);
      revealField(event.target);
    };

    const handleFocusOut = (event: FocusEvent) => markKeyboard(event.relatedTarget);

    applyKeyboardInset();
    viewport.addEventListener("resize", handleResize);
    viewport.addEventListener("scroll", applyKeyboardInset);
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);

    return () => {
      viewport.removeEventListener("resize", handleResize);
      viewport.removeEventListener("scroll", applyKeyboardInset);
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
      root.style.removeProperty(keyboardInsetToken);
      root.style.removeProperty(visualHeightToken);
      root.removeAttribute(keyboardOpenAttribute);
    };
  }, []);
};
