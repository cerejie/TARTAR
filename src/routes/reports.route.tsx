import { createRoute, redirect, useNavigate } from '@tanstack/react-router'
import { Col, Row, Segmented, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { appLayoutRoute } from './app.route'
import { PageHeader } from '../components/PageHeader'
import { SectionCard } from '../components/SectionCard'
import { DataTable } from '../components/DataTable'
import { StatCard } from '../components/StatCard'
import { useQuery } from '../hooks/useQuery'
import { useBranchScope } from '../hooks/useBranchScope'
import { useExpenseCategories } from '../hooks/useReferenceData'
import { useAuthStore } from '../stores/auth.store'
import * as transactionsService from '../services/transactions.service'
import { receivablesService, payablesService } from '../services/ledger.service'
import {
  isLedgerOverdue,
  labels,
  tagColors,
  type LedgerStatus,
  type Payable,
  type Receivable,
  type Transaction,
  type TransactionType,
} from '../models'
import { formatDate, formatMoney } from '../utils/format'

const REPORT_TYPES = [
  'daily',
  'weekly',
  'monthly',
  'cashflow',
  'receivables',
  'payables',
  'expenses',
] as const
type ReportType = (typeof REPORT_TYPES)[number]

const REPORT_LABEL: Record<ReportType, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  cashflow: 'Cash Flow',
  receivables: 'Receivables',
  payables: 'Payables',
  expenses: 'Expenses',
}

const INFLOW: TransactionType[] = ['sale', 'customer_payment', 'collection', 'cash_deposit']
const OUTFLOW: TransactionType[] = ['expense', 'supplier_payment', 'purchase', 'petty_cash']

/** Reports (build spec §12). Managers + accountants (BIR income/expense). */
export const reportsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/reports',
  validateSearch: (search: Record<string, unknown>): { type: ReportType } => {
    const t = search.type as ReportType
    return { type: REPORT_TYPES.includes(t) ? t : 'daily' }
  },
  beforeLoad: () => {
    const s = useAuthStore.getState()
    const allowed =
      s.kind === 'superadmin' || s.user?.role === 'admin' || s.user?.role === 'accountant'
    if (!allowed) throw redirect({ to: '/transactions' })
  },
  component: ReportsPage,
})

function rangeFor(type: ReportType): { from: string; to: string } {
  const to = dayjs().format('YYYY-MM-DD')
  if (type === 'daily') return { from: to, to }
  if (type === 'weekly') return { from: dayjs().startOf('week').format('YYYY-MM-DD'), to }
  return { from: dayjs().startOf('month').format('YYYY-MM-DD'), to }
}

function ReportsPage() {
  const { type } = reportsRoute.useSearch()
  const navigate = useNavigate()
  const { from, to } = rangeFor(type)
  const txnBased = ['daily', 'weekly', 'monthly', 'cashflow', 'expenses'].includes(type)

  // Global branch view (sidebar) narrows every report to one branch.
  const { branch, branchName } = useBranchScope()
  const scope = branch ?? 'all'
  const branchFilter = branch ? { branch } : {}

  const txns = useQuery(
    `report-txn:${type}:${scope}`,
    () => transactionsService.listTransactions({ dateFrom: from, dateTo: to, ...branchFilter }),
    { enabled: txnBased },
  )
  const rcv = useQuery(`report-rcv:${scope}`, () => receivablesService.list(branchFilter), { enabled: type === 'receivables' })
  const pay = useQuery(`report-pay:${scope}`, () => payablesService.list(branchFilter), { enabled: type === 'payables' })

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle={branchName ? `Financial reporting for ${branchName}` : 'Financial reporting across the business'}
      />

      <Segmented
        className="tartar-report-seg"
        value={type}
        onChange={(v) => void navigate({ to: '/reports', search: { type: v as ReportType } })}
        options={REPORT_TYPES.map((t) => ({ label: REPORT_LABEL[t], value: t }))}
      />

      {type === 'receivables' ? (
        <LedgerReport rows={rcv.data ?? []} loading={rcv.loading} nameOf={(r) => r.customer_name} label="Customer" />
      ) : type === 'payables' ? (
        <LedgerReport rows={pay.data ?? []} loading={pay.loading} nameOf={(p) => p.supplier_name} label="Supplier" />
      ) : type === 'expenses' ? (
        <ExpensesReport txns={txns.data ?? []} loading={txns.loading} />
      ) : type === 'cashflow' ? (
        <CashFlowReport txns={txns.data ?? []} loading={txns.loading} />
      ) : (
        <PeriodReport txns={txns.data ?? []} loading={txns.loading} />
      )}
    </>
  )
}

const sumBy = (txns: Transaction[], pred: (t: Transaction) => boolean) =>
  txns.filter(pred).reduce((a, t) => a + Number(t.amount), 0)

function PeriodReport({ txns, loading }: { txns: Transaction[]; loading: boolean }) {
  const sales = sumBy(txns, (t) => t.type === 'sale')
  const expenses = sumBy(txns, (t) => t.type === 'expense')

  const columns: ColumnsType<Transaction> = [
    { title: 'Date', dataIndex: 'txn_date', render: formatDate },
    { title: 'Type', dataIndex: 'type', render: (t: TransactionType) => labels.transactionType[t] },
    { title: 'Branch', dataIndex: 'branch' },
    { title: 'Reference', dataIndex: 'reference_number', render: (v: string | null) => v || '—' },
    { title: 'Amount', dataIndex: 'amount', align: 'right', render: (v: number) => formatMoney(v) },
  ]

  return (
    <>
      <Row gutter={[16, 16]} className="tartar-report-stats">
        <Col xs={12} md={8}>
          <StatCard title="Sales" value={sales} loading={loading} tone="positive" />
        </Col>
        <Col xs={12} md={8}>
          <StatCard title="Expenses" value={expenses} loading={loading} tone="negative" />
        </Col>
        <Col xs={12} md={8}>
          <StatCard title="Net" value={sales - expenses} loading={loading} tone="brand" />
        </Col>
      </Row>
      <SectionCard title="Transactions" subtitle="Every movement in the selected period" flush>
        <DataTable<Transaction>
          columns={columns}
          data={txns}
          loading={loading}
          emptyText="No transactions in this period"
        />
      </SectionCard>
    </>
  )
}

function CashFlowReport({ txns, loading }: { txns: Transaction[]; loading: boolean }) {
  const inflow = sumBy(txns, (t) => INFLOW.includes(t.type))
  const outflow = sumBy(txns, (t) => OUTFLOW.includes(t.type))

  const byType = [...INFLOW, ...OUTFLOW].map((type) => ({
    key: type,
    label: labels.transactionType[type],
    direction: INFLOW.includes(type) ? 'Inflow' : 'Outflow',
    total: sumBy(txns, (t) => t.type === type),
  }))

  const columns: ColumnsType<(typeof byType)[number]> = [
    { title: 'Category', dataIndex: 'label' },
    { title: 'Direction', dataIndex: 'direction' },
    { title: 'Total', dataIndex: 'total', align: 'right', render: (v: number) => formatMoney(v) },
  ]

  return (
    <>
      <Row gutter={[16, 16]} className="tartar-report-stats">
        <Col xs={12} md={8}>
          <StatCard title="Cash In" value={inflow} loading={loading} tone="positive" />
        </Col>
        <Col xs={12} md={8}>
          <StatCard title="Cash Out" value={outflow} loading={loading} tone="negative" />
        </Col>
        <Col xs={12} md={8}>
          <StatCard title="Net Cash Flow" value={inflow - outflow} loading={loading} tone="brand" />
        </Col>
      </Row>
      <SectionCard title="Cash Flow by Category" subtitle="Inflows and outflows by transaction type" flush>
        <DataTable columns={columns} data={byType} loading={loading} rowKey="key" />
      </SectionCard>
    </>
  )
}

function ExpensesReport({ txns, loading }: { txns: Transaction[]; loading: boolean }) {
  // Categories are master data, so the breakdown is driven by the loaded rows —
  // archived categories still appear while they carry expenses in the period.
  const { expenseCategories } = useExpenseCategories()
  const expenses = txns.filter((t) => t.type === 'expense')
  const byType = expenseCategories
    .map((c) => ({
      key: c.slug,
      label: c.name,
      active: c.active,
      total: expenses
        .filter((t) => t.expense_type === c.slug)
        .reduce((a, t) => a + Number(t.amount), 0),
    }))
    // Archived categories only earn a row when they actually carry spend.
    .filter((row) => row.active || row.total > 0)

  const columns: ColumnsType<(typeof byType)[number]> = [
    { title: 'Expense type', dataIndex: 'label' },
    { title: 'Total', dataIndex: 'total', align: 'right', render: (v: number) => formatMoney(v) },
  ]

  return (
    <SectionCard title="Expenses by Type" subtitle="Totals for the selected period" flush>
      <DataTable columns={columns} data={byType} loading={loading} rowKey="key" />
    </SectionCard>
  )
}

function LedgerReport<Row extends Receivable | Payable>({
  rows,
  loading,
  nameOf,
  label,
}: {
  rows: Row[]
  loading: boolean
  nameOf: (row: Row) => string
  label: string
}) {
  const balanceOf = (r: Row) => Number(r.amount) - Number(r.paid_amount)
  const outstanding = rows.reduce((a, r) => a + balanceOf(r), 0)
  const overdueRows = rows.filter(isLedgerOverdue)
  const overdueTotal = overdueRows.reduce((a, r) => a + balanceOf(r), 0)

  // Overdue items float to the top of the report (client decision 9), each
  // highlighted in red; the rest follow in due-date order (already sorted).
  const ordered = [...overdueRows, ...rows.filter((r) => !isLedgerOverdue(r))]

  const columns: ColumnsType<Row> = [
    { title: 'Due date', dataIndex: 'due_date', render: formatDate },
    { title: label, key: 'name', render: (_, r) => nameOf(r) },
    { title: 'Branch', dataIndex: 'branch' },
    { title: 'Amount', dataIndex: 'amount', align: 'right', render: (v: number) => formatMoney(v) },
    {
      title: 'Balance',
      key: 'balance',
      align: 'right',
      render: (_, r) => formatMoney(balanceOf(r)),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (s: LedgerStatus, r) =>
        isLedgerOverdue(r) ? (
          <Tag color="red">Overdue</Tag>
        ) : (
          <Tag color={tagColors.ledgerStatus[s]}>{labels.ledgerStatus[s]}</Tag>
        ),
    },
  ]

  return (
    <>
      <Row gutter={[16, 16]} className="tartar-report-stats">
        <Col xs={12} md={8}>
          <StatCard title="Total outstanding" value={outstanding} loading={loading} tone="brand" />
        </Col>
        <Col xs={12} md={8}>
          <StatCard title="Overdue balance" value={overdueTotal} loading={loading} tone="negative" />
        </Col>
        <Col xs={12} md={8}>
          <StatCard title="Overdue records" value={overdueRows.length} loading={loading} raw />
        </Col>
      </Row>
      <SectionCard
        title={`Outstanding ${label}s`}
        subtitle="Overdue items first, highlighted in red"
        flush
      >
        <DataTable<Row>
          columns={columns}
          data={ordered}
          loading={loading}
          emptyText="Nothing outstanding"
          rowClassName={(r) => (isLedgerOverdue(r) ? 'tartar-row-overdue' : '')}
        />
      </SectionCard>
    </>
  )
}
