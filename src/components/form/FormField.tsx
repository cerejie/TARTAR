import type { ReactNode } from 'react'
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form'
import { DatePicker, Form, Input, InputNumber, Select } from 'antd'
import dayjs from 'dayjs'

/**
 * Declarative field config — one entry describes a field's label, control type,
 * and (optionally) when it is shown. `EntityFormModal` renders a list of these,
 * so every form in the app is driven by config, not hand-written JSX (spec §3).
 */
export interface FieldConfig<TValues extends FieldValues = FieldValues> {
  name: Path<TValues>
  label: string
  type: 'text' | 'textarea' | 'password' | 'number' | 'select' | 'multiselect' | 'date'
  options?: { value: string; label: string }[]
  placeholder?: string
  /** Prefix for money inputs, e.g. '₱'. */
  prefix?: string
  /** Prefix icon for text/password inputs (used by the auth forms). */
  icon?: ReactNode
  /** Browser autofill hint, e.g. 'username' / 'current-password'. */
  autoComplete?: string
  allowClear?: boolean
  /** Hide the field based on current form values (cross-field conditional). */
  hidden?: (values: TValues) => boolean
}

interface FormFieldProps<TValues extends FieldValues> {
  config: FieldConfig<TValues>
  control: Control<TValues>
}

/**
 * Binds a single antd input to react-hook-form via <Controller>. Validation
 * errors come from the zodResolver and render inline on the Form.Item.
 */
export function FormField<TValues extends FieldValues>({
  config,
  control,
}: FormFieldProps<TValues>) {
  return (
    <Controller
      name={config.name}
      control={control}
      render={({ field, fieldState }) => (
        <Form.Item
          label={config.label}
          validateStatus={fieldState.error ? 'error' : undefined}
          help={fieldState.error?.message}
        >
          {renderControl(config, field)}
        </Form.Item>
      )}
    />
  )
}

// `field` from RHF is intentionally loosely typed here — a single renderer
// serves every control type; the zod schema is the real type guard on submit.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderControl<TValues extends FieldValues>(config: FieldConfig<TValues>, field: any) {
  switch (config.type) {
    case 'textarea':
      return (
        <Input.TextArea {...field} rows={3} placeholder={config.placeholder} allowClear={config.allowClear} />
      )
    case 'password':
      return (
        <Input.Password
          {...field}
          placeholder={config.placeholder}
          prefix={config.icon}
          autoComplete={config.autoComplete ?? 'new-password'}
        />
      )
    case 'number':
      return (
        <InputNumber
          className="tartar-block"
          value={field.value}
          onChange={field.onChange}
          onBlur={field.onBlur}
          placeholder={config.placeholder}
          prefix={config.prefix}
          min={0}
        />
      )
    case 'select':
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
      )
    case 'multiselect':
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
      )
    case 'date':
      return (
        <DatePicker
          className="tartar-block"
          value={field.value ? dayjs(field.value) : null}
          onChange={(d) => field.onChange(d ? d.format('YYYY-MM-DD') : null)}
          onBlur={field.onBlur}
          format="MMM D, YYYY"
        />
      )
    default:
      return (
        <Input
          {...field}
          value={field.value ?? ''}
          placeholder={config.placeholder}
          prefix={config.icon}
          autoComplete={config.autoComplete}
          allowClear={config.allowClear}
        />
      )
  }
}
