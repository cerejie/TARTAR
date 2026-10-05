import type { HTMLAttributes, ReactNode } from "react";
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
  | "date"
  | "checkbox";

export type IFieldSpan = "third" | "half" | "full";

export interface IFieldOption {
  value: string;
  label: string;
}

export interface IFieldConfig<TValues extends FieldValues = FieldValues> {
  name: Path<TValues>;
  label: string;
  type: IFieldType;
  span?: IFieldSpan;
  spanOf?: (values: TValues) => IFieldSpan;
  required?: boolean;
  options?: IFieldOption[];
  optionsOf?: (values: TValues) => IFieldOption[];
  placeholder?: string;
  hint?: string;
  prefix?: string;
  max?: number;
  hideLabel?: boolean;
  icon?: ReactNode;
  autoComplete?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
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
