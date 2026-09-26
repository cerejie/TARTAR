import { cva } from "class-variance-authority";

export const dataTableRoot = "flex min-w-0 flex-col";

export const dataTableGrid = "border-collapse";

export const dataTableHeader = "[&_tr]:border-border";

export const dataTableHead = cva(
  "h-11 px-4 text-[0.8125rem] font-medium text-muted-foreground",
  {
    variants: {
      align: { left: "", center: "text-center", right: "text-right" },
      sortable: { true: "cursor-pointer select-none hover:text-foreground", false: "" },
    },
    defaultVariants: { align: "left", sortable: false },
  }
);

export const dataTableSortLabel = "inline-flex items-center gap-1";

export const dataTableSortIcon = "size-3.5";

export const dataTableRow =
  "group/row border-b border-border hover:bg-muted/40 data-selected:bg-brand-mist";

export const dataTableRowExpanded = "border-b-0 bg-muted/40";

export const dataTableRowStatic = "hover:bg-transparent";

export const dataTableRowClickable = "cursor-pointer";

export const dataTableRowOverdue = "bg-danger-bg/60 hover:bg-danger-bg";

export const dataTableCell = cva("h-14 px-4 py-2 text-sm text-foreground", {
  variants: {
    align: { left: "", center: "text-center", right: "text-right tabular-nums" },
  },
  defaultVariants: { align: "left" },
});

export const dataTableSelectionCell = "w-px";

export const dataTableExpansionCell = "bg-muted/40 p-0 whitespace-normal";

export const dataTableStateCell = "whitespace-normal";

export const dataTableSkeletonBar = cva("h-4", {
  variants: {
    align: { left: "w-4/5", center: "mx-auto w-3/5", right: "ml-auto w-3/5" },
  },
  defaultVariants: { align: "left" },
});

export const dataTableSkeletonAvatar = "flex items-center gap-3";

export const dataTableSkeletonCircle = "size-8 shrink-0 rounded-full";

export const dataTableSkeletonName = "h-4 w-24";

export const dataTableBodyRefreshing =
  "opacity-60 transition-opacity motion-reduce:transition-none";

export const dataTableRefreshSpinner = "ml-2 inline-flex size-3.5 align-middle text-brand";

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

export const tablePanel = "flex min-w-0 flex-col gap-3";

export const tablePanelBody = "min-w-0";

export const tablePanelTitle = "font-heading text-base font-semibold text-foreground";

export const tablePagination = "flex items-center gap-2 pt-2";

export const tablePaginationStep = "rounded-full";

export const tablePaginationNav = "flex-1";

export const tablePaginationPages = "flex items-center gap-1";

export const tablePaginationPage = cva("size-8 rounded-full tabular-nums", {
  variants: {
    active: { true: "", false: "text-muted-foreground" },
  },
  defaultVariants: { active: false },
});

export const tablePaginationEllipsis = "size-8 text-muted-foreground";

export const tablePaginationSize =
  "hidden items-center gap-2 text-sm whitespace-nowrap text-muted-foreground tabular-nums md:flex";

export const tablePaginationSelect = "w-18";

export const tablePaginationSelectTrigger = "rounded-full";

export const avatarCell = "inline-flex min-w-0 items-center gap-3";

export const avatarCellFallback = "bg-brand-soft text-xs font-semibold text-brand";

export const avatarCellText = "flex min-w-0 flex-col";

export const avatarCellName = "truncate font-medium";

export const nowrapCell = "whitespace-nowrap";

export const tagRow = "inline-flex items-center gap-2";

export const stackedCell = "flex flex-col";

export const cellHint = "text-xs text-muted-foreground";

export const progressCell = "w-full min-w-40 flex-col gap-1.5";

export const progressCellHead = "flex w-full items-baseline justify-between gap-2 tabular-nums";

export const progressCellValue = "font-semibold text-foreground";

export const progressCellTotal = "text-muted-foreground";

export const progressCellPercent = "text-xs text-muted-foreground";

export const progressCellTrack = "h-0.75 bg-track";
