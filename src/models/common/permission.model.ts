import type { EffectiveRole } from "../../enums/role.enum";

export interface IPermissions {
  role: EffectiveRole | null;
  isManager: boolean;
  viewFinancialStanding: boolean;
  viewDashboard: boolean;
  viewBranchMonitoring: boolean;
  viewIncomeExpenses: boolean;
  encodeTransactions: boolean;
  viewReminders: boolean;
  createVouchers: boolean;
  createManualVouchers: boolean;
  approveVouchers: boolean;
  manageUsers: boolean;
  manageMasterData: boolean;
  manageAdmins: boolean;
}

export const derivePermissions = (
  role: EffectiveRole | null
): IPermissions => {
  const isSuperAdmin = role === "superadmin";
  const isAdmin = role === "admin";
  const isManager = isSuperAdmin || isAdmin;
  const isAccountant = role === "accountant";
  const isEmployee = role === "employee";

  return {
    role,
    isManager,
    viewFinancialStanding: isManager,
    viewDashboard: isManager,
    viewBranchMonitoring: isManager,
    viewIncomeExpenses: isManager || isAccountant,
    encodeTransactions: isManager || isEmployee,
    viewReminders: role !== null,
    createVouchers: isManager || isEmployee,
    createManualVouchers: isManager,
    approveVouchers: isManager,
    manageUsers: isManager,
    manageMasterData: isManager,
    manageAdmins: isManager,
  };
};
