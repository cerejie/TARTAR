import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Button, Flex, Layout } from "antd";
import {
  collapseButton,
  header,
  headerRight,
} from "../../../styles/layout/protected.layout.css";
import SyncIndicator from "../status/SyncIndicator";

const { Header } = Layout;

type IProps = {
  siderCollapsed: boolean;
  onToggleSider: () => void;
};

const ProtectedHeader = ({ siderCollapsed, onToggleSider }: IProps) => {
  return (
    <Header className={`${header}`}>
      <Button
        type="text"
        className={`${collapseButton}`}
        aria-label="Toggle menu"
        icon={siderCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={onToggleSider}
      />
      <Flex className={`${headerRight}`} align="center" gap={16}>
        <SyncIndicator />
      </Flex>
    </Header>
  );
};

export default ProtectedHeader;
