import {
  Check,
  KeyRound,
  LockKeyhole,
  LockKeyholeOpen,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import type { IDataTableColumn } from "../../../models/common/table.model";
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
  type UserRole,
} from "../../../enums/role.enum";
import { useUserManageHook } from "../../../hook/data/user/user.manage.hook";
import type { IRowAction } from "../../../models/common/action.model";
import type { IFieldConfig } from "../../../models/common/field.model";
import {
  approveUserSchema,
  createUserSchema,
  resetPasswordSchema,
  updateUserSchema,
  type IApproveUserInput,
  type ICreateUserInput,
  type IResetPasswordInput,
  type IUpdateUserInput,
} from "../../../models/data/account/account.request";
import type { IUser } from "../../../models/data/account/account.response";
import { nowrapCell } from "../../../styles/table/table.styles";
import { formatDate } from "../../../utils/format.utils";

const resetFields: IFieldConfig<IResetPasswordInput>[] = [
  {
    name: "password",
    label: "New password",
    type: "password",
    required: true,
  },
];

const renderApprovalTag = (user: IUser) => {
  if (user.password_reset_requested_at)
    return <StatusTag color="warning" label="Reset requested" />;

  return (
    <StatusTag
      color={approvalStatusColors[user.approval_status]}
      label={approvalStatusLabels[user.approval_status]}
    />
  );
};

const UsersTable = () => {
  const {
    users,
    loading,
    refreshing,
    error,
    retry,
    displayName,
    accountHintOf,
    branchAccessLabelOf,
    editing,
    approving,
    currentUserId,
    createModal,
    editModal,
    resetModal,
    approveModal,
    createFields,
    createDefaults,
    editFields,
    editDefaults,
    approveFields,
    approveDefaults,
    createMutation,
    updateMutation,
    approveMutation,
    resetPasswordMutation,
    canManageUser,
    confirmReject,
    confirmResetDecision,
    confirmRemove,
  } = useUserManageHook();

  const actionsOf = (user: IUser): IRowAction[] => {
    const isSelf = user.id === currentUserId;
    const isPending = user.approval_status === "pending";
    const resetRequested = Boolean(user.password_reset_requested_at);
    if (!canManageUser(user)) return [];

    return [
      ...(isPending
        ? [
            {
              key: "approve",
              label: "Approve account",
              icon: <Check />,
              priority: "primary" as const,
              onSelect: () => approveModal.openModal(user),
            },
            {
              key: "reject",
              label: "Reject account",
              icon: <X />,
              priority: "secondary" as const,
              danger: true,
              onSelect: () => confirmReject(user),
            },
          ]
        : []),
      ...(resetRequested
        ? [
            {
              key: "approve-reset",
              label: "Approve new password",
              icon: <LockKeyholeOpen />,
              priority: isPending ? undefined : ("primary" as const),
              onSelect: () => confirmResetDecision(user, true),
            },
            {
              key: "reject-reset",
              label: "Reject password reset",
              icon: <LockKeyhole />,
              priority: isPending ? undefined : ("secondary" as const),
              danger: true,
              onSelect: () => confirmResetDecision(user, false),
            },
          ]
        : []),
      {
        key: "edit",
        label: "Edit user",
        icon: <Pencil />,
        priority: isPending || resetRequested ? "secondary" : "primary",
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
      dataIndex: "email",
      skeleton: "avatar",
      render: (_, user) => (
        <AvatarCell name={displayName(user)} hint={accountHintOf(user)} />
      ),
    },
    {
      title: "Role",
      mobile: "status",
      dataIndex: "role",
      render: (role: UserRole) => <StatusTag label={userRoleLabels[role]} />,
    },
    {
      title: "Branches",
      dataIndex: "branch_access",
      render: (_, user) => branchAccessLabelOf(user),
    },
    {
      title: "Approval",
      mobile: "status",
      dataIndex: "approval_status",
      className: nowrapCell,
      render: (_, user) => renderApprovalTag(user),
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
      <TablePanel>
        <DataTable<IUser>
          columns={columns}
          data={users}
          loading={loading}
          refreshing={refreshing}
          error={error}
          onRetry={retry}
          emptyText="No users yet"
          detailTitle={() => "User"}
          detailActions={actionsOf}
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

      <EntityFormModal<IApproveUserInput>
        open={approveModal.modal.visible}
        title={approving ? `Approve ${displayName(approving)}` : "Approve user"}
        fields={approveFields}
        schema={approveUserSchema}
        defaultValues={approveDefaults}
        submitting={approveMutation.loading}
        submitText="Approve"
        onSubmit={(values) => {
          if (approving)
            void approveMutation.mutate({ id: approving.id, values });
        }}
        onClose={approveModal.closeModal}
      />

      <EntityFormModal<IUpdateUserInput>
        open={editModal.modal.visible}
        title={editing ? `Edit ${displayName(editing)}` : "Edit user"}
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
        title={
          resetModal.modal.data
            ? `Reset password · ${displayName(resetModal.modal.data)}`
            : "Reset password"
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
