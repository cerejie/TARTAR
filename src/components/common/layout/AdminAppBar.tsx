import { useAdminAppBarHook } from "../../../hook/layout/admin.hook";
import AdminUserSheet from "./AdminUserSheet";
import AppBar from "./AppBar";
import ProtectedUserMenu from "./ProtectedUserMenu";

const AdminAppBar = () => {
  const { title, showUserSheet } = useAdminAppBarHook();

  return (
    <AppBar title={title} trailing={showUserSheet ? <AdminUserSheet /> : <ProtectedUserMenu />} />
  );
};

export default AdminAppBar;
