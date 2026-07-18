import { Button, Popconfirm, Space, Tag, Tooltip } from 'antd'
import { DeleteOutlined, DollarOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { ReactNode } from 'react'
import type { DefaultValues, FieldValues } from 'react-hook-form'
import type { ZodType } from 'zod'
import { PageHeader } from '../PageHeader'
import { SectionCard } from '../SectionCard'
import { NameCell } from '../TableDecor'
import { DataTable } from '../DataTable'
import { LedgerFilterBar } from '../LedgerFilterBar'
import { PaymentsPanel } from '../payments/PaymentsPanel'
import { EntityFormModal } from '../form/EntityFormModal'
import type { FieldConfig } from '../form/FormField'
import { RequirePermission } from '../RequirePermission'
import { useQuery } from '../../hooks/useQuery'
import { useMutation } from '../../hooks/useMutation'
import { useBranches } from '../../hooks/useReferenceData'
import { useBranchScope, scopedFilters } from '../../hooks/useBranchScope'
import { useUiStore, selectModal } from '../../stores/ui.store'
import { useAuthStore } from '../../stores/auth.store'
import {
  isLedgerOverdue,
  labels,
  settlementSchema,
  tagColors,
  type LedgerStatus,
  type SettlementInput,
} from '../../models'
import { formatDate, formatMoney } from '../../utils/format'

/**
 * One component that runs both the Receivables and Payables screens (build spec
 * §9 — identical lifecycle). Handles create, "record payment" (settle), delete,
 * filtering, and overdue/near-due tagging (§14). The two routes just pass config.
 */
export interface LedgerRow {
  id: string
  branch: string
  amount: number
  paid_amount: number
  due_date: string
  reference_number: string | null
  status: LedgerStatus
}

interface LedgerManagerProps<Row extends LedgerRow, Input extends FieldValues> {
  queryKey: 'receivables' | 'payables'
  title: string
  subtitle: string
  partyLabel: string
  nameOf: (row: Row) => string
  list: (filters: object) => Promise<Row[]>
  create: (input: Input, createdBy: string | null) => Promise<{ queued: boolean }>
  /** Records a verifiable payment (payments.service) — not a raw balance write. */
  settle: (row: Row, amount: number, createdBy: string | null) => Promise<{ queued: boolean }>
  remove: (id: string) => Promise<{ queued: boolean }>
  schema: ZodType<Input>
  fields: FieldConfig<Input>[]
  defaults: DefaultValues<Input>
  /** Extra page-header actions rendered before the "Add" button. */
  headerActions?: ReactNode
}

const STATUS_COLOR: Record<LedgerStatus, string> = tagColors.ledgerStatus

export function LedgerManager<Row extends LedgerRow, Input extends FieldValues>(
  props: LedgerManagerProps<Row, Input>,
) {
  const formKey = `${props.queryKey}-form`
  const settleKey = `${props.queryKey}-settle`

  const filters = useUiStore((s) => s.filters)
  const openModal = useUiStore((s) => s.openModal)
  const closeModal = useUiStore((s) => s.closeModal)
  const formModal = useUiStore(selectModal(formKey))
  const settleModal = useUiStore(selectModal(settleKey))
  const createdBy = useAuthStore((s) => s.user?.id ?? null)
  const { branches } = useBranches()
  const { branch: scopeBranch } = useBranchScope()

  const effectiveFilters = scopedFilters(filters, scopeBranch)
  const listKey = `${props.queryKey}:${JSON.stringify(effectiveFilters)}`
  const list = useQuery(listKey, () => props.list(effectiveFilters))
  const rows = list.data ?? []

  const create = useMutation((input: Input) => props.create(input, createdBy), {
    successMessage: `${props.title} added`,
    invalidate: [props.queryKey],
    onSuccess: () => closeModal(formKey),
  })
  const settle = useMutation(
    (payload: { row: Row; amount: number }) => props.settle(payload.row, payload.amount, createdBy),
    {
      successMessage: 'Payment recorded',
      invalidate: [props.queryKey, 'payments'],
      onSuccess: () => closeModal(settleKey),
    },
  )
  const remove = useMutation((id: string) => props.remove(id), {
    successMessage: `${props.title} deleted`,
    invalidate: [props.queryKey],
  })

  const settleRow = rows.find((r) => r.id === settleModal.recordId)
  const branchName = (slug: string) => branches.find((b) => b.slug === slug)?.name ?? slug
  const isOverdue = (r: Row) => isLedgerOverdue(r)

  const columns: ColumnsType<Row> = [
    {
      title: 'Due date',
      dataIndex: 'due_date',
      width: 190,
      render: (v: string, r) => (
        <Space>
          {formatDate(v)}
          {isOverdue(r) ? <Tag color="red">Overdue</Tag> : null}
        </Space>
      ),
    },
    {
      title: props.partyLabel,
      key: 'name',
      render: (_, r) => <NameCell icon={<UserOutlined />}>{props.nameOf(r)}</NameCell>,
    },
    { title: 'Branch', dataIndex: 'branch', render: branchName },
    { title: 'Amount', dataIndex: 'amount', align: 'right', render: (v: number) => formatMoney(v) },
    { title: 'Paid', dataIndex: 'paid_amount', align: 'right', render: (v: number) => formatMoney(v) },
    {
      title: 'Balance',
      key: 'balance',
      align: 'right',
      render: (_, r) => formatMoney(Number(r.amount) - Number(r.paid_amount)),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (s: LedgerStatus) => <Tag color={STATUS_COLOR[s]}>{labels.ledgerStatus[s]}</Tag>,
    },
    { title: 'Reference', dataIndex: 'reference_number', render: (v: string | null) => v || '—' },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, r) => (
        <span className="tartar-row-actions">
          <Tooltip title={r.status === 'paid' ? 'Fully paid' : 'Record payment'}>
            {/* Tooltip needs a live child to hover, so the span keeps the
                disabled button's title reachable. */}
            <span>
              <Button
                className="tartar-icon-btn"
                icon={<DollarOutlined />}
                aria-label="Record payment"
                disabled={r.status === 'paid'}
                onClick={() => openModal(settleKey, r.id)}
              />
            </span>
          </Tooltip>
          <RequirePermission can="isManager" fallback={null}>
            <Popconfirm title="Delete this record?" onConfirm={() => void remove.mutate(r.id)}>
              <Tooltip title="Delete record">
                <Button className="tartar-icon-btn" danger icon={<DeleteOutlined />} aria-label="Delete record" />
              </Tooltip>
            </Popconfirm>
          </RequirePermission>
        </span>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title={props.title}
        subtitle={props.subtitle}
        extra={
          <Space>
            {props.headerActions}
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(formKey)}>
              Add {props.partyLabel.toLowerCase()} record
            </Button>
          </Space>
        }
      />

      <LedgerFilterBar />

      {/* The page header already carries `props.title`/`props.subtitle`, so the
          card names the *contents* instead of repeating them. */}
      <SectionCard title={`All ${props.title}`} subtitle="Matching the current filters" flush>
        <DataTable<Row>
          columns={columns}
          data={rows}
          loading={list.loading}
          emptyText="No records match the filters"
          rowClassName={(r) => (isOverdue(r) ? 'tartar-row-overdue' : '')}
        />
      </SectionCard>

      {/* Payment history + the manager verification/approval queue. */}
      <PaymentsPanel kind={props.queryKey === 'receivables' ? 'receivable' : 'payable'} />

      <EntityFormModal<Input>
        open={formModal.open}
        title={`Add ${props.title.toLowerCase()} record`}
        fields={props.fields}
        schema={props.schema}
        defaultValues={props.defaults}
        submitting={create.loading}
        onSubmit={(v) => void create.mutate(v)}
        onClose={() => closeModal(formKey)}
      />

      <EntityFormModal<SettlementInput>
        open={settleModal.open}
        title="Record payment"
        fields={[{ name: 'amount', label: 'Payment amount', type: 'number', prefix: '₱' }]}
        schema={settlementSchema}
        defaultValues={{ amount: undefined as unknown as number }}
        submitting={settle.loading}
        submitText="Record payment"
        onSubmit={(v) => {
          if (settleRow) void settle.mutate({ row: settleRow, amount: v.amount })
        }}
        onClose={() => closeModal(settleKey)}
      />
    </>
  )
}
