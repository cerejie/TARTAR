import { createRoute } from '@tanstack/react-router'
import type { DefaultValues } from 'react-hook-form'
import { appLayoutRoute } from './app.route'
import { LedgerManager } from '../components/ledger/LedgerManager'
import type { FieldConfig } from '../components/form/FormField'
import { useBranches } from '../hooks/useReferenceData'
import { payablesService } from '../services/ledger.service'
import { payableSchema, type BranchSlug, type Payable, type PayableInput } from '../models'
import { todayIso } from '../utils/format'

/** Payables — suppliers the business bought from on credit (build spec §9). */
export const payablesRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/payables',
  component: PayablesPage,
})

function PayablesPage() {
  const { branches } = useBranches()

  const fields: FieldConfig<PayableInput>[] = [
    { name: 'branch', label: 'Branch', type: 'select', options: branches.map((b) => ({ value: b.slug, label: b.name })) },
    { name: 'supplier_name', label: 'Supplier name', type: 'text' },
    { name: 'amount', label: 'Amount', type: 'number', prefix: '₱' },
    { name: 'due_date', label: 'Due date', type: 'date' },
    { name: 'reference_number', label: 'Reference no.', type: 'text' },
  ]

  const defaults: DefaultValues<PayableInput> = {
    branch: (branches[0]?.slug ?? 'hardware') as BranchSlug,
    supplier_name: '',
    supplier_id: null,
    due_date: todayIso(),
    reference_number: '',
  }

  return (
    <LedgerManager<Payable, PayableInput>
      queryKey="payables"
      title="Payables"
      subtitle="Amounts the business owes suppliers"
      partyLabel="Supplier"
      nameOf={(p) => p.supplier_name}
      list={payablesService.list}
      create={payablesService.create}
      settle={payablesService.settle}
      remove={payablesService.remove}
      schema={payableSchema}
      fields={fields}
      defaults={defaults}
    />
  )
}
