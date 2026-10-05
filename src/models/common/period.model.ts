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

export const monthValues = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
] as const;
export type MonthValue = (typeof monthValues)[number];

export const monthLabels: Record<MonthValue, string> = {
  "01": "January",
  "02": "February",
  "03": "March",
  "04": "April",
  "05": "May",
  "06": "June",
  "07": "July",
  "08": "August",
  "09": "September",
  "10": "October",
  "11": "November",
  "12": "December",
};

export const printContentValues = ["both", "due", "vouchers"] as const;
export type PrintContent = (typeof printContentValues)[number];

export const printContentLabels: Record<PrintContent, string> = {
  both: "Purchases due and purchase vouchers",
  due: "Purchases due",
  vouchers: "Purchase vouchers created",
};

export const periodPrintSchema = z
  .object({
    period: z.enum(printPeriodValues),
    date: isoDateField,
    month: z.enum(monthValues),
    year: z.string().regex(/^\d{4}$/, "Pick a year"),
    date_from: isoDateField,
    date_to: isoDateField,
    content: z.enum(printContentValues),
  })
  .refine(
    (values) => values.period !== "custom" || values.date_from <= values.date_to,
    { path: ["date_to"], message: "End date must be on or after the start date" }
  );

export type IPeriodPrintInput = z.infer<typeof periodPrintSchema>;

export type IPeriodInput = Omit<IPeriodPrintInput, "content">;

export interface IDateRange {
  from: string;
  to: string;
}

export interface IMonthYear {
  month: MonthValue;
  year: string;
}
