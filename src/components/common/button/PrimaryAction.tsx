import { createPortal } from "react-dom";
import AppButton from "./AppButton";
import { useFloatingActionHook } from "../../../hook/layout/app.bar.hook";
import {
  floatingAction,
  floatingActionDock,
  floatingActionLabel,
} from "../../../styles/app/app.styles";

import type { ReactNode } from "react";

type IProps = {
  icon: ReactNode;
  label: string;
  onPress: () => void;
};

const PrimaryAction = ({ icon, label, onPress }: IProps) => {
  const { floating, collapsed } = useFloatingActionHook();

  if (!floating) {
    return (
      <AppButton onPress={onPress}>
        {icon}
        {label}
      </AppButton>
    );
  }

  return createPortal(
    <div data-floating-action className={floatingActionDock}>
      <AppButton
        className={floatingAction({ collapsed })}
        onPress={onPress}
      >
        {icon}
        <span className={floatingActionLabel({ collapsed })}>{label}</span>
      </AppButton>
    </div>,
    document.body
  );
};

export default PrimaryAction;
