import { ConfigProvider, App as AntdApp } from "antd";
import { useAppHook } from "./hook/app/app.hook";
import View from "./View";

const App = () => {
  const { config } = useAppHook();

  return (
    <ConfigProvider theme={config}>
      <AntdApp>
        <View />
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;
