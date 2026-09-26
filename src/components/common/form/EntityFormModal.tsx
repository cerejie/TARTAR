import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useId, type ReactNode } from "react";
import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type Resolver,
} from "react-hook-form";
import type { ZodType } from "zod";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type {
  IFieldConfig,
  IFieldSection,
} from "../../../models/common/field.model";
import type { ModalSize } from "../../../models/common/view.model";
import { entityForm } from "../../../styles/form/form.styles";
import AppModal from "../modal/AppModal";
import FormFieldGrid from "./FormFieldGrid";
import FormSection from "./FormSection";

type IBaseProps<TValues extends FieldValues> = {
  open: boolean;
  title: string;
  subtitle?: string;
  intro?: ReactNode;
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
  intro,
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
  const formId = useId();
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
        <>
          <Button variant="outline" isDisabled={submitting} onPress={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={formId} isDisabled={submitting}>
            {submitting ? <Spinner /> : null}
            {submitText}
          </Button>
        </>
      }
    >
      <form
        id={formId}
        noValidate
        className={entityForm}
        onSubmit={handleSubmit(onSubmit)}
      >
        {intro}
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
      </form>
    </AppModal>
  );
};

export default EntityFormModal;
