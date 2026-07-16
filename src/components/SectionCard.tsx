import type { ReactNode } from 'react'
import { Typography } from 'antd'

/**
 * A titled panel — the app's primary content container. Every table, chart and
 * form group sits in one of these, which is what gives pages their rhythm of
 * white cards on the cream field.
 *
 * Deliberately not antd's <Card title=…>: that renders a fixed 56px header with
 * its own border and no room for a subtitle, so the heading block here is plain
 * markup styled via `tartar-card-*` globalStyle rules.
 */
interface SectionCardProps {
  title: string
  subtitle?: string
  /** Right-aligned action area, level with the title. */
  extra?: ReactNode
  /** Cards wrapping a table set this so the table can meet the card edges. */
  flush?: boolean
  children: ReactNode
}

export function SectionCard({ title, subtitle, extra, flush, children }: SectionCardProps) {
  return (
    <section className={`tartar-card${flush ? ' tartar-card-flush' : ''}`}>
      <div className="tartar-card-head">
        <div>
          <Typography.Title level={4} className="tartar-card-title">
            {title}
          </Typography.Title>
          {subtitle ? (
            <Typography.Text type="secondary" className="tartar-card-subtitle">
              {subtitle}
            </Typography.Text>
          ) : null}
        </div>
        {extra ? <div className="tartar-card-extra">{extra}</div> : null}
      </div>
      <div className="tartar-card-body">{children}</div>
    </section>
  )
}
