import { Fragment } from 'react'
import { createRoute, Link, redirect } from '@tanstack/react-router'
import { Alert, Col, Empty, Row, Space, Spin, Typography } from 'antd'
import { Column } from '@ant-design/charts'
import { appLayoutRoute } from './app.route'
import { PageHeader } from '../components/PageHeader'
import { SectionCard } from '../components/SectionCard'
import { StatCard } from '../components/StatCard'
import { colors } from '../styles/theme.css'
import { useQuery } from '../hooks/useQuery'
import { useBranchScope } from '../hooks/useBranchScope'
import { useAuthStore } from '../stores/auth.store'
import * as dashboardService from '../services/dashboard.service'
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

function DashboardPage() {
  // Global branch view (sidebar). Keys carry the scope so each branch's numbers
  // cache separately and switching back is instant.
  const { branch, branchName } = useBranchScope()
  const scope = branch ?? 'all'
  const summary = useQuery(`dashboard-summary:${scope}`, () => dashboardService.getDashboardSummary(branch))
  const daily = useQuery(`dashboard-daily:${scope}`, () => dashboardService.getDailySales(30, branch))
  const alerts = useQuery(`dashboard-alerts:${scope}`, () => dashboardService.getDueAlerts(7, branch))

  const s = summary.data
  const series = daily.data ?? []

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={branchName ? `Standing for ${branchName}` : 'Company-wide standing across all branches'}
      />

      {/* Alerts lead the page (client decision, 2026-07-19): anything overdue or
          near-due needs attention before the standing figures are read. */}
      <DueAlerts data={alerts.data} loading={alerts.loading} />

      <Row gutter={[16, 16]} className="tartar-stat-grid">
        <StatTile span={6} title="Current Cash" value={s?.currentCash} loading={summary.loading} tone="brand" />
        <StatTile span={6} title="Bank Balance" value={s?.bankBalance} loading={summary.loading} />
        <StatTile span={6} title="Today's Sales" value={s?.todaysSales} loading={summary.loading} tone="positive" />
        <StatTile span={6} title="Today's Expenses" value={s?.todaysExpenses} loading={summary.loading} tone="negative" />
        <StatTile span={6} title="Accounts Receivable" value={s?.accountsReceivable} loading={summary.loading} />
        <StatTile span={6} title="Accounts Payable" value={s?.accountsPayable} loading={summary.loading} />
        <StatTile span={6} title="Monthly Sales" value={s?.monthlySales} loading={summary.loading} tone="positive" />
        <StatTile span={6} title="Monthly Expenses" value={s?.monthlyExpenses} loading={summary.loading} tone="negative" />
      </Row>

      <SectionCard title="Daily Sales" subtitle="Last 30 days">
        {daily.loading ? (
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
            // Charts sit outside antd's token system, so the brand colour has to
            // be handed to them explicitly or they fall back to antd blue — and
            // the axes likewise, or their labels/grid stay the library's grey.
            style={{ fill: colors.brand, radiusTopLeft: 4, radiusTopRight: 4 }}
            axis={{
              x: {
                labelFormatter: (v: string) => v.slice(5),
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
    </>
  )
}

function StatTile(props: {
  span: number
  title: string
  value: number | undefined
  loading: boolean
  tone?: 'default' | 'positive' | 'negative' | 'brand'
}) {
  return (
    <Col xs={12} md={props.span}>
      <StatCard title={props.title} value={props.value} loading={props.loading} tone={props.tone} />
    </Col>
  )
}

/**
 * At most this many alerts render per category — beyond that a "view all" link
 * hands off to the ledger page. Without the cap a bad month turns the dashboard
 * into a wall of red before any standing figure is visible.
 */
const ALERT_CAP = 3

interface AlertGroup {
  key: string
  severity: 'error' | 'warning'
  to: '/receivables' | '/payables'
  items: { id: string; message: string; description: string }[]
}

function DueAlerts({ data, loading }: { data?: dashboardService.DueAlerts; loading: boolean }) {
  if (loading || !data) return null

  const groups: AlertGroup[] = [
    {
      key: 'overdue-receivables',
      severity: 'error',
      to: '/receivables',
      items: data.overdueReceivables.map((r) => ({
        id: r.id,
        message: `Overdue receivable — ${r.customer_name}`,
        description: `${formatMoney(r.amount - r.paid_amount)} was due ${formatDate(r.due_date)}`,
      })),
    },
    {
      key: 'overdue-payables',
      severity: 'error',
      to: '/payables',
      items: data.overduePayables.map((p) => ({
        id: p.id,
        message: `Overdue payable — ${p.supplier_name}`,
        description: `${formatMoney(p.amount - p.paid_amount)} was due ${formatDate(p.due_date)}`,
      })),
    },
    {
      key: 'near-due-receivables',
      severity: 'warning',
      to: '/receivables',
      items: data.nearDueReceivables.map((r) => ({
        id: r.id,
        message: `Receivable due soon — ${r.customer_name}`,
        description: `${formatMoney(r.amount - r.paid_amount)} due ${formatDate(r.due_date)}`,
      })),
    },
    {
      key: 'near-due-payables',
      severity: 'warning',
      to: '/payables',
      items: data.nearDuePayables.map((p) => ({
        id: p.id,
        message: `Payable due soon — ${p.supplier_name}`,
        description: `${formatMoney(p.amount - p.paid_amount)} due ${formatDate(p.due_date)}`,
      })),
    },
  ]
  if (groups.every((g) => !g.items.length)) return null

  return (
    <SectionCard title="Notifications & Alerts" subtitle="Overdue and near-due items needing attention">
      <Space direction="vertical" className="tartar-block" size="small">
        {groups.map((g) => (
          <Fragment key={g.key}>
            {g.items.slice(0, ALERT_CAP).map((item) => (
              <Alert
                key={item.id}
                type={g.severity}
                showIcon
                message={item.message}
                description={item.description}
              />
            ))}
            {g.items.length > ALERT_CAP ? (
              <Typography.Text type="secondary">
                <Link to={g.to}>
                  +{g.items.length - ALERT_CAP} more — view all in{' '}
                  {g.to === '/receivables' ? 'Receivables' : 'Payables'}
                </Link>
              </Typography.Text>
            ) : null}
          </Fragment>
        ))}
      </Space>
      <Typography.Text type="secondary" className="tartar-alerts-hint">
        Near-due window: 7 days
      </Typography.Text>
    </SectionCard>
  )
}
