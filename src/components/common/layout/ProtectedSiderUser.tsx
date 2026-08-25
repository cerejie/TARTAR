import {
  LogoutOutlined,
  RightOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Dropdown, Flex, type MenuProps } from "antd";
import { useProtectedSiderUserHook } from "../../../hook/layout/protected.hook";
import {
  siderUser,
  siderUserAvatar,
  siderUserCaret,
  siderUserMeta,
  siderUserName,
  siderUserRole,
  statusDot,
  statusDotOnline,
} from "../../../styles/layout/protected.layout.css";

const ProtectedSiderUser = () => {
  const { displayName, roleLabel, online, logoutMutation } =
    useProtectedSiderUserHook();

  const menu: MenuProps = {
    items: [{ key: "logout", icon: <LogoutOutlined />, label: "Sign out" }],
    onClick: ({ key }) => {
      if (key === "logout") void logoutMutation.mutate();
    },
  };

  return (
    <Dropdown menu={menu} trigger={["click"]} placement="top">
      <Button type="text" className={`${siderUser}`}>
        <Flex component="span" className={`${siderUserAvatar}`}>
          <Avatar size={34} icon={<UserOutlined />} />
          <span
            className={`${statusDot} ${online ? statusDotOnline : ""}`}
            aria-hidden="true"
          />
        </Flex>
        <Flex vertical component="span" className={`${siderUserMeta}`}>
          <span className={`${siderUserName}`}>{displayName}</span>
          <span className={`${siderUserRole}`}>{roleLabel}</span>
        </Flex>
        <RightOutlined className={`${siderUserCaret}`} />
      </Button>
    </Dropdown>
  );
};

export default ProtectedSiderUser;
