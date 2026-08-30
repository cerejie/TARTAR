export type ViewLayout = "stack" | "bento";

export type BentoSpan =
  | "quarter"
  | "third"
  | "half"
  | "twoThirds"
  | "full";

export type CardTone = "surface" | "ink" | "accent";

export type ModalSize = "sm" | "md" | "lg" | "xl";

export const modalWidths: Record<ModalSize, number> = {
  sm: 420,
  md: 560,
  lg: 760,
  xl: 1040,
};
