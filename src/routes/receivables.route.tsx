import { createRoute } from '@tanstack/react-router'
import type { DefaultValues } from 'react-hook-form'
import { appLayoutRoute } from './app.route'
import { LedgerManager } from '../components/ledger/LedgerManager'
import type { FieldConfig } from '../components/form/FormField'
import { useBranches } from '../hooks/useReferenceData'
import { receivablesService } from '../services/ledger.service'
import { receivableSchema, type BranchSlug, type Receivable, type ReceivableInput } from '../models'
import { todayIso } from '../utils/format'

/** Receivables — customers who pay later (build spec §9). */
export const receivablesRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/receivables',
  component: ReceivablesPage,
})

function ReceivablesPage() {
  const { branches } = useBranches()

  const fields: FieldConfig<ReceivableInput>[] = [
    { name: 'branch', label: 'Branch', type: 'select', options: branches.map((b) => ({ value: b.slug, label: b.name })) },
    { name: 'customer_name', label: 'Customer name', type: 'text' },
    { name: 'amount', label: 'Amount', type: 'number', prefix: '₱' },
    { name: 'due_date', label: 'Due date', type: 'date' },
    { name: 'reference_number', label: 'Reference no.', type: 'text' },
  ]

  const defaults: DefaultValues<ReceivableInput> = {
    branch: (branches[0]?.slug ?? 'hardware') as BranchSlug,
    customer_name: '',
    customer_id: null,
    due_date: todayIso(),
    reference_number: '',
  }

  return (
    <LedgerManager<Receivable, ReceivableInput>
      queryKey="receivables"
      title="Receivables"
      subtitle="Amounts customers owe the business"
      partyLabel="Customer"
      nameOf={(r) => r.customer_name}
      list={receivablesService.list}
      create={receivablesService.create}
      settle={receivablesService.settle}
      remove={receivablesService.remove}
      schema={receivableSchema}
      fields={fields}
      defaults={defaults}
    />
  )
}
