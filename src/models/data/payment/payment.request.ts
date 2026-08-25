import { z } from "zod";
import { isoDateField } from "../../../utils/schema.utils";
import type { IAllocationDraft } from "./payment.response";

export const paymentDetailsSchema = z.object({
  paid_at: isoDateField,
  reference_number: z.string().trim().max(80).nullable().optional(),
});

export type IPaymentDetailsInput = z.infer<typeof paymentDetailsSchema>;

export const paymentFormSchema = paymentDetailsSchema.extend({
  amounts: z.record(z.string(), z.coerce.number().min(0)),
});

export type IPaymentFormInput = IPaymentDetailsInput & {
  amounts: Record<string, number>;
};

export interface IRecordPaymentInput {
  partyId: string | null;
  partyName: string;
  paidAt: string;
  referenceNumber: string | null;
  allocations: IAllocationDraft[];
}
