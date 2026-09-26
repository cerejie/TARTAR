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

export const fieldRequired = "text-destructive";

export const fieldDateTrigger = "w-full justify-start font-normal";

export const fieldDatePlaceholder = "text-muted-foreground";

export const fieldDatePopover = "w-auto p-0";

export const formSection = "flex flex-col gap-4";

export const formSectionHeader = "flex flex-col gap-1";

export const formSectionTitle = "font-heading text-sm font-semibold";

export const formSectionDescription = "text-sm text-muted-foreground";
