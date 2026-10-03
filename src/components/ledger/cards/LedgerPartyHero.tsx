import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn.utils";
import { toneText } from "../../../styles/common/tone.styles";
import {
  ledgerPartyHero,
  ledgerPartyHeroAmount,
  ledgerPartyHeroAmountSkeleton,
  ledgerPartyHeroAvatar,
  ledgerPartyHeroCaption,
  ledgerPartyHeroInitials,
  ledgerPartyHeroMeta,
  ledgerPartyHeroName,
} from "../../../styles/ledger/ledger.styles";
import {
  formatDate,
  formatInitials,
  formatMoney,
} from "../../../utils/format.utils";

import type { ILedgerPartySummary } from "../../../models/data/ledger/ledger.response";

type IProps = {
  name: string;
  summary?: Pick<
    ILedgerPartySummary,
    "outstanding" | "unpaidCount" | "lastTransactionAt"
  >;
  summaryLoading: boolean;
  lastPayment: string | null;
  unpaidNoun: string;
};

const LedgerPartyHero = ({
  name,
  summary,
  summaryLoading,
  lastPayment,
  unpaidNoun,
}: IProps) => {
  const outstanding = summary?.outstanding ?? 0;
  const unpaidCount = summary?.unpaidCount ?? 0;
  const lastTransactionAt = summary?.lastTransactionAt ?? null;

  const metaParts = [
    `${unpaidCount} ${unpaidNoun}`,
    lastPayment ? `Last payment ${formatDate(lastPayment)}` : null,
    lastTransactionAt ? `Last transaction ${formatDate(lastTransactionAt)}` : null,
  ].filter((part): part is string => part !== null);

  return (
    <div className={ledgerPartyHero}>
      <Avatar className={ledgerPartyHeroAvatar}>
        <AvatarFallback className={ledgerPartyHeroInitials}>
          {formatInitials(name)}
        </AvatarFallback>
      </Avatar>
      <span className={ledgerPartyHeroName}>{name}</span>
      <span className={ledgerPartyHeroCaption}>Outstanding balance</span>
      {summaryLoading ? (
        <Skeleton className={ledgerPartyHeroAmountSkeleton} />
      ) : (
        <span
          className={cn(
            ledgerPartyHeroAmount,
            toneText({ tone: outstanding > 0 ? "negative" : "positive" })
          )}
        >
          {formatMoney(outstanding)}
        </span>
      )}
      {summaryLoading ? null : (
        <span className={ledgerPartyHeroMeta}>{metaParts.join(" · ")}</span>
      )}
    </div>
  );
};

export default LedgerPartyHero;
