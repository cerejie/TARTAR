import { useCallback, useRef } from "react";
import type { KeyboardEvent } from "react";
import { CheckIcon, XIcon } from "lucide-react";
import { ListBox, ListBoxItem } from "react-aria-components";
import type { FieldValues } from "react-hook-form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Sheet, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/cn.utils";
import AppButton from "../button/AppButton";
import type {
  IFieldConfig,
  IFieldOption,
} from "../../../models/common/field.model";
import {
  fieldNumberInput,
  fieldSheetBody,
  fieldSheetClear,
  fieldSheetContent,
  fieldSheetEmpty,
  fieldSheetHandle,
  fieldSheetInput,
  fieldSheetInputClear,
  fieldSheetInputGroup,
  fieldSheetLabel,
  fieldSheetList,
  fieldSheetOption,
  fieldSheetOptionCheck,
  fieldSheetSave,
  fieldSheetTextarea,
} from "../../../styles/form/form.styles";
import { sheetHasInput } from "../../../utils/field.utils";
import { fuzzyOptions } from "../../../utils/fuzzy.utils";

type IProps<TValues extends FieldValues> = {
  config: IFieldConfig<TValues>;
  open: boolean;
  draft: string;
  selectedValue: string;
  invalid: boolean;
  onDraftChange: (draft: string) => void;
  onSave: () => void;
  onPick: (value: string | undefined) => void;
  onClose: () => void;
};

const isNumeric = (type: string) => type === "number" || type === "amount";

const inputModeOf = <TValues extends FieldValues>(
  config: IFieldConfig<TValues>
): IFieldConfig<TValues>["inputMode"] => {
  if (config.type === "amount") return "decimal";
  if (config.type === "number") return "numeric";
  return config.inputMode;
};

const focusOnOpen = (element: HTMLInputElement | HTMLTextAreaElement | null) => {
  if (!element) return undefined;
  element.focus({ preventScroll: true });
  const frame = requestAnimationFrame(() => {
    if (document.activeElement !== element) element.focus({ preventScroll: true });
  });
  return () => cancelAnimationFrame(frame);
};

const emptyMessageOf = (creatable: boolean, typed: string) =>
  creatable && typed ? `No close match. "${typed}" is added as new.` : "No match found.";

const FieldSheet = <TValues extends FieldValues>({
  config,
  open,
  draft,
  selectedValue,
  invalid,
  onDraftChange,
  onSave,
  onPick,
  onClose,
}: IProps<TValues>) => {
  const fieldId = `${String(config.name)}-sheet`;
  const options: IFieldOption[] = config.options ?? [];
  const isSelect = config.type === "select";
  const isCreatable = config.type === "creatable";
  const hasList = isSelect || isCreatable;
  const hasInput = sheetHasInput(config);
  const listOptions = hasInput ? fuzzyOptions(options, draft) : options;
  const typed = draft.trim();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const attachInput = useCallback((element: HTMLInputElement | null) => {
    inputRef.current = element;
    return focusOnOpen(element);
  }, []);

  const handleClearDraft = () => {
    onDraftChange("");
    inputRef.current?.focus();
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) onClose();
  };

  const handleEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (isSelect) {
      const [firstMatch] = listOptions;
      if (firstMatch) onPick(firstMatch.value);
      return;
    }
    onSave();
  };

  const handleAction = (key: string | number) => {
    const picked = options.find((option) => option.value === String(key));
    if (!picked) return;
    if (isSelect) {
      onPick(picked.value);
      return;
    }
    onPick(picked.label);
  };

  return (
    <Sheet
      side="bottom"
      isOpen={open}
      onOpenChange={handleOpenChange}
      showCloseButton={false}
      className={fieldSheetContent}
    >
      <div className={fieldSheetHandle} />
      <div className={fieldSheetBody}>
        <SheetTitle className={fieldSheetLabel}>
          <label htmlFor={hasInput ? fieldId : undefined}>{config.label}</label>
        </SheetTitle>

        {hasInput && config.type === "textarea" ? (
          <Textarea
            ref={focusOnOpen}
            id={fieldId}
            rows={4}
            aria-invalid={invalid}
            className={fieldSheetTextarea}
            value={draft}
            placeholder={config.placeholder}
            onChange={(event) => onDraftChange(event.target.value)}
          />
        ) : null}

        {hasInput && config.type !== "textarea" ? (
          <InputGroup className={fieldSheetInputGroup}>
            {config.prefix ? (
              <InputGroupAddon>
                <InputGroupText>{config.prefix}</InputGroupText>
              </InputGroupAddon>
            ) : null}
            <InputGroupInput
              ref={attachInput}
              id={fieldId}
              aria-invalid={invalid}
              type={isNumeric(config.type) ? "number" : "text"}
              inputMode={inputModeOf(config)}
              min={isNumeric(config.type) ? 0 : undefined}
              max={config.max}
              enterKeyHint={isSelect ? "search" : "done"}
              className={cn(
                fieldSheetInput,
                isNumeric(config.type) && fieldNumberInput
              )}
              value={draft}
              placeholder={isSelect ? "Search" : config.placeholder}
              onChange={(event) => onDraftChange(event.target.value)}
              onKeyDown={handleEnter}
            />
            {draft ? (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  aria-label="Clear"
                  size="icon-sm"
                  className={fieldSheetInputClear}
                  onPress={handleClearDraft}
                >
                  <XIcon />
                </InputGroupButton>
              </InputGroupAddon>
            ) : null}
          </InputGroup>
        ) : null}

        {hasList ? (
          <ListBox
            aria-label={config.label}
            onAction={handleAction}
            className={fieldSheetList({ dropdown: isCreatable })}
            renderEmptyState={() => (
              <div className={fieldSheetEmpty}>{emptyMessageOf(isCreatable, typed)}</div>
            )}
          >
            {listOptions.map((option) => {
              const isPicked = option.value === selectedValue;
              return (
                <ListBoxItem
                  key={option.value}
                  id={option.value}
                  textValue={option.label}
                  aria-current={isPicked || undefined}
                  className={fieldSheetOption({ dropdown: isCreatable, picked: isPicked })}
                >
                  {option.label}
                  {isPicked ? <CheckIcon className={fieldSheetOptionCheck} /> : null}
                </ListBoxItem>
              );
            })}
          </ListBox>
        ) : null}

        {isSelect ? null : (
          <AppButton className={fieldSheetSave} onPress={onSave}>
            Save
          </AppButton>
        )}

        {isSelect && config.allowClear && selectedValue ? (
          <AppButton
            variant="outline"
            className={fieldSheetClear}
            onPress={() => onPick(undefined)}
          >
            Clear
          </AppButton>
        ) : null}
      </div>
    </Sheet>
  );
};

export default FieldSheet;
