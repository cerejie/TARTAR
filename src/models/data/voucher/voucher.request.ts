import { z } from "zod";
import {
  voucherKindSchema,
  voucherTypeSchema,
} from "../../../enums/voucher.enum";
import { amountField, isoDateField } from "../../../utils/schema.utils";
import { branchSlugSchema } from "../branch/branch.response";

export const voucherSchema = z
  .object({
    type: voucherTypeSchema,
    kind: voucherKindSchema,
    branch: branchSlugSchema,
    payee: z.string().trim().min(1, "Payee is required").max(160),
    amount: amountField,
    supplier_id: z.string().uuid().nullable().optional(),
    due_date: isoDateField.nullable().optional(),
    check_bank: z.string().trim().max(120).nullable().optional(),
    check_number: z.string().trim().max(60).nullable().optional(),
    check_due_date: isoDateField.nullable().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.kind === "purchase" && !values.due_date) {
      ctx.addIssue({
        code: "custom",
        path: ["due_date"],
        message: "A purchase needs a due date — approval creates a payable",
      });
    }
    if (values.type !== "check") return;

    const required = [
      ["check_bank", values.check_bank, "Enter the issuing bank"],
      ["check_number", values.check_number, "Enter the check number"],
      ["check_due_date", values.check_due_date, "Enter the check due date"],
    ] as const;

    for (const [path, value, message] of required) {
      if (!value) ctx.addIssue({ code: "custom", path: [path], message });
    }
  });

export type IVoucherInput = z.infer<typeof voucherSchema>;
