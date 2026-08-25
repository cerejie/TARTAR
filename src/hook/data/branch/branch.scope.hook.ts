import {
  selectIsManager,
  useAccountStore,
} from "../../../store/data/account/account.store";
import { useBranchStore } from "../../../store/data/branch/branch.store";
import { useBranchListHook } from "./branch.list.hook";

export const useBranchScopeHook = () => {
  const isManager = useAccountStore(selectIsManager);
  const stored = useBranchStore((state) => state.branchFilter);
  const setBranch = useBranchStore((state) => state.setBranchFilter);
  const { branches } = useBranchListHook();

  const branch = isManager ? stored : null;
  const branchName = branch
    ? branches.find((item) => item.slug === branch)?.name ?? branch
    : null;

  return { enabled: isManager, branch, branchName, setBranch, branches };
};
