import type { FieldValues, Path } from "react-hook-form";
import type {
  IFieldConfig,
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
