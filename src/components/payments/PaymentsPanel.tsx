import { Button, Popconfirm, Space, Tag, Tooltip } from 'antd'
import { CheckOutlined, CloseOutlined, UserOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { SectionCard } from '../SectionCard'
import { DataTable } from '../DataTable'
import { NameCell } from '../TableDecor'
import { RequirePermission } from '../RequirePermission'
import { useQuery } from '../../hooks/useQuery'
import { useMutation } from '../../hooks/useMutation'
import { usePermissions } from '../../hooks/usePermissions'
import { useAuthStore } from '../../stores/auth.store'
import * as paymentsService from '../../services/payments.service'
import * as usersService from '../../services/users.service'
import { paymentStatusLabels, tagColors, type LedgerPayment, type PaymentKind } from '../../models'
import { formatDate, formatMoney } from '../../utils/format'

/**
 * Payment history + verification queue (client decisions 2026-07). Payments
 * apply to balances immediately; managers confirm them here — "Verify" on the
 * receivable side, "Approve" on the payable side — or reject, which reverses
 * the balances but keeps the row for audit. Reused by the Receivables and
 * Payables pages (all parties) and the Customer Ledger pane (one party).
 */
interface PaymentsPanelProps {
  kind: PaymentKind
  /** Restrict to one party (the customer-ledger pane). */
  party?: { partyId: string | null; partyName: string }
  /** Compact table (inside the ledger modal). */
  compact?: boolean
}

export function PaymentsPanel({ kind, party, compact }: PaymentsPanelProps) {
  const permissions = usePermissions()
  const verifierId = useAuthStore((s) => s.user?.id ?? null)
  const verb = kind === 'receivable' ? 'Verify' : 'Approve'
  const statusLabels = paymentStatusLabels(kind)
  const ledgerKey = kind === 'receivable' ? 'receivables' : 'payables'

  const listKey = `payments:${kind}:${party ? (party.partyId ?? party.partyName) : 'all'}`
  const list = useQuery(listKey, () =>
    paymentsService.listPayments(
      kind,
      party ? (party.partyId ? { partyId: party.partyId } : { partyName: party.partyName }) : {},
    ),
  )
  const users = useQuery('users', () => usersService.listUsers(), { enabled: permissions.isManager })
  const userById = new Map((users.data ?? []).map((u) => [u.id, u]))

  const invalidate = ['payments', ledgerKey]
  const verify = useMutation((id: string) => paymentsService.verifyPayment(id, verifierId), {
    successMessage: `Payment ${kind === 'receivable' ? 'verified' : 'approved'}`,
    invalidate,
  })
  const reject = useMutation((id: string) => paymentsService.rejectPayment(id), {
    successMessage: 'Payment rejected — balances restored',
    invalidate,
  })

  const columns: ColumnsType<LedgerPayment> = [
    { title: 'Date', dataIndex: 'paid_at', width: 120, render: (v: string) => formatDate(v) },
    ...(party
      ? []
      : [
          {
            title: kind === 'receivable' ? 'Customer' : 'Supplier',
            dataIndex: 'party_name',
            render: (name: string) => <NameCell icon={<UserOutlined />}>{name}</NameCell>,
          },
        ]),
    { title: 'Amount', dataIndex: 'amount', align: 'right', render: (v: number) => formatMoney(v) },
    { title: 'Reference', dataIndex: 'reference_number', render: (v: string | null) => v || '—' },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (s: LedgerPayment['status'], p) => {
        const verifier = p.verified_by ? userById.get(p.verified_by) : undefined
        const tag = <Tag color={tagColors.paymentStatus[s]}>{statusLabels[s]}</Tag>
        return verifier && s !== 'pending' ? (
          <Tooltip title={`${verifier.full_name || verifier.username} · ${formatDate(p.verified_at)}`}>
            {tag}
          </Tooltip>
        ) : (
          tag
        )
      },
    },
    ...(permissions.isManager
      ? [
          {
            title: 'Recorded by',
            key: 'created_by',
            render: (_: unknown, p: LedgerPayment) => {
              const u = p.created_by ? userById.get(p.created_by) : undefined
              return u ? u.full_name || u.username : '—'
            },
          },
        ]
      : []),
    {
      title: '',
      key: 'actions',
      width: 190,
      render: (_, p) => (
        <RequirePermission can="isManager" fallback={null}>
          <Space>
            {p.status === 'pending' ? (
              <Button
                type="link"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => void verify.mutate(p.id)}
              >
                {verb}
              </Button>
            ) : null}
            {p.status !== 'rejected' ? (
              <Popconfirm
                title="Reject this payment and restore the balances?"
                onConfirm={() => void reject.mutate(p.id)}
              >
                <Button type="link" danger size="small" icon={<CloseOutlined />}>
                  Reject
                </Button>
              </Popconfirm>
            ) : null}
          </Space>
        </RequirePermission>
      ),
    },
  ]

  const table = (
    <DataTable<LedgerPayment>
      columns={columns}
      data={list.data ?? []}
      loading={list.loading}
      pageSize={compact ? 5 : 10}
      emptyText="No payments recorded yet"
    />
  )

  return compact ? (
    table
  ) : (
    <SectionCard
      title={kind === 'receivable' ? 'Customer Payments' : 'Supplier Payments'}
      subtitle={`Applied immediately — pending until a manager ${verb.toLowerCase()}s them`}
      flush
    >
      {table}
    </SectionCard>
  )
}
