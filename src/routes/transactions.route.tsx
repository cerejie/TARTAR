import { createRoute } from '@tanstack/react-router'
import { Button, Popconfirm, Tag } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { DefaultValues } from 'react-hook-form'
import { appLayoutRoute } from './app.route'
import { PageHeader } from '../components/PageHeader'
import { SectionCard } from '../components/SectionCard'
import { DataTable } from '../components/DataTable'
import { LedgerFilterBar } from '../components/LedgerFilterBar'
import { EntityFormModal } from '../components/form/EntityFormModal'
import type { FieldConfig } from '../components/form/FormField'
import { RequirePermission } from '../components/RequirePermission'
import { useQuery } from '../hooks/useQuery'
import { useMutation } from '../hooks/useMutation'
import { usePermissions } from '../hooks/usePermissions'
import { useBranches, useFarmSections } from '../hooks/useReferenceData'
import { useBranchScope, scopedFilters } from '../hooks/useBranchScope'
import { useUiStore, selectModal } from '../stores/ui.store'
import { useAuthStore } from '../stores/auth.store'
import * as transactionsService from '../services/transactions.service'
import * as usersService from '../services/users.service'
import { customersService, suppliersService } from '../services/party.service'
import {
  cashAccountValues,
  expenseTypeValues,
  incomeSourceValues,
  labels,
  toOptions,
  transactionSchema,
  transactionTypeValues,
  type BranchSlug,
  type Transaction,
  type TransactionInput,
} from '../models'
import { formatDate, formatMoney, formatTime, todayIso } from '../utils/format'

const MODAL = 'transaction-form'

export const transactionsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/transactions',
  component: TransactionsPage,
})

function TransactionsPage() {
  const permissions = usePermissions()
  const filters = useUiStore((s) => s.filters)
  const openModal = useUiStore((s) => s.openModal)
  const closeModal = useUiStore((s) => s.closeModal)
  const modal = useUiStore(selectModal(MODAL))
  const createdBy = useAuthStore((s) => s.user?.id ?? null)

  const { branches } = useBranches()
  const { farmSections } = useFarmSections()
  const customers = useQuery('customers', () => customersService.list())
  const suppliers = useQuery('suppliers', () => suppliersService.list())
  // Who encoded each transaction (build: audit User/Role). Managers only — RLS
  // only lets managers read other users' rows, so the columns are manager-gated.
  const users = useQuery('users', () => usersService.listUsers(), { enabled: permissions.isManager })
  const userById = new Map((users.data ?? []).map((u) => [u.id, u]))

  const { branch: scopeBranch } = useBranchScope()
  const effectiveFilters = scopedFilters(filters, scopeBranch)
  const listKey = `transactions:${JSON.stringify(effectiveFilters)}`
  const list = useQuery(listKey, () => transactionsService.listTransactions(effectiveFilters))

  const create = useMutation(
    (values: TransactionInput) => transactionsService.createTransaction(normalize(values), createdBy),
    { successMessage: 'Transaction recorded', invalidate: ['transactions'], onSuccess: () => closeModal(MODAL) },
  )
  const remove = useMutation((id: string) => transactionsService.deleteTransaction(id), {
    successMessage: 'Transaction deleted',
    invalidate: ['transactions'],
  })

  const branchName = (slug: string) => branches.find((b) => b.slug === slug)?.name ?? slug

  const fields: FieldConfig<TransactionInput>[] = [
    { name: 'type', label: 'Type', type: 'select', options: toOptions(transactionTypeValues, labels.transactionType) },
    { name: 'branch', label: 'Branch', type: 'select', options: branches.map((b) => ({ value: b.slug, label: b.name })) },
    {
      name: 'farm_section',
      label: 'Farm section',
      type: 'select',
      allowClear: true,
      options: farmSections.map((f) => ({ value: f.slug, label: f.name })),
      hidden: (v) => v.branch !== 'farm',
    },
    { name: 'txn_date', label: 'Date', type: 'date' },
    { name: 'amount', label: 'Amount', type: 'number', prefix: '₱' },
    {
      name: 'income_source',
      label: 'Income source',
      type: 'select',
      options: toOptions(incomeSourceValues, labels.incomeSource),
      hidden: (v) => v.type !== 'sale',
    },
    {
      name: 'expense_type',
      label: 'Expense type',
      type: 'select',
      options: toOptions(expenseTypeValues, labels.expenseType),
      hidden: (v) => v.type !== 'expense',
    },
    {
      name: 'customer_id',
      label: 'Customer',
      type: 'select',
      allowClear: true,
      options: (customers.data ?? []).map((c) => ({ value: c.id, label: c.name })),
      hidden: (v) => !['sale', 'customer_payment', 'collection'].includes(v.type),
    },
    {
      name: 'supplier_id',
      label: 'Supplier',
      type: 'select',
      allowClear: true,
      options: (suppliers.data ?? []).map((sp) => ({ value: sp.id, label: sp.name })),
      hidden: (v) => !['purchase', 'supplier_payment'].includes(v.type),
    },
    { name: 'cash_account', label: 'Cash account', type: 'select', allowClear: true, options: toOptions(cashAccountValues, labels.cashAccount) },
    { name: 'reference_number', label: 'Reference no.', type: 'text' },
    { name: 'description', label: 'Description', type: 'textarea' },
  ]

  const defaults: DefaultValues<TransactionInput> = {
    type: 'sale',
    branch: (branches[0]?.slug ?? 'hardware') as BranchSlug,
    farm_section: null,
    txn_date: todayIso(),
    income_source: 'product_sales',
    expense_type: null,
    customer_id: null,
    supplier_id: null,
    cash_account: null,
    reference_number: '',
    description: '',
  }

  const columns: ColumnsType<Transaction> = [
    { title: 'Date', dataIndex: 'txn_date', render: formatDate, width: 130 },
    // Encode time comes from `created_at`; `txn_date` is date-only.
    { title: 'Time', dataIndex: 'created_at', render: (v: string) => formatTime(v), width: 100 },
    { title: 'Type', dataIndex: 'type', render: (t: Transaction['type']) => <Tag>{labels.transactionType[t]}</Tag> },
    { title: 'Branch', dataIndex: 'branch', render: branchName },
    ...(permissions.isManager
      ? [
          {
            title: 'User',
            key: 'user',
            render: (_: unknown, r: Transaction) => {
              const u = r.created_by ? userById.get(r.created_by) : undefined
              return u ? u.full_name || u.username : '—'
            },
          },
          {
            title: 'Role',
            key: 'role',
            width: 130,
            render: (_: unknown, r: Transaction) => {
              const u = r.created_by ? userById.get(r.created_by) : undefined
              return u ? <Tag>{labels.userRole[u.role]}</Tag> : '—'
            },
          },
        ]
      : []),
    { title: 'Party', key: 'party', render: (_, r) => r.customer?.name ?? r.supplier?.name ?? '—' },
    { title: 'Reference', dataIndex: 'reference_number', render: (v: string | null) => v || '—' },
    { title: 'Amount', dataIndex: 'amount', align: 'right', render: (v: number) => formatMoney(v) },
    ...(permissions.isManager
      ? [
          {
            title: '',
            key: 'actions',
            width: 90,
            render: (_: unknown, r: Transaction) => (
              <Popconfirm title="Delete this transaction?" onConfirm={() => void remove.mutate(r.id)}>
                <Button type="link" danger size="small">
                  Delete
                </Button>
              </Popconfirm>
            ),
          },
        ]
      : []),
  ]

  return (
    <>
      <PageHeader
        title="Transactions"
        subtitle="Sales, expenses, payments, purchases and collections"
        extra={
          <RequirePermission can="encodeTransactions" fallback={null}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(MODAL)}>
              Record transaction
            </Button>
          </RequirePermission>
        }
      />

      <LedgerFilterBar />

      <SectionCard title="All Transactions" subtitle="Matching the current filters" flush>
        <DataTable<Transaction>
          columns={columns}
          data={list.data ?? []}
          loading={list.loading}
          emptyText="No transactions match the current filters"
        />
      </SectionCard>

      <EntityFormModal<TransactionInput>
        open={modal.open}
        title="Record transaction"
        fields={fields}
        schema={transactionSchema}
        defaultValues={defaults}
        submitting={create.loading}
        submitText="Record"
        onSubmit={(v) => void create.mutate(v)}
        onClose={() => closeModal(MODAL)}
      />
    </>
  )
}

/** Null out fields that don't apply to the chosen type/branch before saving. */
function normalize(v: TransactionInput): TransactionInput {
  return {
    ...v,
    farm_section: v.branch === 'farm' ? v.farm_section : null,
    income_source: v.type === 'sale' ? v.income_source : null,
    expense_type: v.type === 'expense' ? v.expense_type : null,
    customer_id: ['sale', 'customer_payment', 'collection'].includes(v.type) ? v.customer_id : null,
    supplier_id: ['purchase', 'supplier_payment'].includes(v.type) ? v.supplier_id : null,
  }
}
