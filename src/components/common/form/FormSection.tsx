import { ChevronDown } from "lucide-react";
import type { Control, FieldValues, Path } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { IFieldSection } from "../../../models/common/field.model";
import {
  formSection,
  formSectionChevron,
  formSectionDisclosure,
  formSectionHeader,
  formSectionHeaderToggle,
  formSectionPanelBody,
  formSectionTitle,
  formSectionToggle,
} from "../../../styles/form/form.styles";
import FormFieldGrid from "./FormFieldGrid";

type IProps<TValues extends FieldValues> = {
  section: IFieldSection<TValues>;
  control: Control<TValues>;
  values: TValues;
  lastKeyboardField?: Path<TValues>;
  collapsible?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
};

const FormSection = <TValues extends FieldValues>({
  section,
  control,
  values,
  lastKeyboardField,
  collapsible = false,
  expanded = true,
  onExpandedChange,
}: IProps<TValues>) => {
  const grid = (
    <CardContent className={collapsible ? formSectionPanelBody : undefined}>
      <FormFieldGrid
        fields={section.fields}
        control={control}
        values={values}
        lastKeyboardField={lastKeyboardField}
      />
    </CardContent>
  );

  if (!collapsible) {
    return (
      <Card className={formSection}>
        <CardHeader className={formSectionHeader}>
          <CardTitle className={formSectionTitle}>{section.title}</CardTitle>
        </CardHeader>
        {grid}
      </Card>
    );
  }

  return (
    <Card className={formSection}>
      <Collapsible
        className={formSectionDisclosure}
        isExpanded={expanded}
        onExpandedChange={onExpandedChange}
      >
        <CardHeader className={formSectionHeaderToggle}>
          <CollapsibleTrigger className={formSectionToggle}>
            <span className={formSectionTitle}>{section.title}</span>
            <ChevronDown className={formSectionChevron} />
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>{grid}</CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default FormSection;
