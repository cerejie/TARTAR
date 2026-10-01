import { cva } from "class-variance-authority";

export const segmentedTabs =
  "grid w-full auto-cols-fr grid-flow-col gap-0 rounded-pill bg-muted p-1 lg:w-fit";

export const segmentedTabsItem =
  "relative h-9 min-w-0 rounded-pill px-2 text-muted-foreground sm:px-3 hover:bg-transparent data-selected:bg-transparent data-selected:text-foreground";

export const segmentedTabsThumb =
  "absolute inset-0 rounded-pill bg-panel shadow-sm transition-[translate,width] duration-200 ease-out motion-reduce:transition-none";

export const segmentedTabsLabel = "relative truncate";

export const segmentedTabsCount =
  "relative rounded-pill bg-track px-1.5 text-xs tabular-nums text-muted-foreground";

export const metricTileLink =
  "block rounded-xl outline-none transition-transform select-none focus-visible:ring-[3px] focus-visible:ring-ring/50 data-pressed:scale-98 motion-reduce:transition-none";

export const metricTile =
  "h-full transition-shadow hover:shadow-raised motion-reduce:transition-none";

export const metricTileBody = "flex flex-col gap-3";

export const metricTileHead = "flex items-center justify-between gap-2";

export const metricTileLabel = "truncate text-sm font-medium text-muted-foreground";

export const metricTileIcon =
  "inline-flex size-9 shrink-0 items-center justify-center rounded-pill [&_svg]:size-4";

export const metricTileValue =
  "truncate font-heading text-xl font-semibold tracking-tight tabular-nums sm:text-2xl md:text-3xl lg:text-2xl xl:text-3xl";

export const metricTileSubLine = "truncate text-xs text-muted-foreground";

export const metricTileSkeletonLabel = "h-4 w-1/2";

export const metricTileSkeletonValue = "h-8 w-4/5";

export const listSection = "flex flex-col gap-1.5";

export const listSectionHead = "flex items-center justify-between gap-2 px-4";

export const listSectionTitle =
  "text-xs font-semibold tracking-wide text-muted-foreground uppercase";

export const listSectionMeta = "text-xs text-muted-foreground tabular-nums";

export const listSectionItems =
  "flex flex-col overflow-hidden rounded-panel bg-panel shadow-panel transition-opacity";

export const listSectionRefreshing = "opacity-60";

export const listCard = cva(
  "relative flex-nowrap gap-3 rounded-none border-0 border-b border-border px-4 py-3 last:border-b-0 transition-colors select-none has-[[data-pressed]]:bg-muted motion-reduce:transition-none",
  {
    variants: {
      selected: {
        true: "bg-brand-soft has-[[data-pressed]]:bg-brand-soft",
        false: "",
      },
    },
    defaultVariants: { selected: false },
  }
);

export const listCardMedia = "relative";

export const listCardUnreadDot =
  "absolute top-1/2 -left-3 size-2 -translate-y-1/2 rounded-pill bg-brand";

export const listCardAvatarFallback = "bg-brand-soft text-xs font-semibold text-brand";

export const listCardContent = "min-w-0";

export const listCardName = cva("truncate", {
  variants: {
    unread: { true: "font-semibold", false: "" },
  },
  defaultVariants: { unread: false },
});

export const listCardNamePress =
  "min-w-0 truncate text-left outline-none after:absolute after:inset-0 focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50 focus-visible:after:ring-inset";

export const listCardMeta = "truncate";

export const listCardAside = "flex shrink-0 items-center gap-1";

export const listCardFigures = "flex flex-col items-end gap-1";

export const listCardAmount = "font-semibold tabular-nums";

export const listCardChevron = "size-4 shrink-0 text-muted-foreground/60";

export const listCardSkeletonRow = "flex items-center gap-3 px-4 py-3";

export const listCardSkeletonAvatar = "size-10 shrink-0 rounded-pill";

export const listCardSkeletonText = "h-4 flex-1";

export const appSheetContent = "bg-panel";

export const appSheetSide = "w-full rounded-l-panel sm:max-w-md";

export const appSheetBody = "min-h-0 flex-1 overflow-y-auto px-4 py-1";

export const appSheetGrabZone =
  "flex shrink-0 cursor-grab touch-none justify-center pt-2 -mb-3 active:cursor-grabbing";

export const appSheetGrabHandle = "h-1.5 w-10 rounded-pill bg-track";

export const appSheetDragHeader = "touch-none";

export const recordHero = "flex flex-col items-center gap-2 pt-2 pb-5 text-center";

export const recordHeroName = "max-w-full truncate text-sm font-medium text-muted-foreground";

export const recordHeroAmount =
  "font-heading text-3xl font-semibold tracking-tight tabular-nums";

export const detailRows =
  "flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border";

export const detailRow = "flex items-center justify-between gap-4 px-4 py-3 text-sm";

export const detailRowLabel = "shrink-0 text-muted-foreground";

export const detailRowValue = "min-w-0 truncate text-right font-medium text-foreground";

export const branchSheetList = "max-h-[60dvh]";

export const appPull = "flex items-end justify-center overflow-hidden";

export const appPullBadge = cva(
  "mb-2 flex size-9 items-center justify-center rounded-pill bg-panel text-brand shadow-panel [&_svg]:size-4",
  {
    variants: {
      ready: { true: "text-brand", false: "text-muted-foreground" },
      refreshing: { true: "[&_svg]:animate-spin", false: "" },
    },
    defaultVariants: { ready: false, refreshing: false },
  }
);

export const detailPanel =
  "sticky top-0 flex flex-col overflow-hidden rounded-panel bg-panel shadow-panel";

export const detailPanelHead =
  "flex items-center justify-between gap-2 border-b border-border py-2 pr-2 pl-4";

export const detailPanelTitle = "font-heading text-base font-semibold";

export const detailPanelBody = "px-4 pb-4";

export const detailPanelFooter = "flex flex-col gap-2 border-t border-border bg-muted/50 p-4";

export const floatingActionDock =
  "fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[calc(5.5rem+max(1rem,env(safe-area-inset-bottom)))] z-40";

export const floatingAction = cva(
  "h-14 rounded-pill px-5 shadow-pop transition-[width,padding] duration-200 motion-reduce:transition-none [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      collapsed: {
        true: "w-14 gap-0 px-0",
        false: "gap-2",
      },
    },
  }
);

export const floatingActionLabel = cva(
  "overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200 motion-reduce:transition-none",
  {
    variants: {
      collapsed: {
        true: "max-w-0 opacity-0",
        false: "max-w-60 opacity-100",
      },
    },
  }
);
