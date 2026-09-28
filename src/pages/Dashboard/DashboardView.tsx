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
import StatDelta from "../../components/common/status/StatDelta";
import StatusTag from "../../components/common/status/StatusTag";
import BentoCell from "../../components/common/view/BentoCell";
import BentoGrid from "../../components/common/view/BentoGrid";
import ContentView from "../../components/common/view/ContentView";
import CashFlowDonut from "../../components/dashboard/CashFlowDonut";
import NotificationsCard from "../../components/dashboard/NotificationsCard";
import SalesOverviewCard from "../../components/dashboard/SalesOverviewCard";
import { useDashboardHook } from "../../hook/data/dashboard/dashboard.hook";
import { formatDate, formatMoney, todayIso } from "../../utils/format.utils";

const DashboardView = () => {
  const {
    salesPeriod,
    setSalesPeriod,
    summary,
    summaryLoading,
    summaryError,
    retrySummary,
    series,
    salesLoading,
    salesError,
    retrySales,
    alerts,
    alertsLoading,
    alertsError,
    retryAlerts,
    monthlyPendingSales,
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
      <BentoCell span="main">
        <BentoGrid>
          <BentoCell span="quarter">
            <StatCard
              title="Current Cash"
              value={summary?.currentCash}
              loading={summaryLoading}
              error={summaryError}
              onRetry={retrySummary}
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
              error={summaryError}
              onRetry={retrySummary}
              icon={<Landmark />}
              caption="Total in bank accounts"
            />
          </BentoCell>
          <BentoCell span="quarter">
            <StatCard
              title="Today's Sales"
              value={summary?.todaysSales}
              loading={summaryLoading}
              error={summaryError}
              onRetry={retrySummary}
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
              error={summaryError}
              onRetry={retrySummary}
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
              error={summaryError}
              onRetry={retrySummary}
              icon={<User />}
              caption="Total outstanding"
            />
          </BentoCell>
          <BentoCell span="quarter">
            <StatCard
              title="Accounts Payable"
              value={summary?.accountsPayable}
              loading={summaryLoading}
              error={summaryError}
              onRetry={retrySummary}
              icon={<FileCheck />}
              caption="Total outstanding"
            />
          </BentoCell>
          <BentoCell span="quarter">
            <StatCard
              title="Monthly Sales"
              value={summary?.monthlySales}
              loading={summaryLoading}
              error={summaryError}
              onRetry={retrySummary}
              variant="positive"
              icon={<ChartLine />}
              chip={
                monthlyPendingSales ? (
                  <StatusTag
                    color="warning"
                    label={`${formatMoney(monthlyPendingSales)} pending`}
                  />
                ) : null
              }
              caption="Verified, month to date"
            />
          </BentoCell>
          <BentoCell span="quarter">
            <StatCard
              title="Net Profit (MTD)"
              value={netProfit}
              loading={summaryLoading}
              error={summaryError}
              onRetry={retrySummary}
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
              error={salesError}
              onRetry={retrySales}
            />
          </BentoCell>

          <BentoCell span="third">
            <SectionCard
              title="Cash Flow (MTD)"
              subtitle="Cash in vs. cash out this month"
              loading={summaryLoading}
              error={summaryError}
              onRetry={retrySummary}
            >
              <CashFlowDonut
                cashIn={cashIn}
                cashOut={cashOut}
                netCashFlow={netCashFlow}
              />
            </SectionCard>
          </BentoCell>
        </BentoGrid>
      </BentoCell>

      <BentoCell span="aside">
        <NotificationsCard
          data={alerts}
          loading={alertsLoading}
          error={alertsError}
          onRetry={retryAlerts}
        />
      </BentoCell>
    </ContentView>
  );
};

export default DashboardView;
