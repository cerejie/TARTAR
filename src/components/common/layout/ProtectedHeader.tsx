import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Button, Flex, Layout } from "antd";
import {
  collapseButton,
  header,
  headerLeft,
  headerRight,
} from "../../../styles/layout/protected.layout.css";
import SyncIndicator from "../status/SyncIndicator";
import ProtectedBranchScope from "./ProtectedBranchScope";
import ProtectedHeaderUser from "./ProtectedHeaderUser";

const { Header } = Layout;

type IProps = {
  siderCollapsed: boolean;
  onToggleSider: () => void;
};

const ProtectedHeader = ({ siderCollapsed, onToggleSider }: IProps) => {
  return (
    <Header className={`${header}`}>
      <Flex className={`${headerLeft}`} align="center">
        <Button
          type="text"
          className={`${collapseButton}`}
          aria-label="Toggle menu"
          icon={siderCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggleSider}
        />
        <ProtectedHeaderUser />
      </Flex>
      <Flex className={`${headerRight}`} align="center">
        <ProtectedBranchScope />
        <SyncIndicator />
      </Flex>
    </Header>
  );
};

export default ProtectedHeader;
