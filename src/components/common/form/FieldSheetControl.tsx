import { useId, useRef } from "react";
import { ChevronDownIcon } from "lucide-react";
import type { ControllerRenderProps, FieldValues, Path } from "react-hook-form";
import { Button } from "react-aria-components";
import FieldSheet from "./FieldSheet";
import { useFieldSheet } from "../../../hook/common/field.sheet.hook";
import type { IFieldConfig } from "../../../models/common/field.model";
import {
  fieldSheetAnchor,
  fieldSheetProxy,
  fieldSheetTrigger,
  fieldSheetTriggerAffix,
  fieldSheetTriggerText,
} from "../../../styles/form/form.styles";
import {
  asAmountText,
  asNumber,
  asPhone,
  asText,
  inputModeOf,
  sheetHasInput,
} from "../../../utils/field.utils";
import { formatAmountInput, toAmount } from "../../../utils/format.utils";

type IProps<TValues extends FieldValues> = {
  config: IFieldConfig<TValues>;
  field: ControllerRenderProps<TValues, Path<TValues>>;
  invalid: boolean;
  placeholder: string;
};

const committedValueOf = <TValues extends FieldValues>(
  config: IFieldConfig<TValues>,
  draft: string
): unknown => {
  if (config.type === "amount") return toAmount(asNumber(draft));
  if (config.type === "number") return asNumber(draft);
  if (config.type === "phone") return asPhone(draft);
  if (config.type === "creatable") return draft.trim();
  return draft;
};

const FieldSheetControl = <TValues extends FieldValues>({
  config,
  field,
  invalid,
  placeholder,
}: IProps<TValues>) => {
  const sheetId = useId();
  const { open, draft, setDraft, openSheet, closeSheet } = useFieldSheet(sheetId);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const proxyRef = useRef<HTMLInputElement | null>(null);
  const focusingProxy = useRef(false);

  const value = asText(field.value);
  const isSelect = config.type === "select";
  const isAmount = config.type === "amount";
  const shownText = isSelect
    ? (config.options?.find((option) => option.value === value)?.label ?? "")
    : isAmount
      ? formatAmountInput(field.value)
      : value;
  const hasValue = shownText !== "";
  const hasChevron = isSelect || config.type === "creatable";

  const commit = (next: unknown) => {
    field.onChange(next);
    field.onBlur();
    closeSheet();
  };

  const handlePress = () => {
    if (sheetHasInput(config)) {
      focusingProxy.current = true;
      proxyRef.current?.focus({ preventScroll: true });
      focusingProxy.current = false;
    }
    openSheet(isSelect ? "" : isAmount ? asAmountText(field.value) : value);
  };

  const handleProxyFocus = () => {
    if (!focusingProxy.current) triggerRef.current?.focus();
  };

  const handlePick = (picked: string | undefined) =>
    commit(isSelect ? picked : (picked ?? "").trim());

  const handleClose = () => {
    field.onBlur();
    closeSheet();
  };

  return (
    <div className={fieldSheetAnchor}>
      <input
        ref={proxyRef}
        aria-hidden
        tabIndex={-1}
        inputMode={inputModeOf(config)}
        className={fieldSheetProxy}
        onFocus={handleProxyFocus}
      />
      <Button
        id={String(config.name)}
        ref={(element) => {
          triggerRef.current = element;
          field.ref(element);
        }}
        aria-invalid={invalid}
        className={fieldSheetTrigger}
        onPress={handlePress}
      >
        {config.prefix && hasValue ? (
          <span className={fieldSheetTriggerAffix}>{config.prefix}</span>
        ) : null}
        <span
          className={fieldSheetTriggerText({
            filled: hasValue,
            multiline: config.type === "textarea",
          })}
        >
          {hasValue ? shownText : placeholder}
        </span>
        {hasChevron ? (
          <span className={fieldSheetTriggerAffix}>
            <ChevronDownIcon />
          </span>
        ) : null}
      </Button>
      <FieldSheet
        config={config}
        open={open}
        draft={draft}
        selectedValue={isSelect ? value : ""}
        invalid={invalid}
        onDraftChange={setDraft}
        onSave={() => commit(committedValueOf(config, draft))}
        onPick={handlePick}
        onClose={handleClose}
      />
    </div>
  );
};

export default FieldSheetControl;
