import { styleVariants } from "@vanilla-extract/css";

export const tone = styleVariants({
  default: {},
  brand: {},
  positive: {},
  negative: {},
  warning: {},
});

export type Tone = keyof typeof tone;
