import {
  DeleteOutlined,
  EditOutlined,
  KeyOutlined,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Space, Tag, Tooltip } from "antd";
import { useConfirm } from "../../hook/common/confirmation.hook";
import type { ColumnsType } from "antd/es/table";
import SectionCard from "../../components/common/card/SectionCard";
import EntityFormModal from "../../components/common/form/EntityFormModal";
import DataTable from "../../components/common/table/DataTable";
import { NameCell, RowActions } from "../../components/common/table/TableDecor";
import ContentView from "../../components/common/view/ContentView";
import {
  approvalStatusColors,
  approvalStatusLabels,
  userRoleLabels,
  type ApprovalStatus,
  type UserRole,
} from "../../enums/role.enum";
import { useUserManageHook } from "../../hook/data/user/user.manage.hook";
import {
  createUserSchema,
  resetPasswordSchema,
  updateUserSchema,
  type ICreateUserInput,
  type IResetPasswordInput,
  type IUpdateUserInput,
} from "../../models/data/account/account.request";
import type { IUser } from "../../models/data/account/account.response";
import { iconButton } from "../../styles/table/table.css";
import { formatDate } from "../../utils/format.utils";

const UsersView = () => {
  const {
    users,
    loading,
    editing,
    currentUserId,
    createModal,
    editModal,
    resetModal,
    createFields,
    createDefaults,
    editFields,
    editDefaults,
    createMutation,
    updateMutation,
    approvalMutation,
    removeMutation,
    resetPasswordMutation,
  } = useUserManageHook();

  const openConfirm = useConfirm();

  const columns: ColumnsType<IUser> = [
    {
      title: "Username",
      dataIndex: "username",
      render: (value: string) => (
        <NameCell icon={<UserOutlined />}>{value}</NameCell>
      ),
    },
    {
      title: "Full name",
      dataIndex: "full_name",
      render: (value: string | null) => value || "—",
    },
    {
      title: "Role",
      dataIndex: "role",
      render: (role: UserRole) => <Tag>{userRoleLabels[role]}</Tag>,
    },
    {
      title: "Branches",
      dataIndex: "branch_access",
      render: (branches: string[]) =>
        branches.length ? branches.join(", ") : "All",
    },
    {
      title: "Approval",
      dataIndex: "approval_status",
      render: (status: ApprovalStatus, user) =>
        status === "pending" ? (
          <Space>
            <Button
              size="small"
              type="primary"
              onClick={() =>
                void approvalMutation.mutate({
                  id: user.id,
                  status: "approved",
                })
              }
            >
              Approve
            </Button>
            <Button
              size="small"
              danger
              onClick={() =>
                void approvalMutation.mutate({
                  id: user.id,
                  status: "rejected",
                })
              }
            >
              Reject
            </Button>
          </Space>
        ) : (
          <Tag color={approvalStatusColors[status]}>
            {approvalStatusLabels[status]}
          </Tag>
        ),
    },
    {
      title: "Created",
      dataIndex: "created_at",
      render: (value: string) => formatDate(value),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      align: "center",
      render: (_, user) => (
        <RowActions>
          <Tooltip title="Edit user">
            <Button
              className={`${iconButton}`}
              icon={<EditOutlined />}
              aria-label={`Edit ${user.username}`}
              onClick={() => editModal.openModal(user)}
            />
          </Tooltip>
          <Tooltip title="Reset password">
            <Button
              className={`${iconButton}`}
              icon={<KeyOutlined />}
              aria-label={`Reset password for ${user.username}`}
              onClick={() => resetModal.openModal(user)}
            />
          </Tooltip>
          {user.id === currentUserId ? (
            <Tooltip title="You cannot delete your own account">
              <span>
                <Button
                  className={`${iconButton}`}
                  danger
                  disabled
                  icon={<DeleteOutlined />}
                />
              </span>
            </Tooltip>
          ) : (
            <Tooltip title="Delete user">
              <Button
                className={`${iconButton}`}
                danger
                icon={<DeleteOutlined />}
                aria-label={`Delete ${user.username}`}
                onClick={() =>
                  openConfirm({
                    kind: "delete",
                    title: `Delete ${user.username}?`,
                    onConfirm: () => removeMutation.mutate(user.id),
                  })
                }
              />
            </Tooltip>
          )}
        </RowActions>
      ),
    },
  ];

  return (
    <ContentView
      title="Users"
      subtitle="Manage all users and assign any role"
      actions={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => createModal.openModal()}
        >
          Add user
        </Button>
      }
    >
      <SectionCard
        title="All Users"
        subtitle="Accounts, roles and branch access"
        flush
      >
        <DataTable<IUser>
          columns={columns}
          data={users}
          loading={loading}
          emptyText="No users yet"
        />
      </SectionCard>

      <EntityFormModal<ICreateUserInput>
        open={createModal.modal.visible}
        title="Add user"
        fields={createFields}
        schema={createUserSchema}
        defaultValues={createDefaults}
        submitting={createMutation.loading}
        submitText="Create"
        onSubmit={(values) => void createMutation.mutate(values)}
        onClose={createModal.closeModal}
      />

      <EntityFormModal<IUpdateUserInput>
        open={editModal.modal.visible}
        title={`Edit ${editing?.username ?? "user"}`}
        fields={editFields}
        schema={updateUserSchema}
        defaultValues={editDefaults}
        submitting={updateMutation.loading}
        onSubmit={(values) => {
          if (editing) void updateMutation.mutate({ id: editing.id, values });
        }}
        onClose={editModal.closeModal}
      />

      <EntityFormModal<IResetPasswordInput>
        open={resetModal.modal.visible}
        title="Reset password"
        fields={[
          { name: "password", label: "New password", type: "password" },
        ]}
        schema={resetPasswordSchema}
        defaultValues={{ password: "" }}
        submitting={resetPasswordMutation.loading}
        submitText="Reset password"
        onSubmit={(values) => {
          if (resetModal.modal.data)
            void resetPasswordMutation.mutate({
              id: resetModal.modal.data.id,
              password: values.password,
            });
        }}
        onClose={resetModal.closeModal}
      />
    </ContentView>
  );
};

export default UsersView;
