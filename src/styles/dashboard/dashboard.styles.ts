import { cva } from "class-variance-authority";

export const donutValue = "font-heading text-lg font-bold tabular-nums text-foreground";

export const donutLabel = "text-xs text-muted-foreground";

export const donutLegend = "mt-4 flex flex-col gap-2.5";

export const donutLegendRow = "flex items-center justify-between gap-2 text-sm";

export const donutLegendKey = "flex items-center gap-2 text-muted-foreground";

export const donutLegendTotal =
  "flex items-center justify-between gap-2 border-t pt-2.5 text-sm";

export const donutLegendDot = "size-2.5 shrink-0 rounded-full";

export const donutLegendValue = "font-heading font-bold tabular-nums text-foreground";

export const notificationGroup = "mb-4 flex flex-col last:mb-0";

export const notificationGroupHead =
  "mb-0.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider";

export const notificationScrollFrame = "xl:relative xl:h-full xl:min-h-96";

export const notificationScroll =
  "@container/feed -mr-2 max-h-96 overflow-y-auto pr-2 xl:absolute xl:inset-0 xl:max-h-none";

export const notificationItem =
  "-mx-2 flex cursor-pointer items-start justify-between gap-2 rounded-md border-b border-border px-2 py-2 text-left outline-none transition-colors last:border-b-0 hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 @max-xs/feed:flex-wrap @max-xs/feed:gap-y-1";

export const notificationItemMain = "flex min-w-0 flex-1 items-start gap-2.5";

export const notificationDot = "mt-1.5 size-2 shrink-0 rounded-full";

export const notificationText = "flex min-w-0 flex-1 flex-col";

export const notificationName = "truncate text-sm font-semibold";

export const notificationSub = "text-xs text-muted-foreground";

export const notificationFigures =
  "flex shrink-0 flex-col text-right @max-xs/feed:w-full @max-xs/feed:flex-row @max-xs/feed:items-baseline @max-xs/feed:justify-between @max-xs/feed:pl-4.5";

export const notificationAmount = cva("whitespace-nowrap text-sm font-bold tabular-nums", {
  variants: {
    tone: {
      negative: "text-danger",
      warning: "text-foreground",
    },
  },
});

export const notificationDate = "whitespace-nowrap text-xs text-muted-foreground";

export const quickActions = "grid grid-cols-4 gap-2";

export const quickAction =
  "flex min-w-0 flex-col items-center gap-1.5 rounded-card px-1 py-2 text-caption font-medium text-foreground outline-none transition-transform select-none focus-visible:ring-[3px] focus-visible:ring-ring/50 data-pressed:scale-98 motion-reduce:transition-none";

export const quickActionIcon =
  "inline-flex size-12 items-center justify-center rounded-surface bg-brand-soft text-brand [&_svg]:size-5";

export const quickActionLabel = "max-w-full truncate";
