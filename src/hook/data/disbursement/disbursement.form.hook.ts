import type { DisbursementKind } from "../../../enums/transaction.enum";
import type { IExpenseCategory } from "../../../models/data/expense-category/expense.category.response";
import type { IDisbursementInput } from "../../../models/data/transaction/transaction.request";
import { supplierServices } from "../../../services/data/party.services";
import referenceServices from "../../../services/data/reference.services";
import { nameKey } from "../../../utils/fuzzy.utils";
import { resolveParty } from "../../../utils/party.utils";
import { slugify } from "../../../utils/slug.utils";
import { useExpenseCategoryListHook } from "../expense-category/expense.category.list.hook";
import { useSupplierListHook } from "../party/supplier.list.hook";

const resolveExpenseType = async (
  categories: readonly IExpenseCategory[],
  typed: string
): Promise<string> => {
  const name = typed.trim();
  const slug = slugify(name);
  const existing = categories.find(
    (category) =>
      nameKey(category.name) === nameKey(name) || category.slug === slug
  );
  if (existing) return existing.slug;

  return referenceServices.ensureExpenseCategory(name);
};

export const useDisbursementFormHook = (kind: DisbursementKind) => {
  const { suppliers, supplierOptions } = useSupplierListHook();
  const { expenseCategories } = useExpenseCategoryListHook();

  const resolveExpenseTypeOf = async (values: IDisbursementInput) =>
    kind === "expense" && values.expense_type
      ? resolveExpenseType(expenseCategories, values.expense_type)
      : values.expense_type;

  const prepare = async (
    values: IDisbursementInput
  ): Promise<IDisbursementInput> => {
    const supplier = await resolveParty(
      suppliers,
      values.payee ?? "",
      supplierServices.create
    );

    return {
      ...values,
      supplier_id: supplier.id,
      payee: supplier.name,
      expense_type: await resolveExpenseTypeOf(values),
    };
  };

  return {
    payeeOptions: supplierOptions,
    prepare,
  };
};
