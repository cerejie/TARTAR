import type { Control, FieldValues } from "react-hook-form";
import type { IFieldConfig } from "../../../models/common/field.model";
import { formGrid } from "../../../styles/form/form.css";
import FormField from "./FormField";

type IProps<TValues extends FieldValues> = {
  fields: IFieldConfig<TValues>[];
  control: Control<TValues>;
  values: TValues;
};

const FormFieldGrid = <TValues extends FieldValues>({
  fields,
  control,
  values,
}: IProps<TValues>) => {
  return (
    <div className={`${formGrid}`}>
      {fields
        .filter((field) => !field.hidden?.(values))
        .map((field) => (
          <FormField
            key={String(field.name)}
            config={field}
            control={control}
          />
        ))}
    </div>
  );
};

export default FormFieldGrid;
