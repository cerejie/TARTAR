import { branchListKey } from "../../../keys/query.keys";
import type { IBranch } from "../../../models/data/branch/branch.response";
import referenceServices from "../../../services/data/reference.services";
import {
  selectBranchAccess,
  useAccountStore,
} from "../../../store/data/account/account.store";
import { useQuery } from "../../common/query.hook";

export const accessibleBranchesOf = (
  all: readonly IBranch[],
  access: readonly string[] | null
): IBranch[] =>
  access === null
    ? [...all]
    : all.filter((branch) => access.includes(branch.slug));

export const useBranchListHook = () => {
  const access = useAccountStore(selectBranchAccess);
  const query = useQuery<IBranch[]>(
    branchListKey,
    referenceServices.getBranches
  );

  const all = query.data ?? [];
  const branches = accessibleBranchesOf(all, access);
  const toOption = (branch: IBranch) => ({
    value: branch.slug,
    label: branch.name,
  });

  return {
    ...query,
    branches,
    defaultBranch: branches[0]?.slug ?? "hardware",
    branchOptions: branches.map(toOption),
    allBranchOptions: all.map(toOption),
    branchName: (slug: string) =>
      all.find((branch) => branch.slug === slug)?.name ?? slug,
  };
};
