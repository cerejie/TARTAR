import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { App as AntdApp, ConfigProvider } from 'antd'
import { colors, fontBody } from '../styles/theme.css'

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
          colorPrimary: colors.brand,
          colorLink: colors.brand,
          colorBgLayout: colors.bg,
          colorBgContainer: colors.surface,
          colorText: colors.text,
          colorTextSecondary: colors.textMuted,
          colorBorder: colors.border,
          colorBorderSecondary: colors.borderSubtle,
          fontFamily: fontBody,
          borderRadius: 8,
        },
        components: {
          // The sider is the one dark surface, so it needs the dark-mode slots
          // rather than the light tokens above.
          Layout: {
            siderBg: colors.brandDark,
            headerBg: colors.bg,
            bodyBg: colors.bg,
          },
          Button: { controlHeight: 40, paddingInline: 18, fontWeight: 500 },
          Card: { borderRadiusLG: 16 },
          Menu: {
            darkItemBg: colors.brandDark,
            darkSubMenuItemBg: colors.brandDark,
            darkItemColor: colors.accent,
            darkItemHoverBg: colors.brand,
            darkItemHoverColor: colors.surface,
            darkItemSelectedBg: colors.brand,
            darkItemSelectedColor: colors.surface,
          },
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
