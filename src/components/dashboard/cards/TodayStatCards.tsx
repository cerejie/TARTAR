import { ChartPie, FileText, TrendingUp } from "lucide-react";
import { expensesPath, reportsPath, salesPath } from "../../../utils/route.utils";
import { statCaptionOf } from "../../../utils/stat.utils";
import StatCard from "../../common/card/StatCard";
import StatDelta from "../../common/status/StatDelta";
import BentoCell from "../../common/view/BentoCell";

import type { IDashboardSummary } from "../../../models/data/dashboard/dashboard.response";

type IProps = {
  summary: IDashboardSummary | undefined;
  summaryLoading: boolean;
  summaryError: string | null;
  onRetrySummary: () => void;
  netProfit: number | undefined;
  lastMonthNetProfit: number | undefined;
  profitLoading: boolean;
  profitError: string | null;
  onRetryProfit: () => void;
};

const TodayStatCards = ({
  summary,
  summaryLoading,
  summaryError,
  onRetrySummary,
  netProfit,
  lastMonthNetProfit,
  profitLoading,
  profitError,
  onRetryProfit,
}: IProps) => {
  return (
    <>
      <BentoCell span="third">
        <StatCard
          title="Today's Sales"
          value={summary?.todaysSales}
          loading={summaryLoading}
          error={summaryError}
          onRetry={onRetrySummary}
          variant="positive"
          icon={<TrendingUp />}
          href={salesPath}
          chip={
            <StatDelta
              current={summary?.todaysSales}
              previous={summary?.yesterdaysSales}
              goodDirection="up"
              label="vs yesterday"
            />
          }
          caption={statCaptionOf(
            summary?.todaysSales,
            summary?.yesterdaysSales,
            "vs yesterday",
            "Recorded today"
          )}
        />
      </BentoCell>
      <BentoCell span="third">
        <StatCard
          title="Today's Expenses"
          value={summary?.todaysExpenses}
          loading={summaryLoading}
          error={summaryError}
          onRetry={onRetrySummary}
          variant="negative"
          icon={<FileText />}
          href={expensesPath}
          chip={
            <StatDelta
              current={summary?.todaysExpenses}
              previous={summary?.yesterdaysExpenses}
              goodDirection="down"
              label="vs yesterday"
            />
          }
          caption={statCaptionOf(
            summary?.todaysExpenses,
            summary?.yesterdaysExpenses,
            "vs yesterday",
            "Recorded today"
          )}
        />
      </BentoCell>
      <BentoCell span="third">
        <StatCard
          title="Net Profit (MTD)"
          value={netProfit}
          loading={profitLoading}
          error={profitError}
          onRetry={onRetryProfit}
          variant="accent"
          icon={<ChartPie />}
          href={reportsPath}
          chip={
            <StatDelta
              current={netProfit}
              previous={lastMonthNetProfit}
              goodDirection="up"
              label="vs last month"
            />
          }
          caption={statCaptionOf(
            netProfit,
            lastMonthNetProfit,
            "vs last month",
            "Sales less expenses and purchases"
          )}
        />
      </BentoCell>
    </>
  );
};

export default TodayStatCards;
