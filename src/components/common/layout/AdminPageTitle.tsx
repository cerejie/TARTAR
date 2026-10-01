import type { ReactNode } from "react";
import { useAdminTitleHook } from "../../../hook/layout/admin.hook";
import {
  adminPageTitle,
  adminPageTitleRow,
} from "../../../styles/admin/admin.layout.styles";

type IProps = {
  action?: ReactNode;
};

const AdminPageTitle = ({ action }: IProps) => {
  const { title } = useAdminTitleHook();

  return (
    <div className={adminPageTitleRow}>
      <h1 className={adminPageTitle}>{title}</h1>
      {action}
    </div>
  );
};

export default AdminPageTitle;
