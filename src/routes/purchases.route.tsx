import { createRoute } from '@tanstack/react-router'
import { appLayoutRoute } from './app.route'
import { DisbursementManager } from '../components/disbursements/DisbursementManager'

/** Purchases module — every purchase auto-generates a pending voucher. */
export const purchasesRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/purchases',
  component: PurchasesPage,
})

function PurchasesPage() {
  return (
    <DisbursementManager
      kind="purchase"
      title="Purchases"
      subtitle="Goods bought — each record generates a voucher for approval"
    />
  )
}
