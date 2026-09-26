import { cva } from "class-variance-authority";

export const sectionCardRoot = cva("", {
  variants: {
    tone: {
      surface: "",
      ink: "bg-ink text-on-ink ring-0",
      accent: "bg-lime-mist ring-lime-soft",
    },
    flush: {
      true: "py-0",
      false: "",
    },
  },
  defaultVariants: { tone: "surface", flush: false },
});

export const sectionCardSubtitle = cva("", {
  variants: {
    tone: {
      surface: "",
      ink: "text-on-ink-muted",
      accent: "",
    },
  },
  defaultVariants: { tone: "surface" },
});

export const sectionCardTitle = "font-heading font-semibold";

export const sectionCardExtra = "flex items-center gap-2";

export const sectionCardFlushBody = "px-0";

export const sectionCardInset = "py-4";

export const sectionCardFooter = "flex-wrap gap-2 border-t";
