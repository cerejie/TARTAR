import { useSyncExternalStore } from "react";
import type { DeviceClass } from "../../models/common/view.model";
import { isTextEntry } from "../../utils/keyboard.utils";

const phoneMediaQuery =
  "(width < 48rem), (width < 64rem) and (height < 30rem)";
const tabletPortraitMediaQuery = "(width < 64rem) and (orientation: portrait)";
const desktopMediaQuery = "(width >= 64rem)";
const coarsePointerQuery = "(pointer: coarse)";

const deviceMediaQueries = [
  phoneMediaQuery,
  tabletPortraitMediaQuery,
  desktopMediaQuery,
] as const;

const matches = (query: string) => window.matchMedia(query).matches;

const subscribeDevice = (onChange: () => void) => {
  const medias = deviceMediaQueries.map((query) => window.matchMedia(query));
  medias.forEach((media) => media.addEventListener("change", onChange));
  return () =>
    medias.forEach((media) => media.removeEventListener("change", onChange));
};

const measureDevice = (): DeviceClass => {
  if (matches(phoneMediaQuery)) return "phone";
  if (matches(desktopMediaQuery)) return "desktop";
  if (matches(tabletPortraitMediaQuery)) return "tabletPortrait";
  return "tabletLandscape";
};

let settledDevice: DeviceClass | null = null;

const isTouchTyping = () =>
  matches(coarsePointerQuery) && isTextEntry(document.activeElement);

const readDevice = (): DeviceClass => {
  if (settledDevice && isTouchTyping()) return settledDevice;
  settledDevice = measureDevice();
  return settledDevice;
};

const readServerDevice = (): DeviceClass => "desktop";

const useDeviceClass = () =>
  useSyncExternalStore(subscribeDevice, readDevice, readServerDevice);

export const useIsPhone = () => useDeviceClass() === "phone";

export const useIsCompact = () => {
  const device = useDeviceClass();
  return device === "phone" || device === "tabletPortrait";
};

export const useIsDesktop = () => useDeviceClass() === "desktop";
