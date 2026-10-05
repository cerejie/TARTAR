import type { ControllerRenderProps, FieldValues, Path } from "react-hook-form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { useAmountDraft } from "../../../hook/common/amount.draft.hook";
import type { IFieldConfig } from "../../../models/common/field.model";

type IProps<TValues extends FieldValues> = {
  config: IFieldConfig<TValues>;
  field: ControllerRenderProps<TValues, Path<TValues>>;
  invalid: boolean;
  enterKeyHint?: "next" | "done";
};

const AmountControl = <TValues extends FieldValues>({
  config,
  field,
  invalid,
  enterKeyHint,
}: IProps<TValues>) => {
  const { text, handleFocus, handleChange, handleBlur } = useAmountDraft(
    field.value,
    field.onChange,
    field.onBlur
  );

  return (
    <InputGroup>
      {config.prefix ? (
        <InputGroupAddon>
          <InputGroupText>{config.prefix}</InputGroupText>
        </InputGroupAddon>
      ) : null}
      <InputGroupInput
        id={String(config.name)}
        name={field.name}
        ref={field.ref}
        aria-invalid={invalid}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        enterKeyHint={enterKeyHint}
        value={text}
        placeholder={config.placeholder}
        onFocus={handleFocus}
        onChange={(event) => handleChange(event.target.value)}
        onBlur={handleBlur}
      />
    </InputGroup>
  );
};

export default AmountControl;
