import { CaretDownOutlined, ShopOutlined } from "@ant-design/icons";
import { Badge, Button, Dropdown, Flex, Tooltip, type MenuProps } from "antd";
import { useBranchScopeHook } from "../../../hook/data/branch/branch.scope.hook";
import {
  branchField,
  branchFieldLabel,
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
    <Flex className={`${branchField}`}>
      <span className={`${branchFieldLabel}`} aria-hidden="true">
        Current Branch
      </span>
      <Dropdown menu={menu} trigger={["click"]} placement="bottomLeft">
        <Tooltip
          placement="right"
          title={
            branch
              ? `Branch view: ${branchName}`
              : "Branch view: all branches"
          }
        >
          <Button
            type="text"
            className={`${branchScope} ${branch ? branchScopeActive : ""}`}
            aria-label="Choose which branch to view"
          >
            <Badge dot={!!branch} color="gold" offset={[2, 2]}>
              <ShopOutlined />
            </Badge>
            <span className={`${branchScopeLabel}`}>
              {branchName ?? "All branches"}
            </span>
            <CaretDownOutlined className={`${branchScopeCaret}`} />
          </Button>
        </Tooltip>
      </Dropdown>
    </Flex>
  );
};

export default ProtectedBranchScope;
