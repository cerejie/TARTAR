import { cva } from "class-variance-authority";

export const sectionCardRoot = cva("h-full", {
  variants: {
    flush: {
      true: "py-0",
      false: "",
    },
  },
  defaultVariants: { flush: false },
});

export const sectionCardTitle = "font-heading font-semibold";

export const sectionCardExtra = cva("flex items-center gap-2", {
  variants: {
    stacked: {
      true: "max-md:col-span-full max-md:row-span-1 max-md:row-start-3 max-md:mt-2 max-md:justify-self-stretch",
      false: "",
    },
  },
  defaultVariants: { stacked: false },
});

export const sectionCardBody = "flex-1";

export const sectionCardFlushBody = "px-0";

export const sectionCardInset = "py-4";

export const sectionCardFooter = "flex-wrap gap-2 border-t";

export const sectionCardSkeleton = "h-56 w-full";

export const infoCard = "h-full";

export const infoCardBody = "flex h-full flex-col gap-3";

export const infoCardHead = "flex items-center justify-between gap-2";

export const infoCardMeta = "truncate text-xs text-muted-foreground";

export const infoCardTitle = "truncate font-heading text-base font-semibold";

export const infoCardText = "line-clamp-2 text-sm text-muted-foreground";

export const infoCardAction = "mt-auto self-start";

export const infoCardSkeletonChip = "h-5 w-20 rounded-pill";

export const infoCardSkeletonTitle = "h-5 w-3/4";

export const infoCardSkeletonText = "h-10 w-full";

export const infoCardSkeletonAction = "mt-auto h-9 w-28";
