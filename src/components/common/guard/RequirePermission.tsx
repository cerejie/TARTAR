import type { ReactNode } from "react";
import { ShieldX } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { usePermissions } from "../../../hook/account/account.permission.hook";
import type { IPermissions } from "../../../models/common/permission.model";
import { permissionDenied } from "../../../styles/status/status.styles";

type IProps = {
  can: keyof IPermissions;
  children: ReactNode;
  fallback?: ReactNode;
};

const denied = (
  <Empty className={permissionDenied}>
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <ShieldX />
      </EmptyMedia>
      <EmptyTitle>Not allowed</EmptyTitle>
      <EmptyDescription>You don't have access to this section.</EmptyDescription>
    </EmptyHeader>
  </Empty>
);

const RequirePermission = ({ can, children, fallback = denied }: IProps) => {
  const permissions = usePermissions();

  return <>{permissions[can] ? children : fallback}</>;
};

export default RequirePermission;
