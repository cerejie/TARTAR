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
import { Col, Empty, Flex, Row, Segmented, Spin } from "antd";
import dayjs from "dayjs";
import StatCard from "../../components/common/card/StatCard";
import SectionCard from "../../components/common/card/SectionCard";
import PageHeader from "../../components/common/view/PageHeader";
import CashFlowDonut from "../../components/dashboard/CashFlowDonut";
import NotificationsPanel from "../../components/dashboard/NotificationsPanel";
import StatDelta from "../../components/dashboard/StatDelta";
import { useDashboardHook } from "../../hook/data/dashboard/dashboard.hook";
import {
  salesPeriodLabels,
  salesPeriodSubtitles,
  salesPeriodValues,
  type SalesPeriod,
} from "../../models/data/dashboard/dashboard.response";
import { colors } from "../../styles/common/vars.css";
import { statGrid } from "../../styles/stat/stat.css";
import { chartLoading } from "../../styles/view/common/common.view.css";
import { notificationColumn } from "../../styles/view/dashboard/dashboard.view.css";
import { formatMoney } from "../../utils/format.utils";

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

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={
          branchName
            ? `Standing for ${branchName}`
            : "Company-wide standing across all branches"
        }
      />

      <Row gutter={[24, 24]} align="stretch">
        <Col xs={24} xl={18}>
          <Row gutter={[16, 16]} className={`${statGrid}`}>
            <Col xs={24} sm={12} md={6}>
              <StatCard
                title="Current Cash"
                value={summary?.currentCash}
                loading={summaryLoading}
                variant="brand"
                icon={<WalletOutlined />}
                caption="Available cash on hand"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <StatCard
                title="Bank Balance"
                value={summary?.bankBalance}
                loading={summaryLoading}
                icon={<BankOutlined />}
                caption="Total in bank accounts"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <StatCard
                title="Today's Sales"
                value={summary?.todaysSales}
                loading={summaryLoading}
                variant="positive"
                icon={<RiseOutlined />}
                caption={
                  <StatDelta
                    current={summary?.todaysSales}
                    previous={summary?.yesterdaysSales}
                    goodDirection="up"
                    label="vs yesterday"
                  />
                }
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <StatCard
                title="Today's Expenses"
                value={summary?.todaysExpenses}
                loading={summaryLoading}
                variant="negative"
                icon={<FileTextOutlined />}
                caption={
                  <StatDelta
                    current={summary?.todaysExpenses}
                    previous={summary?.yesterdaysExpenses}
                    goodDirection="down"
                    label="vs yesterday"
                  />
                }
              />
            </Col>
          </Row>

          <Row gutter={[16, 16]} className={`${statGrid}`}>
            <Col xs={24} sm={12} md={6}>
              <StatCard
                title="Accounts Receivable"
                value={summary?.accountsReceivable}
                loading={summaryLoading}
                icon={<UserOutlined />}
                caption="Total outstanding"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <StatCard
                title="Accounts Payable"
                value={summary?.accountsPayable}
                loading={summaryLoading}
                icon={<FileDoneOutlined />}
                caption="Total outstanding"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <StatCard
                title="Monthly Sales"
                value={summary?.monthlySales}
                loading={summaryLoading}
                variant="positive"
                icon={<LineChartOutlined />}
                caption="Month to date"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <StatCard
                title="Net Profit (MTD)"
                value={netProfit}
                loading={summaryLoading}
                variant="brand"
                icon={<PieChartOutlined />}
                caption={
                  <StatDelta
                    current={netProfit}
                    previous={lastMonthNetProfit}
                    goodDirection="up"
                    label="vs last month"
                  />
                }
              />
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
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
                  <Flex
                    className={`${chartLoading}`}
                    align="center"
                    justify="center"
                  >
                    <Spin />
                  </Flex>
                ) : series.length ? (
                  <Column
                    data={series}
                    xField="date"
                    yField="total"
                    height={300}
                    style={{
                      fill: colors.brand,
                      radiusTopLeft: 4,
                      radiusTopRight: 4,
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
                        gridStrokeOpacity: 0.35,
                      },
                    }}
                    tooltip={{
                      items: [
                        {
                          channel: "y",
                          valueFormatter: (value: number) =>
                            formatMoney(value),
                        },
                      ],
                    }}
                  />
                ) : (
                  <Empty description="No sales recorded yet" />
                )}
              </SectionCard>
            </Col>
            <Col xs={24} lg={8}>
              <SectionCard
                title="Cash Flow (MTD)"
                subtitle="Cash in vs. cash out this month"
              >
                {summaryLoading ? (
                  <Flex
                    className={`${chartLoading}`}
                    align="center"
                    justify="center"
                  >
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
            </Col>
          </Row>
        </Col>

        <Col xs={24} xl={6}>
          <Flex vertical className={`${notificationColumn}`}>
            <NotificationsPanel data={alerts} loading={alertsLoading} />
          </Flex>
        </Col>
      </Row>
    </>
  );
};

export default DashboardView;
