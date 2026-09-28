import { useSyncExternalStore } from "react";

const desktopMediaQuery = "(min-width: 64rem)";

const subscribeDesktop = (onChange: () => void) => {
  const media = window.matchMedia(desktopMediaQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};

const readDesktop = () => window.matchMedia(desktopMediaQuery).matches;

const readServerDesktop = () => false;

export const useIsDesktop = () =>
  useSyncExternalStore(subscribeDesktop, readDesktop, readServerDesktop);
