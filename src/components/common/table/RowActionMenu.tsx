import { MenuOutlined } from "@ant-design/icons";
import { Button, Dropdown, Tooltip, type MenuProps } from "antd";
import type { IRowAction } from "../../../models/common/action.model";
import { iconButton, rowActionMenu } from "../../../styles/table/table.css";

type IProps = {
  actions: readonly IRowAction[];
};

const RowActionMenu = ({ actions }: IProps) => {
  if (actions.length === 0) return null;

  if (actions.length === 1) {
    const [action] = actions;
    return (
      <Tooltip title={action.label}>
        <Button
          className={`${iconButton}`}
          danger={action.danger}
          disabled={action.disabled}
          icon={action.icon}
          aria-label={action.label}
          onClick={action.onSelect}
        />
      </Tooltip>
    );
  }

  const items: MenuProps["items"] = actions.map((action) => ({
    key: action.key,
    label: action.label,
    danger: action.danger,
    disabled: action.disabled,
  }));

  const selectAction: MenuProps["onClick"] = ({ key }) => {
    actions.find((action) => action.key === key)?.onSelect();
  };

  return (
    <Dropdown
      menu={{ items, onClick: selectAction }}
      trigger={["click"]}
      placement="bottomRight"
      classNames={{ root: rowActionMenu }}
    >
      <Button
        className={`${iconButton}`}
        icon={<MenuOutlined />}
        aria-label="Row actions"
      />
    </Dropdown>
  );
};

export default RowActionMenu;
