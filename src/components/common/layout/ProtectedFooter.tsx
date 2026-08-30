import { Badge, Flex, Layout } from "antd";
import { useProtectedFooterHook } from "../../../hook/layout/protected.hook";
import {
  footer,
  footerNote,
} from "../../../styles/layout/protected.layout.css";

const { Footer } = Layout;

const ProtectedFooter = () => {
  const { year, branchLabel, online } = useProtectedFooterHook();

  return (
    <Footer className={`${footer}`}>
      <span className={`${footerNote}`}>
        © {year} TARTAR ERP · Enterprise Suite
      </span>
      <Flex align="center" gap={16}>
        <span className={`${footerNote}`}>{branchLabel}</span>
        <Badge
          status={online ? "success" : "warning"}
          text={online ? "Connected" : "Offline"}
        />
      </Flex>
    </Footer>
  );
};

export default ProtectedFooter;
