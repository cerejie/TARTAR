import { styleVariants } from "@vanilla-extract/css";

export const tone = styleVariants({
  default: {},
  brand: {},
  positive: {},
  negative: {},
  warning: {},
  accent: {},
  info: {},
});

export type Tone = keyof typeof tone;
