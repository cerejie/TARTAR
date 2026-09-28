import { Bell } from "lucide-react";
import EmptyState from "../../components/common/status/EmptyState";

const AdminNotificationsView = () => {
  return <EmptyState icon={<Bell />} description="Due alerts arrive in the next update." />;
};

export default AdminNotificationsView;
