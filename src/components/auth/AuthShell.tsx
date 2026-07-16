import type { ReactNode } from 'react'
import { Card, Typography } from 'antd'
import { CloudSyncOutlined, FileProtectOutlined, ShopOutlined } from '@ant-design/icons'

/**
 * Shared chrome for the public auth pages (login / register): a split-screen
 * composition with an espresso branding panel on the left and the floating
 * form card over a soft cream field on the right. The panel collapses away on
 * narrow viewports, where the card grows its own compact brand row instead.
 *
 * Purely presentational — pages pass their heading and form as children. All
 * styling lives in globalStyle rules keyed on `tartar-auth-*` (hard rule).
 */

const FEATURES = [
  { icon: <ShopOutlined />, text: 'Every branch on one ledger' },
  { icon: <FileProtectOutlined />, text: 'Vouchers with an approval trail' },
  { icon: <CloudSyncOutlined />, text: 'Works offline, syncs when you return' },
]

interface AuthShellProps {
  /** Card heading, e.g. "Welcome back". */
  title: string
  /** One-line supporting copy under the heading. */
  subtitle: string
  children: ReactNode
}

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="tartar-auth-page">
      <aside className="tartar-auth-hero">
        <div className="tartar-auth-hero-brand">
          <span className="tartar-auth-mark" aria-hidden="true">
            T
          </span>
          TARTAR
        </div>

        <div className="tartar-auth-hero-body">
          <Typography.Title level={1} className="tartar-auth-hero-title">
            The calm ledger behind a busy tartar.
          </Typography.Title>
          <Typography.Paragraph className="tartar-auth-hero-copy">
            Cash, receivables, payables and vouchers for every branch — kept in
            one quiet, careful place.
          </Typography.Paragraph>
          <ul className="tartar-auth-hero-list">
            {FEATURES.map((f) => (
              <li key={f.text} className="tartar-auth-hero-item">
                <span className="tartar-auth-hero-icon" aria-hidden="true">
                  {f.icon}
                </span>
                {f.text}
              </li>
            ))}
          </ul>
        </div>

        {/* Etched farm scene, shared with the app sider — brand continuity. */}
        <div className="tartar-auth-hero-art" aria-hidden="true" />
      </aside>

      <main className="tartar-auth-main">
        <span className="tartar-auth-blob tartar-auth-blob-a" aria-hidden="true" />
        <span className="tartar-auth-blob tartar-auth-blob-b" aria-hidden="true" />
        <span className="tartar-auth-blob tartar-auth-blob-c" aria-hidden="true" />

        <Card className="tartar-auth-card">
          {/* Compact brand row — only rendered visible when the hero is gone. */}
          <div className="tartar-auth-card-brand">
            <span className="tartar-auth-mark" aria-hidden="true">
              T
            </span>
            <span className="tartar-auth-wordmark">TARTAR</span>
          </div>

          <Typography.Title level={2} className="tartar-auth-title">
            {title}
          </Typography.Title>
          <Typography.Text className="tartar-auth-subtitle">{subtitle}</Typography.Text>

          {children}
        </Card>
      </main>
    </div>
  )
}
