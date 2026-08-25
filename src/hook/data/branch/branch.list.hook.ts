import { branchListKey } from "../../../keys/query.keys";
import type { IBranch } from "../../../models/data/branch/branch.response";
import referenceServices from "../../../services/data/reference.services";
import {
  selectBranchAccess,
  useAccountStore,
} from "../../../store/data/account/account.store";
import { useQuery } from "../../common/query.hook";

export const useBranchListHook = () => {
  const access = useAccountStore(selectBranchAccess);
  const query = useQuery<IBranch[]>(
    branchListKey,
    referenceServices.getBranches
  );

  const all = query.data ?? [];
  const branches =
    access === null
      ? all
      : all.filter((branch) => access.includes(branch.slug));

  return {
    ...query,
    branches,
    defaultBranch: branches[0]?.slug ?? "hardware",
    branchOptions: branches.map((branch) => ({
      value: branch.slug,
      label: branch.name,
    })),
    branchName: (slug: string) =>
      branches.find((branch) => branch.slug === slug)?.name ?? slug,
  };
};
