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
