import { type ReactNode, useState } from 'react'
import { createRoute, Link, redirect } from '@tanstack/react-router'
import { Badge, Col, Empty, Row, Segmented, Spin, Typography } from 'antd'
import {
  BankOutlined,
  CaretDownOutlined,
  CaretUpOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  LineChartOutlined,
  PieChartOutlined,
  RiseOutlined,
  UserOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import { Column, Pie } from '@ant-design/charts'
import dayjs from 'dayjs'
import { appLayoutRoute } from './app.route'
import { PageHeader } from '../components/PageHeader'
import { SectionCard } from '../components/SectionCard'
import { StatCard } from '../components/StatCard'
import { colors } from '../styles/theme.css'
import { useQuery } from '../hooks/useQuery'
import { useBranchScope } from '../hooks/useBranchScope'
import { useAuthStore } from '../stores/auth.store'
import * as dashboardService from '../services/dashboard.service'
import { salesPeriodValues, type Payable, type Receivable, type SalesPeriod } from '../models'
import { formatDate, formatMoney } from '../utils/format'

/**
 * Admin/superAdmin dashboard (build spec §11). Manager-only — non-managers are
 * redirected to their transactions home.
 */
export const dashboardRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/',
  beforeLoad: () => {
    const s = useAuthStore.getState()
    const isManager = s.kind === 'superadmin' || s.user?.role === 'admin'
    if (!isManager) throw redirect({ to: '/transactions' })
  },
  component: DashboardPage,
})

const SALES_PERIOD_LABEL: Record<SalesPeriod, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
}

const SALES_PERIOD_SUBTITLE: Record<SalesPeriod, string> = {
  daily: 'Last 30 days',
  weekly: 'Last 12 weeks',
  monthly: 'Last 12 months',
  yearly: 'Last 5 years',
}

function DashboardPage() {
  // Global branch view (sidebar). Keys carry the scope so each branch's numbers
  // cache separately and switching back is instant.
  const { branch, branchName } = useBranchScope()
  const scope = branch ?? 'all'
  const [period, setPeriod] = useState<SalesPeriod>('daily')

  const summary = useQuery(`dashboard-summary:${scope}`, () => dashboardService.getDashboardSummary(branch))
  const sales = useQuery(`dashboard-sales:${scope}:${period}`, () => dashboardService.getSalesSeries(period, branch))
  const alerts = useQuery(`dashboard-alerts:${scope}`, () => dashboardService.getDueAlerts(7, branch))

  const s = summary.data
  const series = sales.data ?? []

  const netProfit = s ? s.monthlySales - s.monthlyExpenses : undefined
  const lastMonthNetProfit = s ? s.lastMonthSales - s.lastMonthExpenses : undefined
  const cashIn = s?.monthlyCashIn ?? 0
  const cashOut = s?.monthlyCashOut ?? 0
  const netCashFlow = cashIn - cashOut

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={branchName ? `Standing for ${branchName}` : 'Company-wide standing across all branches'}
      />

      {/* Notifications ride alongside the standing figures (not above them):
          on the two-column layout below `xl` they stack after the charts, but
          at desktop width the sidebar keeps overdue/near-due items constantly
          in view without pushing the numbers down the page. */}
      <Row gutter={[24, 24]} align="stretch">
        <Col xs={24} xl={18}>
          <Row gutter={[16, 16]} className="tartar-stat-grid">
            <StatTile
              span={6}
              title="Current Cash"
              value={s?.currentCash}
              loading={summary.loading}
              tone="brand"
              icon={<WalletOutlined />}
              caption="Available cash on hand"
            />
            <StatTile
              span={6}
              title="Bank Balance"
              value={s?.bankBalance}
              loading={summary.loading}
              icon={<BankOutlined />}
              caption="Total in bank accounts"
            />
            <StatTile
              span={6}
              title="Today's Sales"
              value={s?.todaysSales}
              loading={summary.loading}
              tone="positive"
              icon={<RiseOutlined />}
              caption={
                <StatDelta current={s?.todaysSales} previous={s?.yesterdaysSales} goodDirection="up" label="vs yesterday" />
              }
            />
            <StatTile
              span={6}
              title="Today's Expenses"
              value={s?.todaysExpenses}
              loading={summary.loading}
              tone="negative"
              icon={<FileTextOutlined />}
              caption={
                <StatDelta
                  current={s?.todaysExpenses}
                  previous={s?.yesterdaysExpenses}
                  goodDirection="down"
                  label="vs yesterday"
                />
              }
            />
          </Row>

          <Row gutter={[16, 16]} className="tartar-stat-grid">
            <StatTile
              span={6}
              title="Accounts Receivable"
              value={s?.accountsReceivable}
              loading={summary.loading}
              icon={<UserOutlined />}
              caption="Total outstanding"
            />
            <StatTile
              span={6}
              title="Accounts Payable"
              value={s?.accountsPayable}
              loading={summary.loading}
              icon={<FileDoneOutlined />}
              caption="Total outstanding"
            />
            <StatTile
              span={6}
              title="Monthly Sales"
              value={s?.monthlySales}
              loading={summary.loading}
              tone="positive"
              icon={<LineChartOutlined />}
              caption="Month to date"
            />
            <StatTile
              span={6}
              title="Net Profit (MTD)"
              value={netProfit}
              loading={summary.loading}
              tone="brand"
              icon={<PieChartOutlined />}
              caption={
                <StatDelta current={netProfit} previous={lastMonthNetProfit} goodDirection="up" label="vs last month" />
              }
            />
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <SectionCard
                title="Sales Overview"
                subtitle={SALES_PERIOD_SUBTITLE[period]}
                extra={
                  <Segmented
                    size="small"
                    value={period}
                    onChange={(v) => setPeriod(v as SalesPeriod)}
                    options={salesPeriodValues.map((p) => ({ label: SALES_PERIOD_LABEL[p], value: p }))}
                  />
                }
              >
                {sales.loading ? (
                  // Same height as the chart it becomes, so the card doesn't jump.
                  <div className="tartar-chart-loading">
                    <Spin />
                  </div>
                ) : series.length ? (
                  <Column
                    data={series}
                    xField="date"
                    yField="total"
                    height={300}
                    // Charts sit outside antd's token system, so the brand colour has
                    // to be handed to them explicitly or they fall back to antd blue —
                    // and the axes likewise, or their labels/grid stay the library's grey.
                    style={{ fill: colors.brand, radiusTopLeft: 4, radiusTopRight: 4 }}
                    axis={{
                      x: {
                        labelFormatter: (v: string) => formatAxisLabel(v, period),
                        labelFill: colors.textMuted,
                        line: false,
                      },
                      y: {
                        labelFill: colors.textMuted,
                        gridStroke: colors.border,
                        gridStrokeOpacity: 0.35,
                      },
                    }}
                    tooltip={{ items: [{ channel: 'y', valueFormatter: (v: number) => formatMoney(v) }] }}
                  />
                ) : (
                  <Empty description="No sales recorded yet" />
                )}
              </SectionCard>
            </Col>
            <Col xs={24} lg={8}>
              <SectionCard title="Cash Flow (MTD)" subtitle="Cash in vs. cash out this month">
                {summary.loading ? (
                  <div className="tartar-chart-loading">
                    <Spin />
                  </div>
                ) : (
                  <CashFlowDonut cashIn={cashIn} cashOut={cashOut} netCashFlow={netCashFlow} />
                )}
              </SectionCard>
            </Col>
          </Row>
        </Col>

        <Col xs={24} xl={6}>
          <div className="tartar-notif-col">
            <NotificationsPanel data={alerts.data} loading={alerts.loading} />
          </div>
        </Col>
      </Row>
    </>
  )
}

function formatAxisLabel(iso: string, period: SalesPeriod): string {
  const d = dayjs(iso)
  if (period === 'daily') return d.format('MM-DD')
  if (period === 'weekly') return d.format('MMM D')
  if (period === 'monthly') return d.format('MMM')
  return d.format('YYYY')
}

function StatTile(props: {
  span: number
  title: string
  value: number | undefined
  loading: boolean
  tone?: 'default' | 'positive' | 'negative' | 'brand'
  icon?: ReactNode
  caption?: ReactNode
}) {
  return (
    <Col xs={12} md={props.span}>
      <StatCard
        title={props.title}
        value={props.value}
        loading={props.loading}
        tone={props.tone}
        icon={props.icon}
        caption={props.caption}
      />
    </Col>
  )
}

/**
 * Percent-change indicator for a stat tile. `goodDirection` says which way is
 * good news for this metric — sales rising is good, expenses rising isn't —
 * so the colour reflects "good/bad", not just "up/down". Renders nothing
 * without a real comparison (no previous-period figure yet, or it was zero).
 */
function StatDelta({
  current,
  previous,
  goodDirection,
  label,
}: {
  current: number | undefined
  previous: number | undefined
  goodDirection: 'up' | 'down'
  label: string
}) {
  if (current === undefined || previous === undefined || previous === 0) return null
  const pct = ((current - previous) / Math.abs(previous)) * 100
  const isUp = pct >= 0
  const isGood = isUp === (goodDirection === 'up')
  const tone = isGood ? 'positive' : 'negative'
  return (
    <span className={`tartar-stat-delta tartar-tone-${tone}`}>
      {isUp ? <CaretUpOutlined /> : <CaretDownOutlined />}
      {Math.abs(pct).toFixed(1)}% {label}
    </span>
  )
}

function CashFlowDonut({
  cashIn,
  cashOut,
  netCashFlow,
}: {
  cashIn: number
  cashOut: number
  netCashFlow: number
}) {
  const hasMovement = cashIn > 0 || cashOut > 0

  return (
    <>
      <div className="tartar-donut-wrap">
        {hasMovement ? (
          <Pie
            data={[
              { type: 'Cash In', value: cashIn },
              { type: 'Cash Out', value: cashOut },
            ]}
            angleField="value"
            colorField="type"
            innerRadius={0.7}
            height={220}
            legend={false}
            label={false}
            scale={{ color: { range: [colors.positive, colors.danger] } }}
            tooltip={{ items: [{ channel: 'y', valueFormatter: (v: number) => formatMoney(v) }] }}
          />
        ) : (
          <div className="tartar-chart-loading">
            <Empty description="No cash movement this month" />
          </div>
        )}
        {hasMovement ? (
          <div className="tartar-donut-center">
            <span className="tartar-donut-center-value">{formatMoney(netCashFlow)}</span>
            <span className="tartar-donut-center-label">Net Cash Flow</span>
          </div>
        ) : null}
      </div>
      <div className="tartar-donut-legend">
        <div className="tartar-donut-legend-row">
          <span className="tartar-donut-legend-key">
            <span className="tartar-donut-legend-dot" style={{ background: colors.positive }} />
            Cash In
          </span>
          <span className="tartar-donut-legend-value">{formatMoney(cashIn)}</span>
        </div>
        <div className="tartar-donut-legend-row">
          <span className="tartar-donut-legend-key">
            <span className="tartar-donut-legend-dot" style={{ background: colors.danger }} />
            Cash Out
          </span>
          <span className="tartar-donut-legend-value">{formatMoney(cashOut)}</span>
        </div>
        <div className="tartar-donut-legend-row">
          <span className="tartar-donut-legend-key">
            <span className="tartar-donut-legend-dot" style={{ background: colors.brand }} />
            Net Cash Flow
          </span>
          <span className="tartar-donut-legend-value">{formatMoney(netCashFlow)}</span>
        </div>
      </div>
    </>
  )
}

/** At most this many rows render per notification group before it hands off
 *  to the full ledger — beyond that a bad week turns the sidebar into a wall
 *  of red before anything else is visible. */
const NOTIF_CAP = 4

interface NotifRow {
  id: string
  name: string
  amount: number
  dueDate: string
  kind: 'receivable' | 'payable'
}

function ledgerRows(receivables: Receivable[], payables: Payable[]): NotifRow[] {
  return [
    ...receivables.map((r) => ({
      id: `r-${r.id}`,
      name: r.customer_name,
      amount: Number(r.amount) - Number(r.paid_amount),
      dueDate: r.due_date,
      kind: 'receivable' as const,
    })),
    ...payables.map((p) => ({
      id: `p-${p.id}`,
      name: p.supplier_name,
      amount: Number(p.amount) - Number(p.paid_amount),
      dueDate: p.due_date,
      kind: 'payable' as const,
    })),
  ].sort((a, b) => a.dueDate.localeCompare(b.dueDate))
}

interface NotifGroup {
  key: string
  label: string
  tone: 'negative' | 'warning'
  rows: NotifRow[]
  describe: (row: NotifRow) => string
}

const ledgerLabel = (kind: NotifRow['kind']) => (kind === 'receivable' ? 'Receivable' : 'Payable')

function NotificationsPanel({ data, loading }: { data?: dashboardService.DueAlerts; loading: boolean }) {
  if (loading || !data) {
    return (
      <SectionCard title="Notifications & Alerts">
        <div className="tartar-notif-empty">
          <Spin />
        </div>
      </SectionCard>
    )
  }

  const overdue = ledgerRows(data.overdueReceivables, data.overduePayables)
  const nearDue = ledgerRows(data.nearDueReceivables, data.nearDuePayables)
  const todayStr = dayjs().format('YYYY-MM-DD')
  const tomorrowStr = dayjs().add(1, 'day').format('YYYY-MM-DD')
  const dueToday = nearDue.filter((r) => r.dueDate === todayStr)
  const dueTomorrow = nearDue.filter((r) => r.dueDate === tomorrowStr)
  const dueLater = nearDue.filter((r) => r.dueDate > tomorrowStr)
  const totalCount = overdue.length + dueToday.length + dueTomorrow.length + dueLater.length

  const groups: NotifGroup[] = [
    {
      key: 'overdue',
      label: 'Overdue',
      tone: 'negative',
      rows: overdue,
      describe: (row) => {
        const days = dayjs(todayStr).diff(row.dueDate, 'day')
        return `${ledgerLabel(row.kind)} overdue by ${days} day${days === 1 ? '' : 's'}`
      },
    },
    {
      key: 'today',
      label: 'Due Today',
      tone: 'warning',
      rows: dueToday,
      describe: (row) => `${ledgerLabel(row.kind)} due today`,
    },
    {
      key: 'tomorrow',
      label: 'Due Tomorrow',
      tone: 'warning',
      rows: dueTomorrow,
      describe: (row) => `${ledgerLabel(row.kind)} due tomorrow`,
    },
    {
      key: 'week',
      label: 'Due This Week',
      tone: 'warning',
      rows: dueLater,
      describe: (row) => `${ledgerLabel(row.kind)} due ${formatDate(row.dueDate)}`,
    },
  ]
  const visibleGroups = groups.filter((g) => g.rows.length)

  return (
    <SectionCard
      title="Notifications & Alerts"
      subtitle="Overdue and near-due items — next 7 days"
      extra={totalCount ? <Badge count={totalCount} color={colors.danger} /> : null}
    >
      {visibleGroups.length ? (
        visibleGroups.map((g) => (
          <div className="tartar-notif-group" key={g.key}>
            <div className={`tartar-notif-group-head tartar-tone-${g.tone}`}>
              <span>{g.label}</span>
              <span className={`tartar-notif-count tartar-tone-${g.tone}`}>{g.rows.length}</span>
            </div>
            {g.rows.slice(0, NOTIF_CAP).map((row) => (
              <div className="tartar-notif-item" key={row.id}>
                <div className="tartar-notif-item-main">
                  <span className={`tartar-notif-dot tartar-tone-${g.tone}`} />
                  <div className="tartar-notif-text">
                    <span className="tartar-notif-name">{row.name}</span>
                    <span className="tartar-notif-sub">{g.describe(row)}</span>
                  </div>
                </div>
                <div className="tartar-notif-figures">
                  <div className={`tartar-notif-amount tartar-tone-${g.tone}`}>{formatMoney(row.amount)}</div>
                  <div className="tartar-notif-date">{formatDate(row.dueDate)}</div>
                </div>
              </div>
            ))}
            {g.rows.length > NOTIF_CAP ? (
              <Typography.Text type="secondary" className="tartar-notif-more">
                +{g.rows.length - NOTIF_CAP} more
              </Typography.Text>
            ) : null}
          </div>
        ))
      ) : (
        <Empty className="tartar-notif-empty" description="Nothing overdue or due soon" />
      )}
      <div className="tartar-notif-footer">
        <Typography.Text type="secondary">
          <Link to="/receivables">Receivables</Link> · <Link to="/payables">Payables</Link>
        </Typography.Text>
      </div>
    </SectionCard>
  )
}
