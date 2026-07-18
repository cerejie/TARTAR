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
          // Typography type="secondary" reads colorTextDescription, not
          // colorTextSecondary — left alone it derives a low-alpha espresso
          // (~2.6:1 on white) instead of the palette's muted brown.
          colorTextDescription: colors.textMuted,
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
            darkItemBg: 'transparent',
            darkSubMenuItemBg: 'transparent',
            darkItemColor: colors.accent,
            // Hover is a translucent wash, NOT the selected brown — when the two
            // states share a colour the nav gives no feedback about where you are.
            darkItemHoverBg: 'rgba(255, 242, 223, 0.09)',
            darkItemHoverColor: colors.bg,
            // Inverted selection: a light cream pill with espresso text pops
            // against the dark sider far more than another shade of brown.
            darkItemSelectedBg: colors.bg,
            darkItemSelectedColor: colors.brandDark,
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
