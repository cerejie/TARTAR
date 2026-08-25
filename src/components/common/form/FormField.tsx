import { DatePicker, Form, Input, InputNumber, Select } from "antd";
import dayjs from "dayjs";
import {
  Controller,
  type Control,
  type ControllerRenderProps,
  type FieldValues,
} from "react-hook-form";
import type { IFieldConfig } from "../../../models/common/field.model";
import { blockControl } from "../../../styles/form/form.css";

type IProps<TValues extends FieldValues> = {
  config: IFieldConfig<TValues>;
  control: Control<TValues>;
};

type IFieldBinding = Omit<ControllerRenderProps<FieldValues>, "ref">;

const renderControl = <TValues extends FieldValues>(
  config: IFieldConfig<TValues>,
  field: IFieldBinding
) => {
  switch (config.type) {
    case "textarea":
      return (
        <Input.TextArea
          {...field}
          rows={3}
          placeholder={config.placeholder}
          allowClear={config.allowClear}
        />
      );
    case "password":
      return (
        <Input.Password
          {...field}
          placeholder={config.placeholder}
          prefix={config.icon}
          autoComplete={config.autoComplete ?? "new-password"}
        />
      );
    case "number":
      return (
        <InputNumber
          className={`${blockControl}`}
          value={field.value}
          onChange={field.onChange}
          onBlur={field.onBlur}
          placeholder={config.placeholder}
          prefix={config.prefix}
          min={0}
        />
      );
    case "select":
      return (
        <Select
          value={field.value ?? undefined}
          onChange={field.onChange}
          onBlur={field.onBlur}
          options={config.options}
          placeholder={config.placeholder}
          allowClear={config.allowClear}
          showSearch
          optionFilterProp="label"
        />
      );
    case "multiselect":
      return (
        <Select
          mode="multiple"
          value={field.value ?? []}
          onChange={field.onChange}
          onBlur={field.onBlur}
          options={config.options}
          placeholder={config.placeholder}
          allowClear={config.allowClear}
          optionFilterProp="label"
        />
      );
    case "date":
      return (
        <DatePicker
          className={`${blockControl}`}
          value={field.value ? dayjs(field.value) : null}
          onChange={(date) =>
            field.onChange(date ? date.format("YYYY-MM-DD") : null)
          }
          onBlur={field.onBlur}
          format="MMM D, YYYY"
        />
      );
    default:
      return (
        <Input
          {...field}
          value={field.value ?? ""}
          placeholder={config.placeholder}
          prefix={config.icon}
          autoComplete={config.autoComplete}
          allowClear={config.allowClear}
        />
      );
  }
};

const FormField = <TValues extends FieldValues>({
  config,
  control,
}: IProps<TValues>) => {
  return (
    <Controller
      name={config.name}
      control={control}
      render={({ field, fieldState }) => (
        <Form.Item
          label={config.label}
          validateStatus={fieldState.error ? "error" : undefined}
          help={fieldState.error?.message}
        >
          {renderControl(config, field as unknown as IFieldBinding)}
        </Form.Item>
      )}
    />
  );
};

export default FormField;
