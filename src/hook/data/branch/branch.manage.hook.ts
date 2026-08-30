import type { DefaultValues } from "react-hook-form";
import {
  branchCreateModalKey,
  branchEditModalKey,
} from "../../../keys/modal.keys";
import {
  branchAdminListKey,
  branchListKey,
  branchMonitorKey,
  scopedKey,
} from "../../../keys/query.keys";
import type { IFieldConfig } from "../../../models/common/field.model";
import type { IBranchInput } from "../../../models/data/branch/branch.request";
import type { IBranch } from "../../../models/data/branch/branch.response";
import type { IBranchMonitorRow } from "../../../models/data/dashboard/dashboard.response";
import dashboardServices from "../../../services/data/dashboard.services";
import referenceServices from "../../../services/data/reference.services";
import { useModal } from "../../common/modal.hook";
import { useMutation } from "../../common/mutation.hook";
import { useQuery } from "../../common/query.hook";
import { useBranchListHook } from "./branch.list.hook";
import { useBranchScopeHook } from "./branch.scope.hook";

const invalidate = [branchListKey, branchAdminListKey, branchMonitorKey];

export const branchFormFields: IFieldConfig<IBranchInput>[] = [
  {
    name: "name",
    label: "Branch name",
    type: "text",
    placeholder: "e.g. LGC Poultry",
  },
  { name: "sort", label: "Sort order", type: "number" },
  {
    name: "voucher_prefix",
    label: "Voucher prefix (3 letters)",
    type: "text",
    placeholder: "e.g. LGC",
  },
];

export const useBranchManageHook = () => {
  const createModal = useModal(branchCreateModalKey);
  const editModal = useModal<IBranch>(branchEditModalKey);

  const listQuery = useQuery<IBranch[]>(
    branchAdminListKey,
    referenceServices.getAllBranches
  );

  const allBranches = listQuery.data ?? [];
  const editing = editModal.modal.data;
  const nextSort =
    allBranches.reduce((max, branch) => Math.max(max, branch.sort), 0) + 1;

  const createMutation = useMutation(
    (values: IBranchInput) => referenceServices.createBranch(values),
    {
      successMessage: "Branch added",
      invalidate,
      onSuccess: createModal.closeModal,
    }
  );

  const updateMutation = useMutation(
    (payload: { slug: string; values: IBranchInput }) =>
      referenceServices.updateBranch(payload.slug, payload.values),
    {
      successMessage: "Branch updated",
      invalidate,
      onSuccess: editModal.closeModal,
    }
  );

  const setActiveMutation = useMutation(
    (payload: { slug: string; active: boolean }) =>
      referenceServices.setBranchActive(payload.slug, payload.active),
    { successMessage: "Branch updated", invalidate }
  );

  const { branches } = useBranchListHook();
  const { branch: scopeBranch } = useBranchScopeHook();
  const monitored = scopeBranch
    ? branches.filter((branch) => branch.slug === scopeBranch)
    : branches;

  const monitorQuery = useQuery<IBranchMonitorRow[]>(
    scopedKey(branchMonitorKey, monitored.map((b) => b.slug).join(",")),
    () => dashboardServices.getBranchMonitor(monitored),
    { enabled: monitored.length > 0 }
  );

  const createDefaults: DefaultValues<IBranchInput> = {
    name: "",
    sort: nextSort,
    voucher_prefix: "",
  };

  const editDefaults: DefaultValues<IBranchInput> = {
    name: editing?.name ?? "",
    sort: editing?.sort ?? nextSort,
    voucher_prefix: editing?.voucher_prefix ?? "",
  };

  return {
    allBranches,
    loading: listQuery.loading,
    editing,
    createModal,
    editModal,
    createDefaults,
    editDefaults,
    createMutation,
    updateMutation,
    setActiveMutation,
    monitorRows: monitorQuery.data ?? [],
    monitorLoading: monitorQuery.loading,
  };
};
