import { useNavigate } from "react-router-dom";
import { branchScopeSearchKey } from "../../../keys/modal.keys";
import {
  selectCanScopeBranch,
  selectIsManager,
  useAccountStore,
} from "../../../store/data/account/account.store";
import { useBranchStore } from "../../../store/data/branch/branch.store";
import { useSearch } from "../../common/search.hook";
import { branchScopeTitleOf } from "../../../utils/branch.utils";
import { useBranchListHook } from "./branch.list.hook";
import type { IBranch } from "../../../models/data/branch/branch.response";

export const scopedBranchOf = (
  stored: string | null,
  canScope: boolean,
  branches: readonly IBranch[]
): string | null =>
  canScope && branches.some((item) => item.slug === stored) ? stored : null;

export const useBranchScopeHook = () => {
  const navigate = useNavigate();
  const isManager = useAccountStore(selectIsManager);
  const canScope = useAccountStore(selectCanScopeBranch);
  const stored = useBranchStore((state) => state.branchFilter);
  const setBranch = useBranchStore((state) => state.setBranchFilter);
  const { branches, allBranchOptions, isInitialLoading } = useBranchListHook();
  const { search, setSearch } = useSearch(branchScopeSearchKey);

  const branch = scopedBranchOf(stored, canScope, branches);
  const branchName = branch
    ? branches.find((item) => item.slug === branch)?.name ?? branch
    : null;
  const printScope = branchScopeTitleOf(
    branchName,
    branches.map((item) => item.name),
    allBranchOptions.length
  );

  return {
    enabled: canScope,
    loading: isInitialLoading,
    canManage: isManager,
    branch,
    branchName,
    printScope,
    setBranch,
    branches,
    search,
    setSearch,
    goToManageBranches: () => navigate("/branches"),
  };
};
