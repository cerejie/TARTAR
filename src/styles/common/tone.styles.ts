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
      default: "bg-cloud text-foreground",
      brand: "bg-lime text-ink",
      positive: "bg-positive/10 text-positive",
      negative: "bg-danger-bg text-danger",
      warning: "bg-warning/10 text-warning",
      accent: "bg-lilac-soft text-ink",
      info: "bg-lilac-soft text-ink",
    },
  },
  defaultVariants: { tone: "default" },
});

export const toneFill = cva("", {
  variants: {
    tone: {
      default: "bg-primary",
      brand: "bg-lime-deep",
      positive: "bg-positive",
      negative: "bg-danger",
      warning: "bg-warning",
      accent: "bg-lilac",
      info: "bg-lilac",
    },
  },
  defaultVariants: { tone: "default" },
});

export type Tone = NonNullable<VariantProps<typeof toneText>["tone"]>;
