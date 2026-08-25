import { Flex } from "antd";
import type { ReactNode } from "react";
import {
  columnIcon,
  columnLabel,
  nameCell,
  rowActions,
  rowIcon,
} from "../../../styles/table/table.css";

type IIconProps = {
  icon: ReactNode;
};

type ILabelProps = {
  icon: ReactNode;
  children: ReactNode;
};

export const RowIcon = ({ icon }: IIconProps) => (
  <Flex
    component="span"
    className={`${rowIcon}`}
    align="center"
    justify="center"
    aria-hidden="true"
  >
    {icon}
  </Flex>
);

export const NameCell = ({ icon, children }: ILabelProps) => (
  <Flex component="span" className={`${nameCell}`} align="center" gap={8}>
    <RowIcon icon={icon} />
    <span>{children}</span>
  </Flex>
);

export const ColumnLabel = ({ icon, children }: ILabelProps) => (
  <Flex component="span" className={`${columnLabel}`} align="center" gap={4}>
    <Flex component="span" className={`${columnIcon}`} aria-hidden="true">
      {icon}
    </Flex>
    {children}
  </Flex>
);

export const RowActions = ({ children }: { children: ReactNode }) => (
  <Flex component="span" className={`${rowActions}`} align="center" gap={8}>
    {children}
  </Flex>
);
