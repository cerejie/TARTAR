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
import { formatDateTime } from "../../../utils/format.utils";
import { toOptions } from "../../../utils/option.utils";
import { useAvatarUrls } from "../../account/account.avatar.hook";
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
  const avatarUrlOf = useAvatarUrls();
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
      successMessage: "New password set",
      invalidate,
      onSuccess: resetModal.closeModal,
    }
  );

  const dismissResetMutation = useMutation(
    (id: string) => userServices.dismissPasswordReset(id),
    { successMessage: "Password request dismissed", invalidate }
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
    {
      name: "email",
      label: "Email",
      type: "text",
      required: true,
      inputMode: "email",
    },
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

  const resetRequestHintOf = (user: IUser | undefined) =>
    user?.password_reset_requested_at
      ? `Requested ${formatDateTime(user.password_reset_requested_at)}. Anyone who knows this email can send a request — confirm with ${displayName(user)} directly, then give them this password yourself.`
      : undefined;

  const confirmDismissReset = (user: IUser) =>
    openConfirm({
      kind: "delete",
      title: `Dismiss ${displayName(user)}'s password request?`,
      message: "Their current password stays as it is.",
      okText: "Dismiss",
      onConfirm: () => dismissResetMutation.mutate(user.id),
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
    avatarUrlOf,
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
    confirmDismissReset,
    resetRequestHintOf,
    confirmRemove,
  };
};
