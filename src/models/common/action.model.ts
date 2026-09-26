import type { ReactNode } from "react";

export interface IRowAction {
  key: string;
  label: string;
  hint?: string;
  icon: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onSelect: () => void;
}
