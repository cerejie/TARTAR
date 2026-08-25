import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import ProtectedHeader from "../components/common/layout/ProtectedHeader";
import ProtectedSider from "../components/common/layout/ProtectedSider";
import { useProtectedLayoutHook } from "../hook/layout/protected.hook";
import {
  content,
  protectedLayout,
  siderScrim,
  siderWrapper,
} from "../styles/layout/protected.layout.css";

const { Sider, Content } = Layout;

const ProtectedLayout = () => {
  const {
    siderCollapsed,
    siderBroken,
    toggleSider,
    setSiderCollapsed,
    setSiderBroken,
  } = useProtectedLayoutHook();

  return (
    <Layout className={`${protectedLayout}`}>
      {siderBroken && !siderCollapsed ? (
        <div
          className={`${siderScrim}`}
          aria-hidden="true"
          onClick={() => setSiderCollapsed(true)}
        />
      ) : null}

      <Sider
        className={`${siderWrapper}`}
        collapsible
        collapsed={siderCollapsed}
        trigger={null}
        width={224}
        breakpoint="lg"
        collapsedWidth={siderBroken ? 0 : 80}
        onBreakpoint={setSiderBroken}
      >
        <ProtectedSider siderCollapsed={siderCollapsed} />
      </Sider>

      <Layout>
        <ProtectedHeader
          siderCollapsed={siderCollapsed}
          onToggleSider={toggleSider}
        />
        <Content className={`${content}`}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default ProtectedLayout;
