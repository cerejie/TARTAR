import type { Control, FieldValues } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { IFieldSection } from "../../../models/common/field.model";
import {
  formSection,
  formSectionHeader,
  formSectionTitle,
} from "../../../styles/form/form.styles";
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
    <Card className={formSection}>
      <CardHeader className={formSectionHeader}>
        <CardTitle className={formSectionTitle}>{section.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <FormFieldGrid
          fields={section.fields}
          control={control}
          values={values}
        />
      </CardContent>
    </Card>
  );
};

export default FormSection;
