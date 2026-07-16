import type { ReactNode } from 'react'
import { Avatar, Dropdown, Layout, Menu, Typography, type MenuProps } from 'antd'
import { LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined } from '@ant-design/icons'
import { useAuth } from '../hooks/useAuth'
import { useNetwork } from '../hooks/useNetwork'
import { useUiStore } from '../stores/ui.store'
import { labels } from '../models'
import { SyncIndicator } from './SyncIndicator'

/**
 * The authenticated app shell (sider + header + content). Presentational: the
 * concrete nav items and selection come from the route layer, keeping this
 * reusable and free of route-path coupling. Mounts the network listener once.
 */
interface AppLayoutProps {
  menuItems: MenuProps['items']
  selectedKey: string
  onMenuSelect: (key: string) => void
  children: ReactNode
}

export function AppLayout({ menuItems, selectedKey, onMenuSelect, children }: AppLayoutProps) {
  useNetwork()
  const collapsed = useUiStore((s) => s.siderCollapsed)
  const toggleSider = useUiStore((s) => s.toggleSider)
  const { user, role, logout } = useAuth()

  const displayName = user?.full_name || user?.username || 'superAdmin (Developer)'
  const roleLabel =
    role === 'superadmin' ? 'superAdmin' : role ? labels.userRole[role] : ''

  const userMenu: MenuProps = {
    items: [{ key: 'logout', icon: <LogoutOutlined />, label: 'Sign out' }],
    onClick: ({ key }) => {
      if (key === 'logout') void logout()
    },
  }

  return (
    <Layout className="tartar-shell">
      <Layout.Sider className="tartar-sider" collapsible collapsed={collapsed} trigger={null} width={224}>
        <div className="tartar-logo">{collapsed ? 'T' : 'TARTAR'}</div>
        <Menu
          className="tartar-menu"
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => onMenuSelect(key)}
        />
      </Layout.Sider>

      <Layout>
        <Layout.Header className="tartar-header">
          <button type="button" className="tartar-collapse-btn" onClick={toggleSider} aria-label="Toggle menu">
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>
          <div className="tartar-header-right">
            <SyncIndicator />
            <Dropdown menu={userMenu} trigger={['click']}>
              <button type="button" className="tartar-user-btn">
                <Avatar size="small" icon={<UserOutlined />} />
                <span className="tartar-user-meta">
                  <Typography.Text strong>{displayName}</Typography.Text>
                  <Typography.Text type="secondary" className="tartar-user-role">
                    {roleLabel}
                  </Typography.Text>
                </span>
              </button>
            </Dropdown>
          </div>
        </Layout.Header>

        <Layout.Content className="tartar-content">{children}</Layout.Content>
      </Layout>
    </Layout>
  )
}
