import { Button, Col, Flex, Row, Tag, Tooltip, Typography } from 'antd'
import {
  ArrowLeftOutlined,
  DollarOutlined,
  InfoCircleOutlined,
  PrinterOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { StatCard } from '../StatCard'
import { DataTable } from '../DataTable'
import { LedgerFilterBar } from '../LedgerFilterBar'
import { RequirePermission } from '../RequirePermission'
import { PaymentsPanel } from '../payments/PaymentsPanel'
import { PaymentAllocationModal } from './PaymentAllocationModal'
import { CUSTOMER_DETAILS_FORM, CUSTOMER_INFO_MODAL, CustomerInfoModal } from './CustomerDetails'
import { useQuery } from '../../hooks/useQuery'
import { useMutation } from '../../hooks/useMutation'
import { usePermissions } from '../../hooks/usePermissions'
import { useBranches } from '../../hooks/useReferenceData'
import { useBranchScope, scopedFilters } from '../../hooks/useBranchScope'
import { useUiStore, selectModal } from '../../stores/ui.store'
import { useAuthStore } from '../../stores/auth.store'
import { receivablesService } from '../../services/ledger.service'
import * as paymentsService from '../../services/payments.service'
import * as usersService from '../../services/users.service'
import { isLedgerOverdue, labels, tagColors, type Receivable } from '../../models'
import { formatDate, formatMoney } from '../../utils/format'
import { printStatement } from '../../utils/print'

/**
 * Customer Ledger — the detail pane inside the Customer Ledger modal. Shows the
 * selected customer's summary + every receivable, with pane-scoped filters.
 * Employees tick receivables and record one payment across them (pending
 * manager verification); the statement button prints the full ledger.
 */
const PAY_MODAL = 'receivable-ledger-payment'

export function CustomerLedgerView() {
  const customer = useUiStore((s) => s.ledgerCustomer)
  const closeLedgerDetail = useUiStore((s) => s.closeLedgerDetail)
  const filters = useUiStore((s) => s.customerLedgerFilters)
  const selection = useUiStore((s) => s.ledgerSelection)
  const setSelection = useUiStore((s) => s.setLedgerSelection)
  const openModal = useUiStore((s) => s.openModal)
  const closeModal = useUiStore((s) => s.closeModal)
  const payModal = useUiStore(selectModal(PAY_MODAL))
  const infoModal = useUiStore(selectModal(CUSTOMER_INFO_MODAL))
  const createdBy = useAuthStore((s) => s.user?.id ?? null)
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

  // Same key as the payments panel below, so the statement prints from cache.
  const paymentsKey = `payments:receivable:${ledgerId}`
  const payments = useQuery(
    paymentsKey,
    () =>
      paymentsService.listPayments(
        'receivable',
        customer?.customerId
          ? { partyId: customer.customerId }
          : { partyName: customer?.customerName ?? '' },
      ),
    { enabled: !!customer },
  )

  // Who encoded each row — manager-gated, same as the Transactions page (RLS
  // only lets managers read other users' rows).
  const users = useQuery('users', () => usersService.listUsers(), { enabled: permissions.isManager })
  const userById = new Map((users.data ?? []).map((u) => [u.id, u]))

  const rows = list.data ?? []
  const selectedRows = rows.filter((r) => selection.includes(r.id) && r.status !== 'paid')

  const recordPayment = useMutation(
    (input: paymentsService.RecordPaymentInput) =>
      paymentsService.recordPayment('receivable', input, createdBy),
    {
      successMessage: permissions.isManager
        ? 'Payment recorded'
        : 'Payment recorded — pending verification',
      invalidate: ['receivables', 'payments'],
      onSuccess: () => {
        closeModal(PAY_MODAL)
        setSelection([])
      },
    },
  )

  if (!customer) return null

  const branchName = (slug: string) => branches.find((b) => b.slug === slug)?.name ?? slug
  const isOverdue = isLedgerOverdue

  const columns: ColumnsType<Receivable> = [
    { title: 'Date', dataIndex: 'created_at', width: 120, render: (v: string) => formatDate(v) },
    { title: 'Due date', dataIndex: 'due_date', width: 120, render: (v: string) => formatDate(v) },
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
          <Tag color={tagColors.ledgerStatus[s]}>{labels.ledgerStatus[s]}</Tag>
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
      <Flex className="tartar-ledger-head" align="center" gap="middle" wrap justify="space-between">
        <Flex align="center" gap="middle">
          <Button icon={<ArrowLeftOutlined />} onClick={closeLedgerDetail}>
            Back to customers
          </Button>
          <Typography.Title level={4} className="tartar-card-title">
            {customer.customerName}
          </Typography.Title>
        </Flex>
        <Flex align="center" gap="small">
          <Tooltip title="Customer information">
            <Button
              icon={<InfoCircleOutlined />}
              aria-label={`Information for ${customer.customerName}`}
              onClick={() => openModal(CUSTOMER_INFO_MODAL)}
            />
          </Tooltip>
          <Button
            icon={<PrinterOutlined />}
            onClick={() =>
              printStatement(customer, summary, rows, payments.data ?? [], branchName)
            }
          >
            Print statement
          </Button>
          <RequirePermission can="encodeTransactions" fallback={null}>
            <Tooltip title={selectedRows.length ? undefined : 'Tick the receivables being paid first'}>
              <span>
                <Button
                  type="primary"
                  icon={<DollarOutlined />}
                  disabled={selectedRows.length === 0}
                  onClick={() => openModal(PAY_MODAL)}
                >
                  Record payment
                </Button>
              </span>
            </Tooltip>
          </RequirePermission>
        </Flex>
      </Flex>

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

      <LedgerFilterBar scope="customer-ledger" showBranch={false} showStatus />

      <DataTable<Receivable>
        columns={columns}
        data={rows}
        loading={list.loading}
        pageSize={10}
        emptyText="No receivables match the filters"
        rowClassName={(r) => (isOverdue(r) ? 'tartar-row-overdue' : '')}
        rowSelection={{
          selectedRowKeys: selection,
          onChange: (keys) => setSelection(keys as string[]),
          getCheckboxProps: (r) => ({ disabled: r.status === 'paid' }),
        }}
      />

      <Typography.Title level={5} className="tartar-ledger-section">
        Payments
      </Typography.Title>
      <PaymentsPanel
        kind="receivable"
        party={{ partyId: customer.customerId, partyName: customer.customerName }}
        compact
      />

      {/* The details form itself lives in CustomerLedgerModal, keyed on the
          ledger identity, so the list pane and this pane share one instance. */}
      <CustomerInfoModal
        open={infoModal.open}
        customer={customer}
        onClose={() => closeModal(CUSTOMER_INFO_MODAL)}
        onEdit={
          permissions.encodeTransactions
            ? () => {
                closeModal(CUSTOMER_INFO_MODAL)
                openModal(CUSTOMER_DETAILS_FORM, ledgerId)
              }
            : undefined
        }
      />

      <PaymentAllocationModal
        open={payModal.open}
        customer={customer}
        rows={selectedRows}
        submitting={recordPayment.loading}
        onSubmit={(input) => void recordPayment.mutate(input)}
        onClose={() => closeModal(PAY_MODAL)}
      />
    </>
  )
}
