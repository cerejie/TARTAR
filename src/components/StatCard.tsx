import { Card, Statistic, Skeleton } from 'antd'
import type { ReactNode } from 'react'
import { formatMoney } from '../utils/format'

/**
 * A dashboard stat tile (build spec §11). Money values are peso-formatted; pass
 * `raw` for non-money figures (counts). Used for Current Cash, Today's Sales,
 * Bank Balance, AR/AP, etc.
 */
interface StatCardProps {
  title: string
  value: number | string | null | undefined
  loading?: boolean
  /** When true, render the value as-is instead of peso currency. */
  raw?: boolean
  prefix?: ReactNode
  /** Accent tone for the value text (maps to a globalStyle class). */
  tone?: 'default' | 'positive' | 'negative' | 'brand'
  /** Icon badge docked top-right of the tile (dashboard stat grid only). */
  icon?: ReactNode
  /** Small line under the value — a plain caption or a computed delta. */
  caption?: ReactNode
}

export function StatCard({
  title,
  value,
  loading,
  raw,
  prefix,
  tone = 'default',
  icon,
  caption,
}: StatCardProps) {
  return (
    <Card className="tartar-stat" size="small">
      {loading ? (
        <Skeleton active paragraph={false} title={{ width: '80%' }} />
      ) : (
        <div className="tartar-stat-body">
          <div className="tartar-stat-head">
            <Statistic
              className={`tartar-stat-value tartar-tone-${tone}`}
              title={title}
              prefix={prefix}
              value={raw ? (value ?? '—') : formatMoney(value)}
            />
            {icon ? <span className={`tartar-stat-icon tartar-tone-${tone}`}>{icon}</span> : null}
          </div>
          {caption ? <div className="tartar-stat-caption">{caption}</div> : null}
        </div>
      )}
    </Card>
  )
}
