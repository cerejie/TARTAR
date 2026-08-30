import type { DefaultValues } from "react-hook-form";
import {
  expenseCategoryCreateModalKey,
  expenseCategoryEditModalKey,
} from "../../../keys/modal.keys";
import { expenseCategoryListKey } from "../../../keys/query.keys";
import type { IExpenseCategoryInput } from "../../../models/data/expense-category/expense.category.request";
import type { IExpenseCategory } from "../../../models/data/expense-category/expense.category.response";
import referenceServices from "../../../services/data/reference.services";
import { useModal } from "../../common/modal.hook";
import { useMutation } from "../../common/mutation.hook";
import { useExpenseCategoryListHook } from "./expense.category.list.hook";

export const useExpenseCategoryManageHook = () => {
  const createModal = useModal(expenseCategoryCreateModalKey);
  const editModal = useModal<IExpenseCategory>(expenseCategoryEditModalKey);
  const { expenseCategories, loading } = useExpenseCategoryListHook();

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
    loading,
    editing,
    createModal,
    editModal,
    createDefaults,
    editDefaults,
    createMutation,
    updateMutation,
    setActiveMutation,
    removeMutation,
  };
};
