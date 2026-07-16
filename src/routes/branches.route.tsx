import { createRoute, redirect } from '@tanstack/react-router'
import { Button, Popconfirm, Space, Tag } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { DefaultValues } from 'react-hook-form'
import { appLayoutRoute } from './app.route'
import { PageHeader } from '../components/PageHeader'
import { DataTable } from '../components/DataTable'
import { EntityFormModal } from '../components/form/EntityFormModal'
import type { FieldConfig } from '../components/form/FormField'
import { useQuery } from '../hooks/useQuery'
import { useMutation } from '../hooks/useMutation'
import { useBranches } from '../hooks/useReferenceData'
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
  ]
  const createDefaults: DefaultValues<BranchInput> = { name: '', sort: nextSort }
  const editDefaults: DefaultValues<BranchInput> = {
    name: editing?.name ?? '',
    sort: editing?.sort ?? nextSort,
  }

  const columns: ColumnsType<Branch> = [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Slug', dataIndex: 'slug', width: 160, render: (v: string) => <Tag>{v}</Tag> },
    { title: 'Order', dataIndex: 'sort', width: 90 },
    {
      title: 'Status',
      dataIndex: 'active',
      width: 120,
      render: (active: boolean) => (active ? <Tag color="green">Active</Tag> : <Tag>Archived</Tag>),
    },
    {
      title: '',
      key: 'actions',
      width: 200,
      render: (_, b) => (
        <Space>
          <Button type="link" size="small" onClick={() => openModal(EDIT, b.slug)}>
            Edit
          </Button>
          {b.active ? (
            <Popconfirm
              title="Archive this branch?"
              description="It is hidden from selectors but its history is kept."
              onConfirm={() => void setActive.mutate({ slug: b.slug, active: false })}
            >
              <Button type="link" danger size="small">
                Archive
              </Button>
            </Popconfirm>
          ) : (
            <Button
              type="link"
              size="small"
              onClick={() => void setActive.mutate({ slug: b.slug, active: true })}
            >
              Restore
            </Button>
          )}
        </Space>
      ),
    },
  ]

  // --- Financial monitoring (unchanged) — scoped to active branches ----------
  const { branches } = useBranches()
  const monitor = useQuery(
    `branch-monitor:${branches.map((b) => b.slug).join(',')}`,
    () => dashboardService.getBranchMonitor(branches),
    { enabled: branches.length > 0 },
  )
  const monitorColumns: ColumnsType<BranchMonitorRow> = [
    { title: 'Branch', dataIndex: 'branchName' },
    { title: 'Cash Balance', dataIndex: 'cashBalance', align: 'right', render: (v: number) => formatMoney(v) },
    { title: 'Sales', dataIndex: 'sales', align: 'right', render: (v: number) => formatMoney(v) },
    { title: 'Expenses', dataIndex: 'expenses', align: 'right', render: (v: number) => formatMoney(v) },
    { title: 'Receivables', dataIndex: 'receivables', align: 'right', render: (v: number) => formatMoney(v) },
    { title: 'Payables', dataIndex: 'payables', align: 'right', render: (v: number) => formatMoney(v) },
  ]

  return (
    <>
      <PageHeader
        title="Branches"
        subtitle="Add, rename, re-order and archive business units"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(CREATE)}>
            Add branch
          </Button>
        }
      />
      <DataTable<Branch>
        columns={columns}
        data={allBranches}
        loading={branchList.loading}
        rowKey="slug"
        emptyText="No branches yet — add your first one"
      />

      <PageHeader
        title="Branch Monitoring"
        subtitle="Cash, sales, expenses, receivables and payables per branch"
      />
      <DataTable<BranchMonitorRow>
        columns={monitorColumns}
        data={monitor.data ?? []}
        loading={monitor.loading}
        rowKey="branch"
        emptyText="No branch data"
      />

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
