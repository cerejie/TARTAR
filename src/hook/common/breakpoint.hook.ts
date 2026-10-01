import { useSyncExternalStore } from "react";

const desktopMediaQuery = "(min-width: 64rem)";
const tabletUpMediaQuery = "(min-width: 48rem)";

const subscribeTo = (query: string) => (onChange: () => void) => {
  const media = window.matchMedia(query);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};

const readMatch = (query: string) => () => window.matchMedia(query).matches;

const readServerMatch = () => false;

const subscribeDesktop = subscribeTo(desktopMediaQuery);
const readDesktop = readMatch(desktopMediaQuery);

const subscribeTabletUp = subscribeTo(tabletUpMediaQuery);
const readTabletUp = readMatch(tabletUpMediaQuery);

export const useIsDesktop = () =>
  useSyncExternalStore(subscribeDesktop, readDesktop, readServerMatch);

export const useIsTabletUp = () =>
  useSyncExternalStore(subscribeTabletUp, readTabletUp, readServerMatch);
