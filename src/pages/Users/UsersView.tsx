import { KeyRound, Pencil, Plus, Trash2, User } from "lucide-react";
import AppButton from "../../components/common/button/AppButton";
import StatusTag from "../../components/common/status/StatusTag";
import { useConfirm } from "../../hook/common/confirmation.hook";
import type { IDataTableColumn } from "../../models/common/table.model";
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

  const columns: IDataTableColumn<IUser>[] = [
    {
      title: "Username",
      dataIndex: "username",
      render: (value: string) => (
        <NameCell icon={<User />}>{value}</NameCell>
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
      render: (role: UserRole) => <StatusTag label={userRoleLabels[role]} />,
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
          <RowActions>
            <AppButton
              size="sm"
              onPress={() =>
                void approvalMutation.mutate({
                  id: user.id,
                  status: "approved",
                })
              }
            >
              Approve
            </AppButton>
            <AppButton
              size="sm"
              variant="destructive"
              onPress={() =>
                void approvalMutation.mutate({
                  id: user.id,
                  status: "rejected",
                })
              }
            >
              Reject
            </AppButton>
          </RowActions>
        ) : (
          <StatusTag color={approvalStatusColors[status]} label={approvalStatusLabels[status]} />
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
          <AppButton
            variant="outline"
            size="icon-sm"
            aria-label={`Edit ${user.username}`}
            tooltip="Edit user"
            onPress={() => editModal.openModal(user)}
          >
            <Pencil />
          </AppButton>
          <AppButton
            variant="outline"
            size="icon-sm"
            aria-label={`Reset password for ${user.username}`}
            tooltip="Reset password"
            onPress={() => resetModal.openModal(user)}
          >
            <KeyRound />
          </AppButton>
          <AppButton
            variant="destructive"
            size="icon-sm"
            aria-label={
              user.id === currentUserId
                ? "You cannot delete your own account"
                : `Delete ${user.username}`
            }
            tooltip="Delete user"
            disabled={user.id === currentUserId}
            onPress={() =>
              openConfirm({
                kind: "delete",
                title: `Delete ${user.username}?`,
                onConfirm: () => removeMutation.mutate(user.id),
              })
            }
          >
            <Trash2 />
          </AppButton>
        </RowActions>
      ),
    },
  ];

  return (
    <ContentView
      actions={
        <AppButton onPress={() => createModal.openModal()}>
          <Plus />
          Add user
        </AppButton>
      }
    >
      <SectionCard
        title="All Users"
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
