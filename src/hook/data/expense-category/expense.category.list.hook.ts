import { expenseCategoryListKey } from "../../../keys/query.keys";
import type { IExpenseCategory } from "../../../models/data/expense-category/expense.category.response";
import referenceServices from "../../../services/data/reference.services";
import { useQuery } from "../../common/query.hook";

export const useExpenseCategoryListHook = () => {
  const query = useQuery<IExpenseCategory[]>(
    expenseCategoryListKey,
    referenceServices.getAllExpenseCategories
  );

  const expenseCategories = query.data ?? [];
  const bySlug = new Map(
    expenseCategories.map((category) => [category.slug, category])
  );

  return {
    ...query,
    expenseCategories,
    labelOf: (slug: string | null | undefined) =>
      slug ? bySlug.get(slug)?.name ?? slug : "—",
    optionsFor: (keepSlug?: string | null) =>
      expenseCategories
        .filter((category) => category.active || category.slug === keepSlug)
        .map((category) => ({ value: category.slug, label: category.name })),
  };
};
