import { Flex } from "antd";
import {
  siderArt,
  siderLogo,
  siderLogoLockup,
  siderLogoMark,
  siderLogoSub,
  siderLogoWord,
} from "../../../styles/layout/protected.layout.css";
import ProtectedBranchScope from "./ProtectedBranchScope";
import ProtectedMenu from "./ProtectedMenu";
import ProtectedSiderUser from "./ProtectedSiderUser";

type IProps = {
  siderCollapsed: boolean;
};

const ProtectedSider = ({ siderCollapsed }: IProps) => {
  return (
    <>
      <Flex className={`${siderLogo}`} align="center" gap={10}>
        <Flex
          component="span"
          className={`${siderLogoMark}`}
          align="center"
          justify="center"
          aria-hidden="true"
        >
          T
        </Flex>
        {siderCollapsed ? null : (
          <Flex vertical component="span" className={`${siderLogoLockup}`}>
            <span className={`${siderLogoWord}`}>TARTAR ERP</span>
            <span className={`${siderLogoSub}`}>Enterprise Suite</span>
          </Flex>
        )}
      </Flex>

      <ProtectedBranchScope />
      <ProtectedMenu />

      <div className={`${siderArt}`} aria-hidden="true" />

      <ProtectedSiderUser />
    </>
  );
};

export default ProtectedSider;
