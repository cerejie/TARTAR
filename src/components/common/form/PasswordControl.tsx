import { Eye, EyeOff } from "lucide-react";
import type { ControllerRenderProps, FieldValues, Path } from "react-hook-form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useReveal } from "../../../hook/common/reveal.hook";
import type { IFieldConfig } from "../../../models/common/field.model";
import { fieldRevealIcon, fieldRevealToggle } from "../../../styles/form/form.styles";
import { asText } from "../../../utils/field.utils";

type IProps<TValues extends FieldValues> = {
  config: IFieldConfig<TValues>;
  field: ControllerRenderProps<TValues, Path<TValues>>;
  invalid: boolean;
  enterKeyHint?: "next" | "done";
};

const PasswordControl = <TValues extends FieldValues>({
  config,
  field,
  invalid,
  enterKeyHint,
}: IProps<TValues>) => {
  const { revealed, toggleRevealed } = useReveal();
  const fieldId = String(config.name);

  return (
    <InputGroup>
      {config.icon ? <InputGroupAddon>{config.icon}</InputGroupAddon> : null}
      <InputGroupInput
        {...field}
        id={fieldId}
        aria-invalid={invalid}
        type={revealed ? "text" : "password"}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint={enterKeyHint}
        value={asText(field.value)}
        placeholder={config.placeholder}
        autoComplete={config.autoComplete ?? "new-password"}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-sm"
          aria-label={revealed ? "Hide password" : "Show password"}
          aria-controls={fieldId}
          className={fieldRevealToggle}
          onPress={toggleRevealed}
        >
          {revealed ? (
            <EyeOff className={fieldRevealIcon} />
          ) : (
            <Eye className={fieldRevealIcon} />
          )}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
};

export default PasswordControl;
