import { cva } from "class-variance-authority";

export const statusTag = cva("", {
  variants: {
    color: {
      default: "border-border text-muted-foreground",
      positive: "border-positive/30 bg-positive/10 text-positive",
      negative: "border-danger-border bg-danger-bg text-danger",
      warning: "border-warning/30 bg-warning/10 text-warning",
      info: "border-info/30 bg-info-soft text-info",
      brand: "border-brand/30 bg-brand-soft text-brand",
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

export const countButton = "relative rounded-pill";

export const countBadge =
  "absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-pill bg-brand px-1 text-[10px] leading-none font-semibold text-on-brand";

export const offlineDot =
  "absolute right-0.5 bottom-0.5 size-2.5 rounded-pill border-2 border-panel bg-warning";

export const syncSpin = "animate-spin";

export const failedBadge = "bg-danger";

export const syncHeadHint = "block text-xs font-normal text-muted-foreground";

export const syncSection = "flex flex-col gap-2";

export const syncSectionTitle = "text-xs font-medium text-muted-foreground";

export const syncFailedIcon = "text-danger";

export const syncPendingIcon = "text-muted-foreground";

export const syncReason = "text-danger";

export const syncFailedActions = "justify-end";

export const permissionDenied = "border";

export const emptyState = "min-h-56 p-6";

export const errorState = cva("", {
  variants: {
    compact: { true: "gap-3 p-4", false: "min-h-56 p-6" },
  },
  defaultVariants: { compact: false },
});

export const errorStateMedia = "bg-danger-bg text-danger";
