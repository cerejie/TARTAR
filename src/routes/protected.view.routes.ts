import {
  AppstoreOutlined,
  AuditOutlined,
  BankOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  SolutionOutlined,
  SwapOutlined,
  TeamOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import type { IRoute } from "../models/common/route.model";
import BranchesView from "../pages/Branches/BranchesView";
import DashboardView from "../pages/Dashboard/DashboardView";
import ExpensesView from "../pages/Expenses/ExpensesView";
import MasterDataView from "../pages/MasterData/MasterDataView";
import PayablesView from "../pages/Payables/PayablesView";
import PurchasesView from "../pages/Purchases/PurchasesView";
import ReceivablesView from "../pages/Receivables/ReceivablesView";
import ReportsView from "../pages/Reports/ReportsView";
import TransactionsView from "../pages/Transactions/TransactionsView";
import UsersView from "../pages/Users/UsersView";
import VouchersView from "../pages/Vouchers/VouchersView";
import { permissionLoader } from "./route.guard";

export const protectedViewsRoutes: IRoute[] = [
  {
    key: "dashboard",
    path: "/",
    label: "Dashboard",
    description: "Company-wide financial standing and alerts",
    icon: DashboardOutlined,
    group: "Main",
    can: "viewDashboard",
    loader: permissionLoader("viewDashboard", "/transactions"),
    Component: DashboardView,
  },
  {
    key: "transactions",
    path: "/transactions",
    label: "Transactions",
    description: "Sales, payments, deposits and collections",
    icon: SwapOutlined,
    group: "Operations",
    can: "viewReminders",
    Component: TransactionsView,
  },
  {
    key: "purchases",
    path: "/purchases",
    label: "Purchases",
    description: "Goods bought, each with an auto-generated voucher",
    icon: ShoppingCartOutlined,
    group: "Operations",
    can: "viewReminders",
    Component: PurchasesView,
  },
  {
    key: "expenses",
    path: "/expenses",
    label: "Expenses",
    description: "Operating costs, each with an auto-generated voucher",
    icon: WalletOutlined,
    group: "Operations",
    can: "viewReminders",
    Component: ExpensesView,
  },
  {
    key: "vouchers",
    path: "/vouchers",
    label: "Vouchers",
    description: "Approval workflow for check and cash vouchers",
    icon: FileTextOutlined,
    group: "Operations",
    can: "createVouchers",
    Component: VouchersView,
  },
  {
    key: "receivables",
    path: "/receivables",
    label: "Receivables",
    description: "Amounts customers owe the business",
    icon: SolutionOutlined,
    group: "Accounting",
    can: "viewReminders",
    Component: ReceivablesView,
  },
  {
    key: "payables",
    path: "/payables",
    label: "Payables",
    description: "Amounts the business owes suppliers",
    icon: AuditOutlined,
    group: "Accounting",
    can: "viewReminders",
    Component: PayablesView,
  },
  {
    key: "reports",
    path: "/reports",
    label: "Reports",
    description: "Daily, weekly, monthly, cash flow and ledger reports",
    icon: BankOutlined,
    group: "Monitoring",
    can: "viewIncomeExpenses",
    loader: permissionLoader("viewIncomeExpenses", "/transactions"),
    Component: ReportsView,
  },
  {
    key: "branches",
    path: "/branches",
    label: "Branch Monitoring",
    description: "Add, rename and monitor every business unit",
    icon: AppstoreOutlined,
    group: "Monitoring",
    can: "viewBranchMonitoring",
    loader: permissionLoader("viewBranchMonitoring", "/"),
    Component: BranchesView,
  },
  {
    key: "master-data",
    path: "/master-data",
    label: "Master Data",
    description: "Suppliers and expense categories",
    icon: DatabaseOutlined,
    group: "System",
    can: "manageMasterData",
    loader: permissionLoader("manageMasterData", "/"),
    Component: MasterDataView,
  },
  {
    key: "users",
    path: "/users",
    label: "Users",
    description: "Accounts, roles and branch access",
    icon: TeamOutlined,
    group: "System",
    can: "manageUsers",
    loader: permissionLoader("manageUsers", "/"),
    Component: UsersView,
  },
];
