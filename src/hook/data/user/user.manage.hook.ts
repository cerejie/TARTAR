import type { DefaultValues } from "react-hook-form";
import {
  approvalStatusLabels,
  approvalStatusValues,
  manageableRolesOf,
  userRoleLabels,
} from "../../../enums/role.enum";
import {
  userApproveModalKey,
  userCreateModalKey,
  userEditModalKey,
  userResetModalKey,
} from "../../../keys/modal.keys";
import { userListKey } from "../../../keys/query.keys";
import type { IFieldConfig } from "../../../models/common/field.model";
import type { BranchSlug } from "../../../models/data/branch/branch.response";
import type {
  IApproveUserInput,
  ICreateUserInput,
  IUpdateUserInput,
} from "../../../models/data/account/account.request";
import type { IUser } from "../../../models/data/account/account.response";
import accountServices from "../../../services/data/account.services";
import userServices from "../../../services/data/user.services";
import {
  selectUserId,
  useAccountStore,
} from "../../../store/data/account/account.store";
import { toOptions } from "../../../utils/option.utils";
import { usePermissions } from "../../account/account.permission.hook";
import { useConfirm } from "../../common/confirmation.hook";
import { useModal } from "../../common/modal.hook";
import { useMutation } from "../../common/mutation.hook";
import { useBranchListHook } from "../branch/branch.list.hook";
import { useUserListHook } from "./user.list.hook";

const isSuperAdminRole = (values: { role?: string }) =>
  values.role === "superadmin";

export const useUserManageHook = () => {
  const createModal = useModal(userCreateModalKey);
  const editModal = useModal<IUser>(userEditModalKey);
  const resetModal = useModal<IUser>(userResetModalKey);
  const approveModal = useModal<IUser>(userApproveModalKey);

  const permissions = usePermissions();
  const currentUserId = useAccountStore(selectUserId);
  const { allBranchOptions, branchName } = useBranchListHook();
  const openConfirm = useConfirm();
  const {
    users,
    isInitialLoading: loading,
    isRefreshing: refreshing,
    error,
    refetch: retry,
  } = useUserListHook();

  const invalidate = [userListKey];
  const editing = editModal.modal.data;
  const approving = approveModal.modal.data;

  const manageableRoles = manageableRolesOf(permissions.role);
  const roleOptions = toOptions(manageableRoles, userRoleLabels);

  const createMutation = useMutation(
    (values: ICreateUserInput) => accountServices.createUser(values),
    {
      successMessage: "User created",
      invalidate,
      onSuccess: createModal.closeModal,
    }
  );

  const updateMutation = useMutation(
    (payload: { id: string; values: IUpdateUserInput }) =>
      userServices.update(payload.id, payload.values),
    {
      successMessage: "User updated",
      invalidate,
      onSuccess: editModal.closeModal,
    }
  );

  const approveMutation = useMutation(
    (payload: { id: string; values: IApproveUserInput }) =>
      userServices.update(payload.id, {
        ...payload.values,
        approval_status: "approved",
      }),
    {
      successMessage: "User approved",
      invalidate,
      onSuccess: approveModal.closeModal,
    }
  );

  const rejectMutation = useMutation(
    (id: string) => userServices.setApproval(id, "rejected"),
    { successMessage: "Registration rejected", invalidate }
  );

  const removeMutation = useMutation((id: string) => userServices.remove(id), {
    successMessage: "User deleted",
    invalidate,
  });

  const resetPasswordMutation = useMutation(
    (payload: { id: string; password: string }) =>
      accountServices.setUserPassword(payload.id, payload.password),
    {
      successMessage: "Password reset",
      invalidate,
      onSuccess: resetModal.closeModal,
    }
  );

  const approveResetMutation = useMutation(
    (id: string) => userServices.decidePasswordReset(id, true),
    { successMessage: "New password approved", invalidate }
  );

  const rejectResetMutation = useMutation(
    (id: string) => userServices.decidePasswordReset(id, false),
    { successMessage: "Password reset rejected", invalidate }
  );

  const canManageUser = (user: IUser) => manageableRoles.includes(user.role);

  const branchAccessField = {
    name: "branch_access",
    label: "Branch access",
    type: "multiselect",
    options: allBranchOptions,
    hidden: isSuperAdminRole,
  } as const;

  const createFields: IFieldConfig<ICreateUserInput>[] = [
    { name: "email", label: "Email", type: "text", required: true },
    { name: "full_name", label: "Full name", type: "text", required: true },
    {
      name: "password",
      label: "Temporary password",
      type: "password",
      required: true,
    },
    {
      name: "role",
      label: "Role",
      type: "select",
      required: true,
      options: roleOptions,
    },
    branchAccessField,
  ];

  const createDefaults: DefaultValues<ICreateUserInput> = {
    email: "",
    full_name: "",
    password: "",
    role: "employee",
    branch_access: [],
    access_flags: {},
  };

  const editFields: IFieldConfig<IUpdateUserInput>[] = [
    { name: "full_name", label: "Full name", type: "text" },
    { name: "role", label: "Role", type: "select", options: roleOptions },
    branchAccessField,
    {
      name: "approval_status",
      label: "Approval",
      type: "select",
      options: toOptions(approvalStatusValues, approvalStatusLabels),
    },
  ];

  const approveFields: IFieldConfig<IApproveUserInput>[] = [
    {
      name: "role",
      label: "Role",
      type: "select",
      required: true,
      options: roleOptions,
    },
    branchAccessField,
  ];

  const displayName = (user: IUser) => user.full_name || user.username;

  const accountHintOf = (user: IUser) => user.email ?? `@${user.username}`;

  const branchAccessLabelOf = (user: IUser) => {
    if (user.role === "superadmin") return "All";
    if (!user.branch_access.length) return "None";
    return user.branch_access.map(branchName).join(", ");
  };

  const confirmReject = (user: IUser) =>
    openConfirm({
      kind: "delete",
      title: `Reject ${displayName(user)}?`,
      message: "They cannot sign in until someone approves them.",
      okText: "Reject",
      onConfirm: () => rejectMutation.mutate(user.id),
    });

  const confirmResetDecision = (user: IUser, approve: boolean) =>
    openConfirm({
      kind: approve ? "confirm" : "delete",
      title: approve
        ? `Approve ${displayName(user)}'s new password?`
        : `Reject ${displayName(user)}'s password reset?`,
      message: approve
        ? "Their old password stops working; they sign in with the one they requested."
        : "Their current password stays; the requested one is discarded.",
      okText: approve ? "Approve" : "Reject",
      onConfirm: () =>
        approve
          ? approveResetMutation.mutate(user.id)
          : rejectResetMutation.mutate(user.id),
    });

  const confirmRemove = (user: IUser) =>
    openConfirm({
      kind: "delete",
      title: `Delete ${displayName(user)}?`,
      message: "The account is removed and can no longer sign in.",
      onConfirm: () => removeMutation.mutate(user.id),
    });

  const editDefaults: DefaultValues<IUpdateUserInput> = {
    full_name: editing?.full_name ?? "",
    role: editing?.role,
    branch_access: (editing?.branch_access ?? []) as BranchSlug[],
    approval_status: editing?.approval_status,
  };

  const approveDefaults: DefaultValues<IApproveUserInput> = {
    role: approving?.role ?? "employee",
    branch_access: (approving?.branch_access ?? []) as BranchSlug[],
  };

  return {
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
  };
};
