import { Wallet } from "lucide-react";
import DetailRows from "../../common/app/DetailRows";
import StatCard from "../../common/card/StatCard";
import BentoCell from "../../common/view/BentoCell";
import BentoGrid from "../../common/view/BentoGrid";
import { useIsCompact } from "../../../hook/common/breakpoint.hook";
import { formatDate } from "../../../utils/format.utils";

import type { IDetailItem } from "../../../models/common/detail.model";
import type { ILedgerPartySummary } from "../../../models/data/ledger/ledger.response";

type ILedgerPartyTotals = Pick<
  ILedgerPartySummary,
  "outstanding" | "unpaidCount" | "lastTransactionAt"
>;

type ILedgerPartyFacts = ILedgerPartyTotals & {
  lastPayment: string | null;
};

type IProps = {
  summary?: ILedgerPartyTotals;
  summaryLoading: boolean;
  lastPayment: string | null;
  lastPaymentLoading: boolean;
  unpaidLabel: string;
};

const LedgerPartyOverview = ({
  summary,
  summaryLoading,
  lastPayment,
  lastPaymentLoading,
  unpaidLabel,
}: IProps) => {
  const isCompact = useIsCompact();

  const facts: ILedgerPartyFacts = {
    outstanding: summary?.outstanding ?? 0,
    unpaidCount: summary?.unpaidCount ?? 0,
    lastTransactionAt: summary?.lastTransactionAt ?? null,
    lastPayment,
  };
  const balanceTone = facts.outstanding > 0 ? "negative" : "positive";

  if (isCompact) {
    const factItems: IDetailItem<ILedgerPartyFacts>[] = [
      {
        key: "unpaid",
        label: unpaidLabel,
        render: (record) => (summaryLoading ? "—" : record.unpaidCount),
      },
      {
        key: "last-payment",
        label: "Last payment",
        render: (record) =>
          lastPaymentLoading ? "—" : formatDate(record.lastPayment),
      },
      {
        key: "last-transaction",
        label: "Last transaction",
        render: (record) =>
          summaryLoading ? "—" : formatDate(record.lastTransactionAt),
      },
    ];

    return (
      <>
        <StatCard
          title="Outstanding balance"
          value={facts.outstanding}
          loading={summaryLoading}
          variant={balanceTone}
          icon={<Wallet />}
        />
        <DetailRows record={facts} items={factItems} />
      </>
    );
  }

  return (
    <BentoGrid>
      <BentoCell span="quarter">
        <StatCard
          title="Outstanding balance"
          value={facts.outstanding}
          loading={summaryLoading}
          variant={balanceTone}
        />
      </BentoCell>
      <BentoCell span="quarter">
        <StatCard
          title={unpaidLabel}
          value={facts.unpaidCount}
          loading={summaryLoading}
          raw
        />
      </BentoCell>
      <BentoCell span="quarter">
        <StatCard
          title="Last payment"
          value={formatDate(facts.lastPayment)}
          loading={lastPaymentLoading}
          raw
        />
      </BentoCell>
      <BentoCell span="quarter">
        <StatCard
          title="Last transaction"
          value={formatDate(facts.lastTransactionAt)}
          loading={summaryLoading}
          raw
        />
      </BentoCell>
    </BentoGrid>
  );
};

export default LedgerPartyOverview;
