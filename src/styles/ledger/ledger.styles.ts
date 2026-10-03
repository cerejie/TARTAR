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

export const ledgerPane = "flex min-w-0 flex-col gap-4 pb-4";

export const ledgerHead = "flex flex-wrap items-center justify-between gap-4";

export const ledgerHeadStart = "flex min-w-0 items-center gap-4";

export const ledgerHeadActions = "flex flex-wrap items-center gap-2";

export const ledgerTitle = "truncate font-heading text-lg font-semibold";

export const ledgerSectionTitle = "font-heading text-base font-semibold";

export const paymentTotal = "text-right text-sm text-muted-foreground";

export const paymentTotalValue = `${moneyLevel({ level: "amount" })} text-foreground`;

export const ledgerIconButton = "max-lg:size-10 max-lg:gap-0 max-lg:rounded-full max-lg:px-0";

export const ledgerIconLabel = "max-lg:sr-only";

export const ledgerPartyHero = "flex flex-col items-center gap-1.5 pt-2 pb-1 text-center";

export const ledgerPartyHeroAvatar = "size-14";

export const ledgerPartyHeroInitials = "bg-brand-soft text-lg font-semibold text-brand";

export const ledgerPartyHeroName = "max-w-full truncate font-heading text-base font-semibold";

export const ledgerPartyHeroCaption = "text-caption text-muted-foreground";

export const ledgerPartyHeroAmount = moneyLevel({ level: "primary" });

export const ledgerPartyHeroAmountSkeleton = "h-9 w-40";

export const ledgerPartyHeroMeta = "max-w-full text-caption text-muted-foreground";

export const ledgerAmountCell = "flex flex-col items-end";

export const ledgerAmountCellOf = moneyLevel({ level: "meta" });
