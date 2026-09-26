import { cva } from "class-variance-authority";

export const dataTableRoot = "flex min-w-0 flex-col";

export const dataTableGrid = "border-separate border-spacing-y-2";

export const dataTableHeader = "[&_tr]:border-b-0";

export const dataTableHead = cva(
  "bg-cloud px-4 py-2.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase first:rounded-l-md last:rounded-r-md",
  {
    variants: {
      align: { left: "", center: "text-center", right: "text-right" },
      sortable: { true: "cursor-pointer select-none", false: "" },
    },
    defaultVariants: { align: "left", sortable: false },
  }
);

export const dataTableSortLabel = "inline-flex items-center gap-1";

export const dataTableSortIcon = "size-3.5";

export const dataTableRow = "group/row border-b-0 hover:bg-transparent data-selected:bg-transparent";

export const dataTableRowClickable = "cursor-pointer";

export const dataTableRowOverdue = "[&>td]:bg-danger-bg";

export const dataTableCell = cva(
  "border-y border-border bg-card px-4 py-3 transition-colors group-hover/row:border-foreground/30 group-data-selected/row:bg-lime-mist",
  {
    variants: {
      align: { left: "", center: "text-center", right: "text-right tabular-nums" },
      expanded: {
        true: "border-foreground/30 first:rounded-tl-md first:border-l last:rounded-tr-md last:border-r",
        false: "first:rounded-l-md first:border-l last:rounded-r-md last:border-r",
      },
    },
    defaultVariants: { align: "left", expanded: false },
  }
);

export const dataTableSelectionCell = "w-px";

export const dataTableExpansionCell =
  "rounded-md border border-foreground/30 bg-card p-0 whitespace-normal";

export const dataTableStateCell = "rounded-md border border-border bg-card whitespace-normal";

export const dataTableSkeletonBar = "h-4 w-full";

export const dataTableEmpty = "py-8";

export const dataTableLoadingAnnounce = "sr-only";

export const leadCell = "inline-flex items-center gap-2";

export const expandTrigger = cva("transition-transform", {
  variants: {
    open: { true: "rotate-90", false: "" },
  },
  defaultVariants: { open: false },
});

export const rowDetailReveal = cva("overflow-hidden duration-200", {
  variants: {
    closing: {
      true: "animate-out fade-out-0 slide-out-to-top-1 fill-mode-forwards",
      false: "animate-in fade-in-0 slide-in-from-top-1",
    },
  },
  defaultVariants: { closing: false },
});

export const rowDetailContent = "grid gap-6 px-4 py-4 md:grid-cols-2 xl:grid-cols-3";

export const rowDetailSection = "flex min-w-0 flex-col gap-2";

export const rowDetailSectionTitle =
  "flex items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase";

export const rowDetailSectionIcon = "inline-flex [&_svg]:size-3.5";

export const rowDetailField = "flex items-baseline justify-between gap-4 text-sm";

export const rowDetailLabel = "text-muted-foreground";

export const rowDetailValue = "min-w-0 text-right font-medium";

export const rowIcon =
  "inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-cloud text-foreground [&_svg]:size-3.5";

export const nameCell = "inline-flex items-center gap-2 font-medium";

export const columnLabel = "inline-flex items-center gap-1";

export const columnIcon = "inline-flex text-muted-foreground [&_svg]:size-3.5";

export const rowActions = "inline-flex items-center gap-2";

export const tablePanel = "flex min-w-0 flex-col gap-3";

export const tablePanelBody = "min-w-0";

export const tablePagination =
  "flex flex-col items-center justify-between gap-3 py-2 md:flex-row";

export const tablePaginationInfo = "text-sm text-muted-foreground tabular-nums";

export const tablePaginationPages = "flex items-center gap-1";

export const tablePaginationPage = "px-2 text-sm whitespace-nowrap text-muted-foreground tabular-nums";

export const tablePaginationSize = "flex items-center gap-2 text-sm text-muted-foreground";

export const tablePaginationSelect = "w-20";

export const nowrapCell = "whitespace-nowrap";

export const tagRow = "inline-flex items-center gap-2";
