import { DownOutlined, LogoutOutlined } from "@ant-design/icons";
import { Avatar, Badge, Button, Dropdown, Flex, type MenuProps } from "antd";
import { useProtectedUserHook } from "../../../hook/layout/protected.hook";
import {
  siderFooter,
  siderUser,
  siderUserAvatar,
  siderUserBadge,
  siderUserCaret,
  siderUserMenu,
  siderUserMeta,
  siderUserName,
  siderUserOnline,
  siderUserRole,
} from "../../../styles/layout/protected.layout.css";

const ProtectedSiderUser = () => {
  const { displayName, roleLabel, initial, online, logoutMutation } =
    useProtectedUserHook();

  const menu: MenuProps = {
    items: [
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "Sign out",
        danger: true,
      },
    ],
    onClick: ({ key }) => {
      if (key === "logout") void logoutMutation.mutate();
    },
  };

  return (
    <div className={`${siderFooter}`}>
      <Dropdown
        menu={menu}
        trigger={["click"]}
        placement="topLeft"
        classNames={{ root: siderUserMenu }}
      >
        <Button type="text" className={`${siderUser}`}>
          <Badge
            dot={online}
            classNames={{ root: siderUserBadge, indicator: siderUserOnline }}
          >
            <Avatar size={30} className={`${siderUserAvatar}`}>
              {initial}
            </Avatar>
          </Badge>
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
