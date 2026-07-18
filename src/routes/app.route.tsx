import { createRoute, Outlet, redirect, useNavigate, useRouterState } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { AppLayout } from '../components/AppLayout'
import { usePermissions } from '../hooks/usePermissions'
import { useAuthStore } from '../stores/auth.store'
import { NAV_GROUPS, NAV_ITEMS, type AppPath } from './nav'

/**
 * Pathless layout route wrapping every authenticated page. `beforeLoad` is the
 * single auth gate: no session → bounce to /login (build spec §4). Children
 * render inside the AppLayout shell.
 */
export const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'app',
  beforeLoad: () => {
    if (!useAuthStore.getState().kind) {
      throw redirect({ to: '/login' })
    }
  },
  component: AppShell,
})

function AppShell() {
  const navigate = useNavigate()
  const kind = useAuthStore((s) => s.kind)
  const permissions = usePermissions()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  // On logout the store clears before the /login redirect finishes committing.
  // Render nothing in that window so protected UI never flashes without a session.
  if (!kind) return null

  // Sectioned nav: items the role can see, under their group heading. Groups
  // whose every item is filtered out disappear rather than render an empty label.
  const visible = NAV_ITEMS.filter((item) => permissions[item.can])
  const menuItems = NAV_GROUPS.flatMap((group) => {
    const children = visible
      .filter((item) => item.group === group)
      .map((item) => ({ key: item.key, label: item.label, icon: item.icon }))
    return children.length ? [{ type: 'group' as const, key: group, label: group, children }] : []
  })

  return (
    <AppLayout
      menuItems={menuItems}
      selectedKey={pathname}
      onMenuSelect={(key) => void navigate({ to: key as AppPath })}
    >
      <Outlet />
    </AppLayout>
  )
}
