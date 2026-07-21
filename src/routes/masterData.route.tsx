import { createRoute, redirect, useNavigate } from '@tanstack/react-router'
import { Segmented } from 'antd'
import { appLayoutRoute } from './app.route'
import { PageHeader } from '../components/PageHeader'
import { SuppliersPanel } from '../components/masterData/SuppliersPanel'
import { ExpenseCategoriesPanel } from '../components/masterData/ExpenseCategoriesPanel'
import { useAuthStore } from '../stores/auth.store'

const SECTIONS = ['suppliers', 'expense-categories'] as const
type Section = (typeof SECTIONS)[number]

const SECTION_LABEL: Record<Section, string> = {
  suppliers: 'Suppliers',
  'expense-categories': 'Expense Categories',
}

const SECTION_SUBTITLE: Record<Section, string> = {
  suppliers: 'Supplier records used by payables, purchases and vouchers',
  'expense-categories': 'Categories offered when recording an expense',
}

/**
 * Master Data (client decision 2026-07-21) — the reference records the
 * operational screens pick from. Managers only, like the rest of System; the
 * matching RLS policies enforce the same server-side.
 */
export const masterDataRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/master-data',
  validateSearch: (search: Record<string, unknown>): { section: Section } => {
    const s = search.section as Section
    return { section: SECTIONS.includes(s) ? s : 'suppliers' }
  },
  beforeLoad: () => {
    const s = useAuthStore.getState()
    const isManager = s.kind === 'superadmin' || s.user?.role === 'admin'
    if (!isManager) throw redirect({ to: '/' })
  },
  component: MasterDataPage,
})

function MasterDataPage() {
  const { section } = masterDataRoute.useSearch()
  const navigate = useNavigate()

  return (
    <>
      <PageHeader title="Master Data" subtitle={SECTION_SUBTITLE[section]} />

      {/* Same Segmented switcher the Reports page uses, and the selection lives
          in the URL so a section can be linked to and survives a reload. */}
      <Segmented
        className="tartar-report-seg"
        value={section}
        onChange={(v) => void navigate({ to: '/master-data', search: { section: v as Section } })}
        options={SECTIONS.map((s) => ({ label: SECTION_LABEL[s], value: s }))}
      />

      {section === 'suppliers' ? <SuppliersPanel /> : <ExpenseCategoriesPanel />}
    </>
  )
}
