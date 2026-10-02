import { useDashboardHook } from "../../../hook/data/dashboard/dashboard.hook";
import BentoCell from "../../common/view/BentoCell";
import BentoGrid from "../../common/view/BentoGrid";
import AttentionList from "../AttentionList";
import CashFlowCard from "../cards/CashFlowCard";
import PerformanceStatCards from "../cards/PerformanceStatCards";
import PositionStatCards from "../cards/PositionStatCards";
import TodayStatCards from "../cards/TodayStatCards";
import NotificationsCard from "../NotificationsCard";
import SalesOverviewCard from "../SalesOverviewCard";

const DashboardDesktop = () => {
  const dashboard = useDashboardHook();

  return (
    <BentoGrid>
      <BentoCell span="main">
        <BentoGrid>
          <TodayStatCards
            summary={dashboard.summary}
            summaryLoading={dashboard.summaryLoading}
            summaryError={dashboard.summaryError}
            onRetrySummary={dashboard.retrySummary}
            netProfit={dashboard.netProfit}
            lastMonthNetProfit={dashboard.lastMonthNetProfit}
            profitLoading={dashboard.profitLoading}
            profitError={dashboard.profitError}
            onRetryProfit={dashboard.retryProfit}
          />

          <BentoCell span="full">
            <AttentionList
              items={dashboard.attentionItems}
              loading={dashboard.attentionLoading}
              refreshing={dashboard.attentionRefreshing}
              error={dashboard.attentionError}
              onRetry={dashboard.retryAttention}
              onOpen={dashboard.openAttentionItem}
            />
          </BentoCell>

          <PositionStatCards
            accountsReceivable={dashboard.summary?.accountsReceivable}
            accountsPayable={dashboard.summary?.accountsPayable}
            loading={dashboard.summaryLoading}
            error={dashboard.summaryError}
            onRetry={dashboard.retrySummary}
          />
          <PerformanceStatCards
            monthlySales={dashboard.summary?.monthlySales}
            monthlyPendingSales={dashboard.monthlyPendingSales}
            monthlyExpenses={dashboard.monthlyExpenses}
            loading={dashboard.summaryLoading}
            error={dashboard.summaryError}
            onRetry={dashboard.retrySummary}
          />

          <BentoCell span="twoThirds">
            <SalesOverviewCard
              salesPeriod={dashboard.salesPeriod}
              onSalesPeriodChange={dashboard.setSalesPeriod}
              series={dashboard.series}
              loading={dashboard.salesLoading}
              error={dashboard.salesError}
              onRetry={dashboard.retrySales}
            />
          </BentoCell>
          <BentoCell span="third">
            <CashFlowCard
              cashIn={dashboard.cashIn}
              cashOut={dashboard.cashOut}
              netCashFlow={dashboard.netCashFlow}
              loading={dashboard.summaryLoading}
              error={dashboard.summaryError}
              onRetry={dashboard.retrySummary}
            />
          </BentoCell>
        </BentoGrid>
      </BentoCell>

      <BentoCell span="aside">
        <NotificationsCard
          data={dashboard.alerts}
          loading={dashboard.alertsLoading}
          error={dashboard.alertsError}
          onRetry={dashboard.retryAlerts}
        />
      </BentoCell>
    </BentoGrid>
  );
};

export default DashboardDesktop;
