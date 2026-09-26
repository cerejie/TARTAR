import type { DefaultValues } from "react-hook-form";
import {
  expenseCategoryCreateModalKey,
  expenseCategoryEditModalKey,
} from "../../../keys/modal.keys";
import { expenseCategoryListKey } from "../../../keys/query.keys";
import type { IFieldConfig } from "../../../models/common/field.model";
import type { IExpenseCategoryInput } from "../../../models/data/expense-category/expense.category.request";
import type { IExpenseCategory } from "../../../models/data/expense-category/expense.category.response";
import referenceServices from "../../../services/data/reference.services";
import { useConfirm } from "../../common/confirmation.hook";
import { useModal } from "../../common/modal.hook";
import { useMutation } from "../../common/mutation.hook";
import { useExpenseCategoryListHook } from "./expense.category.list.hook";

export const expenseCategoryFormFields: IFieldConfig<IExpenseCategoryInput>[] =
  [
    {
      name: "name",
      label: "Category name",
      type: "text",
      required: true,
      placeholder: "e.g. Fuel",
    },
    {
      name: "code",
      label: "Voucher code (3 letters)",
      type: "text",
      required: true,
      placeholder: "e.g. FUE",
    },
    { name: "sort", label: "Sort order", type: "number", required: true },
  ];

export const useExpenseCategoryManageHook = () => {
  const createModal = useModal(expenseCategoryCreateModalKey);
  const editModal = useModal<IExpenseCategory>(expenseCategoryEditModalKey);
  const openConfirm = useConfirm();
  const {
    expenseCategories,
    isInitialLoading,
    isRefreshing,
    error,
    refetch,
  } = useExpenseCategoryListHook();

  const invalidate = [expenseCategoryListKey];
  const editing = editModal.modal.data;
  const nextSort =
    expenseCategories.reduce((max, category) => Math.max(max, category.sort), 0) +
    1;

  const createMutation = useMutation(
    (values: IExpenseCategoryInput) =>
      referenceServices.createExpenseCategory(values),
    {
      successMessage: "Category added",
      invalidate,
      onSuccess: createModal.closeModal,
    }
  );

  const updateMutation = useMutation(
    (payload: { slug: string; values: IExpenseCategoryInput }) =>
      referenceServices.updateExpenseCategory(payload.slug, payload.values),
    {
      successMessage: "Category updated",
      invalidate,
      onSuccess: editModal.closeModal,
    }
  );

  const setActiveMutation = useMutation(
    (payload: { slug: string; active: boolean }) =>
      referenceServices.setExpenseCategoryActive(payload.slug, payload.active),
    { successMessage: "Category updated", invalidate }
  );

  const removeMutation = useMutation(
    (slug: string) => referenceServices.deleteExpenseCategory(slug),
    { successMessage: "Category deleted", invalidate }
  );

  const confirmArchive = (category: IExpenseCategory) =>
    openConfirm({
      title: `Archive ${category.name}?`,
      message:
        "It stops appearing on the expense form but past expenses keep it.",
      okText: "Archive",
      onConfirm: () =>
        setActiveMutation.mutate({ slug: category.slug, active: false }),
    });

  const confirmRestore = (category: IExpenseCategory) =>
    openConfirm({
      title: `Restore ${category.name}?`,
      message: "It appears on the expense form again.",
      okText: "Restore",
      onConfirm: () =>
        setActiveMutation.mutate({ slug: category.slug, active: true }),
    });

  const confirmRemove = (category: IExpenseCategory) =>
    openConfirm({
      kind: "delete",
      title: `Delete ${category.name}?`,
      message: "Only possible while no expense uses it — otherwise archive it.",
      onConfirm: () => removeMutation.mutate(category.slug),
    });

  const createDefaults: DefaultValues<IExpenseCategoryInput> = {
    name: "",
    code: "",
    sort: nextSort,
  };

  const editDefaults: DefaultValues<IExpenseCategoryInput> = {
    name: editing?.name ?? "",
    code: editing?.code ?? "",
    sort: editing?.sort ?? nextSort,
  };

  return {
    expenseCategories,
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
