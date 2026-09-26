import type { ReactNode } from "react";
import {
  nameCell,
  rowActions,
  rowIcon,
} from "../../../styles/table/table.styles";

type IIconProps = {
  icon: ReactNode;
};

type ILabelProps = {
  icon: ReactNode;
  children: ReactNode;
};

const RowIcon = ({ icon }: IIconProps) => (
  <span className={rowIcon} aria-hidden="true">
    {icon}
  </span>
);

export const NameCell = ({ icon, children }: ILabelProps) => (
  <span className={nameCell}>
    <RowIcon icon={icon} />
    <span>{children}</span>
  </span>
);

export const RowActions = ({ children }: { children: ReactNode }) => (
  <span className={rowActions}>{children}</span>
);
