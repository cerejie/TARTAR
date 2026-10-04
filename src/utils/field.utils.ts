import { get, type FieldErrors, type FieldValues, type Path } from "react-hook-form";
import type {
  IFieldConfig,
  IFieldSection,
  IFieldType,
} from "../models/common/field.model";

const keyboardFieldTypes: readonly IFieldType[] = [
  "text",
  "password",
  "number",
  "amount",
];

const sheetFieldTypes: readonly IFieldType[] = [
  "text",
  "textarea",
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
