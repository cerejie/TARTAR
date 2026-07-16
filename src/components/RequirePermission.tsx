import type { ReactNode } from 'react'
import { Result } from 'antd'
import { usePermissions, type Permissions } from '../hooks/usePermissions'

/**
 * Conditionally renders children based on a permission flag (build spec §5).
 * Use for in-page gating (buttons, sections). Route-level protection lives in
 * the route guard. Pass `fallback={null}` to hide silently.
 */
interface RequirePermissionProps {
  can: keyof Permissions
  children: ReactNode
  fallback?: ReactNode
}

const DENIED = (
  <Result status="403" title="Not allowed" subTitle="You don't have access to this section." />
)

export function RequirePermission({ can, children, fallback = DENIED }: RequirePermissionProps) {
  const permissions = usePermissions()
  return permissions[can] ? <>{children}</> : <>{fallback}</>
}
