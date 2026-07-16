import { createGlobalTheme } from '@vanilla-extract/css'

/**
 * Design tokens shared across the app. Consumed by globalStyle rules (and only
 * globalStyle) to customise antd — no inline styles, no CSS modules.
 */
export const vars = createGlobalTheme(':root', {
  color: {
    brand: '#c1121f',
    brandDark: '#8d0d17',
    bg: '#f5f5f5',
    surface: '#ffffff',
    text: '#1f1f1f',
    textMuted: '#6b7280',
    border: '#e5e7eb',
  },
  space: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  radius: {
    sm: '4px',
    md: '8px',
  },
  font: {
    body: "'Segoe UI', system-ui, -apple-system, Roboto, Helvetica, Arial, sans-serif",
  },
})
