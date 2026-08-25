import { z } from "zod";
import { codeField, sortField } from "../../../utils/schema.utils";

export const expenseCategorySchema = z.object({
  name: z.string().trim().min(2, "Enter a category name").max(80),
  code: codeField("FUE"),
  sort: sortField,
});

export type IExpenseCategoryInput = z.infer<typeof expenseCategorySchema>;
