const requiredCssFeatures: readonly (readonly [string, string])[] = [
  ["color", "color-mix(in oklab, red, blue)"],
  ["container-type", "inline-size"],
];

export const isBrowserSupported = (): boolean => {
  if (typeof CSS === "undefined" || typeof CSS.supports !== "function") return false;
  if (typeof CSS.registerProperty !== "function") return false;
  return requiredCssFeatures.every(([property, value]) => CSS.supports(property, value));
};
