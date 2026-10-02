import { useDashboardHook } from "../../../hook/data/dashboard/dashboard.hook";
import BentoGrid from "../../common/view/BentoGrid";
import AttentionList from "../AttentionList";
import CashFlowCard from "../cards/CashFlowCard";
import PerformanceStatCards from "../cards/PerformanceStatCards";
import PositionStatCards from "../cards/PositionStatCards";
import TodayStatCards from "../cards/TodayStatCards";
import DashboardSection from "../DashboardSection";
import QuickActions from "../QuickActions";
import SalesOverviewCard from "../SalesOverviewCard";

const DashboardPhone = () => {
  const dashboard = useDashboardHook();

  return (
    <>
      <DashboardSection title="Today">
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
        </BentoGrid>
      </DashboardSection>

      <QuickActions actions={dashboard.quickActions} />

      <AttentionList
        items={dashboard.attentionItems}
        loading={dashboard.attentionLoading}
        refreshing={dashboard.attentionRefreshing}
        error={dashboard.attentionError}
        onRetry={dashboard.retryAttention}
        onOpen={dashboard.openAttentionItem}
      />

      <DashboardSection title="Financial position">
        <BentoGrid>
          <PositionStatCards
            accountsReceivable={dashboard.summary?.accountsReceivable}
            accountsPayable={dashboard.summary?.accountsPayable}
            loading={dashboard.summaryLoading}
            error={dashboard.summaryError}
            onRetry={dashboard.retrySummary}
          />
        </BentoGrid>
      </DashboardSection>

      <DashboardSection title="Performance">
        <BentoGrid>
          <PerformanceStatCards
            monthlySales={dashboard.summary?.monthlySales}
            monthlyPendingSales={dashboard.monthlyPendingSales}
            monthlyExpenses={dashboard.monthlyExpenses}
            loading={dashboard.summaryLoading}
            error={dashboard.summaryError}
            onRetry={dashboard.retrySummary}
          />
        </BentoGrid>
      </DashboardSection>

      <DashboardSection title="Trends">
        <SalesOverviewCard
          salesPeriod={dashboard.salesPeriod}
          onSalesPeriodChange={dashboard.setSalesPeriod}
          series={dashboard.series}
          loading={dashboard.salesLoading}
          error={dashboard.salesError}
          onRetry={dashboard.retrySales}
        />
        <CashFlowCard
          cashIn={dashboard.cashIn}
          cashOut={dashboard.cashOut}
          netCashFlow={dashboard.netCashFlow}
          loading={dashboard.summaryLoading}
          error={dashboard.summaryError}
          onRetry={dashboard.retrySummary}
        />
      </DashboardSection>
    </>
  );
};

export default DashboardPhone;
