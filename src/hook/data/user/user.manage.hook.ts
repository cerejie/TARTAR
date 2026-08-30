import type { DefaultValues } from "react-hook-form";
import {
  approvalStatusLabels,
  approvalStatusValues,
  userRoleLabels,
  userRoleValues,
  type ApprovalStatus,
  type UserRole,
} from "../../../enums/role.enum";
import {
  userCreateModalKey,
  userEditModalKey,
  userResetModalKey,
} from "../../../keys/modal.keys";
import { userListKey } from "../../../keys/query.keys";
import type { IFieldConfig } from "../../../models/common/field.model";
import type { BranchSlug } from "../../../models/data/branch/branch.response";
import type {
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
import { useModal } from "../../common/modal.hook";
import { useMutation } from "../../common/mutation.hook";
import { useBranchListHook } from "../branch/branch.list.hook";
import { useUserListHook } from "./user.list.hook";

export const useUserManageHook = () => {
  const createModal = useModal(userCreateModalKey);
  const editModal = useModal<IUser>(userEditModalKey);
  const resetModal = useModal<IUser>(userResetModalKey);

  const permissions = usePermissions();
  const currentUserId = useAccountStore(selectUserId);
  const { branchOptions } = useBranchListHook();
  const { users, loading } = useUserListHook();

  const invalidate = [userListKey];
  const editing = editModal.modal.data;

  const assignableRoles: UserRole[] = permissions.manageAdmins
    ? [...userRoleValues]
    : userRoleValues.filter((role) => role !== "admin");
  const roleOptions = toOptions(assignableRoles, userRoleLabels);

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

  const approvalMutation = useMutation(
    (payload: { id: string; status: ApprovalStatus }) =>
      userServices.setApproval(payload.id, payload.status),
    { successMessage: "Approval updated", invalidate }
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

  const createFields: IFieldConfig<ICreateUserInput>[] = [
    { name: "username", label: "Username", type: "text" },
    { name: "full_name", label: "Full name", type: "text" },
    { name: "password", label: "Temporary password", type: "password" },
    { name: "role", label: "Role", type: "select", options: roleOptions },
    {
      name: "branch_access",
      label: "Branch access",
      type: "multiselect",
      options: branchOptions,
    },
  ];

  const createDefaults: DefaultValues<ICreateUserInput> = {
    username: "",
    full_name: "",
    password: "",
    role: "employee",
    branch_access: [],
    access_flags: {},
  };

  const editFields: IFieldConfig<IUpdateUserInput>[] = [
    { name: "full_name", label: "Full name", type: "text" },
    { name: "role", label: "Role", type: "select", options: roleOptions },
    {
      name: "branch_access",
      label: "Branch access",
      type: "multiselect",
      options: branchOptions,
    },
    {
      name: "approval_status",
      label: "Approval",
      type: "select",
      options: toOptions(approvalStatusValues, approvalStatusLabels),
    },
  ];

  const editDefaults: DefaultValues<IUpdateUserInput> = {
    full_name: editing?.full_name ?? "",
    role: editing?.role,
    branch_access: (editing?.branch_access ?? []) as BranchSlug[],
    approval_status: editing?.approval_status,
  };

  return {
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
  };
};
