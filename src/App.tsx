import { ConfigProvider, App as AntdApp } from "antd";
import ConfirmationModal from "./components/common/modal/ConfirmationModal";
import { useAppHook } from "./hook/app/app.hook";
import View from "./View";

const App = () => {
  const { config } = useAppHook();

  return (
    <ConfigProvider theme={config}>
      <AntdApp>
        <View />
        <ConfirmationModal />
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;
