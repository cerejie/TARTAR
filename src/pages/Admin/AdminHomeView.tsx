import { House } from "lucide-react";
import EmptyState from "../../components/common/status/EmptyState";

const AdminHomeView = () => {
  return <EmptyState icon={<House />} description="The overview arrives in the next update." />;
};

export default AdminHomeView;
