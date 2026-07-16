import type { ReactNode } from 'react'
import {
  AppstoreOutlined,
  AuditOutlined,
  BankOutlined,
  DashboardOutlined,
  FileTextOutlined,
  SolutionOutlined,
  SwapOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { createElement } from 'react'
import type { Permissions } from '../hooks/usePermissions'

/** The set of navigable app paths (all children of the guarded layout route). */
export type AppPath =
  | '/'
  | '/transactions'
  | '/receivables'
  | '/payables'
  | '/vouchers'
  | '/branches'
  | '/reports'
  | '/users'

interface NavItem {
  key: AppPath
  label: string
  icon: ReactNode
  /** Which permission flag must be true for the item to appear (build spec §5). */
  can: keyof Permissions
}

/** Sidebar navigation, filtered per role at render time. */
export const NAV_ITEMS: NavItem[] = [
  { key: '/', label: 'Dashboard', icon: createElement(DashboardOutlined), can: 'viewDashboard' },
  { key: '/transactions', label: 'Transactions', icon: createElement(SwapOutlined), can: 'viewReminders' },
  { key: '/receivables', label: 'Receivables', icon: createElement(SolutionOutlined), can: 'viewReminders' },
  { key: '/payables', label: 'Payables', icon: createElement(AuditOutlined), can: 'viewReminders' },
  { key: '/vouchers', label: 'Vouchers', icon: createElement(FileTextOutlined), can: 'createVouchers' },
  { key: '/branches', label: 'Branch Monitoring', icon: createElement(AppstoreOutlined), can: 'viewBranchMonitoring' },
  { key: '/reports', label: 'Reports', icon: createElement(BankOutlined), can: 'viewIncomeExpenses' },
  { key: '/users', label: 'Users', icon: createElement(TeamOutlined), can: 'manageUsers' },
]
