import type { IMutationResult } from "../../models/common/query.model";
import type { IQueuedWrite } from "../../models/common/write.model";
import type { IBranchInput } from "../../models/data/branch/branch.request";
import type {
  IBranch,
  IFarmSection,
} from "../../models/data/branch/branch.response";
import type { IExpenseCategoryInput } from "../../models/data/expense-category/expense.category.request";
import type { IExpenseCategory } from "../../models/data/expense-category/expense.category.response";
import type { IIncomeSourceInput } from "../../models/data/income-source/income.source.request";
import type { IIncomeSource } from "../../models/data/income-source/income.source.response";
import { runWrite } from "../../store/common/sync.store";
import { slugify } from "../../utils/slug.utils";
import { supabase, toError } from "../../utils/supabase.utils";
import { queuedAtOf, queuedInsertOf } from "../../utils/write.utils";

const branchTable = "branches";
const farmSectionTable = "farm_sections";
const expenseCategoryTable = "expense_categories";
const incomeSourceTable = "income_sources";

const branchColumns = "slug, name, sort, active, voucher_prefix, legal_name, address";
const expenseCategoryColumns = "slug, name, code, sort, active, created_at";
const incomeSourceColumns = "slug, name, sort, active, created_at";

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

const orderedIncomeSources = () =>
  supabase
    .from(incomeSourceTable)
    .select(incomeSourceColumns)
    .order("sort", { ascending: true })
    .order("name", { ascending: true });

const branchErrors: Record<string, string> = {
  "23505": "A branch with a similar name already exists",
};

const categoryErrors: Record<string, string> = {
  "23505": "That voucher code or a similar name is already used by another category",
  "23503": "This category is used by existing expenses — archive it instead",
};

const incomeSourceErrors: Record<string, string> = {
  "23505": "An income source with a similar name already exists",
  "23503": "This income source is used by existing sales — archive it instead",
};

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

  createBranch: async (
    values: IBranchInput
  ): Promise<IMutationResult & { slug: string }> => {
    const slug = slugify(values.name);
    if (!slug) throw new Error("Branch name must contain letters or numbers");

    const result = await runWrite({
      label: `New branch "${values.name.trim()}"`,
      kind: "insert",
      table: branchTable,
      values: {
        slug,
        name: values.name.trim(),
        sort: values.sort,
        active: true,
        voucher_prefix: values.voucher_prefix,
        legal_name: values.legal_name ?? null,
        address: values.address ?? null,
      },
      errors: branchErrors,
    });

    return { ...result, slug };
  },

  updateBranch: (slug: string, values: IBranchInput) =>
    runWrite({
      label: `Update branch "${values.name.trim()}"`,
      kind: "update",
      table: branchTable,
      values: {
        name: values.name.trim(),
        sort: values.sort,
        voucher_prefix: values.voucher_prefix,
        legal_name: values.legal_name ?? null,
        address: values.address ?? null,
      },
      match: { slug },
    }),

  setBranchActive: (slug: string, active: boolean) =>
    runWrite({
      label: active ? "Restore branch" : "Archive branch",
      kind: "update",
      table: branchTable,
      values: { active },
      match: { slug },
    }),

  pendingBranchOf: (write: IQueuedWrite): IBranch | null =>
    queuedInsertOf(write, branchTable) as IBranch | null,

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

  createExpenseCategory: async (values: IExpenseCategoryInput) => {
    const slug = slugify(values.name);
    if (!slug) throw new Error("Category name must contain letters or numbers");

    return runWrite({
      label: `New expense type "${values.name.trim()}"`,
      kind: "insert",
      table: expenseCategoryTable,
      values: {
        slug,
        name: values.name.trim(),
        code: values.code,
        sort: values.sort,
        active: true,
      },
      errors: categoryErrors,
    });
  },

  ensureExpenseCategory: async (name: string): Promise<string> => {
    const slug = slugify(name);
    if (!slug) throw new Error("Expense type must contain letters or numbers");

    await runWrite({
      label: `New expense type "${name.trim()}"`,
      kind: "rpc",
      fn: "ensure_expense_category",
      args: { p_slug: slug, p_name: name.trim() },
    });

    return slug;
  },

  updateExpenseCategory: (slug: string, values: IExpenseCategoryInput) =>
    runWrite({
      label: `Update expense type "${values.name.trim()}"`,
      kind: "update",
      table: expenseCategoryTable,
      values: {
        name: values.name.trim(),
        code: values.code,
        sort: values.sort,
      },
      match: { slug },
      errors: categoryErrors,
    }),

  setExpenseCategoryActive: (slug: string, active: boolean) =>
    runWrite({
      label: active ? "Restore expense type" : "Archive expense type",
      kind: "update",
      table: expenseCategoryTable,
      values: { active },
      match: { slug },
    }),

  deleteExpenseCategory: (slug: string) =>
    runWrite({
      label: "Delete expense type",
      kind: "delete",
      table: expenseCategoryTable,
      match: { slug },
      errors: categoryErrors,
    }),

  pendingExpenseCategoryOf: (write: IQueuedWrite): IExpenseCategory | null => {
    const values = queuedInsertOf(write, expenseCategoryTable);
    if (!values) return null;

    return { created_at: queuedAtOf(write), ...values } as IExpenseCategory;
  },

  getAllIncomeSources: async (): Promise<IIncomeSource[]> => {
    const { data, error } = await orderedIncomeSources();
    if (error) throw toError(error);

    return (data ?? []) as IIncomeSource[];
  },

  createIncomeSource: async (values: IIncomeSourceInput) => {
    const slug = slugify(values.name);
    if (!slug)
      throw new Error("Income source name must contain letters or numbers");

    return runWrite({
      label: `New income source "${values.name.trim()}"`,
      kind: "insert",
      table: incomeSourceTable,
      values: {
        slug,
        name: values.name.trim(),
        sort: values.sort,
        active: true,
      },
      errors: incomeSourceErrors,
    });
  },

  updateIncomeSource: (slug: string, values: IIncomeSourceInput) =>
    runWrite({
      label: `Update income source "${values.name.trim()}"`,
      kind: "update",
      table: incomeSourceTable,
      values: { name: values.name.trim(), sort: values.sort },
      match: { slug },
    }),

  setIncomeSourceActive: (slug: string, active: boolean) =>
    runWrite({
      label: active ? "Restore income source" : "Archive income source",
      kind: "update",
      table: incomeSourceTable,
      values: { active },
      match: { slug },
    }),

  deleteIncomeSource: (slug: string) =>
    runWrite({
      label: "Delete income source",
      kind: "delete",
      table: incomeSourceTable,
      match: { slug },
      errors: incomeSourceErrors,
    }),

  pendingIncomeSourceOf: (write: IQueuedWrite): IIncomeSource | null => {
    const values = queuedInsertOf(write, incomeSourceTable);
    if (!values) return null;

    return { created_at: queuedAtOf(write), ...values } as IIncomeSource;
  },
};

export default referenceServices;
