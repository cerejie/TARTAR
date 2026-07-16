import { createRoute, redirect } from '@tanstack/react-router'
import { Alert, Col, Empty, Row, Space, Spin, Typography } from 'antd'
import { Column } from '@ant-design/charts'
import { appLayoutRoute } from './app.route'
import { PageHeader } from '../components/PageHeader'
import { SectionCard } from '../components/SectionCard'
import { StatCard } from '../components/StatCard'
import { colors } from '../styles/theme.css'
import { useQuery } from '../hooks/useQuery'
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
  const summary = useQuery('dashboard-summary', dashboardService.getDashboardSummary)
  const daily = useQuery('dashboard-daily', () => dashboardService.getDailySales(30))
  const alerts = useQuery('dashboard-alerts', () => dashboardService.getDueAlerts(7))

  const s = summary.data
  const series = daily.data ?? []

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Company-wide standing across all branches" />

      <Row gutter={[16, 16]}>
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
          <Spin />
        ) : series.length ? (
          <Column
            data={series}
            xField="date"
            yField="total"
            height={300}
            // Charts sit outside antd's token system, so the brand colour has to
            // be handed to them explicitly or they fall back to antd blue.
            style={{ fill: colors.brand, radiusTopLeft: 4, radiusTopRight: 4 }}
            axis={{ x: { labelFormatter: (v: string) => v.slice(5) } }}
            tooltip={{ items: [{ channel: 'y', valueFormatter: (v: number) => formatMoney(v) }] }}
          />
        ) : (
          <Empty description="No sales recorded yet" />
        )}
      </SectionCard>

      <DueAlerts data={alerts.data} loading={alerts.loading} />
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

function DueAlerts({ data, loading }: { data?: dashboardService.DueAlerts; loading: boolean }) {
  if (loading || !data) return null
  const { overdueReceivables, overduePayables, nearDueReceivables, nearDuePayables } = data
  const nothing =
    !overdueReceivables.length &&
    !overduePayables.length &&
    !nearDueReceivables.length &&
    !nearDuePayables.length
  if (nothing) return null

  return (
    <SectionCard title="Notifications & Alerts" subtitle="Overdue and near-due items needing attention">
      <Space direction="vertical" className="tartar-block" size="small">
        {overdueReceivables.map((r) => (
          <Alert
            key={r.id}
            type="error"
            showIcon
            message={`Overdue receivable — ${r.customer_name}`}
            description={`${formatMoney(r.amount - r.paid_amount)} was due ${formatDate(r.due_date)}`}
          />
        ))}
        {overduePayables.map((p) => (
          <Alert
            key={p.id}
            type="error"
            showIcon
            message={`Overdue payable — ${p.supplier_name}`}
            description={`${formatMoney(p.amount - p.paid_amount)} was due ${formatDate(p.due_date)}`}
          />
        ))}
        {nearDueReceivables.map((r) => (
          <Alert
            key={r.id}
            type="warning"
            showIcon
            message={`Receivable due soon — ${r.customer_name}`}
            description={`${formatMoney(r.amount - r.paid_amount)} due ${formatDate(r.due_date)}`}
          />
        ))}
        {nearDuePayables.map((p) => (
          <Alert
            key={p.id}
            type="warning"
            showIcon
            message={`Payable due soon — ${p.supplier_name}`}
            description={`${formatMoney(p.amount - p.paid_amount)} due ${formatDate(p.due_date)}`}
          />
        ))}
      </Space>
      <Typography.Text type="secondary" className="tartar-alerts-hint">
        Near-due window: 7 days
      </Typography.Text>
    </SectionCard>
  )
}
