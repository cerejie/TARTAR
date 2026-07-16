import { useEffect } from 'react'
import { useForm, type DefaultValues, type FieldValues, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ZodType } from 'zod'
import { Form, Modal } from 'antd'
import { FormField, type FieldConfig } from './FormField'

/**
 * One reusable, config-driven modal form for every entity (build spec §3 — no
 * per-entity form boilerplate). Give it a zod schema + field configs and it
 * wires react-hook-form + validation + antd Modal. Conditional fields hide via
 * each config's `hidden(values)` predicate.
 */
interface EntityFormModalProps<TValues extends FieldValues> {
  open: boolean
  title: string
  fields: FieldConfig<TValues>[]
  schema: ZodType<TValues>
  defaultValues: DefaultValues<TValues>
  onSubmit: (values: TValues) => void | Promise<void>
  onClose: () => void
  submitText?: string
  submitting?: boolean
}

export function EntityFormModal<TValues extends FieldValues>({
  open,
  title,
  fields,
  schema,
  defaultValues,
  onSubmit,
  onClose,
  submitText = 'Save',
  submitting = false,
}: EntityFormModalProps<TValues>) {
  // zodResolver's inferred generics don't line up with the caller's TValues
  // (zod v4 input type is `unknown`); the schema is the runtime source of truth,
  // so we cast the resolver to the form's value type.
  const resolver = zodResolver(schema as never) as unknown as Resolver<TValues>
  const { control, handleSubmit, reset, watch } = useForm<TValues>({
    resolver,
    defaultValues,
  })

  // Re-seed the form whenever the modal (re)opens or the target record changes.
  useEffect(() => {
    if (open) reset(defaultValues)
    // defaultValues identity is controlled by the caller (per-record memo).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reset])

  const values = watch()

  return (
    <Modal
      open={open}
      title={title}
      onCancel={onClose}
      onOk={handleSubmit(onSubmit)}
      okText={submitText}
      confirmLoading={submitting}
      destroyOnHidden
      maskClosable={false}
    >
      <Form layout="vertical" className="tartar-entity-form">
        {fields
          .filter((f) => !f.hidden?.(values))
          .map((f) => (
            <FormField key={String(f.name)} config={f} control={control} />
          ))}
      </Form>
    </Modal>
  )
}
