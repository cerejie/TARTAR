import { globalStyle } from '@vanilla-extract/css'
import { vars } from './theme.css'
import { farmSceneUrl, farmSceneSize } from './farmScene'

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

/* Serif headings are the app's signature. antd renders titles as h1–h5, so key
   the rule on the elements rather than chasing each component's class. */
globalStyle('h1, h2, h3, h4, h5, .ant-typography h1, .ant-typography h2, .ant-typography h3', {
  fontFamily: vars.font.heading,
  fontWeight: 600,
  letterSpacing: '0.01em',
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

/* --- Sider ---------------------------------------------------------------- */
/* Column layout so the farm scene can claim the leftover space under the nav.
   It is deliberately NOT absolutely positioned: on a short viewport, or with a
   long nav, an absolute scene would sit on top of the menu items. As a flex
   child it can only ever occupy space the nav didn't want, and `min-height: 0`
   lets it be squeezed to nothing rather than pushing the nav off-screen. */
globalStyle('.tartar-sider .ant-layout-sider-children', {
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
})

globalStyle('.tartar-sider-art', {
  flex: 1,
  minHeight: 0,
  backgroundImage: farmSceneUrl,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'bottom center',
  backgroundSize: `${farmSceneSize.width}px auto`,
  opacity: 0.45,
  pointerEvents: 'none',
  // The scene has no sky — this dissolves the field up into the sider so it
  // reads as atmosphere rather than a picture pasted at the bottom.
  maskImage: 'linear-gradient(to bottom, transparent 0%, #000 55%)',
  WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, #000 55%)',
  transition: 'opacity 0.2s ease',
})

/* Collapsed to 80px the scene would be cropped to an unreadable smear. */
globalStyle('.tartar-sider.ant-layout-sider-collapsed .tartar-sider-art', {
  opacity: 0,
})

globalStyle('.tartar-logo', {
  height: '64px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: vars.font.heading,
  color: vars.color.accent,
  fontWeight: 700,
  letterSpacing: '0.18em',
  fontSize: '20px',
  position: 'relative',
})

/* Nav sits above the illustration. */
globalStyle('.tartar-menu', {
  position: 'relative',
  borderInlineEnd: 'none',
  background: 'transparent',
  paddingInline: vars.space.sm,
})

globalStyle('.tartar-menu .ant-menu-item', {
  borderRadius: vars.radius.md,
})

globalStyle('.tartar-header', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  // Cream, not white: the header is part of the page field, and only cards lift
  // off it. A white bar here would read as a second, competing surface.
  background: vars.color.bg,
  paddingInline: vars.space.lg,
  height: '64px',
  borderBottom: `1px solid ${vars.color.borderSubtle}`,
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
  borderRadius: vars.radius.md,
})

/* The collapse control reads as its own white chip against the cream header. */
globalStyle('.tartar-collapse-btn', {
  background: vars.color.surface,
  border: `1px solid ${vars.color.borderSubtle}`,
  width: '36px',
  height: '36px',
  justifyContent: 'center',
  padding: 0,
})

globalStyle('.tartar-collapse-btn:hover, .tartar-user-btn:hover', {
  background: vars.color.accent,
})

globalStyle('.tartar-user-btn', {
  paddingInline: vars.space.sm,
  paddingBlock: vars.space.xs,
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
  fontSize: '32px',
  lineHeight: 1.2,
  color: vars.color.brandDark,
})

/* --- Section cards -------------------------------------------------------- */
globalStyle('.tartar-card', {
  background: vars.color.surface,
  border: `1px solid ${vars.color.borderSubtle}`,
  borderRadius: vars.radius.xl,
  boxShadow: vars.shadow.card,
  marginBottom: vars.space.lg,
  overflow: 'hidden',
})

globalStyle('.tartar-card-head', {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: vars.space.md,
  flexWrap: 'wrap',
  padding: `${vars.space.lg} ${vars.space.lg} 0`,
})

globalStyle('.tartar-card-title', {
  marginBottom: 0,
  fontSize: '20px',
  color: vars.color.brandDark,
})

globalStyle('.tartar-card-subtitle', {
  fontSize: '13px',
})

globalStyle('.tartar-card-body', {
  padding: vars.space.lg,
})

/* A flush card drops the body's vertical padding so the table's own cell
   padding sets the rhythm, and insets it horizontally to line the first column
   up under the card title.
   The inset lives here rather than on the edge cells: antd's size rules
   (`.ant-table.ant-table-medium …`) set the `padding` shorthand at equal
   specificity and later in the cascade, so per-cell overrides only win via
   ever-longer selectors or !important. Padding the body sidesteps that
   entirely, and matches the design's inset row separators. */
globalStyle('.tartar-card-flush .tartar-card-body', {
  padding: `${vars.space.sm} ${vars.space.md} 0`,
})

/* --- Tables --------------------------------------------------------------- */
globalStyle('.tartar-table .ant-table', {
  background: 'transparent',
})

globalStyle('.tartar-table .ant-table-thead > tr > th', {
  background: 'transparent',
  color: vars.color.brandDark,
  fontWeight: 600,
  borderBottom: `1px solid ${vars.color.borderSubtle}`,
})

/* antd draws vertical separators between header cells; they fight the airy
   look and add lines the design doesn't have. */
globalStyle('.tartar-table .ant-table-thead > tr > th::before', {
  display: 'none',
})

globalStyle('.tartar-table .ant-table-tbody > tr > td', {
  borderBottom: `1px solid ${vars.color.borderSubtle}`,
})

globalStyle('.tartar-table .ant-table-tbody > tr:last-child > td', {
  borderBottom: 'none',
})

globalStyle('.tartar-table .ant-table-tbody > tr:hover > td', {
  background: vars.color.bg,
})

/* --- Stat tiles ----------------------------------------------------------- */
globalStyle('.tartar-stat', {
  height: '100%',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.borderSubtle}`,
  boxShadow: vars.shadow.card,
})

globalStyle('.tartar-stat .ant-statistic-title', {
  color: vars.color.textMuted,
  fontSize: '13px',
})

/* Figures get the serif too — they're the headline of each tile. */
globalStyle('.tartar-stat .ant-statistic-content', {
  fontFamily: vars.font.heading,
  color: vars.color.brandDark,
  fontSize: '24px',
})

globalStyle('.tartar-tone-positive .ant-statistic-content', {
  color: vars.color.positive,
})

globalStyle('.tartar-tone-negative .ant-statistic-content', {
  color: vars.color.danger,
})

globalStyle('.tartar-tone-brand .ant-statistic-content', {
  color: vars.color.brand,
})

globalStyle('.tartar-row-clickable', {
  cursor: 'pointer',
})

/* --- Table decor (icon chips, column labels, chips, row actions) ---------- */
globalStyle('.tartar-row-icon', {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '28px',
  height: '28px',
  flexShrink: 0,
  borderRadius: vars.radius.md,
  background: vars.color.accent,
  color: vars.color.brand,
  fontSize: '14px',
})

globalStyle('.tartar-name-cell', {
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space.sm,
})

globalStyle('.tartar-col-label', {
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space.xs,
  whiteSpace: 'nowrap',
})

globalStyle('.tartar-col-icon', {
  color: vars.color.brandLight,
  fontSize: '14px',
  display: 'inline-flex',
})

/* Right-aligned numeric columns: keep the icon next to the label, not floating
   away from it, by letting the header contents hug the right edge. */
globalStyle('.tartar-table .ant-table-cell.ant-table-cell-ellipsis .tartar-col-label', {
  overflow: 'visible',
})

globalStyle('.tartar-slug', {
  fontFamily: 'inherit',
  background: vars.color.accent,
  color: vars.color.brand,
  border: 'none',
  borderRadius: vars.radius.sm,
  fontSize: '12px',
  marginInlineEnd: 0,
})

globalStyle('.tartar-row-actions', {
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space.sm,
})

globalStyle('.tartar-icon-btn', {
  width: '32px',
  height: '32px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.borderSubtle}`,
  background: vars.color.surface,
  color: vars.color.brand,
})

globalStyle('.tartar-icon-btn:hover', {
  background: vars.color.accent,
  borderColor: vars.color.brandLight,
  color: vars.color.brandDark,
})

/* Destructive actions stay red — the brown above would otherwise swallow antd's
   `danger` styling and make delete look like every other row action. */
globalStyle('.tartar-icon-btn.ant-btn-dangerous', {
  color: vars.color.danger,
  borderColor: vars.color.dangerBorder,
  background: vars.color.dangerBg,
})

globalStyle('.tartar-icon-btn.ant-btn-dangerous:hover', {
  color: vars.color.surface,
  borderColor: vars.color.danger,
  background: vars.color.danger,
})

/* A disabled action must not read as available. */
globalStyle('.tartar-icon-btn:disabled, .tartar-icon-btn:disabled:hover', {
  color: vars.color.brandLight,
  background: vars.color.surface,
  borderColor: vars.color.borderSubtle,
  cursor: 'not-allowed',
})

/* --- Sync indicator ------------------------------------------------------- */
globalStyle('.tartar-sync', {
  display: 'inline-flex',
  alignItems: 'center',
  marginInlineEnd: 0,
})

/* --- Auth (login / register) pages ---------------------------------------- */
globalStyle('.tartar-auth-wrap', {
  flex: 1,
  minHeight: '100vh',
  padding: vars.space.lg,
})

globalStyle('.tartar-auth-card', {
  width: '100%',
  maxWidth: '400px',
  boxShadow: vars.shadow.raised,
  borderRadius: vars.radius.xl,
  border: `1px solid ${vars.color.borderSubtle}`,
  justifyContent: 'center',
})

globalStyle('.tartar-auth-brand', {
  fontFamily: vars.font.heading,
  letterSpacing: '0.18em',
  color: vars.color.brandDark,
  textAlign: 'center',
  marginBottom: 0,
})

globalStyle('.tartar-auth-subtitle', {
  display: 'block',
  textAlign: 'center',
})

globalStyle('.tartar-auth-tabs', {
  marginTop: vars.space.md,
})

/* --- Filter bar ----------------------------------------------------------- */
globalStyle('.tartar-filterbar', {
  marginBottom: vars.space.md,
})

globalStyle('.tartar-filter-branch', {
  minWidth: '200px',
})

globalStyle('.tartar-filter-ref', {
  width: '160px',
})

globalStyle('.tartar-filter-amount', {
  width: '110px',
})

/* --- Cards / charts / reports --------------------------------------------- */
globalStyle('.tartar-chart-card', {
  marginTop: vars.space.lg,
})

globalStyle('.tartar-alerts-hint', {
  display: 'block',
  marginTop: vars.space.sm,
})

globalStyle('.tartar-report-seg', {
  marginBottom: vars.space.lg,
})

globalStyle('.tartar-report-stats', {
  marginBottom: vars.space.lg,
})
