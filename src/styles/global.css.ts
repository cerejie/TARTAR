import { globalStyle } from '@vanilla-extract/css'
import { vars } from './theme.css'

globalStyle('html, body, #root', {
  margin: 0,
  padding: 0,
  height: '100%',
})

globalStyle('body', {
  fontFamily: vars.font.body,
  color: vars.color.text,
  background: vars.color.bg,
})

globalStyle('#root', {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
})

/* Scaffold placeholder — removed once real layout lands. */
globalStyle('.tartar-placeholder', {
  flex: 1,
  minHeight: '100vh',
})

globalStyle('.tartar-placeholder .tartar-brand', {
  letterSpacing: '0.08em',
  color: vars.color.brand,
  marginBottom: 0,
})

/* ==========================================================================
   Reusable component styling. Per the hard rules, antd is customised ONLY via
   these globalStyle rules keyed on the `tartar-*` classNames the components add.
   ========================================================================== */

/* --- Generic full-width form control (InputNumber / DatePicker) ----------- */
globalStyle('.tartar-block', {
  width: '100%',
})

/* --- App shell ------------------------------------------------------------ */
globalStyle('.tartar-shell', {
  minHeight: '100vh',
})

globalStyle('.tartar-logo', {
  height: '56px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#ffffff',
  fontWeight: 700,
  letterSpacing: '0.12em',
  fontSize: '18px',
})

globalStyle('.tartar-header', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: vars.color.surface,
  paddingInline: vars.space.md,
  borderBottom: `1px solid ${vars.color.border}`,
})

globalStyle('.tartar-header-right', {
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.md,
})

globalStyle('.tartar-collapse-btn, .tartar-user-btn', {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.sm,
  padding: vars.space.xs,
  fontSize: '16px',
  color: vars.color.text,
})

globalStyle('.tartar-user-meta', {
  display: 'flex',
  flexDirection: 'column',
  lineHeight: 1.2,
  textAlign: 'left',
})

globalStyle('.tartar-user-role', {
  fontSize: '12px',
})

globalStyle('.tartar-content', {
  padding: vars.space.lg,
})

/* --- Page header ---------------------------------------------------------- */
globalStyle('.tartar-page-header', {
  marginBottom: vars.space.lg,
})

globalStyle('.tartar-page-title', {
  marginBottom: 0,
})

/* --- Stat tiles ----------------------------------------------------------- */
globalStyle('.tartar-stat', {
  height: '100%',
})

globalStyle('.tartar-tone-positive .ant-statistic-content', {
  color: '#237804',
})

globalStyle('.tartar-tone-negative .ant-statistic-content', {
  color: vars.color.brand,
})

globalStyle('.tartar-tone-brand .ant-statistic-content', {
  color: vars.color.brand,
})

/* --- Tables --------------------------------------------------------------- */
globalStyle('.tartar-row-clickable', {
  cursor: 'pointer',
})

/* --- Sync indicator ------------------------------------------------------- */
globalStyle('.tartar-sync', {
  display: 'inline-flex',
  alignItems: 'center',
  marginInlineEnd: 0,
})
