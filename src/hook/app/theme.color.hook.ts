import { useEffect } from "react";

const themeColorSelector = 'meta[name="theme-color"]';

export const backdropThemeColorToken = "--backdrop";
export const panelThemeColorToken = "--panel";

const readToken = (token: string): string =>
  getComputedStyle(document.documentElement).getPropertyValue(token).trim();

export const useThemeColorHook = (token: string) => {
  useEffect(() => {
    const applyThemeColor = () =>
      document.head.querySelector(themeColorSelector)?.setAttribute("content", readToken(token));

    applyThemeColor();

    const modeObserver = new MutationObserver(applyThemeColor);
    modeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => modeObserver.disconnect();
  }, [token]);
};
