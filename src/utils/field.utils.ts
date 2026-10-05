import { get, type FieldErrors, type FieldValues, type Path } from "react-hook-form";
import type {
  IFieldConfig,
  IFieldSection,
  IFieldType,
} from "../models/common/field.model";

const keyboardFieldTypes: readonly IFieldType[] = [
  "text",
  "password",
  "phone",
  "number",
  "amount",
];

const sheetFieldTypes: readonly IFieldType[] = [
  "text",
  "textarea",
  "phone",
  "number",
  "amount",
  "select",
  "creatable",
];

export const searchableOptionCount = 8;

export const asText = (value: unknown): string =>
  typeof value === "string" || typeof value === "number" ? String(value) : "";

export const asNumber = (text: string): number | null => {
  if (text === "") return null;
  const amount = Number(text);
  return Number.isFinite(amount) ? amount : null;
};

export const phoneLength = 11;

export const asPhone = (text: string): string =>
  text.replace(/\D/g, "").slice(0, phoneLength);

export const sanitizeAmount = (text: string): string => {
  const [whole = "", ...rest] = text.replace(/[^\d.]/g, "").split(".");
  if (rest.length === 0) return whole;
  return `${whole}.${rest.join("").slice(0, 2)}`;
};

export const asAmountText = (value: unknown): string => {
  const amount = typeof value === "number" ? value : asNumber(asText(value));
  return amount === null ? "" : amount.toFixed(2);
};

export const sanitizeDraft = (type: IFieldType, text: string): string => {
  if (type === "amount") return sanitizeAmount(text);
  if (type === "phone") return asPhone(text);
  return text;
};

export const inputModeOf = <TValues extends FieldValues>(
  config: IFieldConfig<TValues>
): IFieldConfig<TValues>["inputMode"] => {
  if (config.type === "amount") return "decimal";
  if (config.type === "number" || config.type === "phone") return "numeric";
  return config.inputMode;
};

export const usesFieldSheet = <TValues extends FieldValues>(
  config: IFieldConfig<TValues>
): boolean => sheetFieldTypes.includes(config.type) && !config.autoComplete;

export const sheetHasInput = <TValues extends FieldValues>(
  config: IFieldConfig<TValues>
): boolean =>
  config.type !== "select" ||
  (config.options?.length ?? 0) > searchableOptionCount;

export const lastKeyboardFieldOf = <TValues extends FieldValues>(
  fields: readonly IFieldConfig<TValues>[],
  values: TValues
): Path<TValues> | undefined =>
  fields
    .filter(
      (field) =>
        keyboardFieldTypes.includes(field.type) && !field.hidden?.(values)
    )
    .at(-1)?.name;

export const visibleSectionsOf = <TValues extends FieldValues>(
  sections: readonly IFieldSection<TValues>[],
  values: TValues
): IFieldSection<TValues>[] =>
  sections.filter((section) =>
    section.fields.some((field) => !field.hidden?.(values))
  );

export const sectionHasError = <TValues extends FieldValues>(
  section: IFieldSection<TValues>,
  errors: FieldErrors<TValues>
): boolean => section.fields.some((field) => !!get(errors, field.name));
