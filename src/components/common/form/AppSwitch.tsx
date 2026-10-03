import { useId } from "react";
import { Switch } from "@/components/ui/switch";
import {
  switchDescription,
  switchLabel,
  switchRow,
  switchText,
} from "../../../styles/form/form.styles";

import type { ReactNode } from "react";

type IProps = {
  label: ReactNode;
  description?: ReactNode;
  isSelected: boolean;
  isDisabled?: boolean;
  onChange: (isSelected: boolean) => void;
};

const AppSwitch = ({ label, description, isSelected, isDisabled, onChange }: IProps) => {
  const labelId = useId();
  const descriptionId = useId();

  return (
    <div className={switchRow}>
      <div className={switchText}>
        <span id={labelId} className={switchLabel}>
          {label}
        </span>
        {description ? (
          <span id={descriptionId} className={switchDescription}>
            {description}
          </span>
        ) : null}
      </div>
      <Switch
        aria-labelledby={labelId}
        aria-describedby={description ? descriptionId : undefined}
        isSelected={isSelected}
        isDisabled={isDisabled}
        onChange={onChange}
      />
    </div>
  );
};

export default AppSwitch;
