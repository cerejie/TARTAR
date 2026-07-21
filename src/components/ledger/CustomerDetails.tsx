import { Button, Descriptions, Modal, Tag } from 'antd'
import type { DefaultValues } from 'react-hook-form'
import { EntityFormModal } from '../form/EntityFormModal'
import type { FieldConfig } from '../form/FormField'
import { useQuery } from '../../hooks/useQuery'
import { useMutation } from '../../hooks/useMutation'
import { customersService } from '../../services/party.service'
import {
  partyInfoState,
  partySchema,
  type Customer,
  type CustomerLedgerKey,
  type PartyInfoState,
  type PartyInput,
} from '../../models'

/**
 * Customer information for the Customer Ledger (client decision 2026-07-22):
 * the list pane flags whether a customer's details are on file and offers the
 * form, the detail pane shows them behind an info button. A receivable may name
 * its customer as free text, so saving details creates the master record and
 * adopts that name's history — see `customersService.saveDetails`.
 */
export const CUSTOMER_DETAILS_FORM = 'customer-details-form'
export const CUSTOMER_INFO_MODAL = 'customer-info'

/** Ledger identity as a single string, so it can travel as a modal `recordId`. */
export const ledgerId = (c: CustomerLedgerKey) => c.customerId ?? c.customerName

const FIELDS: FieldConfig<PartyInput>[] = [
  { name: 'name', label: 'Customer name', type: 'text' },
  { name: 'contact_person', label: 'Contact person', type: 'text', placeholder: 'Who to ask for' },
  { name: 'contact', label: 'Contact number', type: 'text', placeholder: 'e.g. 0917 123 4567' },
  { name: 'address', label: 'Address', type: 'textarea' },
]

/** The customer's master record, matched by id or — for a free-typed name whose
 *  record was saved later — by name. */
export function findCustomerRecord(
  customers: Customer[],
  ledger: CustomerLedgerKey | null,
): Customer | undefined {
  if (!ledger) return undefined
  return ledger.customerId
    ? customers.find((c) => c.id === ledger.customerId)
    : customers.find((c) => c.name.toLowerCase() === ledger.customerName.toLowerCase())
}

export function useCustomerRecord(ledger: CustomerLedgerKey | null) {
  const query = useQuery('customers', () => customersService.list())
  return { ...query, record: findCustomerRecord(query.data ?? [], ledger) }
}

const INFO_TAG: Record<PartyInfoState, { color: string; label: string }> = {
  complete: { color: 'green', label: 'Complete' },
  partial: { color: 'gold', label: 'Incomplete' },
  none: { color: 'default', label: 'Not filled' },
}

/** Small "is this customer's information filled in?" indicator. */
export function CustomerInfoTag({ customer }: { customer: Customer | undefined }) {
  const { color, label } = INFO_TAG[partyInfoState(customer)]
  return <Tag color={color}>{label}</Tag>
}

interface CustomerModalProps {
  open: boolean
  customer: CustomerLedgerKey | null
  onClose: () => void
}

export function CustomerDetailsModal({ open, customer, onClose }: CustomerModalProps) {
  const { record, updatedAt } = useCustomerRecord(customer)

  // The target travels through `mutate` rather than the closure, the way every
  // other screen calls a mutation.
  const save = useMutation(
    (p: { ledger: CustomerLedgerKey; input: PartyInput }) =>
      customersService.saveDetails(p.ledger, p.input),
    {
      successMessage: 'Customer details saved',
      // The saved name is denormalised onto receivables and payments, so both
      // ledgers refetch alongside the customer list.
      invalidate: ['customers', 'receivables', 'payments'],
      onSuccess: onClose,
    },
  )

  const defaults: DefaultValues<PartyInput> = {
    name: record?.name ?? customer?.customerName ?? '',
    contact_person: record?.contact_person ?? '',
    contact: record?.contact ?? '',
    address: record?.address ?? '',
  }

  return (
    <EntityFormModal<PartyInput>
      // Held back until the customer list has loaded once: the form seeds its
      // defaults when it opens, so opening early would blank out details that
      // are already on file. `updatedAt` (not `loading`) so a later refetch
      // never closes the form mid-edit.
      open={open && updatedAt > 0}
      title={`Customer details — ${customer?.customerName ?? ''}`}
      fields={FIELDS}
      schema={partySchema}
      defaultValues={defaults}
      submitting={save.loading}
      submitText="Save details"
      onSubmit={(v) => {
        if (customer) void save.mutate({ ledger: customer, input: v })
      }}
      onClose={onClose}
    />
  )
}

/** Read-only view of a customer's information, with a shortcut to the form. */
export function CustomerInfoModal({
  open,
  customer,
  onClose,
  onEdit,
}: CustomerModalProps & { onEdit?: () => void }) {
  const { record, loading } = useCustomerRecord(customer)
  const value = (v: string | null | undefined) => v || '—'

  return (
    <Modal
      open={open}
      title="Customer information"
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        onEdit ? (
          <Button key="edit" type="primary" onClick={onEdit}>
            {record ? 'Edit details' : 'Fill in details'}
          </Button>
        ) : null,
      ]}
    >
      <Descriptions
        column={1}
        size="small"
        bordered
        items={[
          { key: 'name', label: 'Customer', children: record?.name ?? customer?.customerName ?? '—' },
          { key: 'person', label: 'Contact person', children: value(record?.contact_person) },
          { key: 'contact', label: 'Contact number', children: value(record?.contact) },
          { key: 'address', label: 'Address', children: value(record?.address) },
          {
            key: 'state',
            label: 'Information',
            children: loading ? '—' : <CustomerInfoTag customer={record} />,
          },
        ]}
      />
    </Modal>
  )
}
