import { createRoute } from '@tanstack/react-router'
import { appLayoutRoute } from './app.route'
import { DisbursementManager } from '../components/disbursements/DisbursementManager'

/** Expenses module — every expense auto-generates a pending voucher. */
export const expensesRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/expenses',
  component: ExpensesPage,
})

function ExpensesPage() {
  return (
    <DisbursementManager
      kind="expense"
      title="Expenses"
      subtitle="Operating costs — each record generates a voucher for approval"
    />
  )
}
