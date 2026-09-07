import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Flex, Form } from "antd";
import { useEffect } from "react";
import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type Resolver,
} from "react-hook-form";
import type { ZodType } from "zod";
import type {
  IFieldConfig,
  IFieldSection,
} from "../../../models/common/field.model";
import type { ModalSize } from "../../../models/common/view.model";
import { entityForm } from "../../../styles/form/form.css";
import AppModal from "../modal/AppModal";
import FormFieldGrid from "./FormFieldGrid";
import FormSection from "./FormSection";

type IBaseProps<TValues extends FieldValues> = {
  open: boolean;
  title: string;
  subtitle?: string;
  size?: ModalSize;
  schema: ZodType<TValues>;
  defaultValues: DefaultValues<TValues>;
  onSubmit: (values: TValues) => void | Promise<void>;
  onClose: () => void;
  submitText?: string;
  submitting?: boolean;
};

type IProps<TValues extends FieldValues> = IBaseProps<TValues> &
  (
    | { fields: IFieldConfig<TValues>[]; sections?: never }
    | { sections: IFieldSection<TValues>[]; fields?: never }
  );

const EntityFormModal = <TValues extends FieldValues>({
  open,
  title,
  subtitle,
  size = "md",
  fields,
  sections,
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
    <AppModal
      open={open}
      title={title}
      subtitle={subtitle}
      size={size}
      onClose={onClose}
      footer={
        <Flex justify="flex-end" gap={8}>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            loading={submitting}
            onClick={handleSubmit(onSubmit)}
          >
            {submitText}
          </Button>
        </Flex>
      }
    >
      <Form layout="vertical" className={`${entityForm}`}>
        {sections ? (
          sections.map((section) => (
            <FormSection
              key={section.key}
              section={section}
              control={control}
              values={values}
            />
          ))
        ) : (
          <FormFieldGrid
            fields={fields ?? []}
            control={control}
            values={values}
          />
        )}
      </Form>
    </AppModal>
  );
};

export default EntityFormModal;
