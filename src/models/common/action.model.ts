import type { ReactNode } from "react";

export interface IRowAction {
  key: string;
  label: string;
  icon: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onSelect: () => void;
}
