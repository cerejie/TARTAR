import { cva } from "class-variance-authority";

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

export const fieldDateTrigger = "w-full justify-start font-normal";

export const fieldDatePlaceholder = "text-muted-foreground";

export const fieldDatePopover = "w-auto p-0";

export const formSection = "shrink-0 gap-4 [--card-spacing:--spacing(5)]";

export const formSectionHeader = "mx-(--card-spacing) border-b px-0 pb-3";

export const formSectionTitle = "font-heading text-base font-semibold text-primary";

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

export const formSummaryValue = "tabular-nums";
