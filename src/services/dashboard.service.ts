import dayjs from 'dayjs'
import { supabase, toError } from './supabase'
import { CASH_INFLOW_TYPES, CASH_OUTFLOW_TYPES } from '../models'
import type {
  BranchMonitorRow,
  Branch,
  DailySalesPoint,
  DashboardSummary,
  Payable,
  Receivable,
  SalesPeriod,
} from '../models'

const today = () => dayjs().format('YYYY-MM-DD')
const monthStart = () => dayjs().startOf('month').format('YYYY-MM-DD')

const sum = (rows: { amount: number | string }[]) =>
  rows.reduce((acc, r) => acc + Number(r.amount), 0)

const outstanding = (rows: { amount: number | string; paid_amount: number | string }[]) =>
  rows.reduce((acc, r) => acc + (Number(r.amount) - Number(r.paid_amount)), 0)

/**
 * Narrow a query to one branch when the manager's branch view is active
 * (null/undefined = company-wide). Every table here has a `branch` column.
 * Casts through a minimal structural type (like `applyLedgerFilters`) because
 * a recursive generic over the PostgREST builder blows up TS inference.
 */
const scopeToBranch = <Q,>(query: Q, branch?: string | null): Q =>
  branch
    ? ((query as { eq: (column: string, value: unknown) => unknown }).eq('branch', branch) as Q)
    : query

/**
 * Admin dashboard aggregates (build spec §11, extended for the icon/delta
 * stat tiles). Managers only — RLS blocks `cash_accounts` for non-managers, so
 * this is called from manager views.
 */
export async function getDashboardSummary(branch?: string | null): Promise<DashboardSummary> {
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
  const lastMonthStart = dayjs().subtract(1, 'month').startOf('month').format('YYYY-MM-DD')
  // Same day-of-month cutoff as "this month so far", one month back — compares
  // Net Profit (MTD) like-for-like instead of a partial month against a full one.
  const lastMonthCutoff = dayjs().subtract(1, 'month').format('YYYY-MM-DD')

  const [cash, recent, thisMonth, lastMonth, receivables, payables] = await Promise.all([
    scopeToBranch(supabase.from('cash_accounts').select('account, balance'), branch),
    scopeToBranch(
      supabase
        .from('transactions')
        .select('type, txn_date, amount')
        .in('type', ['sale', 'expense'])
        .gte('txn_date', yesterday)
        .lte('txn_date', today()),
      branch,
    ),
    scopeToBranch(
      supabase
        .from('transactions')
        .select('type, amount')
        .gte('txn_date', monthStart())
        .lte('txn_date', today()),
      branch,
    ),
    scopeToBranch(
      supabase
        .from('transactions')
        .select('type, amount')
        .in('type', ['sale', 'expense'])
        .gte('txn_date', lastMonthStart)
        .lte('txn_date', lastMonthCutoff),
      branch,
    ),
    scopeToBranch(supabase.from('receivables').select('amount, paid_amount').neq('status', 'paid'), branch),
    scopeToBranch(supabase.from('payables').select('amount, paid_amount').neq('status', 'paid'), branch),
  ])

  const firstError = [cash, recent, thisMonth, lastMonth, receivables, payables].find((r) => r.error)?.error
  if (firstError) throw toError(firstError)

  const cashRows = (cash.data ?? []) as { account: string; balance: number | string }[]
  const balanceOf = (account: string) =>
    cashRows.filter((r) => r.account === account).reduce((a, r) => a + Number(r.balance), 0)

  const recentRows = (recent.data ?? []) as { type: string; txn_date: string; amount: number | string }[]
  const onDay = (date: string, type: string) =>
    sum(recentRows.filter((r) => r.txn_date === date && r.type === type))

  const thisMonthRows = (thisMonth.data ?? []) as { type: string; amount: number | string }[]
  const lastMonthRows = (lastMonth.data ?? []) as { type: string; amount: number | string }[]
  const ofType = (rows: { type: string; amount: number | string }[], type: string) =>
    sum(rows.filter((r) => r.type === type))
  const ofDirection = (rows: { type: string; amount: number | string }[], types: string[]) =>
    sum(rows.filter((r) => types.includes(r.type)))

  return {
    currentCash: balanceOf('cash_drawer'),
    bankBalance: balanceOf('bank_account'),
    todaysSales: onDay(today(), 'sale'),
    todaysExpenses: onDay(today(), 'expense'),
    yesterdaysSales: onDay(yesterday, 'sale'),
    yesterdaysExpenses: onDay(yesterday, 'expense'),
    accountsReceivable: outstanding(receivables.data ?? []),
    accountsPayable: outstanding(payables.data ?? []),
    monthlySales: ofType(thisMonthRows, 'sale'),
    monthlyExpenses: ofType(thisMonthRows, 'expense'),
    lastMonthSales: ofType(lastMonthRows, 'sale'),
    lastMonthExpenses: ofType(lastMonthRows, 'expense'),
    monthlyCashIn: ofDirection(thisMonthRows, CASH_INFLOW_TYPES),
    monthlyCashOut: ofDirection(thisMonthRows, CASH_OUTFLOW_TYPES),
  }
}

/** How far back each granularity looks, and the calendar unit each bucket spans. */
const SALES_PERIOD_CONFIG: Record<SalesPeriod, { unit: dayjs.ManipulateType; count: number }> = {
  daily: { unit: 'day', count: 30 },
  weekly: { unit: 'week', count: 12 },
  monthly: { unit: 'month', count: 12 },
  yearly: { unit: 'year', count: 5 },
}

/**
 * Sales trend for the dashboard chart (@ant-design/charts), bucketed to the
 * requested granularity. `date` on each point is the bucket's start date — the
 * chart formats it per period (day, week, month, year).
 */
export async function getSalesSeries(
  period: SalesPeriod,
  branch?: string | null,
): Promise<DailySalesPoint[]> {
  const { unit, count } = SALES_PERIOD_CONFIG[period]
  const from = dayjs().subtract(count - 1, unit).startOf(unit)

  const { data, error } = await scopeToBranch(
    supabase
      .from('transactions')
      .select('txn_date, amount')
      .eq('type', 'sale')
      .gte('txn_date', from.format('YYYY-MM-DD')),
    branch,
  )
  if (error) throw toError(error)

  // Bucket by period start, then fill gaps so the chart has one point per bucket.
  const bucketOf = (d: string) => dayjs(d).startOf(unit).format('YYYY-MM-DD')
  const byBucket = new Map<string, number>()
  for (const row of (data ?? []) as { txn_date: string; amount: number | string }[]) {
    const key = bucketOf(row.txn_date)
    byBucket.set(key, (byBucket.get(key) ?? 0) + Number(row.amount))
  }

  const series: DailySalesPoint[] = []
  for (let i = 0; i < count; i += 1) {
    const key = from.add(i, unit).format('YYYY-MM-DD')
    series.push({ date: key, total: byBucket.get(key) ?? 0 })
  }
  return series
}

/** Per-branch monitoring rows (build spec §13). */
export async function getBranchMonitor(branches: Branch[]): Promise<BranchMonitorRow[]> {
  const [cash, sales, expenses, receivables, payables] = await Promise.all([
    supabase.from('cash_accounts').select('branch, balance'),
    supabase.from('transactions').select('branch, amount').eq('type', 'sale'),
    supabase.from('transactions').select('branch, amount').eq('type', 'expense'),
    supabase.from('receivables').select('branch, amount, paid_amount').neq('status', 'paid'),
    supabase.from('payables').select('branch, amount, paid_amount').neq('status', 'paid'),
  ])
  const firstError = [cash, sales, expenses, receivables, payables].find((r) => r.error)?.error
  if (firstError) throw toError(firstError)

  const totalBy = (
    rows: { branch: string; amount?: number | string; balance?: number | string }[] | null,
    branch: string,
    key: 'amount' | 'balance',
  ) => (rows ?? []).filter((r) => r.branch === branch).reduce((a, r) => a + Number(r[key] ?? 0), 0)

  const outstandingBy = (
    rows: { branch: string; amount: number | string; paid_amount: number | string }[] | null,
    branch: string,
  ) =>
    (rows ?? [])
      .filter((r) => r.branch === branch)
      .reduce((a, r) => a + (Number(r.amount) - Number(r.paid_amount)), 0)

  return branches.map((b) => ({
    branch: b.slug,
    branchName: b.name,
    cashBalance: totalBy(cash.data as never, b.slug, 'balance'),
    sales: totalBy(sales.data as never, b.slug, 'amount'),
    expenses: totalBy(expenses.data as never, b.slug, 'amount'),
    receivables: outstandingBy(receivables.data as never, b.slug),
    payables: outstandingBy(payables.data as never, b.slug),
  }))
}

/**
 * Overdue + near-due alerts (build spec §14). Returns receivables/payables that
 * are past due or due within `nearDays`. Employees see their branch scope; RLS
 * filters automatically.
 */
export interface DueAlerts {
  overdueReceivables: Receivable[]
  overduePayables: Payable[]
  nearDueReceivables: Receivable[]
  nearDuePayables: Payable[]
}

export async function getDueAlerts(nearDays = 7, branch?: string | null): Promise<DueAlerts> {
  const todayStr = today()
  const horizon = dayjs().add(nearDays, 'day').format('YYYY-MM-DD')

  const [receivables, payables] = await Promise.all([
    scopeToBranch(supabase.from('receivables').select('*').neq('status', 'paid').lte('due_date', horizon), branch),
    scopeToBranch(supabase.from('payables').select('*').neq('status', 'paid').lte('due_date', horizon), branch),
  ])
  if (receivables.error) throw toError(receivables.error)
  if (payables.error) throw toError(payables.error)

  const rcv = (receivables.data ?? []) as Receivable[]
  const pay = (payables.data ?? []) as Payable[]
  const isOverdue = (d: string) => d < todayStr

  return {
    overdueReceivables: rcv.filter((r) => isOverdue(r.due_date)),
    nearDueReceivables: rcv.filter((r) => !isOverdue(r.due_date)),
    overduePayables: pay.filter((p) => isOverdue(p.due_date)),
    nearDuePayables: pay.filter((p) => !isOverdue(p.due_date)),
  }
}
