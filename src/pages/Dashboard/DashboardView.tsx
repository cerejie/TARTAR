import { Column } from "@ant-design/charts";
import {
  BankOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  LineChartOutlined,
  PieChartOutlined,
  RiseOutlined,
  UserOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { Empty, Flex, Segmented, Spin } from "antd";
import dayjs from "dayjs";
import SectionCard from "../../components/common/card/SectionCard";
import StatCard from "../../components/common/card/StatCard";
import StatDelta from "../../components/common/status/StatDelta";
import BentoCell from "../../components/common/view/BentoCell";
import ContentView from "../../components/common/view/ContentView";
import CashFlowDonut from "../../components/dashboard/CashFlowDonut";
import NotificationsPanel from "../../components/dashboard/NotificationsPanel";
import { useDashboardHook } from "../../hook/data/dashboard/dashboard.hook";
import {
  salesPeriodLabels,
  salesPeriodSubtitles,
  salesPeriodValues,
  type SalesPeriod,
} from "../../models/data/dashboard/dashboard.response";
import { colors } from "../../styles/common/vars.css";
import { chartLoading } from "../../styles/view/common/common.view.css";
import { formatDate, formatMoney, todayIso } from "../../utils/format.utils";

const formatAxisLabel = (iso: string, period: SalesPeriod): string => {
  const date = dayjs(iso);
  if (period === "daily") return date.format("MM-DD");
  if (period === "weekly") return date.format("MMM D");
  if (period === "monthly") return date.format("MMM");
  return date.format("YYYY");
};

const DashboardView = () => {
  const {
    branchName,
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

  const latestDate = series.length ? series[series.length - 1].date : null;

  return (
    <ContentView
      title="Dashboard"
      subtitle={
        branchName
          ? `Standing for ${branchName}`
          : "Company-wide standing across all branches"
      }
      meta={formatDate(todayIso())}
      layout="bento"
    >
      <BentoCell span="quarter">
        <StatCard
          title="Current Cash"
          value={summary?.currentCash}
          loading={summaryLoading}
          variant="brand"
          icon={<WalletOutlined />}
          caption="Available cash on hand"
        />
      </BentoCell>
      <BentoCell span="quarter">
        <StatCard
          title="Bank Balance"
          value={summary?.bankBalance}
          loading={summaryLoading}
          icon={<BankOutlined />}
          caption="Total in bank accounts"
        />
      </BentoCell>
      <BentoCell span="quarter">
        <StatCard
          title="Today's Sales"
          value={summary?.todaysSales}
          loading={summaryLoading}
          variant="positive"
          icon={<RiseOutlined />}
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
          icon={<FileTextOutlined />}
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
          icon={<UserOutlined />}
          caption="Total outstanding"
        />
      </BentoCell>
      <BentoCell span="quarter">
        <StatCard
          title="Accounts Payable"
          value={summary?.accountsPayable}
          loading={summaryLoading}
          icon={<FileDoneOutlined />}
          caption="Total outstanding"
        />
      </BentoCell>
      <BentoCell span="quarter">
        <StatCard
          title="Monthly Sales"
          value={summary?.monthlySales}
          loading={summaryLoading}
          variant="positive"
          icon={<LineChartOutlined />}
          caption="Month to date"
        />
      </BentoCell>
      <BentoCell span="quarter">
        <StatCard
          title="Net Profit (MTD)"
          value={netProfit}
          loading={summaryLoading}
          variant="accent"
          icon={<PieChartOutlined />}
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
        <SectionCard
          title="Sales Overview"
          subtitle={salesPeriodSubtitles[salesPeriod]}
          extra={
            <Segmented
              size="small"
              value={salesPeriod}
              onChange={(value) => setSalesPeriod(value as SalesPeriod)}
              options={salesPeriodValues.map((period) => ({
                label: salesPeriodLabels[period],
                value: period,
              }))}
            />
          }
        >
          {salesLoading ? (
            <Flex className={`${chartLoading}`} align="center" justify="center">
              <Spin />
            </Flex>
          ) : series.length ? (
            <Column
              data={series}
              xField="date"
              yField="total"
              height={300}
              style={{
                fill: (item: { date: string }) =>
                  item.date === latestDate ? colors.accent : colors.ink,
                radiusTopLeft: 8,
                radiusTopRight: 8,
              }}
              axis={{
                x: {
                  labelFormatter: (value: string) =>
                    formatAxisLabel(value, salesPeriod),
                  labelFill: colors.textMuted,
                  line: false,
                },
                y: {
                  labelFill: colors.textMuted,
                  gridStroke: colors.border,
                  gridStrokeOpacity: 0.6,
                },
              }}
              tooltip={{
                items: [
                  {
                    channel: "y",
                    valueFormatter: (value: number) => formatMoney(value),
                  },
                ],
              }}
            />
          ) : (
            <Empty description="No sales recorded yet" />
          )}
        </SectionCard>
      </BentoCell>

      <BentoCell span="third">
        <SectionCard
          title="Cash Flow (MTD)"
          subtitle="Cash in vs. cash out this month"
          tone="ink"
        >
          {summaryLoading ? (
            <Flex className={`${chartLoading}`} align="center" justify="center">
              <Spin />
            </Flex>
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
