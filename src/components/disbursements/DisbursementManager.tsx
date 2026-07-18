import { Button, Modal, Popconfirm, Space, Tag, Tooltip, Typography } from 'antd'
import { DeleteOutlined, EditOutlined, HistoryOutlined, PlusOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { DefaultValues } from 'react-hook-form'
import { PageHeader } from '../PageHeader'
import { SectionCard } from '../SectionCard'
import { DataTable } from '../DataTable'
import { LedgerFilterBar } from '../LedgerFilterBar'
import { EntityFormModal } from '../form/EntityFormModal'
import type { FieldConfig } from '../form/FormField'
import { RequirePermission } from '../RequirePermission'
import { useQuery } from '../../hooks/useQuery'
import { useMutation } from '../../hooks/useMutation'
import { usePermissions } from '../../hooks/usePermissions'
import { useBranches, useFarmSections } from '../../hooks/useReferenceData'
import { useBranchScope, scopedFilters } from '../../hooks/useBranchScope'
import { useUiStore, selectModal } from '../../stores/ui.store'
import { useAuthStore } from '../../stores/auth.store'
import * as transactionsService from '../../services/transactions.service'
import * as usersService from '../../services/users.service'
import { suppliersService } from '../../services/party.service'
import {
  cashAccountValues,
  expenseSchema,
  expenseTypeValues,
  labels,
  purchaseSchema,
  tagColors,
  toOptions,
  voucherTypeValues,
  type BranchSlug,
  type Disbursement,
  type DisbursementInput,
} from '../../models'
import { formatDate, formatDateTime, formatMoney, todayIso } from '../../utils/format'

/**
 * One component that runs both the Purchases and Expenses screens (client
 * decisions 2026-07: separate modules, each record auto-generates a pending
 * voucher via the `create_transaction_with_voucher` RPC). Rows stay editable —
 * with a full edit history — while the voucher is pending; the DB lock trigger
 * freezes them once it is approved or printed.
 */
interface DisbursementManagerProps {
  kind: 'purchase' | 'expense'
  title: string
  subtitle: string
}

/** A row is frozen once its voucher left `pending` (DB enforces this too). */
const isLocked = (r: Disbursement) =>
  !!r.voucher && (r.voucher.status !== 'pending' || r.voucher.printed)

export function DisbursementManager({ kind, title, subtitle }: DisbursementManagerProps) {
  const queryKey = kind === 'purchase' ? 'purchases' : 'expenses'
  const formKey = `${queryKey}-form`
  const editKey = `${queryKey}-edit`
  const historyKey = `${queryKey}-history`

  const permissions = usePermissions()
  const filters = useUiStore((s) => s.filters)
  const openModal = useUiStore((s) => s.openModal)
  const closeModal = useUiStore((s) => s.closeModal)
  const formModal = useUiStore(selectModal(formKey))
  const editModal = useUiStore(selectModal(editKey))
  const historyModal = useUiStore(selectModal(historyKey))
  const createdBy = useAuthStore((s) => s.user?.id ?? null)

  const { branches } = useBranches()
  const { farmSections } = useFarmSections()
  const suppliers = useQuery('suppliers', () => suppliersService.list())
  const users = useQuery('users', () => usersService.listUsers(), { enabled: permissions.isManager })
  const userById = new Map((users.data ?? []).map((u) => [u.id, u]))

  const { branch: scopeBranch } = useBranchScope()
  const effectiveFilters = scopedFilters(filters, scopeBranch)
  const listKey = `${queryKey}:${JSON.stringify(effectiveFilters)}`
  const list = useQuery(listKey, () => transactionsService.listDisbursements(kind, effectiveFilters))
  const rows = list.data ?? []

  const editRow = rows.find((r) => r.id === editModal.recordId)
  const historyRow = rows.find((r) => r.id === historyModal.recordId)
  const audit = useQuery(
    `${queryKey}-audit:${historyModal.recordId ?? 'none'}`,
    () => transactionsService.getTransactionAudit(historyModal.recordId!),
    { enabled: historyModal.open && !!historyModal.recordId },
  )

  const invalidate = [queryKey, 'vouchers']
  const create = useMutation(
    (input: DisbursementInput) => transactionsService.createDisbursement(kind, input, createdBy),
    {
      successMessage: `${title} recorded — voucher pending approval`,
      invalidate,
      onSuccess: () => closeModal(formKey),
    },
  )
  const update = useMutation(
    (payload: { id: string; input: DisbursementInput }) =>
      transactionsService.updateDisbursement(payload.id, kind, payload.input),
    { successMessage: `${title} updated`, invalidate, onSuccess: () => closeModal(editKey) },
  )
  const remove = useMutation((id: string) => transactionsService.deleteTransaction(id), {
    successMessage: `${title} deleted`,
    invalidate,
  })

  const branchName = (slug: string) => branches.find((b) => b.slug === slug)?.name ?? slug

  const fields: FieldConfig<DisbursementInput>[] = [
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
    ...(kind === 'expense'
      ? [
          {
            name: 'expense_type',
            label: 'Expense type',
            type: 'select',
            options: toOptions(expenseTypeValues, labels.expenseType),
          } satisfies FieldConfig<DisbursementInput>,
        ]
      : []),
    {
      name: 'supplier_id',
      label: 'Supplier (payee)',
      type: 'select',
      allowClear: true,
      options: (suppliers.data ?? []).map((sp) => ({ value: sp.id, label: sp.name })),
    },
    {
      name: 'payee',
      label: 'Payee (if not a supplier)',
      type: 'text',
      hidden: (v) => !!v.supplier_id,
    },
    {
      name: 'cash_account',
      label: 'Paid from',
      type: 'select',
      allowClear: true,
      options: toOptions(cashAccountValues, labels.cashAccount),
    },
    // On-credit records have no account to derive the voucher type from, so it
    // is chosen manually (client decision A).
    {
      name: 'voucher_type',
      label: 'Voucher type',
      type: 'select',
      options: toOptions(voucherTypeValues, labels.voucherType),
      hidden: (v) => !!v.cash_account,
    },
    { name: 'reference_number', label: 'Reference no.', type: 'text' },
    { name: 'description', label: 'Description', type: 'textarea' },
  ]

  const createDefaults: DefaultValues<DisbursementInput> = {
    branch: (branches[0]?.slug ?? 'hardware') as BranchSlug,
    farm_section: null,
    txn_date: todayIso(),
    cash_account: 'cash_drawer',
    voucher_type: null,
    supplier_id: null,
    payee: '',
    reference_number: '',
    description: '',
    ...(kind === 'expense' ? { expense_type: undefined } : {}),
  }

  const editDefaults: DefaultValues<DisbursementInput> | null = editRow
    ? {
        branch: editRow.branch as BranchSlug,
        farm_section: editRow.farm_section as DisbursementInput['farm_section'],
        txn_date: editRow.txn_date,
        amount: editRow.amount,
        cash_account: editRow.cash_account,
        voucher_type: editRow.voucher?.type ?? null,
        supplier_id: editRow.supplier_id,
        payee: editRow.supplier_id ? '' : (editRow.voucher?.payee ?? ''),
        reference_number: editRow.reference_number ?? '',
        description: editRow.description ?? '',
        expense_type: editRow.expense_type,
      }
    : null

  const schema = kind === 'expense' ? expenseSchema : purchaseSchema

  const columns: ColumnsType<Disbursement> = [
    { title: 'Date', dataIndex: 'txn_date', width: 120, render: formatDate },
    { title: 'Branch', dataIndex: 'branch', render: branchName },
    {
      title: 'Payee',
      key: 'payee',
      render: (_, r) => r.voucher?.payee ?? r.supplier?.name ?? '—',
    },
    ...(kind === 'expense'
      ? [
          {
            title: 'Expense type',
            dataIndex: 'expense_type',
            render: (t: Disbursement['expense_type']) => (t ? labels.expenseType[t] : '—'),
          },
        ]
      : []),
    { title: 'Amount', dataIndex: 'amount', align: 'right', render: (v: number) => formatMoney(v) },
    { title: 'Reference', dataIndex: 'reference_number', render: (v: string | null) => v || '—' },
    {
      title: 'Voucher no.',
      key: 'voucher_no',
      width: 190,
      // Offline-queued rows have no voucher yet — the number arrives on sync.
      render: (_, r) => r.voucher?.voucher_no ?? '—',
    },
    {
      title: 'Voucher status',
      key: 'voucher_status',
      render: (_, r) =>
        r.voucher ? (
          <Space>
            <Tag color={tagColors.voucherStatus[r.voucher.status]}>
              {labels.voucherStatus[r.voucher.status]}
            </Tag>
            {r.voucher.printed ? <Tag>Printed</Tag> : null}
          </Space>
        ) : (
          <Tag>Syncing</Tag>
        ),
    },
    ...(permissions.isManager
      ? [
          {
            title: 'User',
            key: 'user',
            render: (_: unknown, r: Disbursement) => {
              const u = r.created_by ? userById.get(r.created_by) : undefined
              return u ? u.full_name || u.username : '—'
            },
          },
        ]
      : []),
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      align: 'center',
      render: (_, r) => (
        <span className="tartar-row-actions">
          <RequirePermission can="encodeTransactions" fallback={null}>
            <Tooltip title={isLocked(r) ? 'Locked — voucher approved/printed' : 'Edit'}>
              <span>
                <Button
                  className="tartar-icon-btn"
                  icon={<EditOutlined />}
                  aria-label="Edit record"
                  disabled={isLocked(r)}
                  onClick={() => openModal(editKey, r.id)}
                />
              </span>
            </Tooltip>
          </RequirePermission>
          <Tooltip title="Edit history">
            <Button
              className="tartar-icon-btn"
              icon={<HistoryOutlined />}
              aria-label="Edit history"
              onClick={() => openModal(historyKey, r.id)}
            />
          </Tooltip>
          <RequirePermission can="isManager" fallback={null}>
            {isLocked(r) ? null : (
              <Popconfirm title="Delete this record and its voucher?" onConfirm={() => void remove.mutate(r.id)}>
                <Tooltip title="Delete record">
                  <Button className="tartar-icon-btn" danger icon={<DeleteOutlined />} aria-label="Delete record" />
                </Tooltip>
              </Popconfirm>
            )}
          </RequirePermission>
        </span>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        extra={
          <RequirePermission can="encodeTransactions" fallback={null}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(formKey)}>
              Record {title.toLowerCase().replace(/s$/, '')}
            </Button>
          </RequirePermission>
        }
      />

      <LedgerFilterBar />

      <SectionCard title={`All ${title}`} subtitle="Each record carries its auto-generated voucher" flush>
        <DataTable<Disbursement>
          columns={columns}
          data={rows}
          loading={list.loading}
          emptyText="No records match the filters"
        />
      </SectionCard>

      <EntityFormModal<DisbursementInput>
        open={formModal.open}
        title={`Record ${title.toLowerCase().replace(/s$/, '')}`}
        fields={fields}
        schema={schema}
        defaultValues={createDefaults}
        submitting={create.loading}
        submitText="Record"
        onSubmit={(v) => void create.mutate(v)}
        onClose={() => closeModal(formKey)}
      />

      {editDefaults ? (
        <EntityFormModal<DisbursementInput>
          open={editModal.open}
          title={`Edit ${title.toLowerCase().replace(/s$/, '')}`}
          fields={fields}
          schema={schema}
          defaultValues={editDefaults}
          submitting={update.loading}
          onSubmit={(v) => {
            if (editRow) void update.mutate({ id: editRow.id, input: v })
          }}
          onClose={() => closeModal(editKey)}
        />
      ) : null}

      <Modal
        title="Edit history"
        open={historyModal.open}
        onCancel={() => closeModal(historyKey)}
        footer={null}
        width={640}
      >
        {historyRow ? (
          <Typography.Paragraph type="secondary">
            {labels.transactionType[historyRow.type]} · {formatMoney(historyRow.amount)} ·{' '}
            {formatDate(historyRow.txn_date)}
          </Typography.Paragraph>
        ) : null}
        {(audit.data ?? []).length === 0 && !audit.loading ? (
          <Typography.Text type="secondary">No edits recorded.</Typography.Text>
        ) : null}
        {(audit.data ?? []).map((entry) => {
          const editor = entry.edited_by ? userById.get(entry.edited_by) : undefined
          return (
            <div key={entry.id} className="tartar-audit-entry">
              <Typography.Text strong>{formatDateTime(entry.edited_at)}</Typography.Text>{' '}
              <Typography.Text type="secondary">
                by {editor ? editor.full_name || editor.username : '—'}
              </Typography.Text>
              <ul className="tartar-audit-changes">
                {Object.entries(entry.changes).map(([field, change]) => (
                  <li key={field}>
                    <Typography.Text code>{field.replaceAll('_', ' ')}</Typography.Text>{' '}
                    {String(change.old ?? '—')} → {String(change.new ?? '—')}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </Modal>
    </>
  )
}
