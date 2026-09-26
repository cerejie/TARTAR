import { parseDate, type CalendarDate } from "@internationalized/date";
import { CalendarIcon } from "lucide-react";
import {
  Controller,
  type Control,
  type ControllerRenderProps,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Combobox,
  ComboboxChip,
  ComboboxChipList,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/cn.utils";
import type {
  IFieldConfig,
  IFieldOption,
} from "../../../models/common/field.model";
import {
  fieldControl,
  fieldDatePlaceholder,
  fieldDatePopover,
  fieldDateTrigger,
  fieldLabelHidden,
  fieldNumberInput,
  fieldRequired,
  fieldSelectClearable,
  fieldSpan,
} from "../../../styles/form/form.styles";
import { formatDate, toAmount } from "../../../utils/format.utils";
import { fuzzyOptions } from "../../../utils/fuzzy.utils";

const isoDate = /^\d{4}-\d{2}-\d{2}/;

const asText = (value: unknown): string =>
  typeof value === "string" || typeof value === "number" ? String(value) : "";

const asList = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];

const asDate = (value: unknown): CalendarDate | null => {
  const match = typeof value === "string" ? isoDate.exec(value) : null;
  if (!match) return null;

  try {
    return parseDate(match[0]);
  } catch {
    return null;
  }
};

const selectPlaceholder = <TValues extends FieldValues>(
  config: IFieldConfig<TValues>
) => config.placeholder ?? `Select ${config.label.toLowerCase()}`;

const creatablePlaceholder = <TValues extends FieldValues>(
  config: IFieldConfig<TValues>
) => config.placeholder ?? `Select or type a ${config.label.toLowerCase()}`;

const asNumber = (text: string): number | null => {
  if (text === "") return null;
  const amount = Number(text);
  return Number.isFinite(amount) ? amount : null;
};

type IProps<TValues extends FieldValues> = {
  config: IFieldConfig<TValues>;
  control: Control<TValues>;
};

type IFieldBinding<TValues extends FieldValues> = ControllerRenderProps<
  TValues,
  Path<TValues>
>;

const renderControl = <TValues extends FieldValues>(
  config: IFieldConfig<TValues>,
  field: IFieldBinding<TValues>,
  invalid: boolean
) => {
  const fieldId = String(config.name);
  const options: IFieldOption[] = config.options ?? [];

  switch (config.type) {
    case "textarea":
      return (
        <Textarea
          {...field}
          id={fieldId}
          aria-invalid={invalid}
          rows={3}
          value={asText(field.value)}
          placeholder={config.placeholder}
        />
      );
    case "password":
      return (
        <InputGroup>
          {config.icon ? <InputGroupAddon>{config.icon}</InputGroupAddon> : null}
          <InputGroupInput
            {...field}
            id={fieldId}
            aria-invalid={invalid}
            type="password"
            value={asText(field.value)}
            placeholder={config.placeholder}
            autoComplete={config.autoComplete ?? "new-password"}
          />
        </InputGroup>
      );
    case "number":
    case "amount":
      return (
        <InputGroup>
          {config.prefix ? (
            <InputGroupAddon>
              <InputGroupText>{config.prefix}</InputGroupText>
            </InputGroupAddon>
          ) : null}
          <InputGroupInput
            id={fieldId}
            name={field.name}
            ref={field.ref}
            aria-invalid={invalid}
            type="number"
            className={fieldNumberInput}
            min={0}
            max={config.max}
            step={config.type === "amount" ? 0.01 : 1}
            inputMode={config.type === "amount" ? "decimal" : "numeric"}
            value={asText(field.value)}
            placeholder={config.placeholder}
            onChange={(event) => field.onChange(asNumber(event.target.value))}
            onBlur={() => {
              if (config.type === "amount") field.onChange(toAmount(field.value));
              field.onBlur();
            }}
          />
        </InputGroup>
      );
    case "select":
      return (
        <Combobox
          value={asText(field.value) || null}
          onChange={(key) =>
            field.onChange(key === null ? undefined : String(key))
          }
          onBlur={field.onBlur}
          isInvalid={invalid}
          aria-label={config.label}
          menuTrigger="focus"
          allowsEmptyCollection
          className={fieldControl}
        >
          <ComboboxInput
            id={fieldId}
            placeholder={selectPlaceholder(config)}
            showClear={config.allowClear}
            className={cn(config.allowClear && fieldSelectClearable)}
          />
          <ComboboxContent>
            <ComboboxList
              renderEmptyState={() => <ComboboxEmpty>No match found.</ComboboxEmpty>}
            >
              {options.map((option) => (
                <ComboboxItem key={option.value} id={option.value}>
                  {option.label}
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      );
    case "creatable": {
      const typed = asText(field.value);

      return (
        <Combobox
          allowsCustomValue
          inputValue={typed}
          onInputChange={field.onChange}
          onChange={(key) => {
            const picked = options.find((option) => option.value === key);
            if (picked) field.onChange(picked.label);
          }}
          onBlur={field.onBlur}
          isInvalid={invalid}
          aria-label={config.label}
          menuTrigger="focus"
          defaultFilter={() => true}
          allowsEmptyCollection
          className={fieldControl}
        >
          <ComboboxInput id={fieldId} placeholder={creatablePlaceholder(config)} />
          <ComboboxContent>
            <ComboboxList
              renderEmptyState={() => (
                <ComboboxEmpty>
                  {typed.trim()
                    ? `No close match. "${typed.trim()}" is added as new.`
                    : "No match found."}
                </ComboboxEmpty>
              )}
            >
              {fuzzyOptions(options, typed).map((option) => (
                <ComboboxItem key={option.value} id={option.value}>
                  {option.label}
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      );
    }
    case "multiselect": {
      const selected = asList(field.value);

      return (
        <Combobox
          selectionMode="multiple"
          value={selected}
          onChange={(keys) => field.onChange(keys.map(String))}
          onBlur={field.onBlur}
          isInvalid={invalid}
          aria-label={config.label}
          allowsEmptyCollection
          className={fieldControl}
        >
          <ComboboxChips>
            <ComboboxChipList<IFieldOption>>
              {(option) => (
                <ComboboxChip id={option.value}>{option.label}</ComboboxChip>
              )}
            </ComboboxChipList>
            <ComboboxChipsInput
              id={fieldId}
              placeholder={
                selected.length === 0 ? selectPlaceholder(config) : undefined
              }
            />
          </ComboboxChips>
          <ComboboxContent>
            <ComboboxList
              renderEmptyState={() => <ComboboxEmpty>No match found.</ComboboxEmpty>}
            >
              {options.map((option) => (
                <ComboboxItem key={option.value} id={option.value} value={option}>
                  {option.label}
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      );
    }
    case "date": {
      const selected = asDate(field.value);

      return (
        <PopoverTrigger>
          <Button id={fieldId} variant="outline" className={fieldDateTrigger}>
            <CalendarIcon />
            {selected ? (
              formatDate(selected.toString())
            ) : (
              <span className={fieldDatePlaceholder}>
                {config.placeholder ?? "Pick a date"}
              </span>
            )}
          </Button>
          <Popover placement="bottom start" className={fieldDatePopover}>
            <Calendar
              captionLayout="dropdown"
              value={selected}
              onChange={(next) => field.onChange(next.toString())}
            />
          </Popover>
        </PopoverTrigger>
      );
    }
    default:
      if (config.icon) {
        return (
          <InputGroup>
            <InputGroupAddon>{config.icon}</InputGroupAddon>
            <InputGroupInput
              {...field}
              id={fieldId}
              aria-invalid={invalid}
              value={asText(field.value)}
              placeholder={config.placeholder}
              autoComplete={config.autoComplete}
            />
          </InputGroup>
        );
      }

      return (
        <Input
          {...field}
          id={fieldId}
          aria-invalid={invalid}
          value={asText(field.value)}
          placeholder={config.placeholder}
          autoComplete={config.autoComplete}
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
        <Field
          data-invalid={fieldState.invalid}
          className={fieldSpan({ span: config.span ?? "full" })}
        >
          <FieldLabel
            htmlFor={String(config.name)}
            className={config.hideLabel ? fieldLabelHidden : undefined}
          >
            {config.label}
            {config.required ? <span className={fieldRequired}>*</span> : null}
          </FieldLabel>
          {renderControl(config, field, fieldState.invalid)}
          {config.hint ? <FieldDescription>{config.hint}</FieldDescription> : null}
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  );
};

export default FormField;
