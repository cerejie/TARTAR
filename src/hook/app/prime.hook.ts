import { useEffect } from "react";
import {
  bankAccountListKey,
  bankListKey,
  branchListKey,
  customerListKey,
  expenseCategoryListKey,
  farmSectionListKey,
  incomeSourceListKey,
  supplierListKey,
  userDisplayNamesKey,
  userListKey,
} from "../../keys/query.keys";
import { derivePermissions } from "../../models/common/permission.model";
import bankServices from "../../services/data/bank.services";
import {
  customerServices,
  supplierServices,
} from "../../services/data/party.services";
import referenceServices from "../../services/data/reference.services";
import userServices from "../../services/data/user.services";
import { useNetworkStore } from "../../store/common/network.store";
import { selectEntry, useQueryStore } from "../../store/common/query.store";
import {
  selectBranchAccess,
  selectCanScopeBranch,
  selectIsManager,
  selectRole,
  selectUserId,
  useAccountStore,
} from "../../store/data/account/account.store";
import { useBranchStore } from "../../store/data/branch/branch.store";
import { accessibleBranchesOf } from "../data/branch/branch.list.hook";
import { scopedBranchOf } from "../data/branch/branch.scope.hook";
import type { IQuerySpec } from "../../models/common/query.model";
import type { IBranch } from "../../models/data/branch/branch.response";

const noBranches: readonly IBranch[] = [];

const selectBranches = selectEntry<IBranch[]>(branchListKey);

const ignoreUnavailableViews = () => undefined;

const sharedLookups: readonly IQuerySpec[] = [
  [branchListKey, referenceServices.getBranches],
  [farmSectionListKey, referenceServices.getFarmSections],
  [expenseCategoryListKey, referenceServices.getAllExpenseCategories],
  [incomeSourceListKey, referenceServices.getAllIncomeSources],
  [bankListKey, bankServices.getBanks],
  [bankAccountListKey, bankServices.getAccounts],
  [customerListKey, () => customerServices.getList()],
  [supplierListKey, () => supplierServices.getList()],
];

const managerUserLookup: IQuerySpec = [
  userListKey,
  () => userServices.getList(),
];

const staffUserLookup: IQuerySpec = [
  userDisplayNamesKey,
  () => userServices.getDisplayNames(),
];

export const usePrimeLookupsHook = () => {
  const online = useNetworkStore((state) => state.online);
  const userId = useAccountStore(selectUserId);
  const isManager = useAccountStore(selectIsManager);

  useEffect(() => {
    if (!online || !userId) return;

    const { refetchAll, prime } = useQueryStore.getState();
    refetchAll();
    prime([
      ...sharedLookups,
      isManager ? managerUserLookup : staffUserLookup,
    ]);
  }, [online, userId, isManager]);
};

export const usePrimeViewsHook = () => {
  const online = useNetworkStore((state) => state.online);
  const userId = useAccountStore(selectUserId);
  const role = useAccountStore(selectRole);
  const access = useAccountStore(selectBranchAccess);
  const canScope = useAccountStore(selectCanScopeBranch);
  const stored = useBranchStore((state) => state.branchFilter);
  const allBranches = useQueryStore(selectBranches).data;

  const branches = accessibleBranchesOf(allBranches ?? noBranches, access);
  const branch = scopedBranchOf(stored, canScope, branches);
  const branchSlugs = branches.map((item) => item.slug).join(",");
  const branchesLoaded = allBranches !== undefined;

  useEffect(() => {
    if (!online || !userId || !branchesLoaded) return;

    let superseded = false;

    void import("./prime.view.hook")
      .then(({ viewQueriesOf }) => {
        if (superseded) return;

        const store = useQueryStore.getState();
        const loaded = selectBranches(store).data ?? noBranches;
        store.warm(
          viewQueriesOf({
            permissions: derivePermissions(role),
            branch,
            branches: accessibleBranchesOf(loaded, access),
            canScope,
          })
        );
      })
      .catch(ignoreUnavailableViews);

    return () => {
      superseded = true;
    };
  }, [
    online,
    userId,
    role,
    access,
    canScope,
    branch,
    branchSlugs,
    branchesLoaded,
  ]);
};
