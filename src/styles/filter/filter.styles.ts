import { cva } from "class-variance-authority";

export const filterToolbar = "flex flex-wrap items-center gap-2 max-md:data-compact:flex-nowrap";

export const filterToolbarStart =
  "flex min-w-0 flex-auto flex-wrap items-center gap-2 max-md:in-data-compact:flex-none max-md:in-data-compact:flex-nowrap max-md:in-data-compact:[&>[data-slot=button]]:h-10 max-md:in-data-compact:[&>[data-slot=button]]:rounded-full max-md:in-data-compact:[&>[data-slot=button]]:px-4 has-[[data-toolbar-search]]:flex-1 toolbar-searching:[&>[data-slot=button]]:size-10 toolbar-searching:[&>[data-slot=button]]:px-0!";

export const filterToolbarActions =
  "ml-auto flex min-w-0 flex-wrap items-center justify-end gap-2 max-md:in-data-compact:flex-nowrap max-md:in-data-compact:[&>[data-slot=button]]:h-10 max-md:in-data-compact:[&>[data-slot=button]]:rounded-full max-md:in-data-compact:[&>[data-slot=button]]:px-4 toolbar-searching:[&>[data-slot=button]]:size-10 toolbar-searching:[&>[data-slot=button]]:px-0!";

export const filterBar = cva("flex gap-2", {
  variants: {
    layout: {
      inline: "flex-wrap items-center",
      stack: "flex-col gap-3 *:w-full!",
    },
  },
  defaultVariants: { layout: "inline" },
});

export const filterSearch = cva("w-full", {
  variants: {
    toolbar: {
      true: "min-w-0 flex-1 rounded-full max-md:h-10",
      false: "sm:w-56",
    },
  },
  defaultVariants: { toolbar: false },
});

export const filterSelect = "w-full sm:w-40";

export const filterDateTrigger = "w-full justify-start font-normal sm:w-64";

export const filterDatePlaceholder = "text-muted-foreground";

export const filterDatePopover = "w-auto p-0";

export const filterPill = "relative rounded-full";

export const filterPillLabel = "toolbar-searching:sr-only";

export const filterPillBadge =
  "toolbar-searching:absolute toolbar-searching:-top-1 toolbar-searching:-right-1";

export const filterPopover = "w-80";

export const filterPopoverHead = "flex-row items-center justify-between gap-2";

export const filterPopoverTitle = "text-sm font-semibold";

export const filterSection = "flex flex-col gap-2";

export const filterSectionTitle = "text-label font-semibold text-muted-foreground";

export const filterSections = "flex flex-col gap-5";

export const filterSheetFooter =
  "grid grid-cols-2 gap-2 [&_[data-slot=button][data-variant]]:h-12";

export const filterField = "gap-1.5 *:w-full!";

export const filterSort = "flex items-center gap-2";

export const filterSortLabel = "hidden text-sm whitespace-nowrap text-muted-foreground md:inline";

export const filterSortSelect = "w-auto md:w-44";

export const filterSortTrigger =
  "rounded-full max-md:size-10 max-md:justify-center max-md:px-0 max-md:[&>svg]:hidden";

export const filterSortValue =
  "inline-flex items-center gap-2 max-md:[&_[data-slot=select-value]]:sr-only";

export const sortSheetList = "flex flex-col gap-1 py-2";

export const sortSheetOption = "w-full justify-between";
