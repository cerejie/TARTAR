import { cva } from "class-variance-authority";

export const modalContent = "max-h-[calc(100dvh-2rem)]";

export const modalSize = cva("", {
  variants: {
    size: {
      sm: "sm:max-w-md",
      md: "sm:max-w-xl",
      lg: "sm:max-w-3xl",
      xl: "sm:max-w-5xl",
    },
  },
  defaultVariants: { size: "md" },
});

export const modalBody = "-mx-6 max-h-[70dvh] overflow-y-auto px-6";

export const drawerContent = "max-h-[92dvh]";

export const drawerBody = "overflow-y-auto px-4";

export const drawerFooter = "border-t border-border";

export const modalFooterActions = "flex justify-end gap-2";

export const confirmMedia = cva("", {
  variants: {
    kind: {
      confirm: "bg-brand-soft text-brand",
      delete: "bg-danger-bg text-danger",
    },
  },
  defaultVariants: { kind: "confirm" },
});

export const detailList = "divide-y divide-border rounded-lg border border-border";

export const detailRow = "grid grid-cols-3 gap-4 px-4 py-2.5 text-sm";

export const detailLabel = "text-muted-foreground";

export const detailValue = "col-span-2 min-w-0 font-medium";

export const detailSkeletonList = "flex flex-col gap-3";

export const detailSkeletonBar = "h-5 w-full";
