import type { ApprovalStatus, UserRole } from "../../../enums/role.enum";

export interface IUser {
  id: string;
  username: string;
  full_name: string | null;
  role: UserRole;
  access_flags: Record<string, boolean>;
  approval_status: ApprovalStatus;
  branch_access: string[];
  created_at: string;
  updated_at: string;
}

export interface IAuthUser {
  id: string;
  username: string;
  full_name: string | null;
  role: UserRole;
  access_flags: Record<string, boolean>;
  branch_access: string[];
}

export interface ICustomLoginResponse {
  token: string;
  user: IAuthUser;
}
