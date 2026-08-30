import { DownOutlined, LogoutOutlined } from "@ant-design/icons";
import { Avatar, Button, Dropdown, Flex, type MenuProps } from "antd";
import { useProtectedUserHook } from "../../../hook/layout/protected.hook";
import {
  siderFooter,
  siderUser,
  siderUserAvatar,
  siderUserCaret,
  siderUserMeta,
  siderUserName,
  siderUserRole,
} from "../../../styles/layout/protected.layout.css";

const ProtectedSiderUser = () => {
  const { displayName, roleLabel, initial, logoutMutation } =
    useProtectedUserHook();

  const menu: MenuProps = {
    items: [{ key: "logout", icon: <LogoutOutlined />, label: "Sign out" }],
    onClick: ({ key }) => {
      if (key === "logout") void logoutMutation.mutate();
    },
  };

  return (
    <div className={`${siderFooter}`}>
      <Dropdown menu={menu} trigger={["click"]} placement="topLeft">
        <Button type="text" className={`${siderUser}`}>
          <Avatar size={30} className={`${siderUserAvatar}`}>
            {initial}
          </Avatar>
          <Flex vertical component="span" className={`${siderUserMeta}`}>
            <span className={`${siderUserName}`}>{displayName}</span>
            <span className={`${siderUserRole}`}>{roleLabel}</span>
          </Flex>
          <DownOutlined className={`${siderUserCaret}`} />
        </Button>
      </Dropdown>
    </div>
  );
};

export default ProtectedSiderUser;
