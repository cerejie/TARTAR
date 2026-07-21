import { createRoute } from '@tanstack/react-router'
import type { DefaultValues } from 'react-hook-form'
import { appLayoutRoute } from './app.route'
import { LedgerManager } from '../components/ledger/LedgerManager'
import type { FieldConfig } from '../components/form/FormField'
import { useQuery } from '../hooks/useQuery'
import { useBranches } from '../hooks/useReferenceData'
import { payablesService } from '../services/ledger.service'
import * as paymentsService from '../services/payments.service'
import { suppliersService } from '../services/party.service'
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
  const suppliers = useQuery('suppliers', () => suppliersService.list())

  const fields: FieldConfig<PayableInput>[] = [
    { name: 'branch', label: 'Branch', type: 'select', options: branches.map((b) => ({ value: b.slug, label: b.name })) },
    {
      name: 'supplier_id',
      label: 'Supplier',
      type: 'select',
      allowClear: true,
      options: (suppliers.data ?? []).map((s) => ({ value: s.id, label: s.name })),
    },
    // One-off suppliers that aren't worth a master record stay typeable, the
    // same way the disbursement form handles a non-supplier payee.
    {
      name: 'supplier_name',
      label: 'Supplier name (if not in master data)',
      type: 'text',
      hidden: (v) => !!v.supplier_id,
    },
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

  /**
   * `supplier_name` is what the ledger, reports and statements display, so a
   * picked supplier is denormalised to its name here — from the already-loaded
   * master list, so recording a payable still works offline.
   */
  const resolveSupplierName = (input: PayableInput): string => {
    const picked = input.supplier_id
      ? (suppliers.data ?? []).find((s) => s.id === input.supplier_id)
      : undefined
    const name = picked?.name ?? input.supplier_name?.trim() ?? ''
    if (!name) throw new Error('Select a supplier or enter a name')
    return name
  }

  return (
    <LedgerManager<Payable, PayableInput>
      queryKey="payables"
      title="Payables"
      subtitle="Amounts the business owes suppliers"
      partyLabel="Supplier"
      nameOf={(p) => p.supplier_name}
      list={payablesService.list}
      create={(input, createdBy) =>
        payablesService.create({ ...input, supplier_name: resolveSupplierName(input) }, createdBy)
      }
      settle={(row, amount, createdBy) =>
        paymentsService.recordPayment(
          'payable',
          {
            partyId: row.supplier_id,
            partyName: row.supplier_name,
            paidAt: todayIso(),
            referenceNumber: null,
            allocations: [{ ledgerId: row.id, amount }],
          },
          createdBy,
        )
      }
      remove={payablesService.remove}
      schema={payableSchema}
      fields={fields}
      defaults={defaults}
    />
  )
}
