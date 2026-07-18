import type { ReactNode } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Avatar, Dropdown, Layout, Menu, type MenuProps } from 'antd'
import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  RightOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { useAuth } from '../hooks/useAuth'
import { useNetwork } from '../hooks/useNetwork'
import { useNetworkStore } from '../stores/network.store'
import { useUiStore } from '../stores/ui.store'
import { labels } from '../models'
import { SyncIndicator } from './SyncIndicator'
import { BranchScope } from './BranchScope'

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
  const navigate = useNavigate()
  const collapsed = useUiStore((s) => s.siderCollapsed)
  const toggleSider = useUiStore((s) => s.toggleSider)
  const broken = useUiStore((s) => s.siderBroken)
  const setSiderBroken = useUiStore((s) => s.setSiderBroken)
  const setSiderCollapsed = useUiStore((s) => s.setSiderCollapsed)
  const online = useNetworkStore((s) => s.online)
  const { user, role, logout } = useAuth()

  const displayName = user?.full_name || user?.username || 'superAdmin (Developer)'
  const roleLabel =
    role === 'superadmin' ? 'superAdmin' : role ? labels.userRole[role] : ''

  const userMenu: MenuProps = {
    items: [{ key: 'logout', icon: <LogoutOutlined />, label: 'Sign out' }],
    onClick: ({ key }) => {
      if (key !== 'logout') return
      // `logout` clears the session synchronously (before its awaited remote
      // sign-out), so by the time /login's guard runs the session is already
      // gone — no bounce back to the app. `replace` drops the authed page from
      // history so Back can't return to it without re-authenticating.
      void logout()
      void navigate({ to: '/login', replace: true })
    },
  }

  return (
    <Layout className="tartar-shell">
      {/* Scrim behind the mobile drawer — tap outside the nav to dismiss it.
          Pointer-only affordance: the header toggle stays keyboard-reachable. */}
      {broken && !collapsed ? (
        <div className="tartar-sider-scrim" aria-hidden="true" onClick={() => setSiderCollapsed(true)} />
      ) : null}
      <Layout.Sider
        className="tartar-sider"
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={224}
        // Below `lg` the sider leaves the flow (see .tartar-sider media rules)
        // and collapses to nothing — an 80px rail on a phone still eats a
        // quarter of the screen. The header button reopens it as a drawer.
        breakpoint="lg"
        collapsedWidth={broken ? 0 : 80}
        onBreakpoint={setSiderBroken}
      >
        <div className="tartar-logo">
          <span className="tartar-logo-mark" aria-hidden="true">
            T
          </span>
          {collapsed ? null : (
            <span className="tartar-logo-lockup">
              <span className="tartar-logo-word">TARTAR ERP</span>
              <span className="tartar-logo-sub">Enterprise Suite</span>
            </span>
          )}
        </div>
        {/* Global branch view for managers — scopes every data screen. */}
        <BranchScope />
        <Menu
          className="tartar-menu"
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => {
            onMenuSelect(key)
            // Navigating from the drawer should reveal the page it opened.
            if (broken) setSiderCollapsed(true)
          }}
        />
        {/* Purely decorative farm scene filling the space below the nav. It is
            drawn in CSS (see styles/farmScene.ts) and carries no meaning. */}
        <div className="tartar-sider-art" aria-hidden="true" />
        {/* Account card pinned to the sider foot. The dot mirrors connectivity;
            the header's SyncIndicator stays the detailed source of truth. */}
        <Dropdown menu={userMenu} trigger={['click']} placement="top">
          <button type="button" className="tartar-sider-user">
            <span className="tartar-sider-user-avatar">
              <Avatar size={34} icon={<UserOutlined />} />
              <span
                className={`tartar-status-dot${online ? ' tartar-status-dot-online' : ''}`}
                aria-hidden="true"
              />
            </span>
            <span className="tartar-sider-user-meta">
              <span className="tartar-sider-user-name">{displayName}</span>
              <span className="tartar-sider-user-role">{roleLabel}</span>
            </span>
            <RightOutlined className="tartar-sider-user-caret" />
          </button>
        </Dropdown>
      </Layout.Sider>

      <Layout>
        <Layout.Header className="tartar-header">
          <button type="button" className="tartar-collapse-btn" onClick={toggleSider} aria-label="Toggle menu">
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>
          <div className="tartar-header-right">
            <SyncIndicator />
          </div>
        </Layout.Header>

        <Layout.Content className="tartar-content">{children}</Layout.Content>
      </Layout>
    </Layout>
  )
}
