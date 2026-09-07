import type { Control, FieldValues } from "react-hook-form";
import type { IFieldSection } from "../../../models/common/field.model";
import {
  formSection,
  formSectionDescription,
  formSectionHeader,
  formSectionTitle,
} from "../../../styles/form/form.css";
import FormFieldGrid from "./FormFieldGrid";

type IProps<TValues extends FieldValues> = {
  section: IFieldSection<TValues>;
  control: Control<TValues>;
  values: TValues;
};

const FormSection = <TValues extends FieldValues>({
  section,
  control,
  values,
}: IProps<TValues>) => {
  return (
    <section className={`${formSection}`}>
      <div className={`${formSectionHeader}`}>
        <div className={`${formSectionTitle}`}>{section.title}</div>
        {section.description ? (
          <div className={`${formSectionDescription}`}>
            {section.description}
          </div>
        ) : null}
      </div>
      <FormFieldGrid
        fields={section.fields}
        control={control}
        values={values}
      />
    </section>
  );
};

export default FormSection;
