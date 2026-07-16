import { Flex, Typography } from 'antd'
import type { ReactNode } from 'react'

/** Consistent page title + optional action area used at the top of every page. */
interface PageHeaderProps {
  title: string
  subtitle?: string
  extra?: ReactNode
}

export function PageHeader({ title, subtitle, extra }: PageHeaderProps) {
  return (
    <Flex className="tartar-page-header" align="center" justify="space-between" gap="middle" wrap>
      <div>
        <Typography.Title level={3} className="tartar-page-title">
          {title}
        </Typography.Title>
        {subtitle ? <Typography.Text type="secondary">{subtitle}</Typography.Text> : null}
      </div>
      {extra ? <div className="tartar-page-actions">{extra}</div> : null}
    </Flex>
  )
}
