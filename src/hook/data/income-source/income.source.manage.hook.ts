import {
  incomeSourceCreateModalKey,
  incomeSourceEditModalKey,
} from "../../../keys/modal.keys";
import { incomeSourceListKey } from "../../../keys/query.keys";
import referenceServices from "../../../services/data/reference.services";
import { useConfirm } from "../../common/confirmation.hook";
import { useModal } from "../../common/modal.hook";
import { useMutation } from "../../common/mutation.hook";
import { useIncomeSourceListHook } from "./income.source.list.hook";
import type { DefaultValues } from "react-hook-form";
import type { IFieldConfig } from "../../../models/common/field.model";
import type { IIncomeSourceInput } from "../../../models/data/income-source/income.source.request";
import type { IIncomeSource } from "../../../models/data/income-source/income.source.response";

export const incomeSourceFormFields: IFieldConfig<IIncomeSourceInput>[] = [
  {
    name: "name",
    label: "Income source",
    type: "text",
    required: true,
    placeholder: "e.g. Service Fees",
  },
  { name: "sort", label: "Sort order", type: "number", required: true },
];

export const useIncomeSourceManageHook = () => {
  const createModal = useModal(incomeSourceCreateModalKey);
  const editModal = useModal<IIncomeSource>(incomeSourceEditModalKey);
  const openConfirm = useConfirm();
  const { incomeSources, isInitialLoading, isRefreshing, error, refetch } =
    useIncomeSourceListHook();

  const invalidate = [incomeSourceListKey];
  const editing = editModal.modal.data;
  const nextSort =
    incomeSources.reduce((max, source) => Math.max(max, source.sort), 0) + 1;

  const createMutation = useMutation(
    (values: IIncomeSourceInput) => referenceServices.createIncomeSource(values),
    {
      successMessage: "Income source added",
      invalidate,
      onSuccess: createModal.closeModal,
    }
  );

  const updateMutation = useMutation(
    (payload: { slug: string; values: IIncomeSourceInput }) =>
      referenceServices.updateIncomeSource(payload.slug, payload.values),
    {
      successMessage: "Income source updated",
      invalidate,
      onSuccess: editModal.closeModal,
    }
  );

  const setActiveMutation = useMutation(
    (payload: { slug: string; active: boolean }) =>
      referenceServices.setIncomeSourceActive(payload.slug, payload.active),
    { successMessage: "Income source updated", invalidate }
  );

  const removeMutation = useMutation(
    (slug: string) => referenceServices.deleteIncomeSource(slug),
    { successMessage: "Income source deleted", invalidate }
  );

  const confirmArchive = (source: IIncomeSource) =>
    openConfirm({
      title: `Archive ${source.name}?`,
      message: "It stops appearing on the sale form but past sales keep it.",
      okText: "Archive",
      onConfirm: () =>
        setActiveMutation.mutate({ slug: source.slug, active: false }),
    });

  const confirmRestore = (source: IIncomeSource) =>
    openConfirm({
      title: `Restore ${source.name}?`,
      message: "It appears on the sale form again.",
      okText: "Restore",
      onConfirm: () =>
        setActiveMutation.mutate({ slug: source.slug, active: true }),
    });

  const confirmRemove = (source: IIncomeSource) =>
    openConfirm({
      kind: "delete",
      title: `Delete ${source.name}?`,
      message: "Only possible while no sale uses it — otherwise archive it.",
      onConfirm: () => removeMutation.mutate(source.slug),
    });

  const createDefaults: DefaultValues<IIncomeSourceInput> = {
    name: "",
    sort: nextSort,
  };

  const editDefaults: DefaultValues<IIncomeSourceInput> = {
    name: editing?.name ?? "",
    sort: editing?.sort ?? nextSort,
  };

  return {
    incomeSources,
    loading: isInitialLoading,
    refreshing: isRefreshing,
    error,
    retry: refetch,
    editing,
    createModal,
    editModal,
    createDefaults,
    editDefaults,
    createMutation,
    updateMutation,
    confirmArchive,
    confirmRestore,
    confirmRemove,
  };
};
