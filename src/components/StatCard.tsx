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
}

export function StatCard({ title, value, loading, raw, prefix, tone = 'default' }: StatCardProps) {
  return (
    <Card className="tartar-stat" size="small">
      {loading ? (
        <Skeleton active paragraph={false} title={{ width: '80%' }} />
      ) : (
        <Statistic
          className={`tartar-stat-value tartar-tone-${tone}`}
          title={title}
          prefix={prefix}
          value={raw ? (value ?? '—') : formatMoney(value)}
        />
      )}
    </Card>
  )
}
