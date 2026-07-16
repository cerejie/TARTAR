import { createRoute, redirect } from '@tanstack/react-router'
import { Button, Popconfirm, Space, Tag, Tooltip } from 'antd'
import { DeleteOutlined, EditOutlined, KeyOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { DefaultValues } from 'react-hook-form'
import { appLayoutRoute } from './app.route'
import { PageHeader } from '../components/PageHeader'
import { SectionCard } from '../components/SectionCard'
import { NameCell } from '../components/TableDecor'
import { DataTable } from '../components/DataTable'
import { EntityFormModal } from '../components/form/EntityFormModal'
import type { FieldConfig } from '../components/form/FormField'
import { useQuery } from '../hooks/useQuery'
import { useMutation } from '../hooks/useMutation'
import { usePermissions } from '../hooks/usePermissions'
import { useBranches } from '../hooks/useReferenceData'
import { useUiStore, selectModal } from '../stores/ui.store'
import { useAuthStore } from '../stores/auth.store'
import * as usersService from '../services/users.service'
import * as authService from '../services/auth.service'
import {
  approvalStatusValues,
  createUserSchema,
  labels,
  resetPasswordSchema,
  toOptions,
  updateUserSchema,
  userRoleValues,
  type ApprovalStatus,
  type BranchSlug,
  type CreateUserInput,
  type ResetPasswordInput,
  type UpdateUserInput,
  type User,
  type UserRole,
} from '../models'
import { formatDate } from '../utils/format'

const CREATE = 'user-create'
const EDIT = 'user-edit'
const RESET = 'user-reset'

const APPROVAL_COLOR: Record<ApprovalStatus, string> = { pending: 'gold', approved: 'green', rejected: 'red' }

/** Users management (build spec §4). Managers only. */
export const usersRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/users',
  beforeLoad: () => {
    const s = useAuthStore.getState()
    const isManager = s.kind === 'superadmin' || s.user?.role === 'admin'
    if (!isManager) throw redirect({ to: '/' })
  },
  component: UsersPage,
})

function UsersPage() {
  const permissions = usePermissions()
  const openModal = useUiStore((s) => s.openModal)
  const closeModal = useUiStore((s) => s.closeModal)
  const createModal = useUiStore(selectModal(CREATE))
  const editModal = useUiStore(selectModal(EDIT))
  const resetModal = useUiStore(selectModal(RESET))
  const { branches } = useBranches()

  const list = useQuery('users', () => usersService.listUsers())
  const users = list.data ?? []
  const editing = users.find((u) => u.id === editModal.recordId)

  // superAdmin may assign any role; Admin only non-admin roles (build spec §4).
  const assignableRoles: UserRole[] = permissions.manageAdmins
    ? [...userRoleValues]
    : userRoleValues.filter((r) => r !== 'admin')
  const roleOptions = assignableRoles.map((r) => ({ value: r, label: labels.userRole[r] }))
  const branchOptions = branches.map((b) => ({ value: b.slug, label: b.name }))

  const createUser = useMutation((input: CreateUserInput) => authService.createUser(input), {
    successMessage: 'User created',
    invalidate: ['users'],
    onSuccess: () => closeModal(CREATE),
  })
  const updateUser = useMutation(
    (p: { id: string; patch: UpdateUserInput }) => usersService.updateUser(p.id, p.patch),
    { successMessage: 'User updated', invalidate: ['users'], onSuccess: () => closeModal(EDIT) },
  )
  const approve = useMutation(
    (p: { id: string; status: ApprovalStatus }) => usersService.setApproval(p.id, p.status),
    { successMessage: 'Approval updated', invalidate: ['users'] },
  )
  const remove = useMutation((id: string) => usersService.deleteUser(id), {
    successMessage: 'User deleted',
    invalidate: ['users'],
  })
  const resetPassword = useMutation(
    (p: { id: string; password: string }) => authService.setUserPassword(p.id, p.password),
    { successMessage: 'Password reset', invalidate: ['users'], onSuccess: () => closeModal(RESET) },
  )

  const createFields: FieldConfig<CreateUserInput>[] = [
    { name: 'username', label: 'Username', type: 'text' },
    { name: 'full_name', label: 'Full name', type: 'text' },
    { name: 'password', label: 'Temporary password', type: 'password' },
    { name: 'role', label: 'Role', type: 'select', options: roleOptions },
    { name: 'branch_access', label: 'Branch access', type: 'multiselect', options: branchOptions },
  ]
  const createDefaults: DefaultValues<CreateUserInput> = {
    username: '',
    full_name: '',
    password: '',
    role: 'employee',
    branch_access: [],
    access_flags: {},
  }

  const editFields: FieldConfig<UpdateUserInput>[] = [
    { name: 'full_name', label: 'Full name', type: 'text' },
    { name: 'role', label: 'Role', type: 'select', options: roleOptions },
    { name: 'branch_access', label: 'Branch access', type: 'multiselect', options: branchOptions },
    { name: 'approval_status', label: 'Approval', type: 'select', options: toOptions(approvalStatusValues, labels.approvalStatus) },
  ]
  const editDefaults: DefaultValues<UpdateUserInput> = {
    full_name: editing?.full_name ?? '',
    role: editing?.role,
    branch_access: (editing?.branch_access ?? []) as BranchSlug[],
    approval_status: editing?.approval_status,
  }

  const columns: ColumnsType<User> = [
    {
      title: 'Username',
      dataIndex: 'username',
      render: (v: string) => <NameCell icon={<UserOutlined />}>{v}</NameCell>,
    },
    { title: 'Full name', dataIndex: 'full_name', render: (v: string | null) => v || '—' },
    { title: 'Role', dataIndex: 'role', render: (r: UserRole) => <Tag>{labels.userRole[r]}</Tag> },
    {
      title: 'Branches',
      dataIndex: 'branch_access',
      render: (b: string[]) => (b.length ? b.join(', ') : 'All'),
    },
    {
      title: 'Approval',
      dataIndex: 'approval_status',
      render: (s: ApprovalStatus, u) =>
        s === 'pending' ? (
          <Space>
            <Button size="small" type="primary" onClick={() => void approve.mutate({ id: u.id, status: 'approved' })}>
              Approve
            </Button>
            <Button size="small" danger onClick={() => void approve.mutate({ id: u.id, status: 'rejected' })}>
              Reject
            </Button>
          </Space>
        ) : (
          <Tag color={APPROVAL_COLOR[s]}>{labels.approvalStatus[s]}</Tag>
        ),
    },
    { title: 'Created', dataIndex: 'created_at', render: formatDate },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      align: 'center',
      render: (_, u) => (
        <span className="tartar-row-actions">
          <Tooltip title="Edit user">
            <Button
              className="tartar-icon-btn"
              icon={<EditOutlined />}
              aria-label={`Edit ${u.username}`}
              onClick={() => openModal(EDIT, u.id)}
            />
          </Tooltip>
          <Tooltip title="Reset password">
            <Button
              className="tartar-icon-btn"
              icon={<KeyOutlined />}
              aria-label={`Reset password for ${u.username}`}
              onClick={() => openModal(RESET, u.id)}
            />
          </Tooltip>
          <Popconfirm title="Delete this user?" onConfirm={() => void remove.mutate(u.id)}>
            <Tooltip title="Delete user">
              <Button
                className="tartar-icon-btn"
                danger
                icon={<DeleteOutlined />}
                aria-label={`Delete ${u.username}`}
              />
            </Tooltip>
          </Popconfirm>
        </span>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Users"
        subtitle={
          permissions.manageAdmins
            ? 'Manage all users and assign any role'
            : 'Manage accountants and employees'
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(CREATE)}>
            Add user
          </Button>
        }
      />

      <SectionCard title="All Users" subtitle="Accounts, roles and branch access" flush>
        <DataTable<User> columns={columns} data={users} loading={list.loading} emptyText="No users yet" />
      </SectionCard>

      <EntityFormModal<CreateUserInput>
        open={createModal.open}
        title="Add user"
        fields={createFields}
        schema={createUserSchema}
        defaultValues={createDefaults}
        submitting={createUser.loading}
        submitText="Create"
        onSubmit={(v) => void createUser.mutate(v)}
        onClose={() => closeModal(CREATE)}
      />

      <EntityFormModal<UpdateUserInput>
        open={editModal.open}
        title={`Edit ${editing?.username ?? 'user'}`}
        fields={editFields}
        schema={updateUserSchema}
        defaultValues={editDefaults}
        submitting={updateUser.loading}
        onSubmit={(v) => {
          if (editing) void updateUser.mutate({ id: editing.id, patch: v })
        }}
        onClose={() => closeModal(EDIT)}
      />

      <EntityFormModal<ResetPasswordInput>
        open={resetModal.open}
        title="Reset password"
        fields={[{ name: 'password', label: 'New password', type: 'password' }]}
        schema={resetPasswordSchema}
        defaultValues={{ password: '' }}
        submitting={resetPassword.loading}
        submitText="Reset password"
        onSubmit={(v) => {
          if (resetModal.recordId) void resetPassword.mutate({ id: resetModal.recordId, password: v.password })
        }}
        onClose={() => closeModal(RESET)}
      />
    </>
  )
}
