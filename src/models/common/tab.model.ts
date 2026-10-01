import type { LucideIcon } from "lucide-react";

export type ITabItem = {
  key: string;
  label: string;
  icon?: LucideIcon;
  href?: string;
  onPress?: () => void;
  active: boolean;
  badge: number;
  preload?: () => Promise<unknown>;
};
