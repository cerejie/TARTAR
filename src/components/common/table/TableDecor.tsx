import type { ReactNode } from "react";
import {
  columnIcon,
  columnLabel,
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

export const RowIcon = ({ icon }: IIconProps) => (
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

export const ColumnLabel = ({ icon, children }: ILabelProps) => (
  <span className={columnLabel}>
    <span className={columnIcon} aria-hidden="true">
      {icon}
    </span>
    {children}
  </span>
);

export const RowActions = ({ children }: { children: ReactNode }) => (
  <span className={rowActions}>{children}</span>
);
