import { cva } from "class-variance-authority";

export const modalContent =
  "max-h-[calc(100dvh-2rem)] rounded-panel bg-panel ring-border shadow-panel";

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

export const modalHeaderRuled =
  "-mx-6 -mt-6 border-b border-border px-6 py-4 pr-14 [&_[data-slot=dialog-title]]:text-base [&_[data-slot=dialog-title]]:font-semibold [&_[data-slot=dialog-title]]:leading-8";

export const modalBody = "-mx-6 max-h-[70dvh] overflow-y-auto px-6";

export const modalActionSize =
  "[&_[data-slot=button]]:h-11 [&_[data-slot=button]]:px-6";

export const modalFooter = `-mx-6 -mb-6 rounded-b-panel border-t border-border bg-muted/50 px-6 py-4 ${modalActionSize}`;

export const drawerContent = "max-h-[92dvh] rounded-t-panel bg-panel";

export const drawerHeaderRuled =
  "border-b border-border pr-14 [&_[data-slot=sheet-title]]:text-base [&_[data-slot=sheet-title]]:font-semibold [&_[data-slot=sheet-title]]:leading-8";

export const drawerBody = "min-h-0 flex-1 overflow-y-auto px-4";

export const drawerFooter = `border-t border-border bg-muted/50 pb-safe ${modalActionSize}`;

export const confirmContent = "rounded-panel bg-panel ring-border shadow-panel";

export const confirmFooter = `-mx-6 -mb-6 rounded-b-panel border-t border-border bg-muted/50 px-6 py-4 ${modalActionSize} [&_[data-slot=alert-dialog-cancel]]:h-11 [&_[data-slot=alert-dialog-cancel]]:px-6`;

export const confirmMedia = cva("", {
  variants: {
    kind: {
      confirm: "bg-brand-soft text-brand",
      delete: "bg-danger-bg text-danger",
    },
  },
  defaultVariants: { kind: "confirm" },
});

export const detailGrid = "grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2";

export const detailItem = cva("flex min-w-0 flex-col gap-1", {
  variants: {
    wide: {
      true: "md:col-span-2",
      false: "",
    },
  },
  defaultVariants: { wide: false },
});

export const detailLabel = "text-xs font-medium text-muted-foreground";

export const detailValue = "min-w-0 text-sm font-medium text-foreground";

export const detailSkeletonList = "grid grid-cols-1 gap-4 md:grid-cols-2";

export const detailSkeletonBar = "h-10 w-full";
