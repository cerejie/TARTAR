import { useEffect } from "react";

const keyboardInsetToken = "--keyboard-inset";

export const useKeyboardInsetHook = () => {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const applyKeyboardInset = () => {
      const covered = window.innerHeight - viewport.height - viewport.offsetTop;
      document.documentElement.style.setProperty(
        keyboardInsetToken,
        `${Math.max(0, Math.round(covered))}px`,
      );
    };

    applyKeyboardInset();
    viewport.addEventListener("resize", applyKeyboardInset);
    viewport.addEventListener("scroll", applyKeyboardInset);

    return () => {
      viewport.removeEventListener("resize", applyKeyboardInset);
      viewport.removeEventListener("scroll", applyKeyboardInset);
      document.documentElement.style.removeProperty(keyboardInsetToken);
    };
  }, []);
};
