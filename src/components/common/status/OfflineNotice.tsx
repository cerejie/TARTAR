import { CloudOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useOfflineNotice } from "../../../hook/common/network.hook";

const OfflineNotice = () => {
  const { visible, title } = useOfflineNotice();

  if (!visible) return null;

  return (
    <Alert>
      <CloudOff />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        Changes you record are kept on this device and sync when you reconnect.
      </AlertDescription>
    </Alert>
  );
};

export default OfflineNotice;
