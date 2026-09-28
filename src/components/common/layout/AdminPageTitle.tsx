import { useAdminTitleHook } from "../../../hook/layout/admin.hook";
import { adminPageTitle } from "../../../styles/admin/admin.layout.styles";

const AdminPageTitle = () => {
  const { title } = useAdminTitleHook();

  return <h1 className={adminPageTitle}>{title}</h1>;
};

export default AdminPageTitle;
