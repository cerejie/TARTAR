import { z } from "zod";
import {
  codeField,
  optionalText,
  sortField,
} from "../../../utils/schema.utils";

export const branchSchema = z.object({
  name: z.string().trim().min(2, "Enter a branch name").max(80),
  sort: sortField,
  voucher_prefix: codeField("LGC"),
  legal_name: optionalText(120),
  address: optionalText(240),
});

export type IBranchInput = z.infer<typeof branchSchema>;
