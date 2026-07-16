import { createRoute } from '@tanstack/react-router'
import { Button, Space, Tag } from 'antd'
import { CheckOutlined, CloseOutlined, PlusOutlined, PrinterOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { DefaultValues } from 'react-hook-form'
import { appLayoutRoute } from './app.route'
import { PageHeader } from '../components/PageHeader'
import { DataTable } from '../components/DataTable'
import { EntityFormModal } from '../components/form/EntityFormModal'
import type { FieldConfig } from '../components/form/FormField'
import { RequirePermission } from '../components/RequirePermission'
import { useQuery } from '../hooks/useQuery'
import { useMutation } from '../hooks/useMutation'
import { useBranches } from '../hooks/useReferenceData'
import { useUiStore, selectModal } from '../stores/ui.store'
import { useAuthStore } from '../stores/auth.store'
import * as vouchersService from '../services/vouchers.service'
import {
  labels,
  toOptions,
  voucherSchema,
  voucherTypeValues,
  type BranchSlug,
  type Voucher,
  type VoucherInput,
  type VoucherStatus,
} from '../models'
import { formatMoney } from '../utils/format'
import { printVoucher } from '../utils/print'

const MODAL = 'voucher-form'
const STATUS_COLOR: Record<VoucherStatus, string> = { pending: 'gold', approved: 'green', rejected: 'red' }

/** Voucher approval workflow (build spec §16). */
export const vouchersRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/vouchers',
  component: VouchersPage,
})

function VouchersPage() {
  const openModal = useUiStore((s) => s.openModal)
  const closeModal = useUiStore((s) => s.closeModal)
  const modal = useUiStore(selectModal(MODAL))
  const currentUserId = useAuthStore((s) => s.user?.id ?? null)
  const { branches } = useBranches()

  const list = useQuery('vouchers', () => vouchersService.listVouchers())

  const create = useMutation((input: VoucherInput) => vouchersService.createVoucher(input, currentUserId), {
    successMessage: 'Voucher submitted for approval',
    invalidate: ['vouchers'],
    onSuccess: () => closeModal(MODAL),
  })
  const decide = useMutation(
    (p: { id: string; approve: boolean }) => vouchersService.decideVoucher(p.id, p.approve, currentUserId),
    { successMessage: 'Voucher updated', invalidate: ['vouchers'] },
  )
  const markPrinted = useMutation((id: string) => vouchersService.markVoucherPrinted(id), {
    invalidate: ['vouchers'],
  })

  const branchName = (slug: string) => branches.find((b) => b.slug === slug)?.name ?? slug

  const handlePrint = (v: Voucher) => {
    printVoucher(v, branchName(v.branch))
    if (!v.printed) void markPrinted.mutate(v.id)
  }

  const fields: FieldConfig<VoucherInput>[] = [
    { name: 'type', label: 'Voucher type', type: 'select', options: toOptions(voucherTypeValues, labels.voucherType) },
    { name: 'branch', label: 'Branch', type: 'select', options: branches.map((b) => ({ value: b.slug, label: b.name })) },
    { name: 'payee', label: 'Payee', type: 'text' },
    { name: 'amount', label: 'Amount', type: 'number', prefix: '₱' },
    { name: 'purpose', label: 'Purpose', type: 'textarea' },
  ]

  const defaults: DefaultValues<VoucherInput> = {
    type: 'cash',
    branch: (branches[0]?.slug ?? 'hardware') as BranchSlug,
    payee: '',
    purpose: '',
  }

  const columns: ColumnsType<Voucher> = [
    { title: 'Voucher no.', dataIndex: 'voucher_no', render: (v: string | null) => v || '—', width: 130 },
    { title: 'Type', dataIndex: 'type', render: (t: Voucher['type']) => labels.voucherType[t] },
    { title: 'Branch', dataIndex: 'branch', render: branchName },
    { title: 'Payee', dataIndex: 'payee' },
    { title: 'Amount', dataIndex: 'amount', align: 'right', render: (v: number) => formatMoney(v) },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (s: VoucherStatus, r) => (
        <Space>
          <Tag color={STATUS_COLOR[s]}>{labels.voucherStatus[s]}</Tag>
          {r.printed ? <Tag>Printed</Tag> : null}
        </Space>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 240,
      render: (_, v) => (
        <Space>
          <RequirePermission can="approveVouchers" fallback={null}>
            {v.status === 'pending' ? (
              <>
                <Button
                  type="link"
                  size="small"
                  icon={<CheckOutlined />}
                  onClick={() => void decide.mutate({ id: v.id, approve: true })}
                >
                  Approve
                </Button>
                <Button
                  type="link"
                  danger
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={() => void decide.mutate({ id: v.id, approve: false })}
                >
                  Reject
                </Button>
              </>
            ) : null}
          </RequirePermission>
          <Button
            type="link"
            size="small"
            icon={<PrinterOutlined />}
            disabled={v.status !== 'approved'}
            title={v.status !== 'approved' ? 'Only approved vouchers can be printed' : undefined}
            onClick={() => handlePrint(v)}
          >
            Print
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Vouchers"
        subtitle="Employee creates → manager approves → approved vouchers can be printed"
        extra={
          <RequirePermission can="createVouchers" fallback={null}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(MODAL)}>
              New voucher
            </Button>
          </RequirePermission>
        }
      />

      <DataTable<Voucher>
        columns={columns}
        data={list.data ?? []}
        loading={list.loading}
        emptyText="No vouchers yet"
      />

      <EntityFormModal<VoucherInput>
        open={modal.open}
        title="New voucher"
        fields={fields}
        schema={voucherSchema}
        defaultValues={defaults}
        submitting={create.loading}
        submitText="Submit"
        onSubmit={(v) => void create.mutate(v)}
        onClose={() => closeModal(MODAL)}
      />
    </>
  )
}
