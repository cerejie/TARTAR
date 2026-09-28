import { cva } from "class-variance-authority";

export const contentView = "flex min-w-0 flex-col gap-5";

export const viewHead = "flex flex-wrap items-center gap-3";

export const viewTitle =
  "min-w-0 flex-1 truncate font-heading text-2xl font-semibold tracking-tight text-foreground md:text-[1.625rem]";

export const viewHeadActions =
  "flex min-w-0 flex-wrap items-center gap-2 max-md:has-data-[slot=view-tabs]:w-full";

export const viewTabs =
  "-mx-1 min-w-0 basis-full overflow-x-auto overscroll-x-contain px-1 py-0.5 [scrollbar-width:none] md:basis-auto";

export const viewHeadDivider = "mx-1 hidden h-6 self-center! md:block";

export const viewToolbar = "flex min-w-0 flex-wrap items-center gap-2";

export const viewMeta = "text-sm text-muted-foreground";

export const viewSwitchItem =
  "shrink-0 rounded-full px-4 data-selected:border-brand data-selected:bg-brand data-selected:text-on-brand data-selected:hover:bg-brand-deep data-selected:hover:text-on-brand data-selected:focus-visible:text-on-brand dark:data-selected:text-on-brand";

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
      main: "md:col-span-12 xl:col-span-9",
      aside: "md:col-span-12 xl:col-span-3",
    },
  },
  defaultVariants: { span: "quarter" },
});

export const pageSkeletonTitle = "h-8 w-48 flex-1 md:max-w-64";

export const pageSkeletonAction = "ml-auto h-10 w-32 rounded-pill";

export const pageSkeletonFilter = "h-10 w-28 rounded-pill";

export const pageSkeletonRows = "flex flex-col gap-3";

export const pageSkeletonRow = "h-12 w-full";

export const sectionHeading = "flex flex-wrap items-center gap-3";

export const sectionHeadingTitle = "font-heading text-lg font-semibold";

export const sectionHeadingExtra = "ml-auto flex flex-wrap items-center gap-1";
