import { DownOutlined, ShopOutlined } from "@ant-design/icons";
import { Button, Dropdown, Tooltip, type MenuProps } from "antd";
import { useBranchScopeHook } from "../../../hook/data/branch/branch.scope.hook";
import {
  branchScope,
  branchScopeActive,
  branchScopeCaret,
  branchScopeLabel,
} from "../../../styles/layout/protected.layout.css";

const ProtectedBranchScope = () => {
  const { enabled, branch, branchName, setBranch, branches } =
    useBranchScopeHook();

  if (!enabled || branches.length === 0) return null;

  const menu: MenuProps = {
    items: [
      { key: "all", label: "All branches" },
      { type: "divider" },
      ...branches.map((item) => ({ key: item.slug, label: item.name })),
    ],
    selectable: true,
    selectedKeys: [branch ?? "all"],
    onClick: ({ key }) => setBranch(key === "all" ? null : key),
  };

  return (
    <Dropdown menu={menu} trigger={["click"]} placement="bottomRight">
      <Tooltip
        placement="bottom"
        title={
          branch ? `Branch view: ${branchName}` : "Branch view: all branches"
        }
      >
        <Button
          type="text"
          className={`${branchScope} ${branch ? branchScopeActive : ""}`}
          aria-label="Choose which branch to view"
        >
          <ShopOutlined />
          <span className={`${branchScopeLabel}`}>
            {branchName ?? "All branches"}
          </span>
          <DownOutlined className={`${branchScopeCaret}`} />
        </Button>
      </Tooltip>
    </Dropdown>
  );
};

export default ProtectedBranchScope;
