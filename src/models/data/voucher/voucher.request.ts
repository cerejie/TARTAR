import { z } from "zod";
import {
  voucherKindSchema,
  voucherTypeSchema,
  withholdingSchema,
} from "../../../enums/voucher.enum";
import {
  amountField,
  isoDateField,
  optionalAmountField,
} from "../../../utils/schema.utils";
import { branchSlugSchema } from "../branch/branch.response";

export const voucherBreakdownShape = {
  withholding: withholdingSchema,
  ewt_amount: optionalAmountField,
  less_return: optionalAmountField,
  particulars: z.string().trim().max(500).nullable().optional(),
};

const voucherBreakdownSchema = z.object(voucherBreakdownShape);

export type IVoucherBreakdownInput = z.infer<typeof voucherBreakdownSchema> & {
  amount?: number;
};

export const isBreakdownWithinInvoice = (values: IVoucherBreakdownInput) =>
  (values.ewt_amount ?? 0) + (values.less_return ?? 0) <= (values.amount ?? 0);

export const breakdownWithinInvoiceIssue = {
  path: ["less_return"],
  message: "Withholding and return cannot exceed the invoice amount",
};

export const voucherSchema = z
  .object({
    type: voucherTypeSchema,
    kind: voucherKindSchema,
    branch: branchSlugSchema,
    payee: z.string().trim().min(1, "Payee is required").max(160),
    amount: amountField,
    supplier_id: z.string().uuid().nullable().optional(),
    due_date: isoDateField.nullable().optional(),
    bank_id: z.string().uuid().nullable().optional(),
    bank_account_id: z.string().uuid().nullable().optional(),
    check_bank: z.string().trim().max(120).nullable().optional(),
    check_number: z.string().trim().max(60).nullable().optional(),
    check_due_date: isoDateField.nullable().optional(),
    ...voucherBreakdownShape,
  })
  .superRefine((values, ctx) => {
    if (!isBreakdownWithinInvoice(values)) {
      ctx.addIssue({ code: "custom", ...breakdownWithinInvoiceIssue });
    }
    if (values.kind === "purchase" && !values.due_date) {
      ctx.addIssue({
        code: "custom",
        path: ["due_date"],
        message: "A purchase needs a due date — approval creates a payable",
      });
    }
    if (values.type !== "check") return;

    const required = [
      ["bank_account_id", values.bank_account_id, "Select the issuing bank account"],
      ["check_number", values.check_number, "Enter the check number"],
      ["check_due_date", values.check_due_date, "Enter the check due date"],
    ] as const;

    for (const [path, value, message] of required) {
      if (!value) ctx.addIssue({ code: "custom", path: [path], message });
    }
  });

export type IVoucherInput = z.infer<typeof voucherSchema>;
