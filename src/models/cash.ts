import { type CashAccount } from './enums'

/**
 * Per-branch balances for the two places company money is held: the Cash Drawer
 * and the Bank Account (build spec §10). One row per (branch, account).
 */
export interface CashAccountBalance {
  branch: string
  account: CashAccount
  balance: number
  updated_at: string
}

/** Dashboard aggregates (build spec §11) computed by the dashboard service. */
export interface DashboardSummary {
  currentCash: number // total cash drawer across visible branches
  bankBalance: number // total bank account across visible branches
  todaysSales: number
  todaysExpenses: number
  accountsReceivable: number // outstanding (amount - paid) not yet fully paid
  accountsPayable: number
  monthlySales: number
  monthlyExpenses: number
}

/** One point on the daily-sales chart (build spec §11, @ant-design/charts). */
export interface DailySalesPoint {
  date: string
  total: number
}

/** Per-branch monitoring row (build spec §13). */
export interface BranchMonitorRow {
  branch: string
  branchName: string
  cashBalance: number
  sales: number
  expenses: number
  receivables: number
  payables: number
}
