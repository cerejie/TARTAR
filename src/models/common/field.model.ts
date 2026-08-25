import type { ReactNode } from "react";
import type { FieldValues, Path } from "react-hook-form";

export type IFieldType =
  | "text"
  | "textarea"
  | "password"
  | "number"
  | "select"
  | "multiselect"
  | "date";

export interface IFieldOption {
  value: string;
  label: string;
}

export interface IFieldConfig<TValues extends FieldValues = FieldValues> {
  name: Path<TValues>;
  label: string;
  type: IFieldType;
  options?: IFieldOption[];
  placeholder?: string;
  prefix?: string;
  icon?: ReactNode;
  autoComplete?: string;
  allowClear?: boolean;
  hidden?: (values: TValues) => boolean;
}
