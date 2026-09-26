import type { ReactNode } from "react";
import { useId } from "react";
import { Field, FieldTitle } from "@/components/ui/field";
import { filterField } from "../../../styles/filter/filter.styles";

type IProps = {
  label: string;
  children: ReactNode;
};

const FilterField = ({ label, children }: IProps) => {
  const labelId = useId();

  return (
    <Field aria-labelledby={labelId} className={filterField}>
      <FieldTitle id={labelId}>{label}</FieldTitle>
      {children}
    </Field>
  );
};

export default FilterField;
