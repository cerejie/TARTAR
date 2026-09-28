import { Wallet } from "lucide-react";
import EmptyState from "../../components/common/status/EmptyState";

const AdminReceivablesView = () => {
  return <EmptyState icon={<Wallet />} description="Due collections arrive in the next update." />;
};

export default AdminReceivablesView;
