import { createRoute } from '@tanstack/react-router'
import { Flex, Typography } from 'antd'
import { rootRoute } from './__root'

/** Placeholder landing route — replaced by login / dashboard in later milestones. */
export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexPage,
})

function IndexPage() {
  return (
    <Flex className="tartar-placeholder" vertical align="center" justify="center" gap="small">
      <Typography.Title className="tartar-brand">TARTAR</Typography.Title>
      <Typography.Text type="secondary">
        Business Management System — scaffold is running.
      </Typography.Text>
    </Flex>
  )
}
