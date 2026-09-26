import {
  ChartLine,
  ChartPie,
  FileCheck,
  FileText,
  Landmark,
  TrendingUp,
  User,
  Wallet,
} from "lucide-react";
import SectionCard from "../../components/common/card/SectionCard";
import StatCard from "../../components/common/card/StatCard";
import EmptyState from "../../components/common/status/EmptyState";
import StatDelta from "../../components/common/status/StatDelta";
import BentoCell from "../../components/common/view/BentoCell";
import ContentView from "../../components/common/view/ContentView";
import CashFlowDonut from "../../components/dashboard/CashFlowDonut";
import NotificationsPanel from "../../components/dashboard/NotificationsPanel";
import SalesOverviewCard from "../../components/dashboard/SalesOverviewCard";
import { useDashboardHook } from "../../hook/data/dashboard/dashboard.hook";
import { formatDate, todayIso } from "../../utils/format.utils";

const DashboardView = () => {
  const {
    salesPeriod,
    setSalesPeriod,
    summary,
    summaryLoading,
    series,
    salesLoading,
    alerts,
    alertsLoading,
    netProfit,
    lastMonthNetProfit,
    cashIn,
    cashOut,
    netCashFlow,
  } = useDashboardHook();

  return (
    <ContentView
      meta={formatDate(todayIso())}
      layout="bento"
    >
      <BentoCell span="quarter">
        <StatCard
          title="Current Cash"
          value={summary?.currentCash}
          loading={summaryLoading}
          variant="brand"
          icon={<Wallet />}
          caption="Available cash on hand"
        />
      </BentoCell>
      <BentoCell span="quarter">
        <StatCard
          title="Bank Balance"
          value={summary?.bankBalance}
          loading={summaryLoading}
          icon={<Landmark />}
          caption="Total in bank accounts"
        />
      </BentoCell>
      <BentoCell span="quarter">
        <StatCard
          title="Today's Sales"
          value={summary?.todaysSales}
          loading={summaryLoading}
          variant="positive"
          icon={<TrendingUp />}
          chip={
            <StatDelta
              current={summary?.todaysSales}
              previous={summary?.yesterdaysSales}
              goodDirection="up"
              label="vs yesterday"
            />
          }
          caption="vs yesterday"
        />
      </BentoCell>
      <BentoCell span="quarter">
        <StatCard
          title="Today's Expenses"
          value={summary?.todaysExpenses}
          loading={summaryLoading}
          variant="negative"
          icon={<FileText />}
          chip={
            <StatDelta
              current={summary?.todaysExpenses}
              previous={summary?.yesterdaysExpenses}
              goodDirection="down"
              label="vs yesterday"
            />
          }
          caption="vs yesterday"
        />
      </BentoCell>

      <BentoCell span="quarter">
        <StatCard
          title="Accounts Receivable"
          value={summary?.accountsReceivable}
          loading={summaryLoading}
          icon={<User />}
          caption="Total outstanding"
        />
      </BentoCell>
      <BentoCell span="quarter">
        <StatCard
          title="Accounts Payable"
          value={summary?.accountsPayable}
          loading={summaryLoading}
          icon={<FileCheck />}
          caption="Total outstanding"
        />
      </BentoCell>
      <BentoCell span="quarter">
        <StatCard
          title="Monthly Sales"
          value={summary?.monthlySales}
          loading={summaryLoading}
          variant="positive"
          icon={<ChartLine />}
          caption="Month to date"
        />
      </BentoCell>
      <BentoCell span="quarter">
        <StatCard
          title="Net Profit (MTD)"
          value={netProfit}
          loading={summaryLoading}
          variant="accent"
          icon={<ChartPie />}
          chip={
            <StatDelta
              current={netProfit}
              previous={lastMonthNetProfit}
              goodDirection="up"
              label="vs last month"
            />
          }
          caption="vs last month"
        />
      </BentoCell>

      <BentoCell span="twoThirds">
        <SalesOverviewCard
          salesPeriod={salesPeriod}
          onSalesPeriodChange={setSalesPeriod}
          series={series}
          loading={salesLoading}
        />
      </BentoCell>

      <BentoCell span="third">
        <SectionCard
          title="Cash Flow (MTD)"
          subtitle="Cash in vs. cash out this month"
          tone="ink"
        >
          {summaryLoading ? (
            <EmptyState description="Loading cash flow" loading />
          ) : (
            <CashFlowDonut
              cashIn={cashIn}
              cashOut={cashOut}
              netCashFlow={netCashFlow}
            />
          )}
        </SectionCard>
      </BentoCell>

      <BentoCell span="full">
        <NotificationsPanel data={alerts} loading={alertsLoading} />
      </BentoCell>
    </ContentView>
  );
};

export default DashboardView;
