import { HandCoins } from "lucide-react";
import EmptyState from "../../components/common/status/EmptyState";

const AdminPayablesView = () => {
  return <EmptyState icon={<HandCoins />} description="Due checks and payables arrive in the next update." />;
};

export default AdminPayablesView;
