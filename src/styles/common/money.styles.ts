import { cva } from "class-variance-authority";

export const moneyLevel = cva("tabular-nums", {
  variants: {
    level: {
      primary: "font-heading text-money-lg font-semibold tracking-tight",
      amount: "font-heading text-emphasis font-semibold",
      supporting: "text-sm font-medium",
      meta: "text-caption text-muted-foreground",
    },
  },
  defaultVariants: { level: "amount" },
});
