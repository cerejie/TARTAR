import { z } from "zod";

export const amountField = z.coerce
  .number({ message: "Enter a valid amount" })
  .positive("Amount must be greater than zero")
  .max(1_000_000_000);

export const isoDateField = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date");

export const sortField = z
  .number({ error: "Enter a number" })
  .int("Whole number only")
  .min(0)
  .max(999);

export const codeField = (example: string) =>
  z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, `3 letters, e.g. ${example}`);

export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .optional()
    .transform((value) => value || null);
