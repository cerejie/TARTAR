import type { LucideIcon } from "lucide-react";
import type { RouteObject } from "react-router-dom";
import type { IPermissions } from "./permission.model";

export type IRoute = {
  key?: string;
  label?: string;
  description?: string;
  icon?: LucideIcon;
  group?: string;
  can?: keyof IPermissions;
  isNotNav?: boolean;
  children?: IRoute[];
} & RouteObject;
