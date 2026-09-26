import { cva } from "class-variance-authority";

export const donutValue = "font-heading text-lg font-bold tabular-nums text-foreground";

export const donutLabel = "text-xs text-muted-foreground";

export const donutLegend = "mt-4 flex flex-col gap-2.5";

export const donutLegendRow = "flex items-center justify-between gap-2 text-sm";

export const donutLegendKey = "flex items-center gap-2 text-muted-foreground";

export const donutLegendDot = "size-2.5 shrink-0 rounded-full";

export const donutLegendValue = "font-heading font-bold tabular-nums text-foreground";

export const notificationGroup = "mb-4 flex flex-col last:mb-0";

export const notificationGroupHead =
  "mb-0.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider";

export const notificationItem =
  "flex items-start justify-between gap-2 border-b border-border py-2 last:border-b-0";

export const notificationItemMain = "flex min-w-0 flex-1 items-start gap-2.5";

export const notificationDot = "mt-1.5 size-2 shrink-0 rounded-full";

export const notificationText = "flex min-w-0 flex-1 flex-col";

export const notificationName = "truncate text-sm font-semibold";

export const notificationSub = "text-xs text-muted-foreground";

export const notificationFigures = "flex shrink-0 flex-col text-right";

export const notificationAmount = cva("whitespace-nowrap text-sm font-bold tabular-nums", {
  variants: {
    tone: {
      negative: "text-danger",
      warning: "text-foreground",
    },
  },
});

export const notificationDate = "whitespace-nowrap text-xs text-muted-foreground";

export const notificationMore = "mt-1 text-xs text-muted-foreground";

export const dueAlertSection = "flex flex-col gap-3";

export const dueAlertGrid = "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4";
