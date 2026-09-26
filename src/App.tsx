import { ConfigProvider } from "antd";
import { Toaster } from "@/components/ui/sonner";
import ConfirmationModal from "./components/common/modal/ConfirmationModal";
import { useAppHook } from "./hook/app/app.hook";
import View from "./View";

const App = () => {
  const { config } = useAppHook();

  return (
    <ConfigProvider theme={config} componentSize="medium">
      <View />
      <ConfirmationModal />
      <Toaster position="top-center" />
    </ConfigProvider>
  );
};

export default App;
