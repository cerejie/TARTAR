import { Check, KeyRound, Pencil, Plus, Trash2, X } from "lucide-react";
import type { IDataTableColumn } from "../../../models/common/table.model";
import AppButton from "../../common/button/AppButton";
import FilterToolbar from "../../common/filter/FilterToolbar";
import EntityFormModal from "../../common/form/EntityFormModal";
import StatusTag from "../../common/status/StatusTag";
import AvatarCell from "../../common/table/AvatarCell";
import DataTable from "../../common/table/DataTable";
import RowActionMenu from "../../common/table/RowActionMenu";
import TablePanel from "../../common/table/TablePanel";
import {
  approvalStatusColors,
  approvalStatusLabels,
  userRoleLabels,
  type ApprovalStatus,
  type UserRole,
} from "../../../enums/role.enum";
import { useUserManageHook } from "../../../hook/data/user/user.manage.hook";
import type { IRowAction } from "../../../models/common/action.model";
import type { IFieldConfig } from "../../../models/common/field.model";
import {
  createUserSchema,
  resetPasswordSchema,
  updateUserSchema,
  type ICreateUserInput,
  type IResetPasswordInput,
  type IUpdateUserInput,
} from "../../../models/data/account/account.request";
import type { IUser } from "../../../models/data/account/account.response";
import { nowrapCell } from "../../../styles/table/table.styles";
import { formatDate } from "../../../utils/format.utils";

const resetFields: IFieldConfig<IResetPasswordInput>[] = [
  { name: "password", label: "New password", type: "password" },
];

const UsersTable = () => {
  const {
    users,
    loading,
    refreshing,
    error,
    retry,
    displayName,
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
    resetPasswordMutation,
    confirmApproval,
    confirmRemove,
  } = useUserManageHook();

  const actionsOf = (user: IUser): IRowAction[] => {
    const isSelf = user.id === currentUserId;

    return [
      ...(user.approval_status === "pending"
        ? [
            {
              key: "approve",
              label: "Approve account",
              icon: <Check />,
              onSelect: () => confirmApproval(user, "approved"),
            },
            {
              key: "reject",
              label: "Reject account",
              icon: <X />,
              danger: true,
              onSelect: () => confirmApproval(user, "rejected"),
            },
          ]
        : []),
      {
        key: "edit",
        label: "Edit user",
        icon: <Pencil />,
        onSelect: () => editModal.openModal(user),
      },
      {
        key: "reset",
        label: "Reset password",
        icon: <KeyRound />,
        onSelect: () => resetModal.openModal(user),
      },
      {
        key: "delete",
        label: isSelf ? "You cannot delete your own account" : "Delete user",
        icon: <Trash2 />,
        danger: true,
        disabled: isSelf,
        onSelect: () => confirmRemove(user),
      },
    ];
  };

  const columns: IDataTableColumn<IUser>[] = [
    {
      title: "User",
      dataIndex: "username",
      skeleton: "avatar",
      render: (username: string, user) => (
        <AvatarCell name={displayName(user)} hint={`@${username}`} />
      ),
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
      className: nowrapCell,
      render: (status: ApprovalStatus) => (
        <StatusTag
          color={approvalStatusColors[status]}
          label={approvalStatusLabels[status]}
        />
      ),
    },
    {
      title: "Created",
      dataIndex: "created_at",
      className: nowrapCell,
      render: (value: string) => formatDate(value),
    },
    {
      title: "Action",
      key: "actions",
      align: "center",
      className: nowrapCell,
      render: (_, user) => <RowActionMenu actions={actionsOf(user)} />,
    },
  ];

  return (
    <>
      <TablePanel
        toolbar={
          <FilterToolbar
            actions={
              <AppButton onPress={() => createModal.openModal()}>
                <Plus />
                Add user
              </AppButton>
            }
          />
        }
      >
        <DataTable<IUser>
          columns={columns}
          data={users}
          loading={loading}
          refreshing={refreshing}
          error={error}
          onRetry={retry}
          emptyText="No users yet"
        />
      </TablePanel>

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
        subtitle={
          resetModal.modal.data
            ? `Set a new password for ${resetModal.modal.data.username}.`
            : undefined
        }
        fields={resetFields}
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
    </>
  );
};

export default UsersTable;
