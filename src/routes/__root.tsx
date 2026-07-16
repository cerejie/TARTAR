import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { App as AntdApp, ConfigProvider } from 'antd'
import { vars } from '../styles/theme.css'

/**
 * Root route. Wraps every page in antd's ConfigProvider so theme tokens flow
 * from one place, and renders the matched child route via <Outlet />.
 */
export const rootRoute = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: vars.color.brand,
        },
      }}
    >
      {/* AntdApp provides the message/notification/modal context used by useMutation. */}
      <AntdApp>
        <Outlet />
        {import.meta.env.DEV ? <TanStackRouterDevtools position="bottom-right" /> : null}
      </AntdApp>
    </ConfigProvider>
  )
}
