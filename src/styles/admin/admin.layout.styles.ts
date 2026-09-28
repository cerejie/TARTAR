import { cva } from "class-variance-authority";

export const adminShell =
  "fixed inset-0 flex flex-col overflow-hidden bg-app font-sans text-foreground lg:flex-row lg:gap-4 lg:p-4";

export const adminMain = "flex min-h-0 min-w-0 flex-1 flex-col lg:gap-4";

export const adminAppBar =
  "flex h-14 shrink-0 items-center gap-2 border-b border-border bg-panel px-3 md:h-16 md:gap-3 md:px-6 lg:rounded-panel lg:border lg:shadow-panel";

export const adminAppBarActions = "ml-auto flex shrink-0 items-center gap-1 md:gap-2";

export const adminContent =
  "min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain";

export const adminColumn =
  "mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 md:p-6 lg:px-0 lg:pt-0 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-200";

export const adminPageTitle =
  "font-heading text-2xl font-semibold tracking-tight text-foreground md:text-3xl";

export const adminTabBar =
  "order-last shrink-0 px-3 pt-2 pb-safe md:px-6 lg:order-first lg:w-24 lg:rounded-panel lg:bg-panel lg:p-0 lg:py-3 lg:shadow-panel";

export const adminTabList =
  "mx-auto grid max-w-xl grid-cols-4 overflow-hidden rounded-panel bg-panel shadow-panel lg:flex lg:flex-col lg:gap-1 lg:overflow-visible lg:rounded-none lg:bg-transparent lg:px-2 lg:shadow-none";

export const adminTabItem = cva(
  "relative h-16 w-full flex-col gap-1 rounded-none px-1 text-xs hover:bg-transparent lg:h-auto lg:rounded-xl lg:py-3 lg:hover:bg-muted",
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
  "absolute bottom-0 left-1/2 h-1 w-10 -translate-x-1/2 rounded-t-full bg-brand lg:top-1/2 lg:bottom-auto lg:left-0 lg:h-8 lg:w-1 lg:translate-x-0 lg:-translate-y-1/2 lg:rounded-t-none lg:rounded-r-full";

export const adminTabStack = "flex flex-col gap-4 md:gap-6";
