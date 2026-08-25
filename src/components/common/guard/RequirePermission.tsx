import { Result } from "antd";
import type { ReactNode } from "react";
import { usePermissions } from "../../../hook/account/account.permission.hook";
import type { IPermissions } from "../../../models/common/permission.model";

type IProps = {
  can: keyof IPermissions;
  children: ReactNode;
  fallback?: ReactNode;
};

const denied = (
  <Result
    status="403"
    title="Not allowed"
    subTitle="You don't have access to this section."
  />
);

const RequirePermission = ({ can, children, fallback = denied }: IProps) => {
  const permissions = usePermissions();

  return <>{permissions[can] ? children : fallback}</>;
};

export default RequirePermission;
