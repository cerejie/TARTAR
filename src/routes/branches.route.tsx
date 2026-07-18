import { createRoute, redirect } from '@tanstack/react-router'
import { Badge, Button, Popconfirm, Tag, Tooltip } from 'antd'
import {
  BankOutlined,
  DeleteOutlined,
  EditOutlined,
  FallOutlined,
  FileTextOutlined,
  PlusOutlined,
  RiseOutlined,
  ShopOutlined,
  SolutionOutlined,
  UndoOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { DefaultValues } from 'react-hook-form'
import { appLayoutRoute } from './app.route'
import { PageHeader } from '../components/PageHeader'
import { SectionCard } from '../components/SectionCard'
import { DataTable } from '../components/DataTable'
import { ColumnLabel, NameCell } from '../components/TableDecor'
import { EntityFormModal } from '../components/form/EntityFormModal'
import type { FieldConfig } from '../components/form/FormField'
import { useQuery } from '../hooks/useQuery'
import { useMutation } from '../hooks/useMutation'
import { useBranches } from '../hooks/useReferenceData'
import { useBranchScope } from '../hooks/useBranchScope'
import { useUiStore, selectModal } from '../stores/ui.store'
import { useAuthStore } from '../stores/auth.store'
import * as referenceService from '../services/reference.service'
import * as dashboardService from '../services/dashboard.service'
import { branchSchema, type Branch, type BranchInput, type BranchMonitorRow } from '../models'
import { formatMoney } from '../utils/format'

const CREATE = 'branch-create'
const EDIT = 'branch-edit'

// Refresh both the manager list and every branch selector/monitor after a write.
const INVALIDATE = ['branches', 'branches-admin', 'branch-monitor']

/** Branch management + monitoring (build spec §13). Managers only. */
export const branchesRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/branches',
  beforeLoad: () => {
    const s = useAuthStore.getState()
    const isManager = s.kind === 'superadmin' || s.user?.role === 'admin'
    if (!isManager) throw redirect({ to: '/' })
  },
  component: BranchesPage,
})

function BranchesPage() {
  const openModal = useUiStore((s) => s.openModal)
  const closeModal = useUiStore((s) => s.closeModal)
  const createModal = useUiStore(selectModal(CREATE))
  const editModal = useUiStore(selectModal(EDIT))

  // Master list (incl. archived) that the management table edits.
  const branchList = useQuery('branches-admin', referenceService.listAllBranches)
  const allBranches = branchList.data ?? []
  const editing = allBranches.find((b) => b.slug === editModal.recordId)
  const nextSort = allBranches.reduce((max, b) => Math.max(max, b.sort), 0) + 1

  const createBranch = useMutation((input: BranchInput) => referenceService.createBranch(input), {
    successMessage: 'Branch added',
    invalidate: INVALIDATE,
    onSuccess: () => closeModal(CREATE),
  })
  const updateBranch = useMutation(
    (p: { slug: string; patch: BranchInput }) => referenceService.updateBranch(p.slug, p.patch),
    { successMessage: 'Branch updated', invalidate: INVALIDATE, onSuccess: () => closeModal(EDIT) },
  )
  const setActive = useMutation(
    (p: { slug: string; active: boolean }) => referenceService.setBranchActive(p.slug, p.active),
    { successMessage: 'Branch updated', invalidate: INVALIDATE },
  )

  const formFields: FieldConfig<BranchInput>[] = [
    { name: 'name', label: 'Branch name', type: 'text', placeholder: 'e.g. LGC Poultry' },
    { name: 'sort', label: 'Sort order', type: 'number' },
    // Changing the prefix only affects newly numbered vouchers — history keeps
    // the prefix it was issued under (client decision, 2026-07).
    { name: 'voucher_prefix', label: 'Voucher prefix (3 letters)', type: 'text', placeholder: 'e.g. LGC' },
  ]
  const createDefaults: DefaultValues<BranchInput> = { name: '', sort: nextSort, voucher_prefix: '' }
  const editDefaults: DefaultValues<BranchInput> = {
    name: editing?.name ?? '',
    sort: editing?.sort ?? nextSort,
    voucher_prefix: editing?.voucher_prefix ?? '',
  }

  const columns: ColumnsType<Branch> = [
    {
      title: 'Branch Name',
      dataIndex: 'name',
      render: (name: string) => <NameCell icon={<ShopOutlined />}>{name}</NameCell>,
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      width: 160,
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
      width: 120,
      align: 'center',
      render: (_, b) => (
        <span className="tartar-row-actions">
          <Tooltip title="Edit branch">
            <Button
              className="tartar-icon-btn"
              icon={<EditOutlined />}
              aria-label={`Edit ${b.name}`}
              onClick={() => openModal(EDIT, b.slug)}
            />
          </Tooltip>
          {b.active ? (
            <Popconfirm
              title="Archive this branch?"
              description="It is hidden from selectors but its history is kept."
              onConfirm={() => void setActive.mutate({ slug: b.slug, active: false })}
            >
              {/* Archive, not delete — the tooltip and confirm copy carry that,
                  since the icon alone would imply the record is destroyed. */}
              <Tooltip title="Archive branch">
                <Button
                  className="tartar-icon-btn"
                  danger
                  icon={<DeleteOutlined />}
                  aria-label={`Archive ${b.name}`}
                />
              </Tooltip>
            </Popconfirm>
          ) : (
            <Tooltip title="Restore branch">
              <Button
                className="tartar-icon-btn"
                icon={<UndoOutlined />}
                aria-label={`Restore ${b.name}`}
                onClick={() => void setActive.mutate({ slug: b.slug, active: true })}
              />
            </Tooltip>
          )}
        </span>
      ),
    },
  ]

  // --- Financial monitoring — active branches, narrowed by the sidebar view --
  const { branches } = useBranches()
  const { branch: scopeBranch } = useBranchScope()
  const monitored = scopeBranch ? branches.filter((b) => b.slug === scopeBranch) : branches
  const monitor = useQuery(
    `branch-monitor:${monitored.map((b) => b.slug).join(',')}`,
    () => dashboardService.getBranchMonitor(monitored),
    { enabled: monitored.length > 0 },
  )
  const monitorColumns: ColumnsType<BranchMonitorRow> = [
    {
      title: <ColumnLabel icon={<BankOutlined />}>Branch</ColumnLabel>,
      dataIndex: 'branchName',
      render: (name: string) => <NameCell icon={<ShopOutlined />}>{name}</NameCell>,
    },
    {
      title: <ColumnLabel icon={<WalletOutlined />}>Cash Balance</ColumnLabel>,
      dataIndex: 'cashBalance',
      align: 'right',
      render: (v: number) => formatMoney(v),
    },
    {
      title: <ColumnLabel icon={<RiseOutlined />}>Sales</ColumnLabel>,
      dataIndex: 'sales',
      align: 'right',
      render: (v: number) => formatMoney(v),
    },
    {
      title: <ColumnLabel icon={<FallOutlined />}>Expenses</ColumnLabel>,
      dataIndex: 'expenses',
      align: 'right',
      render: (v: number) => formatMoney(v),
    },
    {
      title: <ColumnLabel icon={<SolutionOutlined />}>Receivables</ColumnLabel>,
      dataIndex: 'receivables',
      align: 'right',
      render: (v: number) => formatMoney(v),
    },
    {
      title: <ColumnLabel icon={<FileTextOutlined />}>Payables</ColumnLabel>,
      dataIndex: 'payables',
      align: 'right',
      render: (v: number) => formatMoney(v),
    },
  ]

  return (
    <>
      <PageHeader
        title="Branch Monitoring"
        subtitle="Monitor cash, sales, expenses, receivables and payables per branch"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(CREATE)}>
            Add Branch
          </Button>
        }
      />

      <SectionCard title="Branches" subtitle="Add, rename, re-order and archive business units" flush>
        <DataTable<Branch>
          columns={columns}
          data={allBranches}
          loading={branchList.loading}
          rowKey="slug"
          emptyText="No branches yet — add your first one"
        />
      </SectionCard>

      <SectionCard
        title="Branch Monitoring"
        subtitle="Cash, sales, expenses, receivables and payables per branch"
        flush
      >
        <DataTable<BranchMonitorRow>
          columns={monitorColumns}
          data={monitor.data ?? []}
          loading={monitor.loading}
          rowKey="branch"
          emptyText="No branch data"
        />
      </SectionCard>

      <EntityFormModal<BranchInput>
        open={createModal.open}
        title="Add branch"
        fields={formFields}
        schema={branchSchema}
        defaultValues={createDefaults}
        submitting={createBranch.loading}
        submitText="Add branch"
        onSubmit={(v) => void createBranch.mutate(v)}
        onClose={() => closeModal(CREATE)}
      />

      <EntityFormModal<BranchInput>
        open={editModal.open}
        title={`Edit ${editing?.name ?? 'branch'}`}
        fields={formFields}
        schema={branchSchema}
        defaultValues={editDefaults}
        submitting={updateBranch.loading}
        onSubmit={(v) => {
          if (editing) void updateBranch.mutate({ slug: editing.slug, patch: v })
        }}
        onClose={() => closeModal(EDIT)}
      />
    </>
  )
}
