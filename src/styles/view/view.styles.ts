import { cva } from "class-variance-authority";

export const contentView = "flex min-w-0 flex-col gap-5";

export const viewHead = "flex flex-wrap items-center gap-3";

export const viewTitle =
  "min-w-0 flex-1 truncate font-heading text-2xl font-semibold tracking-tight text-foreground md:text-[1.625rem]";

export const viewHeadActions = "flex flex-wrap items-center gap-2";

export const viewToolbar = "flex flex-wrap items-center gap-2";

export const viewToolbarStart = "flex min-w-0 flex-1 flex-wrap items-center gap-2";

export const viewToolbarActions = "ml-auto flex flex-wrap items-center gap-2";

export const viewMeta = "text-sm text-muted-foreground";

export const viewSwitchItem =
  "rounded-full px-4 data-selected:border-brand data-selected:bg-brand data-selected:text-on-brand data-selected:hover:bg-brand-deep";

export const viewBody = "flex min-w-0 flex-col gap-4";

export const viewFooter = "flex flex-col gap-4";

export const bentoGrid = "grid grid-cols-1 gap-4 md:grid-cols-12";

export const bentoCell = cva("min-w-0", {
  variants: {
    span: {
      quarter: "md:col-span-6 xl:col-span-3",
      third: "md:col-span-6 xl:col-span-4",
      half: "md:col-span-6",
      twoThirds: "md:col-span-12 xl:col-span-8",
      full: "md:col-span-12",
    },
  },
  defaultVariants: { span: "quarter" },
});
