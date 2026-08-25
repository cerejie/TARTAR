import { z } from "zod";
import { codeField, sortField } from "../../../utils/schema.utils";

export const branchSchema = z.object({
  name: z.string().trim().min(2, "Enter a branch name").max(80),
  sort: sortField,
  voucher_prefix: codeField("LGC"),
});

export type IBranchInput = z.infer<typeof branchSchema>;
