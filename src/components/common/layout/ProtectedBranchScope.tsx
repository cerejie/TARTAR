import {
  CheckOutlined,
  DownOutlined,
  PlusOutlined,
  SearchOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import { Button, Dropdown, Input, type MenuProps } from "antd";
import { useBranchScopeHook } from "../../../hook/data/branch/branch.scope.hook";
import {
  branchScope,
  branchScopeActive,
  branchScopeCaret,
  branchScopeCheck,
  branchScopeLabel,
  branchScopeManage,
  branchScopeOption,
  branchScopePanel,
  branchScopePopup,
  branchScopeSearch,
  siderScope,
} from "../../../styles/layout/protected.layout.css";

const ProtectedBranchScope = () => {
  const {
    enabled,
    branch,
    branchName,
    setBranch,
    branches,
    visibleBranches,
    search,
    setSearch,
    goToManageBranches,
  } = useBranchScopeHook();

  if (!enabled || branches.length === 0) return null;

  const selectedKey = branch ?? "all";

  const option = (key: string, label: string) => ({
    key,
    label: (
      <span className={`${branchScopeOption}`}>
        {label}
        {selectedKey === key ? (
          <CheckOutlined className={`${branchScopeCheck}`} />
        ) : null}
      </span>
    ),
  });

  const menu: MenuProps = {
    items: [
      option("all", "All branches"),
      { type: "divider" },
      ...visibleBranches.map((item) => option(item.slug, item.name)),
    ],
    selectable: true,
    selectedKeys: [selectedKey],
    onClick: ({ key }) => setBranch(key === "all" ? null : key),
  };

  return (
    <div className={`${siderScope}`}>
      <Dropdown
        menu={menu}
        trigger={["click"]}
        placement="bottomLeft"
        classNames={{ root: branchScopePopup }}
        popupRender={(node) => (
          <div className={`${branchScopePanel}`}>
            <Input
              className={`${branchScopeSearch}`}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              prefix={<SearchOutlined />}
              placeholder="Search branches..."
              allowClear
            />
            {node}
            <Button
              type="text"
              className={`${branchScopeManage}`}
              icon={<PlusOutlined />}
              onClick={goToManageBranches}
            >
              Manage branches
            </Button>
          </div>
        )}
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
      </Dropdown>
    </div>
  );
};

export default ProtectedBranchScope;
