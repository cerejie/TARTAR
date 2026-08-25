import type { IBranchInput } from "../../models/data/branch/branch.request";
import type {
  IBranch,
  IFarmSection,
} from "../../models/data/branch/branch.response";
import type { IExpenseCategoryInput } from "../../models/data/expense-category/expense.category.request";
import type { IExpenseCategory } from "../../models/data/expense-category/expense.category.response";
import { slugify } from "../../utils/slug.utils";
import { supabase, toError } from "../../utils/supabase.utils";

const branchTable = "branches";
const farmSectionTable = "farm_sections";
const expenseCategoryTable = "expense_categories";

const branchColumns = "slug, name, sort, active, voucher_prefix";
const expenseCategoryColumns = "slug, name, code, sort, active, created_at";

const orderedBranches = () =>
  supabase
    .from(branchTable)
    .select(branchColumns)
    .order("sort", { ascending: true });

const orderedCategories = () =>
  supabase
    .from(expenseCategoryTable)
    .select(expenseCategoryColumns)
    .order("sort", { ascending: true })
    .order("name", { ascending: true });

const categoryConflict = (code: string, message: string): Error =>
  new Error(
    message.includes("code")
      ? `Voucher code ${code} is already used by another category`
      : "A category with a similar name already exists"
  );

const referenceServices = {
  getBranches: async (): Promise<IBranch[]> => {
    const { data, error } = await orderedBranches().eq("active", true);
    if (error) throw toError(error);

    return (data ?? []) as IBranch[];
  },

  getAllBranches: async (): Promise<IBranch[]> => {
    const { data, error } = await orderedBranches();
    if (error) throw toError(error);

    return (data ?? []) as IBranch[];
  },

  createBranch: async (values: IBranchInput): Promise<IBranch> => {
    const slug = slugify(values.name);
    if (!slug) throw new Error("Branch name must contain letters or numbers");

    const { data, error } = await supabase
      .from(branchTable)
      .insert({
        slug,
        name: values.name.trim(),
        sort: values.sort,
        active: true,
        voucher_prefix: values.voucher_prefix,
      })
      .select(branchColumns)
      .single();

    if (error) {
      if (error.code === "23505")
        throw new Error("A branch with a similar name already exists");
      throw toError(error);
    }

    return data as IBranch;
  },

  updateBranch: async (
    slug: string,
    values: IBranchInput
  ): Promise<void> => {
    const { error } = await supabase
      .from(branchTable)
      .update({
        name: values.name.trim(),
        sort: values.sort,
        voucher_prefix: values.voucher_prefix,
      })
      .eq("slug", slug);

    if (error) throw toError(error);
  },

  setBranchActive: async (slug: string, active: boolean): Promise<void> => {
    const { error } = await supabase
      .from(branchTable)
      .update({ active })
      .eq("slug", slug);

    if (error) throw toError(error);
  },

  getFarmSections: async (): Promise<IFarmSection[]> => {
    const { data, error } = await supabase
      .from(farmSectionTable)
      .select("slug, name")
      .order("name", { ascending: true });

    if (error) throw toError(error);

    return (data ?? []) as IFarmSection[];
  },

  getExpenseCategories: async (): Promise<IExpenseCategory[]> => {
    const { data, error } = await orderedCategories().eq("active", true);
    if (error) throw toError(error);

    return (data ?? []) as IExpenseCategory[];
  },

  getAllExpenseCategories: async (): Promise<IExpenseCategory[]> => {
    const { data, error } = await orderedCategories();
    if (error) throw toError(error);

    return (data ?? []) as IExpenseCategory[];
  },

  createExpenseCategory: async (
    values: IExpenseCategoryInput
  ): Promise<IExpenseCategory> => {
    const slug = slugify(values.name);
    if (!slug) throw new Error("Category name must contain letters or numbers");

    const { data, error } = await supabase
      .from(expenseCategoryTable)
      .insert({
        slug,
        name: values.name.trim(),
        code: values.code,
        sort: values.sort,
        active: true,
      })
      .select(expenseCategoryColumns)
      .single();

    if (error) {
      if (error.code === "23505")
        throw categoryConflict(values.code, error.message);
      throw toError(error);
    }

    return data as IExpenseCategory;
  },

  updateExpenseCategory: async (
    slug: string,
    values: IExpenseCategoryInput
  ): Promise<void> => {
    const { error } = await supabase
      .from(expenseCategoryTable)
      .update({
        name: values.name.trim(),
        code: values.code,
        sort: values.sort,
      })
      .eq("slug", slug);

    if (error) {
      if (error.code === "23505")
        throw categoryConflict(values.code, error.message);
      throw toError(error);
    }
  },

  setExpenseCategoryActive: async (
    slug: string,
    active: boolean
  ): Promise<void> => {
    const { error } = await supabase
      .from(expenseCategoryTable)
      .update({ active })
      .eq("slug", slug);

    if (error) throw toError(error);
  },

  deleteExpenseCategory: async (slug: string): Promise<void> => {
    const { error } = await supabase
      .from(expenseCategoryTable)
      .delete()
      .eq("slug", slug);

    if (error) {
      if (error.code === "23503")
        throw new Error(
          "This category is used by existing expenses — archive it instead"
        );
      throw toError(error);
    }
  },
};

export default referenceServices;
