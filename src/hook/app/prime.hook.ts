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
import bankServices from "../../services/data/bank.services";
import {
  customerServices,
  supplierServices,
} from "../../services/data/party.services";
import referenceServices from "../../services/data/reference.services";
import userServices from "../../services/data/user.services";
import { useNetworkStore } from "../../store/common/network.store";
import { useQueryStore } from "../../store/common/query.store";
import {
  selectIsManager,
  selectUserId,
  useAccountStore,
} from "../../store/data/account/account.store";

type ILookupQuery = [string, () => Promise<unknown>];

const sharedLookups: readonly ILookupQuery[] = [
  [branchListKey, referenceServices.getBranches],
  [farmSectionListKey, referenceServices.getFarmSections],
  [expenseCategoryListKey, referenceServices.getAllExpenseCategories],
  [incomeSourceListKey, referenceServices.getAllIncomeSources],
  [bankListKey, bankServices.getBanks],
  [bankAccountListKey, bankServices.getAccounts],
  [customerListKey, () => customerServices.getList()],
  [supplierListKey, () => supplierServices.getList()],
];

const managerUserLookup: ILookupQuery = [
  userListKey,
  () => userServices.getList(),
];

const staffUserLookup: ILookupQuery = [
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
