import { Flex } from "antd";
import {
  siderLogo,
  siderLogoLockup,
  siderLogoMark,
  siderLogoSub,
  siderLogoWord,
} from "../../../styles/layout/protected.layout.css";
import ProtectedBranchScope from "./ProtectedBranchScope";
import ProtectedMenu from "./ProtectedMenu";
import ProtectedSiderUser from "./ProtectedSiderUser";

const ProtectedSider = () => {
  return (
    <>
      <Flex className={`${siderLogo}`} align="center">
        <Flex
          component="span"
          className={`${siderLogoMark}`}
          align="center"
          justify="center"
          aria-hidden="true"
        >
          T
        </Flex>
        <Flex vertical component="span" className={`${siderLogoLockup}`}>
          <span className={`${siderLogoWord}`}>TARTAR ERP</span>
          <span className={`${siderLogoSub}`}>Enterprise Suite</span>
        </Flex>
      </Flex>

      <ProtectedBranchScope />

      <ProtectedMenu />

      <ProtectedSiderUser />
    </>
  );
};

export default ProtectedSider;
