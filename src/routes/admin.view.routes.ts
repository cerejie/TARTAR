import { Bell, HandCoins, House, Wallet } from "lucide-react";
import type { IRoute } from "../models/common/route.model";
import {
  adminBasePath,
  adminNotificationsPath,
  adminPayablesPath,
  adminReceivablesPath,
} from "../utils/route.utils";
import { lazyView } from "./route.lazy";

export const adminViewRoutes: IRoute[] = [
  {
    key: "admin_home",
    path: adminBasePath,
    label: "Home",
    description: "Sales, expenses, receivables and payables at a glance",
    icon: House,
    group: "Admin",
    can: "viewDashboard",
    ...lazyView(() => import("../pages/Admin/AdminHomeView")),
  },
  {
    key: "admin_payables",
    path: adminPayablesPath,
    label: "Payables",
    description: "Due checks and near-due or overdue payables",
    icon: HandCoins,
    group: "Admin",
    can: "viewDashboard",
    ...lazyView(() => import("../pages/Admin/AdminPayablesView")),
  },
  {
    key: "admin_receivables",
    path: adminReceivablesPath,
    label: "Receivables",
    description: "Overdue receivables and those due this week",
    icon: Wallet,
    group: "Admin",
    can: "viewDashboard",
    ...lazyView(() => import("../pages/Admin/AdminReceivablesView")),
  },
  {
    key: "admin_notifications",
    path: adminNotificationsPath,
    label: "Notifications",
    description: "Due alerts grouped by urgency",
    icon: Bell,
    group: "Admin",
    can: "viewDashboard",
    ...lazyView(() => import("../pages/Admin/AdminNotificationsView")),
  },
];
