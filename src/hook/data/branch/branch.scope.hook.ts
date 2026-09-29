import { useNavigate } from "react-router-dom";
import { branchScopeSearchKey } from "../../../keys/modal.keys";
import {
  selectCanScopeBranch,
  selectIsManager,
  useAccountStore,
} from "../../../store/data/account/account.store";
import { useBranchStore } from "../../../store/data/branch/branch.store";
import { useSearch } from "../../common/search.hook";
import { useBranchListHook } from "./branch.list.hook";

export const useBranchScopeHook = () => {
  const navigate = useNavigate();
  const isManager = useAccountStore(selectIsManager);
  const canScope = useAccountStore(selectCanScopeBranch);
  const stored = useBranchStore((state) => state.branchFilter);
  const setBranch = useBranchStore((state) => state.setBranchFilter);
  const { branches } = useBranchListHook();
  const { search, setSearch } = useSearch(branchScopeSearchKey);

  const storedIsListed = isManager || branches.some((item) => item.slug === stored);
  const branch = canScope && storedIsListed ? stored : null;
  const branchName = branch
    ? branches.find((item) => item.slug === branch)?.name ?? branch
    : null;

  return {
    enabled: canScope,
    canManage: isManager,
    branch,
    branchName,
    setBranch,
    branches,
    search,
    setSearch,
    goToManageBranches: () => navigate("/branches"),
  };
};
