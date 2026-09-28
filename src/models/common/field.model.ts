import type { ReactNode } from "react";
import type { FieldValues, Path } from "react-hook-form";

export type IFieldType =
  | "text"
  | "textarea"
  | "password"
  | "number"
  | "amount"
  | "select"
  | "creatable"
  | "multiselect"
  | "date";

export type IFieldSpan = "half" | "full";

export interface IFieldOption {
  value: string;
  label: string;
}

export interface IFieldConfig<TValues extends FieldValues = FieldValues> {
  name: Path<TValues>;
  label: string;
  type: IFieldType;
  span?: IFieldSpan;
  required?: boolean;
  options?: IFieldOption[];
  placeholder?: string;
  hint?: string;
  prefix?: string;
  max?: number;
  hideLabel?: boolean;
  icon?: ReactNode;
  autoComplete?: string;
  allowClear?: boolean;
  hidden?: (values: TValues) => boolean;
}

export interface IFieldSection<TValues extends FieldValues = FieldValues> {
  key: string;
  title: string;
  fields: IFieldConfig<TValues>[];
}

export interface IFormSummaryLine {
  key: string;
  label: string;
  value: string;
  emphasis?: boolean;
}
