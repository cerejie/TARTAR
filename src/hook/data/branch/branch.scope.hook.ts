import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { branchScopeSearchKey } from "../../../keys/modal.keys";
import {
  selectIsManager,
  useAccountStore,
} from "../../../store/data/account/account.store";
import { useBranchStore } from "../../../store/data/branch/branch.store";
import { useSearch } from "../../common/search.hook";
import { useBranchListHook } from "./branch.list.hook";

export const useBranchScopeHook = () => {
  const navigate = useNavigate();
  const isManager = useAccountStore(selectIsManager);
  const stored = useBranchStore((state) => state.branchFilter);
  const setBranch = useBranchStore((state) => state.setBranchFilter);
  const { branches } = useBranchListHook();
  const { search, setSearch } = useSearch(branchScopeSearchKey);

  const branch = isManager ? stored : null;
  const branchName = branch
    ? branches.find((item) => item.slug === branch)?.name ?? branch
    : null;

  const visibleBranches = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return branches;

    return branches.filter((item) => item.name.toLowerCase().includes(term));
  }, [branches, search]);

  return {
    enabled: isManager,
    branch,
    branchName,
    setBranch,
    branches,
    visibleBranches,
    search,
    setSearch,
    goToManageBranches: () => navigate("/branches"),
  };
};
