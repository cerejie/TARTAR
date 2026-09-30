import type { ApprovalStatus, UserRole } from "../../../enums/role.enum";

export interface IUser {
  id: string;
  email: string | null;
  username: string;
  full_name: string | null;
  role: UserRole;
  access_flags: Record<string, boolean>;
  approval_status: ApprovalStatus;
  branch_access: string[];
  password_reset_requested_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface IUserDisplayName {
  id: string;
  name: string;
}

export interface IAuthUser {
  id: string;
  email: string | null;
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
