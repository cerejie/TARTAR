import { cva } from "class-variance-authority";

export const adminShell =
  "flex h-dvh flex-col overflow-hidden bg-app font-sans text-foreground lg:flex-row lg:gap-4 lg:p-4";

export const adminMain = "flex min-h-0 min-w-0 flex-1 flex-col lg:gap-4";

export const adminAppBar =
  "flex h-14 shrink-0 items-center gap-2 border-b border-border bg-panel px-3 md:h-16 md:gap-3 md:px-6 lg:rounded-panel lg:border lg:shadow-panel";

export const adminAppBarTitle =
  "min-w-0 flex-1 truncate font-heading text-lg font-semibold tracking-tight text-foreground md:text-xl";

export const adminAppBarActions = "flex shrink-0 items-center gap-1 md:gap-2";

export const adminContent =
  "min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain";

export const adminColumn =
  "mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 md:p-6 lg:px-0 lg:pt-0 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-200";

export const adminTabBar =
  "order-last shrink-0 border-t border-border bg-panel pb-safe lg:order-first lg:w-24 lg:rounded-panel lg:border lg:py-3 lg:shadow-panel";

export const adminTabList =
  "mx-auto grid max-w-xl grid-cols-4 lg:flex lg:flex-col lg:gap-1 lg:px-2";

export const adminTabItem = cva(
  "h-16 w-full flex-col gap-1 rounded-none px-1 text-xs font-medium hover:bg-transparent lg:h-auto lg:rounded-xl lg:py-3 lg:hover:bg-muted",
  {
    variants: {
      active: {
        true: "text-brand",
        false: "text-muted-foreground",
      },
    },
    defaultVariants: { active: false },
  }
);

export const adminTabIndicator = cva(
  "flex h-8 w-14 items-center justify-center rounded-pill transition-colors motion-reduce:transition-none",
  {
    variants: {
      active: {
        true: "bg-brand-soft",
        false: "bg-transparent",
      },
    },
    defaultVariants: { active: false },
  }
);

export const adminTabStack = "flex flex-col gap-4 md:gap-6";
