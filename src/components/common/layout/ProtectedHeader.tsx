import { Flex, Layout } from "antd";
import { useProtectedHeaderHook } from "../../../hook/layout/protected.hook";
import {
  header,
  headerLeft,
  headerRight,
  headerSubtitle,
  headerTitle,
} from "../../../styles/layout/protected.layout.css";
import SyncIndicator from "../status/SyncIndicator";

const { Header } = Layout;

const ProtectedHeader = () => {
  const { title, description } = useProtectedHeaderHook();

  return (
    <Header className={`${header}`}>
      <div className={`${headerLeft}`}>
        <span className={`${headerTitle}`}>{title}</span>
        {description ? (
          <span className={`${headerSubtitle}`}>{description}</span>
        ) : null}
      </div>
      <Flex className={`${headerRight}`} align="center">
        <SyncIndicator />
      </Flex>
    </Header>
  );
};

export default ProtectedHeader;
