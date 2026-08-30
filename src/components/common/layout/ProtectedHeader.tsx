import { Flex, Layout } from "antd";
import { useProtectedHeaderHook } from "../../../hook/layout/protected.hook";
import {
  header,
  headerLeft,
  headerRight,
  headerTitle,
} from "../../../styles/layout/protected.layout.css";
import SyncIndicator from "../status/SyncIndicator";

const { Header } = Layout;

const ProtectedHeader = () => {
  const { title } = useProtectedHeaderHook();

  return (
    <Header className={`${header}`}>
      <Flex className={`${headerLeft}`} align="center">
        <span className={`${headerTitle}`}>{title}</span>
      </Flex>
      <Flex className={`${headerRight}`} align="center">
        <SyncIndicator />
      </Flex>
    </Header>
  );
};

export default ProtectedHeader;
