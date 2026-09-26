import { cva } from "class-variance-authority";

export const shellRoot = "h-dvh overflow-hidden bg-background font-sans text-foreground";

export const shellInset = "min-h-0 min-w-0 overflow-hidden";

export const shellContent =
  "min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-4 [scrollbar-gutter:stable] sm:px-4 lg:px-10 lg:py-6";

export const shellFooter =
  "mx-3 flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-border-subtle py-4 text-xs text-muted-foreground sm:mx-4 lg:mx-10";

export const shellFooterNote = "inline-flex items-center gap-1.5";

export const shellFooterMeta = "flex items-center gap-4";

export const shellFooterDot = cva("size-2 rounded-pill", {
  variants: {
    online: { true: "bg-positive", false: "bg-warning" },
  },
});
