import { Badge, Dropdown, Tooltip, type MenuProps } from 'antd'
import { CaretDownOutlined, ShopOutlined } from '@ant-design/icons'
import { useBranchScope } from '../hooks/useBranchScope'

/**
 * Sidebar branch view switcher (managers only). Lets admin/superAdmin focus
 * every screen on one branch at a time — dashboard, ledgers, reports, vouchers
 * and monitoring all read the same scope. Collapsed sider keeps just the icon
 * (CSS hides the label/caret), so the Tooltip carries the current selection.
 */
export function BranchScope() {
  const { enabled, branch, branchName, setBranch, branches } = useBranchScope()
  if (!enabled || branches.length === 0) return null

  const items: MenuProps['items'] = [
    { key: 'all', label: 'All branches' },
    { type: 'divider' },
    ...branches.map((b) => ({ key: b.slug, label: b.name })),
  ]

  const menu: MenuProps = {
    items,
    selectable: true,
    selectedKeys: [branch ?? 'all'],
    onClick: ({ key }) => setBranch(key === 'all' ? null : key),
  }

  return (
    <Dropdown menu={menu} trigger={['click']} placement="bottomLeft">
      <Tooltip
        placement="right"
        title={branch ? `Branch view: ${branchName}` : 'Branch view: all branches'}
      >
        <button
          type="button"
          className={branch ? 'tartar-branch-scope tartar-branch-scope-active' : 'tartar-branch-scope'}
          aria-label="Choose which branch to view"
        >
          <Badge dot={!!branch} color="gold" offset={[2, 2]}>
            <ShopOutlined className="tartar-branch-scope-icon" />
          </Badge>
          <span className="tartar-branch-scope-label">{branchName ?? 'All branches'}</span>
          <CaretDownOutlined className="tartar-branch-scope-caret" />
        </button>
      </Tooltip>
    </Dropdown>
  )
}
