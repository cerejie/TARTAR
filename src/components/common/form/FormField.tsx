import { parseDate, type CalendarDate } from "@internationalized/date";
import { CalendarIcon } from "lucide-react";
import { Dialog } from "react-aria-components";
import {
  Controller,
  type Control,
  type ControllerRenderProps,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
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
  ComboboxTrigger,
} from "@/components/ui/combobox";
import {
  Field,
  FieldContent,
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
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/cn.utils";
import FieldSheetControl from "./FieldSheetControl";
import { useIsCompact } from "../../../hook/common/breakpoint.hook";
import type {
  IFieldConfig,
  IFieldOption,
} from "../../../models/common/field.model";
import {
  fieldControl,
  fieldDateDialog,
  fieldDatePlaceholder,
  fieldDatePopover,
  fieldDateTrigger,
  fieldLabelHidden,
  fieldMultiselectTrigger,
  fieldNativeDate,
  fieldNativeSelect,
  fieldNumberInput,
  fieldRequired,
  fieldSelectClearable,
  fieldSpan,
} from "../../../styles/form/form.styles";
import { asNumber, asText, usesFieldSheet } from "../../../utils/field.utils";
import { formatDate, toAmount } from "../../../utils/format.utils";
import { fuzzyOptions } from "../../../utils/fuzzy.utils";

const isoDate = /^\d{4}-\d{2}-\d{2}/;

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

const withArticle = (noun: string) =>
  `${/^[aeiou]/.test(noun) ? "an" : "a"} ${noun}`;

const creatablePlaceholder = <TValues extends FieldValues>(
  config: IFieldConfig<TValues>
) =>
  config.placeholder ??
  `Select or type ${withArticle(config.label.toLowerCase())}`;

const sheetPlaceholder = <TValues extends FieldValues>(
  config: IFieldConfig<TValues>
) => {
  if (config.type === "select") return selectPlaceholder(config);
  if (config.type === "creatable") return creatablePlaceholder(config);
  return config.placeholder ?? `Enter ${withArticle(config.label.toLowerCase())}`;
};

type IEnterKeyHint = "next" | "done";

type IProps<TValues extends FieldValues> = {
  config: IFieldConfig<TValues>;
  control: Control<TValues>;
  enterKeyHint?: IEnterKeyHint;
};

type IFieldBinding<TValues extends FieldValues> = ControllerRenderProps<
  TValues,
  Path<TValues>
>;

const renderControl = <TValues extends FieldValues>(
  config: IFieldConfig<TValues>,
  field: IFieldBinding<TValues>,
  invalid: boolean,
  native: boolean,
  enterKeyHint?: IEnterKeyHint
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
            enterKeyHint={enterKeyHint}
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
            enterKeyHint={enterKeyHint}
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
      if (native) {
        const selected = asText(field.value);

        return (
          <NativeSelect
            id={fieldId}
            name={field.name}
            ref={field.ref}
            aria-invalid={invalid}
            value={selected}
            data-empty={selected === "" || undefined}
            className={fieldNativeSelect}
            onChange={(event) =>
              field.onChange(event.target.value === "" ? undefined : event.target.value)
            }
            onBlur={field.onBlur}
          >
            <NativeSelectOption value="" disabled={!config.allowClear}>
              {selectPlaceholder(config)}
            </NativeSelectOption>
            {options.map((option) => (
              <NativeSelectOption key={option.value} value={option.value}>
                {option.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        );
      }

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
          menuTrigger="focus"
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
            <ComboboxTrigger className={fieldMultiselectTrigger} />
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

      if (native) {
        return (
          <Input
            id={fieldId}
            name={field.name}
            ref={field.ref}
            type="date"
            aria-invalid={invalid}
            className={fieldNativeDate}
            value={selected?.toString() ?? ""}
            onChange={(event) =>
              field.onChange(event.target.value || (config.required ? "" : null))
            }
            onBlur={field.onBlur}
          />
        );
      }

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
            <Dialog aria-label={config.label} className={fieldDateDialog}>
              {({ close }) => (
                <Calendar
                  captionLayout="dropdown"
                  value={selected}
                  onChange={(next) => {
                    field.onChange(next.toString());
                    close();
                  }}
                />
              )}
            </Dialog>
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
              inputMode={config.inputMode}
              enterKeyHint={enterKeyHint}
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
          inputMode={config.inputMode}
          enterKeyHint={enterKeyHint}
        />
      );
  }
};

const FormField = <TValues extends FieldValues>({
  config,
  control,
  enterKeyHint,
}: IProps<TValues>) => {
  const native = useIsCompact();

  if (config.type === "checkbox") {
    return (
      <Controller
        name={config.name}
        control={control}
        render={({ field, fieldState }) => (
          <Field
            orientation="horizontal"
            data-invalid={fieldState.invalid}
            className={fieldSpan({ span: config.span ?? "full" })}
          >
            <Checkbox
              id={String(config.name)}
              name={field.name}
              isSelected={field.value === true}
              isInvalid={fieldState.invalid}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
            <FieldContent>
              <FieldLabel htmlFor={String(config.name)}>{config.label}</FieldLabel>
              {config.hint ? (
                <FieldDescription>{config.hint}</FieldDescription>
              ) : null}
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        )}
      />
    );
  }

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
          {native && usesFieldSheet(config) ? (
            <FieldSheetControl
              config={config}
              field={field}
              invalid={fieldState.invalid}
              placeholder={sheetPlaceholder(config)}
            />
          ) : (
            renderControl(config, field, fieldState.invalid, native, enterKeyHint)
          )}
          {config.hint ? <FieldDescription>{config.hint}</FieldDescription> : null}
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  );
};

export default FormField;
