import { cva } from "class-variance-authority";

import { moneyLevel } from "../common/money.styles";

export const dataTableRoot = "flex min-w-0 flex-col";

export const dataTableGrid = "border-collapse";

export const dataTableHeader = "[&_tr]:border-border";

export const dataTableHead = cva(
  "h-11 px-3 text-label font-medium text-muted-foreground min-[1440px]:px-4",
  {
    variants: {
      align: { left: "", center: "text-center", right: "text-right" },
      sortable: { true: "cursor-pointer select-none hover:text-foreground", false: "" },
    },
    defaultVariants: { align: "left", sortable: false },
  }
);

export const dataTableCollapse = cva("", {
  variants: {
    collapse: { xl: "hidden xl:table-cell", "2xl": "hidden 2xl:table-cell" },
  },
});

export const dataTableSortLabel = "inline-flex items-center gap-1";

export const dataTableSortIcon = "size-3.5";

export const dataTableRow =
  "group/row border-b border-border hover:bg-muted/40 data-selected:bg-brand-mist";

export const dataTableRowExpanded = "border-b-0 bg-muted/40";

export const dataTableRowStatic = "hover:bg-transparent";

export const dataTableRowPending = "bg-warning/5 text-muted-foreground dark:bg-warning/10";

export const dataTableRowClickable = "cursor-pointer";

export const dataTableRowFocused =
  "bg-brand-mist text-foreground animate-row-focus motion-reduce:animate-none";

export const dataTableRowOverdue = "bg-danger-bg/60 hover:bg-danger-bg";

export const dataTableCell = cva("h-14 px-3 py-2 text-sm whitespace-normal text-foreground pointer-coarse:h-16 min-[1440px]:px-4", {
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


export const dataTableRefreshSpinner = "ml-2 inline-flex size-3.5 align-middle text-brand";

export const dataTableEmpty = "py-8";

export const dataTableLoadingAnnounce = "sr-only";

export const dataListFrame = "relative";

export const dataList =
  "flex flex-col divide-y divide-foreground/10 border-y border-foreground/10";

export const dataListRow =
  "relative flex min-h-14 items-center gap-3 px-1 py-3 text-sm transition-colors has-data-pressed:bg-muted/70 has-data-focus-visible:ring-2 has-data-focus-visible:ring-ring has-data-focus-visible:ring-inset";

export const dataListRowSelected = "bg-brand-mist";

export const dataListRowFocused =
  "bg-brand-mist ring-2 ring-brand/30 ring-inset animate-row-focus motion-reduce:animate-none";

export const dataListMain = "flex min-w-0 flex-1 flex-col gap-0.5";

export const dataListTitle = "min-w-0 truncate text-left font-semibold text-foreground";

export const dataListTitlePress =
  "min-w-0 truncate text-left font-semibold text-foreground outline-none after:absolute after:inset-0";

export const dataListSecondary =
  "flex min-w-0 items-center gap-1.5 overflow-hidden text-xs whitespace-nowrap text-muted-foreground";

export const dataListSecondaryItem = "min-w-0 truncate first:shrink-0 first:max-w-[60%]";

export const dataListSeparator = "shrink-0 text-muted-foreground/60";

export const dataListTrail = "flex max-w-[45%] shrink-0 flex-col items-end gap-1 text-right";

export const dataListAmount = `${moneyLevel({ level: "amount" })} flex flex-col items-end`;

export const dataListTags = "flex items-center justify-end gap-1";

export const dataListRaised = "relative z-10";

export const dataListChevron = "size-4 shrink-0 text-muted-foreground/60";

export const dataCardLine = "block truncate";

export const dataListSkeletonMain = "flex flex-1 flex-col gap-2";

export const dataListSkeletonTitle = "h-4 w-2/5";

export const dataListSkeletonAmount = "h-4 w-16";

export const dataListSkeletonMeta = "h-3 w-3/5";

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

export const rowDetailContent =
  "grid gap-x-10 gap-y-5 px-4 py-4 md:grid-cols-[repeat(auto-fill,minmax(18rem,1fr))]";

export const rowDetailSection = "flex min-w-0 max-w-md flex-col gap-2";

export const rowDetailSectionTitle =
  "flex items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase";

export const rowDetailSectionIcon = "inline-flex [&_svg]:size-3.5";

export const rowDetailField = "grid grid-cols-[8rem_minmax(0,1fr)] items-baseline gap-3 text-sm";

export const rowDetailLabel = "text-muted-foreground";

export const rowDetailValue = "min-w-0 font-medium break-words";

export const tablePanel = "flex min-w-0 flex-col gap-3";

export const tablePanelBody = "min-w-0";

export const tablePanelTitle = "font-heading text-base font-semibold text-foreground";

export const tableLoadMore =
  "flex min-h-11 items-center justify-center gap-2 pt-2 text-xs text-muted-foreground tabular-nums";

export const tablePagination = "flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-2";

export const tablePaginationRange = "text-sm whitespace-nowrap text-muted-foreground tabular-nums";

export const tablePaginationControls = "flex items-center gap-2";

export const tablePaginationStep = "rounded-full";

export const tablePaginationNav = "mx-0 w-auto";

export const tablePaginationPages = "flex items-center gap-1";

export const tablePaginationPage = cva("size-8 rounded-full tabular-nums", {
  variants: {
    active: { true: "", false: "text-muted-foreground" },
  },
  defaultVariants: { active: false },
});

export const tablePaginationEllipsis = "size-8 text-muted-foreground";

export const tablePaginationSize = "hidden md:flex";

export const tablePaginationSelect = "w-18";

export const tablePaginationSelectTrigger = "rounded-full";

export const avatarCell = "inline-flex min-w-0 max-w-full items-center gap-3";

export const avatarCellFallback = "bg-brand-soft text-xs font-semibold text-brand";

export const nameCell = "flex min-w-0 flex-col";

export const nameCellName = cva("truncate font-medium", {
  variants: { compact: { true: "text-[0.8125rem]", false: "" } },
  defaultVariants: { compact: false },
});

export const nameCellHint = cva("truncate text-muted-foreground", {
  variants: { compact: { true: "text-[0.6875rem]", false: "text-xs" } },
  defaultVariants: { compact: false },
});

export const dataListLabel = "max-w-full truncate text-xs font-medium text-muted-foreground";

export const nowrapCell = "whitespace-nowrap";

export const branchCell = "min-w-32";

export const emptyCell = "text-muted-foreground";

export const rowActionTrigger = "compact:rounded-full";

export const rowActionMenu = "w-auto min-w-48";

export const rowActionItem = "whitespace-nowrap";

export const tagRow = "inline-flex flex-wrap items-center gap-x-2 gap-y-1";

export const stackedCell = "flex flex-col";

export const cellHint = "text-xs text-muted-foreground";

export const progressCell = "w-full min-w-32 flex-col gap-1.5";

export const progressCellHead = "flex w-full items-baseline justify-between gap-2 tabular-nums";

export const progressCellValue = "font-semibold text-foreground";

export const progressCellTotal = "text-muted-foreground";

export const progressCellPercent = "text-xs text-muted-foreground";

export const progressCellTrack = "h-0.75 bg-track";

export const truncateCell = "lg:block lg:max-w-44 lg:truncate";

export const dueDateCell = cva("", {
  variants: { unpaid: { true: "font-semibold text-danger", false: "" } },
  defaultVariants: { unpaid: false },
});
