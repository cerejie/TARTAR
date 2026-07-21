import { createRoute } from '@tanstack/react-router'
import { Button } from 'antd'
import { BookOutlined } from '@ant-design/icons'
import type { DefaultValues } from 'react-hook-form'
import { appLayoutRoute } from './app.route'
import { LedgerManager } from '../components/ledger/LedgerManager'
import { CustomerLedgerModal, CUSTOMER_LEDGER_MODAL } from '../components/ledger/CustomerLedgerModal'
import type { FieldConfig } from '../components/form/FormField'
import { useQuery } from '../hooks/useQuery'
import { useBranches } from '../hooks/useReferenceData'
import { useUiStore } from '../stores/ui.store'
import { receivablesService } from '../services/ledger.service'
import { customersService } from '../services/party.service'
import * as paymentsService from '../services/payments.service'
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
  const openModal = useUiStore((s) => s.openModal)
  const customers = useQuery('customers', () => customersService.list())

  const fields: FieldConfig<ReceivableInput>[] = [
    { name: 'branch', label: 'Branch', type: 'select', options: branches.map((b) => ({ value: b.slug, label: b.name })) },
    {
      name: 'customer_id',
      label: 'Customer',
      type: 'select',
      allowClear: true,
      options: (customers.data ?? []).map((c) => ({ value: c.id, label: c.name })),
    },
    // Walk-ins who aren't worth a master record stay typeable (client decision
    // 2026-07-22); the Customer Ledger can promote one later.
    {
      name: 'customer_name',
      label: 'Customer name (if not in the list)',
      type: 'text',
      hidden: (v) => !!v.customer_id,
    },
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

  /**
   * `customer_name` is what the ledger, reports and statements display, so a
   * picked customer is denormalised to its name here — from the already-loaded
   * list, so recording a receivable still works offline.
   */
  const resolveCustomerName = (input: ReceivableInput): string => {
    const picked = input.customer_id
      ? (customers.data ?? []).find((c) => c.id === input.customer_id)
      : undefined
    const name = picked?.name ?? input.customer_name?.trim() ?? ''
    if (!name) throw new Error('Select a customer or enter a name')
    return name
  }

  return (
    <>
      <LedgerManager<Receivable, ReceivableInput>
        queryKey="receivables"
        title="Receivables"
        subtitle="Amounts customers owe the business"
        partyLabel="Customer"
        nameOf={(r) => r.customer_name}
        list={receivablesService.list}
        create={(input, createdBy) =>
          receivablesService.create({ ...input, customer_name: resolveCustomerName(input) }, createdBy)
        }
        settle={(row, amount, createdBy) =>
          paymentsService.recordPayment(
            'receivable',
            {
              partyId: row.customer_id,
              partyName: row.customer_name,
              paidAt: todayIso(),
              referenceNumber: null,
              allocations: [{ ledgerId: row.id, amount }],
            },
            createdBy,
          )
        }
        remove={receivablesService.remove}
        schema={receivableSchema}
        fields={fields}
        defaults={defaults}
        headerActions={
          <Button icon={<BookOutlined />} onClick={() => openModal(CUSTOMER_LEDGER_MODAL)}>
            Customer Ledger
          </Button>
        }
      />
      <CustomerLedgerModal />
    </>
  )
}
