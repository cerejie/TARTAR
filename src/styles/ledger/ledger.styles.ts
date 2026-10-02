import { cva } from "class-variance-authority";

import { moneyLevel } from "../common/money.styles";

export const slidePanes = "-mx-1 overflow-hidden";

export const slideTrack = cva(
  "flex w-[200%] items-start transition-transform duration-300 ease-in-out motion-reduce:transition-none",
  {
    variants: {
      detail: { true: "-translate-x-1/2", false: "" },
    },
    defaultVariants: { detail: false },
  }
);

export const slidePane = "flex w-1/2 min-w-0 shrink-0 flex-col gap-4 px-1";

export const ledgerHead =
  "flex flex-wrap items-center justify-between gap-4 max-lg:gap-2";

export const ledgerHeadStart = "flex min-w-0 items-center gap-4 max-lg:flex-1 max-lg:gap-2";

export const ledgerHeadActions = "flex flex-wrap items-center gap-2 max-lg:contents";

export const ledgerPayButton = "max-lg:order-last max-lg:w-full";

export const ledgerTitle = "truncate font-heading text-lg font-semibold";

export const ledgerSectionTitle = "font-heading text-base font-semibold";

export const paymentTotal = "text-right text-sm text-muted-foreground";

export const paymentTotalValue = `${moneyLevel({ level: "amount" })} text-foreground`;

export const ledgerIconButton = "max-lg:size-10 max-lg:gap-0 max-lg:rounded-full max-lg:px-0";

export const ledgerIconLabel = "max-lg:sr-only";
