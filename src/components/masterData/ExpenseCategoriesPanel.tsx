import { Badge, Button, Popconfirm, Tag, Tooltip } from 'antd'
import {
  DeleteOutlined,
  EditOutlined,
  InboxOutlined,
  PlusOutlined,
  UndoOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { DefaultValues } from 'react-hook-form'
import { SectionCard } from '../SectionCard'
import { DataTable } from '../DataTable'
import { NameCell } from '../TableDecor'
import { EntityFormModal } from '../form/EntityFormModal'
import type { FieldConfig } from '../form/FormField'
import { useQuery } from '../../hooks/useQuery'
import { useMutation } from '../../hooks/useMutation'
import * as referenceService from '../../services/reference.service'
import { useUiStore, selectModal } from '../../stores/ui.store'
import {
  expenseCategorySchema,
  type ExpenseCategory,
  type ExpenseCategoryInput,
} from '../../models'

const CREATE = 'expense-category-create'
const EDIT = 'expense-category-edit'

// The management list and the expenses form share one cache key.
const INVALIDATE = ['expense-categories']

const FIELDS: FieldConfig<ExpenseCategoryInput>[] = [
  { name: 'name', label: 'Category name', type: 'text', placeholder: 'e.g. Fuel' },
  // Baked into every voucher number issued under this category, so it is
  // entered explicitly rather than derived from the name.
  { name: 'code', label: 'Voucher code (3 letters)', type: 'text', placeholder: 'e.g. FUE' },
  { name: 'sort', label: 'Sort order', type: 'number' },
]

/**
 * Expense categories — the options behind the Expenses form's "Expense type"
 * selector, and the source of each expense voucher's numbering code (client
 * decision 2026-07-21). Managers only, like the rest of Master Data.
 */
export function ExpenseCategoriesPanel() {
  const openModal = useUiStore((s) => s.openModal)
  const closeModal = useUiStore((s) => s.closeModal)
  const createModal = useUiStore(selectModal(CREATE))
  const editModal = useUiStore(selectModal(EDIT))

  const list = useQuery('expense-categories', referenceService.listAllExpenseCategories)
  const categories = list.data ?? []
  const editing = categories.find((c) => c.slug === editModal.recordId)
  const nextSort = categories.reduce((max, c) => Math.max(max, c.sort), 0) + 1

  const create = useMutation(
    (input: ExpenseCategoryInput) => referenceService.createExpenseCategory(input),
    { successMessage: 'Category added', invalidate: INVALIDATE, onSuccess: () => closeModal(CREATE) },
  )
  const update = useMutation(
    (p: { slug: string; patch: ExpenseCategoryInput }) =>
      referenceService.updateExpenseCategory(p.slug, p.patch),
    { successMessage: 'Category updated', invalidate: INVALIDATE, onSuccess: () => closeModal(EDIT) },
  )
  const setActive = useMutation(
    (p: { slug: string; active: boolean }) =>
      referenceService.setExpenseCategoryActive(p.slug, p.active),
    { successMessage: 'Category updated', invalidate: INVALIDATE },
  )
  const remove = useMutation((slug: string) => referenceService.deleteExpenseCategory(slug), {
    successMessage: 'Category deleted',
    invalidate: INVALIDATE,
  })

  const createDefaults: DefaultValues<ExpenseCategoryInput> = {
    name: '',
    code: '',
    sort: nextSort,
  }
  const editDefaults: DefaultValues<ExpenseCategoryInput> = {
    name: editing?.name ?? '',
    code: editing?.code ?? '',
    sort: editing?.sort ?? nextSort,
  }

  const columns: ColumnsType<ExpenseCategory> = [
    {
      title: 'Category',
      dataIndex: 'name',
      render: (name: string) => <NameCell icon={<WalletOutlined />}>{name}</NameCell>,
    },
    {
      title: 'Voucher code',
      dataIndex: 'code',
      width: 150,
      render: (v: string) => <Tag className="tartar-slug">{v}</Tag>,
    },
    { title: 'Order', dataIndex: 'sort', width: 90, align: 'center' },
    {
      title: 'Status',
      dataIndex: 'active',
      width: 120,
      align: 'center',
      render: (active: boolean) =>
        active ? <Badge status="success" text="Active" /> : <Badge status="default" text="Archived" />,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      align: 'center',
      render: (_, c) => (
        <span className="tartar-row-actions">
          <Tooltip title="Edit category">
            <Button
              className="tartar-icon-btn"
              icon={<EditOutlined />}
              aria-label={`Edit ${c.name}`}
              onClick={() => openModal(EDIT, c.slug)}
            />
          </Tooltip>
          {c.active ? (
            <Popconfirm
              title="Archive this category?"
              description="It stops appearing on the expense form but past expenses keep it."
              onConfirm={() => void setActive.mutate({ slug: c.slug, active: false })}
            >
              <Tooltip title="Archive category">
                <Button
                  className="tartar-icon-btn"
                  icon={<InboxOutlined />}
                  aria-label={`Archive ${c.name}`}
                />
              </Tooltip>
            </Popconfirm>
          ) : (
            <Tooltip title="Restore category">
              <Button
                className="tartar-icon-btn"
                icon={<UndoOutlined />}
                aria-label={`Restore ${c.name}`}
                onClick={() => void setActive.mutate({ slug: c.slug, active: true })}
              />
            </Tooltip>
          )}
          <Popconfirm
            title="Delete this category?"
            description="Only possible while no expense uses it — otherwise archive it."
            onConfirm={() => void remove.mutate(c.slug)}
          >
            <Tooltip title="Delete category">
              <Button
                className="tartar-icon-btn"
                danger
                icon={<DeleteOutlined />}
                aria-label={`Delete ${c.name}`}
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
        title="Expense Categories"
        subtitle="Options on the expense form — each owns its voucher numbering code"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(CREATE)}>
            Add category
          </Button>
        }
        flush
      >
        <DataTable<ExpenseCategory>
          columns={columns}
          data={categories}
          loading={list.loading}
          rowKey="slug"
          emptyText="No expense categories yet — add your first one"
        />
      </SectionCard>

      <EntityFormModal<ExpenseCategoryInput>
        open={createModal.open}
        title="Add expense category"
        fields={FIELDS}
        schema={expenseCategorySchema}
        defaultValues={createDefaults}
        submitting={create.loading}
        submitText="Add category"
        onSubmit={(v) => void create.mutate(v)}
        onClose={() => closeModal(CREATE)}
      />

      <EntityFormModal<ExpenseCategoryInput>
        open={editModal.open}
        title={`Edit ${editing?.name ?? 'category'}`}
        fields={FIELDS}
        schema={expenseCategorySchema}
        defaultValues={editDefaults}
        submitting={update.loading}
        onSubmit={(v) => {
          if (editing) void update.mutate({ slug: editing.slug, patch: v })
        }}
        onClose={() => closeModal(EDIT)}
      />
    </>
  )
}
