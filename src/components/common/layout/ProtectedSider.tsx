import { Flex } from "antd";
import { useProtectedCalloutHook } from "../../../hook/layout/protected.hook";
import {
  siderLogo,
  siderLogoLockup,
  siderLogoMark,
  siderLogoSub,
  siderLogoWord,
} from "../../../styles/layout/protected.layout.css";
import ProtectedMenu from "./ProtectedMenu";
import SiderCallout from "./SiderCallout";

type IProps = {
  siderCollapsed: boolean;
};

const ProtectedSider = ({ siderCollapsed }: IProps) => {
  const callout = useProtectedCalloutHook();

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

      <ProtectedMenu />

      {callout ? (
        <SiderCallout
          title={callout.title}
          description={callout.description}
          actionLabel={callout.actionLabel}
          onAction={callout.onAction}
        />
      ) : null}
    </>
  );
};

export default ProtectedSider;
