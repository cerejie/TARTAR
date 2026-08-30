import {
  DownOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Dropdown, Flex, type MenuProps } from "antd";
import { useProtectedHeaderUserHook } from "../../../hook/layout/protected.hook";
import {
  headerUser,
  headerUserAvatar,
  headerUserCaret,
  headerUserMeta,
  headerUserName,
  headerUserRole,
  statusDot,
  statusDotOnline,
} from "../../../styles/layout/protected.layout.css";

const ProtectedHeaderUser = () => {
  const { displayName, roleLabel, online, logoutMutation } =
    useProtectedHeaderUserHook();

  const menu: MenuProps = {
    items: [{ key: "logout", icon: <LogoutOutlined />, label: "Sign out" }],
    onClick: ({ key }) => {
      if (key === "logout") void logoutMutation.mutate();
    },
  };

  return (
    <Dropdown menu={menu} trigger={["click"]} placement="bottomLeft">
      <Button type="text" className={`${headerUser}`}>
        <Flex component="span" className={`${headerUserAvatar}`}>
          <Avatar size={32} icon={<UserOutlined />} />
          <span
            className={`${statusDot} ${online ? statusDotOnline : ""}`}
            aria-hidden="true"
          />
        </Flex>
        <Flex vertical component="span" className={`${headerUserMeta}`}>
          <span className={`${headerUserName}`}>{displayName}</span>
          <span className={`${headerUserRole}`}>{roleLabel}</span>
        </Flex>
        <DownOutlined className={`${headerUserCaret}`} />
      </Button>
    </Dropdown>
  );
};

export default ProtectedHeaderUser;
