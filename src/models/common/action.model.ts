import type { ReactNode } from "react";

export type IActionPriority = "primary" | "secondary";

export interface IRowAction {
  key: string;
  label: string;
  hint?: string;
  icon: ReactNode;
  priority?: IActionPriority;
  danger?: boolean;
  disabled?: boolean;
  onSelect: () => void;
}
