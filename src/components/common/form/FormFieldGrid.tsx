import type { Control, FieldValues, Path } from "react-hook-form";
import type { IFieldConfig } from "../../../models/common/field.model";
import { formGrid } from "../../../styles/form/form.styles";
import { lastKeyboardFieldOf } from "../../../utils/field.utils";
import FormField from "./FormField";

type IProps<TValues extends FieldValues> = {
  fields: IFieldConfig<TValues>[];
  control: Control<TValues>;
  values: TValues;
  lastKeyboardField?: Path<TValues>;
};

const FormFieldGrid = <TValues extends FieldValues>({
  fields,
  control,
  values,
  lastKeyboardField = lastKeyboardFieldOf(fields, values),
}: IProps<TValues>) => {
  return (
    <div className={formGrid}>
      {fields
        .filter((field) => !field.hidden?.(values))
        .map((field) => (
          <FormField
            key={String(field.name)}
            config={
              field.optionsOf
                ? { ...field, options: field.optionsOf(values) }
                : field
            }
            control={control}
            enterKeyHint={field.name === lastKeyboardField ? "done" : "next"}
          />
        ))}
    </div>
  );
};

export default FormFieldGrid;
