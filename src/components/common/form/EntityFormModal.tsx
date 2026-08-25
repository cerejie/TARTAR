import { zodResolver } from "@hookform/resolvers/zod";
import { Form, Modal } from "antd";
import { useEffect } from "react";
import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type Resolver,
} from "react-hook-form";
import type { ZodType } from "zod";
import type { IFieldConfig } from "../../../models/common/field.model";
import { entityForm } from "../../../styles/form/form.css";
import FormField from "./FormField";

type IProps<TValues extends FieldValues> = {
  open: boolean;
  title: string;
  fields: IFieldConfig<TValues>[];
  schema: ZodType<TValues>;
  defaultValues: DefaultValues<TValues>;
  onSubmit: (values: TValues) => void | Promise<void>;
  onClose: () => void;
  submitText?: string;
  submitting?: boolean;
};

const EntityFormModal = <TValues extends FieldValues>({
  open,
  title,
  fields,
  schema,
  defaultValues,
  onSubmit,
  onClose,
  submitText = "Save",
  submitting = false,
}: IProps<TValues>) => {
  const resolver = zodResolver(schema as never) as unknown as Resolver<TValues>;
  const { control, handleSubmit, reset, watch } = useForm<TValues>({
    resolver,
    defaultValues,
  });

  useEffect(() => {
    if (open) reset(defaultValues);
  }, [open, reset]);

  const values = watch();

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
      <Form layout="vertical" className={`${entityForm}`}>
        {fields
          .filter((field) => !field.hidden?.(values))
          .map((field) => (
            <FormField
              key={String(field.name)}
              config={field}
              control={control}
            />
          ))}
      </Form>
    </Modal>
  );
};

export default EntityFormModal;
