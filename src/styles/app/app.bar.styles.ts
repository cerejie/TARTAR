import { cva } from "class-variance-authority";

export const appBar = cva(
  "box-content flex h-14 shrink-0 items-center gap-2 border-b bg-panel px-3 pt-safe transition-[border-color,box-shadow] select-none md:h-16 md:gap-3 md:rounded-panel md:border md:border-border md:px-6 md:pt-0 md:shadow-panel motion-reduce:transition-none",
  {
    variants: {
      scrolled: {
        true: "border-border shadow-sm",
        false: "border-transparent",
      },
    },
    defaultVariants: { scrolled: false },
  }
);

export const appBarTitle =
  "min-w-0 flex-1 truncate text-center font-heading text-base font-semibold text-foreground motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200";

export const appBarActions = "ml-auto flex shrink-0 items-center gap-1 md:gap-2";

export const appTabBar =
  "order-last shrink-0 px-3 pt-2 pb-safe select-none md:order-first md:w-24 md:rounded-panel md:bg-panel md:p-0 md:py-3 md:shadow-panel";

export const appTabList =
  "mx-auto grid max-w-xl auto-cols-fr grid-flow-col overflow-hidden rounded-panel bg-panel shadow-panel md:flex md:flex-col md:gap-1 md:overflow-visible md:rounded-none md:bg-transparent md:px-2 md:shadow-none";

export const appTabItem = cva(
  "relative h-16 w-full flex-col gap-1 rounded-none px-1 text-xs hover:bg-transparent md:h-auto md:rounded-xl md:py-3 md:hover:bg-muted",
  {
    variants: {
      active: {
        true: "font-semibold text-brand [&_svg]:fill-current",
        false: "font-medium text-muted-foreground",
      },
    },
    defaultVariants: { active: false },
  }
);

export const appTabIcon = "relative flex h-7 w-10 items-center justify-center [&_svg]:size-5";

export const appTabBadge = "ring-2 ring-panel";

export const appTabIndicator =
  "absolute bottom-0 left-1/2 h-1 w-10 -translate-x-1/2 rounded-t-full bg-brand md:top-1/2 md:bottom-auto md:left-0 md:h-8 md:w-1 md:translate-x-0 md:-translate-y-1/2 md:rounded-t-none md:rounded-r-full";

export const accountSheetList = "flex flex-col gap-1 pb-3";

export const accountSheetItem = "h-12 w-full justify-start gap-3 px-3 text-base font-normal";

export const accountSheetDanger = "text-danger hover:text-danger";

export const accountSheetHead = "flex items-center gap-3 px-3 pt-1 pb-3";

export const accountSheetName = "truncate font-heading text-base font-semibold";

export const accountSheetRole = "truncate text-sm text-muted-foreground";

export const accountSheetText = "flex min-w-0 flex-col";

export const moreSheetGroup = "flex flex-col gap-1 border-b border-border pb-3 mb-3";

export const moreSheetGroupLabel = "px-3 pt-1 pb-1 text-xs font-medium text-muted-foreground";

export const moreSheetItem = cva(accountSheetItem, {
  variants: {
    active: {
      true: "bg-brand-soft font-semibold text-brand",
      false: "",
    },
  },
  defaultVariants: { active: false },
});
