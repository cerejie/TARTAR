import { cva } from "class-variance-authority";

import { moneyLevel } from "../common/money.styles";

export const entityForm = "flex flex-col gap-6";

export const formGrid = "grid grid-cols-1 gap-4 md:grid-cols-2";

export const fieldSpan = cva("min-w-0", {
  variants: {
    span: { half: "", full: "md:col-span-2" },
  },
  defaultVariants: { span: "full" },
});

export const fieldControl = "w-full";

export const fieldSelectClearable =
  "[&_[data-slot=combobox-trigger]]:inline-flex!";

export const fieldMultiselectTrigger = "ml-auto";

export const fieldNumberInput =
  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

export const fieldRequired = "text-destructive";

export const fieldNativeSelect = "w-full has-data-empty:text-muted-foreground";

export const fieldNativeDate =
  "appearance-none text-left [&::-webkit-date-and-time-value]:text-left";

export const fieldDateTrigger = "w-full justify-start font-normal";

export const fieldDatePlaceholder = "text-muted-foreground";

export const fieldDatePopover = "w-auto p-0";

export const fieldDateDialog = "outline-hidden";

export const formSection = "shrink-0 gap-4 [--card-spacing:--spacing(5)]";

export const formSectionHeader = "mx-(--card-spacing) border-b px-0 pb-3";

export const formSectionTitle = "font-heading text-base font-semibold text-primary";

export const formSectionDisclosure = "group/form-section flex flex-col";

export const formSectionPanelBody = "pt-(--card-spacing)";

export const formSectionHeaderToggle =
  "mx-(--card-spacing) px-0 group-data-expanded/form-section:border-b group-data-expanded/form-section:pb-1";

export const formSectionToggle =
  "group/form-section-toggle -my-2 flex min-h-11 w-full items-center gap-2 rounded-control text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

export const formSectionChevron =
  "ml-auto size-4 text-muted-foreground transition-transform group-aria-expanded/form-section-toggle:rotate-180";

export const fieldLabelHidden = "sr-only";

export const formIntro = "flex flex-wrap gap-4 rounded-lg bg-muted p-4";

export const formIntroItem = "flex min-w-30 flex-col gap-0.5";

export const formIntroLabel = "text-xs font-bold tracking-widest text-muted-foreground uppercase";

export const formIntroValue = "text-sm font-semibold text-foreground";

export const formSummary = "flex flex-col gap-2 rounded-lg bg-muted p-4";

export const formSummaryLine = cva("flex items-center justify-between gap-4 text-sm", {
  variants: {
    emphasis: {
      true: "border-t border-border pt-2 font-semibold text-foreground",
      false: "text-muted-foreground",
    },
  },
  defaultVariants: { emphasis: false },
});

export const formSummaryValue = moneyLevel({ level: "supporting" });

export const formSummaryBar = "flex flex-col";

export const formSummaryBarLines =
  "flex flex-col gap-1.5 border-b border-border pt-2 pb-2.5";

export const formSummaryBarRow = "flex min-h-11 items-center gap-3";

export const formSummaryBarToggle =
  "group/summary-toggle flex min-h-11 w-full items-center gap-3 rounded-control text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

export const formSummaryBarLabel = "text-sm font-semibold text-foreground";

export const formSummaryBarTotal = `ml-auto ${moneyLevel({ level: "amount" })}`;

export const formSummaryBarChevron =
  "size-4 text-muted-foreground transition-transform group-aria-expanded/summary-toggle:rotate-180";

export const switchRow = "flex min-h-11 items-center justify-between gap-4";

export const switchText = "flex min-w-0 flex-col gap-0.5";

export const switchLabel = "text-sm font-medium text-foreground";

export const switchDescription = "text-xs text-muted-foreground";

export const fieldSheetAnchor = "relative min-w-0";

export const fieldSheetProxy =
  "pointer-events-none absolute top-0 left-0 size-px text-base opacity-0";

export const fieldSheetTrigger =
  "flex min-h-11 w-full min-w-0 items-center gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-left text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 pressed:bg-muted/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30";

export const fieldSheetTriggerText = cva("min-w-0 flex-1", {
  variants: {
    filled: { true: "text-foreground", false: "text-muted-foreground" },
    multiline: { true: "line-clamp-2 whitespace-pre-line", false: "truncate" },
  },
  defaultVariants: { filled: false, multiline: false },
});

export const fieldSheetTriggerAffix =
  "shrink-0 text-muted-foreground [&_svg]:size-4";

export const fieldSheetContent =
  "max-h-[calc(0.92*var(--visual-viewport-height))] gap-0 rounded-t-sheet bg-panel pb-safe data-[side=bottom]:bottom-(--keyboard-inset) in-data-keyboard-open:pb-0";

export const fieldSheetHandle =
  "mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-muted-foreground/30";

export const fieldSheetBody = "flex min-h-0 flex-col gap-3 px-4 pt-4 pb-4";

export const fieldSheetLabel = "text-sm font-medium text-muted-foreground";

export const fieldSheetInputGroup =
  "h-14 rounded-xl border-2 border-primary px-1 has-[[data-slot=input-group-control]:focus-visible]:border-primary has-[[data-slot=input-group-control]:focus-visible]:ring-0";

export const fieldSheetInput = "text-base md:text-base";

export const fieldSheetTextarea =
  "min-h-28 rounded-xl border-2 border-primary px-4 py-3 text-base focus-visible:border-primary focus-visible:ring-0 md:text-base";

export const fieldSheetList =
  "-mx-2 flex max-h-[45dvh] flex-col overflow-y-auto overscroll-contain outline-none";

export const fieldSheetOption =
  "flex min-h-12 cursor-default items-center gap-3 rounded-lg px-2 text-base text-foreground outline-none focus-visible:bg-muted pressed:bg-muted selected:font-semibold selected:text-primary";

export const fieldSheetOptionCheck = "ml-auto size-4 shrink-0 text-primary";

export const fieldSheetEmpty = "px-2 py-3 text-sm text-muted-foreground";

export const fieldSheetSave = "h-12 w-full rounded-full text-base font-semibold";

export const fieldSheetClear = "h-11 w-full rounded-full";
