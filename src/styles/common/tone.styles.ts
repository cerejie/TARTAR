import { cva, type VariantProps } from "class-variance-authority";

export const toneText = cva("", {
  variants: {
    tone: {
      default: "text-foreground",
      brand: "text-foreground",
      positive: "text-positive",
      negative: "text-danger",
      warning: "text-warning",
      accent: "text-foreground",
      info: "text-foreground",
    },
  },
  defaultVariants: { tone: "default" },
});

export const toneChip = cva("", {
  variants: {
    tone: {
      default: "bg-muted text-foreground",
      brand: "bg-brand-soft text-brand",
      positive: "bg-positive/10 text-positive",
      negative: "bg-danger-bg text-danger",
      warning: "bg-warning/10 text-warning",
      accent: "bg-info-soft text-info",
      info: "bg-info-soft text-info",
    },
  },
  defaultVariants: { tone: "default" },
});

export const toneFill = cva("", {
  variants: {
    tone: {
      default: "bg-primary",
      brand: "bg-brand",
      positive: "bg-positive",
      negative: "bg-danger",
      warning: "bg-warning",
      accent: "bg-info",
      info: "bg-info",
    },
  },
  defaultVariants: { tone: "default" },
});

export type Tone = NonNullable<VariantProps<typeof toneText>["tone"]>;
