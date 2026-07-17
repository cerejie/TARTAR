import { Button, Col, Row, Tag } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { PageHeader } from '../PageHeader'
import { SectionCard } from '../SectionCard'
import { StatCard } from '../StatCard'
import { DataTable } from '../DataTable'
import { LedgerFilterBar } from '../LedgerFilterBar'
import { STATUS_COLOR } from './LedgerManager'
import { useQuery } from '../../hooks/useQuery'
import { usePermissions } from '../../hooks/usePermissions'
import { useBranches } from '../../hooks/useReferenceData'
import { useBranchScope, scopedFilters } from '../../hooks/useBranchScope'
import { useUiStore } from '../../stores/ui.store'
import { receivablesService } from '../../services/ledger.service'
import * as usersService from '../../services/users.service'
import { labels, type Receivable } from '../../models'
import { formatDate, formatMoney } from '../../utils/format'

/**
 * Customer Ledger — every receivable of one customer on the Receivables page
 * (opened via the picker modal, closed with "Back to Receivables"). Summary
 * figures are computed from the receivable rows, never stored (build spec §9
 * lifecycle unchanged; this is a read-only view over the same data).
 */
export function CustomerLedgerView() {
  const customer = useUiStore((s) => s.ledgerCustomer)
  const setLedgerCustomer = useUiStore((s) => s.setLedgerCustomer)
  const filters = useUiStore((s) => s.filters)
  const permissions = usePermissions()
  const { branches } = useBranches()
  const { branch: scopeBranch } = useBranchScope()

  const effectiveFilters = scopedFilters(filters, scopeBranch)
  const ledgerId = customer ? (customer.customerId ?? customer.customerName) : ''
  const listKey = `receivables:ledger:${ledgerId}:${JSON.stringify(effectiveFilters)}`
  const list = useQuery(
    listKey,
    () => receivablesService.getCustomerLedger(customer!, effectiveFilters),
    { enabled: !!customer },
  )

  // Summary comes from the unfiltered per-customer aggregation so the filter
  // bar narrows the table without changing the customer's true balance.
  const summaries = useQuery('receivables:customers', receivablesService.getCustomersWithReceivables)
  const summary = (summaries.data ?? []).find(
    (c) => (c.customerId ?? c.customerName) === ledgerId,
  )
  const lastPayment = useQuery(
    `receivables:last-payment:${customer?.customerId ?? 'none'}`,
    () => receivablesService.getCustomerLastPayment(customer?.customerId ?? null),
    { enabled: !!customer?.customerId },
  )

  // Who encoded each row — manager-gated, same as the Transactions page (RLS
  // only lets managers read other users' rows).
  const users = useQuery('users', () => usersService.listUsers(), { enabled: permissions.isManager })
  const userById = new Map((users.data ?? []).map((u) => [u.id, u]))

  if (!customer) return null

  const rows = list.data ?? []
  const branchName = (slug: string) => branches.find((b) => b.slug === slug)?.name ?? slug
  const isOverdue = (r: Receivable) => r.status !== 'paid' && r.due_date < dayjs().format('YYYY-MM-DD')

  const columns: ColumnsType<Receivable> = [
    { title: 'Date', dataIndex: 'created_at', width: 130, render: (v: string) => formatDate(v) },
    { title: 'Due date', dataIndex: 'due_date', width: 130, render: (v: string) => formatDate(v) },
    { title: 'Branch', dataIndex: 'branch', render: branchName },
    { title: 'Reference', dataIndex: 'reference_number', render: (v: string | null) => v || '—' },
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
      render: (s: Receivable['status'], r) =>
        isOverdue(r) ? (
          <Tag color="red">Overdue</Tag>
        ) : (
          <Tag color={STATUS_COLOR[s]}>{labels.ledgerStatus[s]}</Tag>
        ),
    },
    ...(permissions.isManager
      ? [
          {
            title: 'Created by',
            key: 'created_by',
            render: (_: unknown, r: Receivable) => {
              const u = r.created_by ? userById.get(r.created_by) : undefined
              return u ? u.full_name || u.username : '—'
            },
          },
        ]
      : []),
  ]

  return (
    <>
      <PageHeader
        title={customer.customerName}
        subtitle="Customer ledger — all receivable transactions"
        extra={
          <Button icon={<ArrowLeftOutlined />} onClick={() => setLedgerCustomer(null)}>
            Back to Receivables
          </Button>
        }
      />

      <Row gutter={[16, 16]} className="tartar-stat-grid">
        <Col xs={12} md={6}>
          <StatCard
            title="Outstanding balance"
            value={summary?.outstanding ?? 0}
            loading={summaries.loading}
            tone={summary && summary.outstanding > 0 ? 'negative' : 'positive'}
          />
        </Col>
        <Col xs={12} md={6}>
          <StatCard
            title="Unpaid transactions"
            value={summary?.unpaidCount ?? 0}
            loading={summaries.loading}
            raw
          />
        </Col>
        <Col xs={12} md={6}>
          <StatCard
            title="Last payment"
            value={formatDate(lastPayment.data ?? null)}
            loading={lastPayment.loading}
            raw
          />
        </Col>
        <Col xs={12} md={6}>
          <StatCard
            title="Last transaction"
            value={formatDate(summary?.lastTransactionAt ?? null)}
            loading={summaries.loading}
            raw
          />
        </Col>
      </Row>

      <LedgerFilterBar showStatus />

      <SectionCard title="Ledger" subtitle="Matching the current filters" flush>
        <DataTable<Receivable>
          columns={columns}
          data={rows}
          loading={list.loading}
          emptyText="No receivables match the filters"
        />
      </SectionCard>
    </>
  )
}
