import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import ProtectedFooter from "../components/common/layout/ProtectedFooter";
import ProtectedHeader from "../components/common/layout/ProtectedHeader";
import ProtectedSider from "../components/common/layout/ProtectedSider";
import { useProtectedLayoutHook } from "../hook/layout/protected.hook";
import {
  content,
  protectedLayout,
  shellMain,
  siderWidth,
  siderWrapper,
} from "../styles/layout/protected.layout.css";

const { Sider, Content } = Layout;

const ProtectedLayout = () => {
  useProtectedLayoutHook();

  return (
    <Layout className={`${protectedLayout}`}>
      <Sider className={`${siderWrapper}`} trigger={null} width={siderWidth}>
        <ProtectedSider />
      </Sider>

      <Layout className={`${shellMain}`}>
        <ProtectedHeader />
        <Content className={`${content}`}>
          <Outlet />
        </Content>
        <ProtectedFooter />
      </Layout>
    </Layout>
  );
};

export default ProtectedLayout;
