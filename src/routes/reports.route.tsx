import { createRoute, redirect, useNavigate } from '@tanstack/react-router'
import { Col, Row, Segmented } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { appLayoutRoute } from './app.route'
import { PageHeader } from '../components/PageHeader'
import { DataTable } from '../components/DataTable'
import { StatCard } from '../components/StatCard'
import { useQuery } from '../hooks/useQuery'
import { useAuthStore } from '../stores/auth.store'
import * as transactionsService from '../services/transactions.service'
import { receivablesService, payablesService } from '../services/ledger.service'
import {
  labels,
  type ExpenseType,
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

  const txns = useQuery(
    `report-txn:${type}`,
    () => transactionsService.listTransactions({ dateFrom: from, dateTo: to }),
    { enabled: txnBased },
  )
  const rcv = useQuery('report-rcv', () => receivablesService.list({}), { enabled: type === 'receivables' })
  const pay = useQuery('report-pay', () => payablesService.list({}), { enabled: type === 'payables' })

  return (
    <>
      <PageHeader title="Reports" subtitle="Financial reporting across the business" />

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
      <DataTable<Transaction> columns={columns} data={txns} loading={loading} emptyText="No transactions in this period" />
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
      <DataTable columns={columns} data={byType} loading={loading} rowKey="key" />
    </>
  )
}

function ExpensesReport({ txns, loading }: { txns: Transaction[]; loading: boolean }) {
  const expenses = txns.filter((t) => t.type === 'expense')
  const byType = (Object.keys(labels.expenseType) as ExpenseType[]).map((et) => ({
    key: et,
    label: labels.expenseType[et],
    total: expenses.filter((t) => t.expense_type === et).reduce((a, t) => a + Number(t.amount), 0),
  }))

  const columns: ColumnsType<(typeof byType)[number]> = [
    { title: 'Expense type', dataIndex: 'label' },
    { title: 'Total', dataIndex: 'total', align: 'right', render: (v: number) => formatMoney(v) },
  ]

  return <DataTable columns={columns} data={byType} loading={loading} rowKey="key" />
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
  const columns: ColumnsType<Row> = [
    { title: 'Due date', dataIndex: 'due_date', render: formatDate },
    { title: label, key: 'name', render: (_, r) => nameOf(r) },
    { title: 'Branch', dataIndex: 'branch' },
    { title: 'Amount', dataIndex: 'amount', align: 'right', render: (v: number) => formatMoney(v) },
    {
      title: 'Balance',
      key: 'balance',
      align: 'right',
      render: (_, r) => formatMoney(Number(r.amount) - Number(r.paid_amount)),
    },
    { title: 'Status', dataIndex: 'status', render: (s: string) => labels.ledgerStatus[s as keyof typeof labels.ledgerStatus] },
  ]
  return <DataTable<Row> columns={columns} data={rows} loading={loading} emptyText="Nothing outstanding" />
}
