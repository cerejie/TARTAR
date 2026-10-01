import { cva } from "class-variance-authority";

export const adminShell =
  "fixed inset-0 flex flex-col overflow-hidden bg-app font-sans text-foreground md:flex-row md:gap-4 md:p-4";

export const adminMain = "flex min-h-0 min-w-0 flex-1 flex-col md:gap-4";

export const adminAppBar = cva(
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

export const adminAppBarTitle =
  "min-w-0 flex-1 truncate text-center font-heading text-base font-semibold text-foreground motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200";

export const adminAppBarActions = "ml-auto flex shrink-0 items-center gap-1 md:gap-2";

export const adminContent =
  "min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain";

export const adminColumn =
  "mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 md:px-0 md:pt-0 md:pb-6 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-150";

export const adminPageTitleRow = "flex items-center justify-between gap-3";

export const adminPageTitle =
  "font-heading text-2xl font-semibold tracking-tight text-foreground md:text-3xl";

export const adminTabBar =
  "order-last shrink-0 px-3 pt-2 pb-safe select-none md:order-first md:w-24 md:rounded-panel md:bg-panel md:p-0 md:py-3 md:shadow-panel";

export const adminTabList =
  "mx-auto grid max-w-xl grid-cols-4 overflow-hidden rounded-panel bg-panel shadow-panel md:flex md:flex-col md:gap-1 md:overflow-visible md:rounded-none md:bg-transparent md:px-2 md:shadow-none";

export const adminTabItem = cva(
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

export const adminTabIcon = "relative flex h-7 w-10 items-center justify-center [&_svg]:size-5";

export const adminTabBadge = "ring-2 ring-panel";

export const adminTabIndicator =
  "absolute bottom-0 left-1/2 h-1 w-10 -translate-x-1/2 rounded-t-full bg-brand md:top-1/2 md:bottom-auto md:left-0 md:h-8 md:w-1 md:translate-x-0 md:-translate-y-1/2 md:rounded-t-none md:rounded-r-full";

export const adminTabStack = "flex flex-col gap-4 md:gap-6";

export const adminUserSheetList = "flex flex-col gap-1 pb-3";

export const adminUserSheetItem = "h-12 w-full justify-start gap-3 px-3 text-base font-normal";

export const adminUserSheetDanger = "text-danger hover:text-danger";

export const adminUserSheetHead = "flex items-center gap-3 px-3 pt-1 pb-3";

export const adminUserSheetName = "truncate font-heading text-base font-semibold";

export const adminUserSheetRole = "truncate text-sm text-muted-foreground";

export const adminUserSheetText = "flex min-w-0 flex-col";

export const adminSplit = "flex flex-col gap-4 md:grid md:grid-cols-2 md:items-start md:gap-6";
