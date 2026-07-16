import { createGlobalTheme } from '@vanilla-extract/css'

/**
 * The five brand browns, lightest to darkest. Everything else in the palette is
 * an alias onto one of these — no other hues get introduced.
 */
export const palette = {
  cream: '#FFF2DF',
  sand: '#FFE0B2',
  tan: '#D3A376',
  brown: '#8C6E63',
  espresso: '#3E2522',
} as const

/**
 * Raw hex values, not CSS var references. antd derives whole palettes from
 * `colorPrimary` (hover/active/bg shades), which needs a colour it can parse —
 * a `var(--…)` string would silently produce a broken palette. So antd tokens
 * read from here, while `vars` below exposes the same values to globalStyle.
 */
export const colors = {
  brand: palette.brown,
  brandDark: palette.espresso,
  brandLight: palette.tan,
  accent: palette.sand,
  bg: palette.cream,
  surface: '#ffffff',
  text: palette.espresso,
  textMuted: palette.brown,
  border: palette.tan,
  borderSubtle: palette.sand,

  /**
   * The only non-brown hues in the system, and deliberately so: "destructive"
   * and "negative" are signals, not brand. Folding them into the browns would
   * make a delete button indistinguishable from an edit button. Kept to one
   * red + one green so the palette stays disciplined.
   */
  danger: '#a8071a',
  dangerBg: '#fff1f0',
  dangerBorder: '#ffccc7',
  positive: '#237804',
} as const

export const fontBody =
  "'Segoe UI', system-ui, -apple-system, Roboto, Helvetica, Arial, sans-serif"

/**
 * Headings run serif against the sans body — the split that gives the UI its
 * ledger/almanac character. System stack only: no webfont, so no network cost
 * and nothing to break offline (this app is a PWA).
 */
export const fontHeading =
  "Georgia, 'Iowan Old Style', 'Palatino Linotype', Palatino, 'Times New Roman', serif"

/**
 * Design tokens shared across the app. Consumed by globalStyle rules (and only
 * globalStyle) to customise antd — no inline styles, no CSS modules.
 */
export const vars = createGlobalTheme(':root', {
  color: colors,
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
    lg: '12px',
    xl: '16px',
    pill: '999px',
  },
  shadow: {
    // Shadows are espresso-tinted rather than neutral black: a grey shadow over
    // a cream page reads as dirt, a brown one reads as depth.
    card: '0 1px 2px rgba(62, 37, 34, 0.04), 0 8px 24px rgba(62, 37, 34, 0.06)',
    raised: '0 8px 30px rgba(62, 37, 34, 0.12)',
  },
  font: {
    body: fontBody,
    heading: fontHeading,
  },
})
