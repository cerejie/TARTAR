import { CalendarDays, CircleAlert, Wallet } from "lucide-react";
import StatCard from "../../common/card/StatCard";
import BentoCell from "../../common/view/BentoCell";
import BentoGrid from "../../common/view/BentoGrid";
import {
  useLedgerScopeHook,
  type LedgerScope,
} from "../../../hook/data/ledger/ledger.scope.hook";

type IProps = {
  scope: LedgerScope;
};

const LedgerSummaryCards = ({ scope }: IProps) => {
  const { summary, summaryLoading, summaryPeriod } = useLedgerScopeHook(scope);

  const overdueCaption =
    summary.overdueCount === 1
      ? "1 record past due"
      : `${summary.overdueCount} records past due`;

  return (
    <BentoGrid>
      <BentoCell span="third">
        <StatCard
          title="Outstanding balance"
          value={summary.outstanding}
          loading={summaryLoading}
          variant="brand"
          icon={<Wallet />}
          caption={summaryPeriod}
        />
      </BentoCell>

      <BentoCell span="third">
        <StatCard
          title="Overdue balance"
          value={summary.overdue}
          loading={summaryLoading}
          variant="negative"
          icon={<CircleAlert />}
          caption={overdueCaption}
        />
      </BentoCell>

      <BentoCell span="third">
        <StatCard
          title="Due in 7 days"
          value={summary.dueSoon}
          loading={summaryLoading}
          variant={scope === "payables" ? "warning" : "default"}
          icon={<CalendarDays />}
          caption="Unpaid records due within the week"
        />
      </BentoCell>
    </BentoGrid>
  );
};

export default LedgerSummaryCards;
