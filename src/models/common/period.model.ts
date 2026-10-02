import { z } from "zod";
import { isoDateField } from "../../utils/schema.utils";

export const printPeriodValues = ["daily", "weekly", "monthly", "custom"] as const;
export type PrintPeriod = (typeof printPeriodValues)[number];

export const printPeriodLabels: Record<PrintPeriod, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  custom: "Custom range",
};

export const quickDateValues = ["today", "week", "month"] as const;
export type QuickDate = (typeof quickDateValues)[number];

export const quickDateLabels: Record<QuickDate, string> = {
  today: "Today",
  week: "This week",
  month: "This month",
};

export const periodPrintSchema = z
  .object({
    period: z.enum(printPeriodValues),
    date: isoDateField,
    date_from: isoDateField,
    date_to: isoDateField,
  })
  .refine(
    (values) => values.period !== "custom" || values.date_from <= values.date_to,
    { path: ["date_to"], message: "End date must be on or after the start date" }
  );

export type IPeriodPrintInput = z.infer<typeof periodPrintSchema>;

export interface IDateRange {
  from: string;
  to: string;
}
