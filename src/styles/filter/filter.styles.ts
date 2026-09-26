import { cva } from "class-variance-authority";

export const filterToolbar = "flex flex-wrap items-center gap-2";

export const filterToolbarStart = "flex min-w-0 flex-1 flex-wrap items-center gap-2";

export const filterToolbarActions = "ml-auto flex items-center gap-2";

export const filterBar = cva("flex gap-2", {
  variants: {
    layout: {
      inline: "flex-wrap items-center",
      stack: "flex-col gap-3 *:w-full!",
    },
  },
  defaultVariants: { layout: "inline" },
});

export const filterSearch = "w-full sm:w-56";

export const filterSelect = "w-full sm:w-40";

export const filterDateTrigger = "w-full justify-start font-normal sm:w-64";

export const filterDatePlaceholder = "text-muted-foreground";

export const filterDatePopover = "w-auto p-0";

export const filterPill = "rounded-full";

export const filterPopover = "w-80";

export const filterPopoverHead = "flex items-center justify-between gap-2";

export const filterPopoverTitle = "text-sm font-semibold";

export const filterSort = "flex items-center gap-2";

export const filterSortLabel = "hidden text-sm whitespace-nowrap text-muted-foreground sm:inline";

export const filterSortSelect = "w-44";

export const filterSortValue = "inline-flex items-center gap-2";
