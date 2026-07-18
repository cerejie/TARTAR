import type { ReactNode } from 'react'
import {
  AppstoreOutlined,
  AuditOutlined,
  BankOutlined,
  DashboardOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  SolutionOutlined,
  SwapOutlined,
  TeamOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import { createElement } from 'react'
import type { Permissions } from '../hooks/usePermissions'

/** The set of navigable app paths (all children of the guarded layout route). */
export type AppPath =
  | '/'
  | '/transactions'
  | '/purchases'
  | '/expenses'
  | '/receivables'
  | '/payables'
  | '/vouchers'
  | '/branches'
  | '/reports'
  | '/users'

/** Sidebar sections, in display order. Labels are uppercased by CSS. */
export const NAV_GROUPS = ['Main', 'Operations', 'Accounting', 'Monitoring', 'System'] as const
export type NavGroup = (typeof NAV_GROUPS)[number]

interface NavItem {
  key: AppPath
  label: string
  icon: ReactNode
  /** Which permission flag must be true for the item to appear (build spec §5). */
  can: keyof Permissions
  /** Which sidebar section the item renders under. */
  group: NavGroup
}

/** Sidebar navigation, filtered per role at render time and grouped by section. */
export const NAV_ITEMS: NavItem[] = [
  { key: '/', label: 'Dashboard', icon: createElement(DashboardOutlined), can: 'viewDashboard', group: 'Main' },
  { key: '/transactions', label: 'Transactions', icon: createElement(SwapOutlined), can: 'viewReminders', group: 'Operations' },
  { key: '/purchases', label: 'Purchases', icon: createElement(ShoppingCartOutlined), can: 'viewReminders', group: 'Operations' },
  { key: '/expenses', label: 'Expenses', icon: createElement(WalletOutlined), can: 'viewReminders', group: 'Operations' },
  { key: '/vouchers', label: 'Vouchers', icon: createElement(FileTextOutlined), can: 'createVouchers', group: 'Operations' },
  { key: '/receivables', label: 'Receivables', icon: createElement(SolutionOutlined), can: 'viewReminders', group: 'Accounting' },
  { key: '/payables', label: 'Payables', icon: createElement(AuditOutlined), can: 'viewReminders', group: 'Accounting' },
  { key: '/reports', label: 'Reports', icon: createElement(BankOutlined), can: 'viewIncomeExpenses', group: 'Monitoring' },
  { key: '/branches', label: 'Branch Monitoring', icon: createElement(AppstoreOutlined), can: 'viewBranchMonitoring', group: 'Monitoring' },
  { key: '/users', label: 'Users', icon: createElement(TeamOutlined), can: 'manageUsers', group: 'System' },
]
