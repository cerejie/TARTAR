import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { effectiveRoleLabels } from "../../enums/role.enum";
import {
  changePasswordSchema,
  type IChangePasswordInput,
} from "../../models/data/account/account.request";
import accountServices from "../../services/data/account.services";
import {
  selectBranchAccess,
  selectRole,
  useAccountStore,
} from "../../store/data/account/account.store";
import { useMutation } from "../common/mutation.hook";
import { useBranchListHook } from "../data/branch/branch.list.hook";

const emptyValue = "—";

export const useAccountSettingsHook = () => {
  const user = useAccountStore((state) => state.user);
  const developerEmail = useAccountStore((state) => state.developerEmail);
  const role = useAccountStore(selectRole);
  const access = useAccountStore(selectBranchAccess);
  const { branchName } = useBranchListHook();

  const { control, handleSubmit, reset } = useForm<IChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { current_password: "", password: "", confirm_password: "" },
  });

  const branchesLabel = () => {
    if (access === null) return "All branches";
    if (access.length === 0) return "None";
    return access.map(branchName).join(", ");
  };

  const profileRows = [
    { label: "Full name", value: user?.full_name || emptyValue },
    { label: "Email", value: user?.email ?? developerEmail ?? emptyValue },
    { label: "Role", value: role ? effectiveRoleLabels[role] : emptyValue },
    { label: "Branch access", value: branchesLabel() },
  ] as const;

  const changePassword = (values: IChangePasswordInput) =>
    developerEmail
      ? accountServices.changeDeveloperPassword(
          developerEmail,
          values.current_password,
          values.password
        )
      : accountServices.changeOwnPassword(
          values.current_password,
          values.password
        );

  const passwordMutation = useMutation(changePassword, {
    successMessage: "Password changed.",
    onSuccess: () => reset(),
  });

  return {
    profileRows,
    control,
    passwordMutation,
    onPasswordSubmit: handleSubmit(
      (values) => void passwordMutation.mutate(values)
    ),
  };
};
