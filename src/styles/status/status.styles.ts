import { cva } from "class-variance-authority";

export const statusTag = cva("", {
  variants: {
    color: {
      default: "border-border text-muted-foreground",
      positive: "border-positive/30 bg-positive/10 text-positive",
      negative: "border-danger-border bg-danger-bg text-danger",
      warning: "border-warning/30 bg-warning/10 text-warning",
      info: "border-lilac bg-lilac-soft text-ink",
      brand: "border-lime-deep bg-lime-soft text-ink",
    },
  },
  defaultVariants: { color: "default" },
});

export const statDelta =
  "inline-flex items-center gap-0.5 text-xs font-medium tabular-nums [&_svg]:size-3";

export const progressRow = "flex-col gap-1.5";

export const progressHead = "flex w-full items-baseline justify-between gap-2";

export const progressValue = "font-heading text-lg font-semibold tabular-nums";

export const progressUnit = "ml-0.5 text-xs font-normal text-muted-foreground";

export const progressLabel = "flex items-center gap-1.5 text-sm text-muted-foreground";

export const progressDot = "size-2 rounded-full";

export const syncBadge = cva("", {
  variants: {
    state: {
      offline: "border-warning/30 bg-warning/10 text-warning",
      pending: "border-lilac bg-lilac-soft text-ink",
    },
  },
});

export const syncSpin = "animate-spin";

export const syncOnline = "inline-flex items-center gap-1.5 text-xs text-muted-foreground";

export const syncOnlineDot = "size-2 rounded-full bg-positive";

export const permissionDenied = "border";

export const emptyState = "min-h-56 p-6";
