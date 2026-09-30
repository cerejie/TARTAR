import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useId, useRef, type ReactNode } from "react";
import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type Path,
  type PathValue,
  type Resolver,
} from "react-hook-form";
import type { ZodType } from "zod";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type {
  IFieldConfig,
  IFieldSection,
  IFormSummaryLine,
} from "../../../models/common/field.model";
import type { ConfirmKind } from "../../../models/common/modal.model";
import type { ModalSize } from "../../../models/common/view.model";
import { entityForm } from "../../../styles/form/form.styles";
import { confirmAction } from "../../../styles/modal/modal.styles";
import AppModal from "../modal/AppModal";
import FormFieldGrid from "./FormFieldGrid";
import FormSection from "./FormSection";
import FormSummary from "./FormSummary";

type IBaseProps<TValues extends FieldValues> = {
  open: boolean;
  title: string;
  intro?: ReactNode;
  size?: ModalSize;
  schema: ZodType<TValues>;
  defaultValues: DefaultValues<TValues>;
  onSubmit: (values: TValues) => void | Promise<void>;
  onClose: () => void;
  submitText?: string;
  submitKind?: ConfirmKind;
  submitting?: boolean;
  summary?: (values: TValues) => readonly IFormSummaryLine[];
  deriveValues?: (changed: Path<TValues>, values: TValues) => Partial<TValues> | null;
};

type IProps<TValues extends FieldValues> = IBaseProps<TValues> &
  (
    | { fields: IFieldConfig<TValues>[]; sections?: never }
    | { sections: IFieldSection<TValues>[]; fields?: never }
  );

const EntityFormModal = <TValues extends FieldValues>({
  open,
  title,
  intro,
  size = "md",
  fields,
  sections,
  schema,
  defaultValues,
  onSubmit,
  onClose,
  submitText = "Save",
  submitKind = "confirm",
  submitting = false,
  summary,
  deriveValues,
}: IProps<TValues>) => {
  const formId = useId();
  const resolver = zodResolver(schema as never) as unknown as Resolver<TValues>;
  const { control, handleSubmit, reset, setValue, watch } = useForm<TValues>({
    resolver,
    defaultValues,
  });
  const previousValues = useRef<Record<string, unknown>>({});

  useEffect(() => {
    if (!open) return;
    reset(defaultValues);
    previousValues.current = { ...defaultValues };
  }, [open, reset]);

  useEffect(() => {
    if (!deriveValues) return;

    const subscription = watch((current, { name }) => {
      const snapshot: Record<string, unknown> = { ...current };
      const previous = previousValues.current;
      previousValues.current = snapshot;
      if (!name || Object.is(previous[name], snapshot[name])) return;

      const derived = deriveValues(name, current as TValues) ?? {};
      for (const [field, value] of Object.entries(derived)) {
        setValue(field as Path<TValues>, value as PathValue<TValues, Path<TValues>>);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, setValue, deriveValues]);

  const values = watch();

  return (
    <AppModal
      open={open}
      title={title}
      size={size}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" isDisabled={submitting} onPress={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form={formId}
            className={confirmAction({ kind: submitKind })}
            isDisabled={submitting}
          >
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
        {summary ? <FormSummary lines={summary(values)} /> : null}
      </form>
    </AppModal>
  );
};

export default EntityFormModal;
