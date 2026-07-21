import { Button, Popconfirm, Tooltip } from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined, ShopOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { DefaultValues } from 'react-hook-form'
import { SectionCard } from '../SectionCard'
import { DataTable } from '../DataTable'
import { NameCell } from '../TableDecor'
import { EntityFormModal } from '../form/EntityFormModal'
import type { FieldConfig } from '../form/FormField'
import { useQuery } from '../../hooks/useQuery'
import { useMutation } from '../../hooks/useMutation'
import { useUiStore, selectModal } from '../../stores/ui.store'
import { suppliersService } from '../../services/party.service'
import { partySchema, type PartyInput, type Supplier } from '../../models'

const CREATE = 'supplier-create'
const EDIT = 'supplier-edit'

/** Every screen that offers a supplier selector reads the same `suppliers` key. */
const INVALIDATE = ['suppliers']

const FIELDS: FieldConfig<PartyInput>[] = [
  { name: 'name', label: 'Supplier name', type: 'text', placeholder: 'e.g. Cebu Steel Trading' },
  { name: 'contact_person', label: 'Contact person', type: 'text', placeholder: 'Who to ask for' },
  { name: 'contact', label: 'Contact number', type: 'text', placeholder: 'e.g. 0917 123 4567' },
  { name: 'address', label: 'Address', type: 'textarea' },
]

const EMPTY: DefaultValues<PartyInput> = {
  name: '',
  contact_person: '',
  contact: '',
  address: '',
}

/**
 * Supplier master records — the source of the supplier selectors on Payables,
 * Purchases/Expenses and manual vouchers (client decision 2026-07-21).
 */
export function SuppliersPanel() {
  const openModal = useUiStore((s) => s.openModal)
  const closeModal = useUiStore((s) => s.closeModal)
  const createModal = useUiStore(selectModal(CREATE))
  const editModal = useUiStore(selectModal(EDIT))

  const list = useQuery('suppliers', () => suppliersService.list())
  const suppliers = list.data ?? []
  const editing = suppliers.find((s) => s.id === editModal.recordId)

  const create = useMutation((input: PartyInput) => suppliersService.create(input), {
    successMessage: 'Supplier added',
    invalidate: INVALIDATE,
    onSuccess: () => closeModal(CREATE),
  })
  const update = useMutation(
    (p: { id: string; patch: PartyInput }) => suppliersService.update(p.id, p.patch),
    { successMessage: 'Supplier updated', invalidate: INVALIDATE, onSuccess: () => closeModal(EDIT) },
  )
  // Deleting is blocked by the FK once a transaction, payable or voucher points
  // at the supplier; `toError` turns that into a readable message.
  const remove = useMutation((id: string) => suppliersService.remove(id), {
    successMessage: 'Supplier deleted',
    invalidate: INVALIDATE,
  })

  const editDefaults: DefaultValues<PartyInput> = editing
    ? {
        name: editing.name,
        contact_person: editing.contact_person ?? '',
        contact: editing.contact ?? '',
        address: editing.address ?? '',
      }
    : EMPTY

  const columns: ColumnsType<Supplier> = [
    {
      title: 'Supplier',
      dataIndex: 'name',
      render: (name: string) => <NameCell icon={<ShopOutlined />}>{name}</NameCell>,
    },
    { title: 'Contact person', dataIndex: 'contact_person', render: (v: string | null) => v || '—' },
    { title: 'Contact number', dataIndex: 'contact', render: (v: string | null) => v || '—' },
    { title: 'Address', dataIndex: 'address', render: (v: string | null) => v || '—' },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, s) => (
        <span className="tartar-row-actions">
          <Tooltip title="Edit supplier">
            <Button
              className="tartar-icon-btn"
              icon={<EditOutlined />}
              aria-label={`Edit ${s.name}`}
              onClick={() => openModal(EDIT, s.id)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this supplier?"
            description="Only possible while no record references it."
            onConfirm={() => void remove.mutate(s.id)}
          >
            <Tooltip title="Delete supplier">
              <Button
                className="tartar-icon-btn"
                danger
                icon={<DeleteOutlined />}
                aria-label={`Delete ${s.name}`}
              />
            </Tooltip>
          </Popconfirm>
        </span>
      ),
    },
  ]

  return (
    <>
      <SectionCard
        title="Suppliers"
        subtitle="Master records offered by every supplier selector in the app"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(CREATE)}>
            Add supplier
          </Button>
        }
        flush
      >
        <DataTable<Supplier>
          columns={columns}
          data={suppliers}
          loading={list.loading}
          emptyText="No suppliers yet — add your first one"
        />
      </SectionCard>

      <EntityFormModal<PartyInput>
        open={createModal.open}
        title="Add supplier"
        fields={FIELDS}
        schema={partySchema}
        defaultValues={EMPTY}
        submitting={create.loading}
        submitText="Add supplier"
        onSubmit={(v) => void create.mutate(v)}
        onClose={() => closeModal(CREATE)}
      />

      <EntityFormModal<PartyInput>
        open={editModal.open}
        title={`Edit ${editing?.name ?? 'supplier'}`}
        fields={FIELDS}
        schema={partySchema}
        defaultValues={editDefaults}
        submitting={update.loading}
        onSubmit={(v) => {
          if (editing) void update.mutate({ id: editing.id, patch: v })
        }}
        onClose={() => closeModal(EDIT)}
      />
    </>
  )
}
