import { z } from "zod";
import { sortField } from "../../../utils/schema.utils";

export const incomeSourceSchema = z.object({
  name: z.string().trim().min(2, "Enter an income source name").max(80),
  sort: sortField,
});

export type IIncomeSourceInput = z.infer<typeof incomeSourceSchema>;
