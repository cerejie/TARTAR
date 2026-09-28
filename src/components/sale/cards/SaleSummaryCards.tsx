import { BadgeCheck, Ban, Clock, Landmark } from "lucide-react";
import StatCard from "../../common/card/StatCard";
import BentoCell from "../../common/view/BentoCell";
import BentoGrid from "../../common/view/BentoGrid";
import { useSaleListHook } from "../../../hook/data/sale/sale.list.hook";

const SaleSummaryCards = () => {
  const {
    summary,
    summaryLoading,
    summaryError,
    retrySummary,
    summaryPeriod,
  } = useSaleListHook();

  return (
    <BentoGrid>
      <BentoCell span="quarter">
        <StatCard
          title="Actual Sales"
          value={summary.verified}
          loading={summaryLoading}
          error={summaryError}
          onRetry={retrySummary}
          variant="brand"
          icon={<BadgeCheck />}
          caption={summaryPeriod}
        />
      </BentoCell>

      <BentoCell span="quarter">
        <StatCard
          title="Pending Verification"
          value={summary.pendingVerification}
          loading={summaryLoading}
          error={summaryError}
          onRetry={retrySummary}
          variant="warning"
          icon={<Clock />}
          caption="Deposited, awaiting an admin"
        />
      </BentoCell>

      <BentoCell span="quarter">
        <StatCard
          title="Undeposited"
          value={summary.undeposited}
          loading={summaryLoading}
          error={summaryError}
          onRetry={retrySummary}
          variant="default"
          icon={<Landmark />}
          caption="Not yet deposited to the bank"
        />
      </BentoCell>

      <BentoCell span="quarter">
        <StatCard
          title="Rejected"
          value={summary.rejected}
          loading={summaryLoading}
          error={summaryError}
          onRetry={retrySummary}
          raw
          variant="negative"
          icon={<Ban />}
          caption="Returned for correction"
        />
      </BentoCell>
    </BentoGrid>
  );
};

export default SaleSummaryCards;
