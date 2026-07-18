import { globalStyle, keyframes } from '@vanilla-extract/css'
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
   the rule on the elements rather than chasing each component's class. The
   `body hN.ant-typography` variants exist because antd v6 sets font-family on
   the heading elements itself (h3.ant-typography, specificity 0-1-1, injected
   after this sheet) — the extra `body` outweighs it without !important. */
globalStyle(
  [
    'h1, h2, h3, h4, h5',
    'body h1.ant-typography, body h2.ant-typography, body h3.ant-typography',
    'body h4.ant-typography, body h5.ant-typography',
  ].join(', '),
  {
    fontFamily: vars.font.heading,
    fontWeight: 600,
    letterSpacing: '0.01em',
  },
)

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

/* --- Mobile shell ----------------------------------------------------------
   Below antd's `lg` breakpoint (992px — mirrored by breakpoint="lg" on the
   Sider) the sider leaves the flow and overlays the page as a drawer: in flow
   even its 80px rail would squeeze the content on a phone. Collapsed it is
   0px wide (see AppLayout's collapsedWidth), so `overflow: hidden` keeps the
   logo/nav from bleeding out of the zero-width shell mid-animation. */
globalStyle('.tartar-sider', {
  '@media': {
    'screen and (max-width: 991.98px)': {
      position: 'fixed',
      insetBlock: 0,
      insetInlineStart: 0,
      zIndex: 100,
      height: '100dvh',
      overflow: 'hidden',
    },
  },
})

globalStyle('.tartar-sider:not(.ant-layout-sider-collapsed)', {
  '@media': {
    'screen and (max-width: 991.98px)': {
      boxShadow: vars.shadow.raised,
    },
  },
})

/* A long nav must scroll inside the open drawer, not push past the viewport. */
globalStyle('.tartar-sider .ant-layout-sider-children', {
  '@media': {
    'screen and (max-width: 991.98px)': {
      overflowY: 'auto',
    },
  },
})

globalStyle('.tartar-sider-scrim', {
  position: 'fixed',
  inset: 0,
  zIndex: 99,
  background: 'rgba(62, 37, 34, 0.4)',
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

/* --- Branch view switcher (managers) --------------------------------------- */
/* Sits between the logo and the nav. It is a plain button (antd Dropdown needs
   a hoverable/clickable child) styled to read as part of the dark sider. */
globalStyle('.tartar-branch-scope', {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.sm,
  width: `calc(100% - ${vars.space.md})`,
  margin: `0 ${vars.space.sm} ${vars.space.sm}`,
  padding: '7px 12px',
  border: '1px solid rgba(255, 224, 178, 0.28)',
  borderRadius: vars.radius.md,
  background: 'rgba(255, 255, 255, 0.06)',
  color: vars.color.accent,
  fontFamily: vars.font.body,
  fontSize: '13px',
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'background 0.2s ease, border-color 0.2s ease',
})

globalStyle('.tartar-branch-scope:hover', {
  background: 'rgba(255, 255, 255, 0.14)',
  borderColor: 'rgba(255, 224, 178, 0.55)',
})

/* A chosen branch reads as "engaged": solid accent border, brighter text. */
globalStyle('.tartar-branch-scope-active', {
  borderColor: vars.color.accent,
  background: 'rgba(255, 224, 178, 0.14)',
})

globalStyle('.tartar-branch-scope .anticon', {
  color: vars.color.accent,
})

globalStyle('.tartar-branch-scope-label', {
  flex: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

globalStyle('.tartar-branch-scope-caret', {
  fontSize: '10px',
  opacity: 0.7,
})

/* Collapsed sider: keep only the (badged) icon, centred — the Tooltip carries
   the current selection. */
globalStyle('.tartar-sider.ant-layout-sider-collapsed .tartar-branch-scope', {
  justifyContent: 'center',
  padding: '7px 0',
})

globalStyle(
  [
    '.tartar-sider.ant-layout-sider-collapsed .tartar-branch-scope-label',
    '.tartar-sider.ant-layout-sider-collapsed .tartar-branch-scope-caret',
  ].join(', '),
  {
    display: 'none',
  },
)

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

/* Keyboard focus on the shell's custom buttons — same tan ring the auth pages
   use, instead of each browser's default ring against the styled surfaces. */
globalStyle(
  [
    '.tartar-collapse-btn:focus-visible',
    '.tartar-user-btn:focus-visible',
    '.tartar-icon-btn:focus-visible',
    '.tartar-branch-scope:focus-visible',
  ].join(', '),
  {
    outline: '3px solid rgba(211, 163, 118, 0.7)',
    outlineOffset: '2px',
  },
)

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
  padding: vars.space.xl,
  '@media': {
    'screen and (max-width: 768px)': { padding: vars.space.md },
  },
})

/* --- Page header ------------------------------------------------------------
   Rendered as its own card so every page opens on the same surface rhythm:
   header card, then content cards, all sharing the 24px padding scale. */
globalStyle('.tartar-page-header', {
  background: vars.color.surface,
  border: `1px solid ${vars.color.borderSubtle}`,
  borderRadius: vars.radius.xl,
  boxShadow: vars.shadow.card,
  padding: vars.space.lg,
  marginBottom: vars.space.lg,
})

globalStyle('.tartar-page-title', {
  marginBottom: '4px',
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

/* antd's size="small" body is a cramped 12px; keep tiles on the shared scale.
   (.ant-card bumps specificity past antd's own `.ant-card-small > .ant-card-body`.) */
globalStyle('.tartar-stat.ant-card .ant-card-body', {
  padding: `${vars.space.md} ${vars.space.lg}`,
})

/* Stat grids sit between the page header and the first section card — give the
   row the same bottom rhythm every card already has. */
globalStyle('.tartar-stat-grid', {
  marginBottom: vars.space.lg,
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

/* ==========================================================================
   Auth (login / register) pages — split-screen composition rendered by
   components/auth/AuthShell. Left: espresso branding hero (drops out under
   960px). Right: floating glass card over a cream field with blurred palette
   blobs. Every colour is one of the five brand browns, shaded only by alpha.
   ========================================================================== */

/* Entrances + ambient drift. Motion is opt-out via prefers-reduced-motion. */
const authCardIn = keyframes({
  from: { opacity: 0, transform: 'translateY(18px) scale(0.98)' },
  to: { opacity: 1, transform: 'translateY(0) scale(1)' },
})

const authHeroIn = keyframes({
  from: { opacity: 0, transform: 'translateY(14px)' },
  to: { opacity: 1, transform: 'translateY(0)' },
})

const authBlobDrift = keyframes({
  from: { transform: 'translate3d(0, 0, 0) scale(1)' },
  to: { transform: 'translate3d(26px, -20px, 0) scale(1.07)' },
})

globalStyle('.tartar-auth-page', {
  flex: 1,
  display: 'flex',
  minHeight: '100vh',
  /* Warm wash over the cream so the field isn't a flat fill. */
  background: `
    radial-gradient(1100px 700px at 88% -10%, rgba(255, 224, 178, 0.7), transparent 60%),
    radial-gradient(900px 650px at -12% 108%, rgba(211, 163, 118, 0.28), transparent 60%),
    ${vars.color.bg}`,
})

/* --- Branding hero ---------------------------------------------------------- */
globalStyle('.tartar-auth-hero', {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  width: 'clamp(360px, 42vw, 560px)',
  padding: '48px',
  overflow: 'hidden',
  color: vars.color.accent,
  /* Tan/brown glows over espresso give the panel depth without new hues. */
  background: `
    radial-gradient(120% 90% at 110% -10%, rgba(140, 110, 99, 0.5), transparent 55%),
    radial-gradient(110% 90% at -25% 110%, rgba(211, 163, 118, 0.22), transparent 60%),
    ${vars.color.brandDark}`,
  '@media': {
    'screen and (max-width: 960px)': { display: 'none' },
  },
})

globalStyle('.tartar-auth-hero-brand', {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  fontFamily: vars.font.heading,
  fontWeight: 700,
  fontSize: '19px',
  letterSpacing: '0.18em',
  color: vars.color.bg,
})

globalStyle('.tartar-auth-hero-body', {
  position: 'relative',
  zIndex: 1,
  margin: 'auto 0',
  paddingBottom: '96px', // keeps the copy clear of the farm scene below
  animation: `${authHeroIn} 0.7s 0.1s cubic-bezier(0.21, 0.61, 0.35, 1) both`,
})

/* antd v6 sets font-family on hN.ant-typography itself, outweighing the
   element-level serif rule up top — so the auth headings restate it. */
globalStyle('.tartar-auth-hero h1.ant-typography', {
  margin: '0 0 12px',
  fontFamily: vars.font.heading,
  fontSize: 'clamp(28px, 2.6vw, 36px)',
  lineHeight: 1.15,
  color: vars.color.bg,
})

globalStyle('.tartar-auth-hero .tartar-auth-hero-copy.ant-typography', {
  margin: 0,
  maxWidth: '42ch',
  fontSize: '15px',
  lineHeight: 1.6,
  color: 'rgba(255, 242, 223, 0.78)',
})

globalStyle('.tartar-auth-hero-list', {
  listStyle: 'none',
  margin: `${vars.space.xl} 0 0`,
  padding: 0,
  display: 'grid',
  gap: '14px',
})

globalStyle('.tartar-auth-hero-item', {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  fontSize: '14px',
  color: 'rgba(255, 242, 223, 0.85)',
})

globalStyle('.tartar-auth-hero-icon', {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '34px',
  height: '34px',
  flexShrink: 0,
  borderRadius: vars.radius.lg,
  fontSize: '15px',
  color: vars.color.brandLight,
  background: 'rgba(255, 224, 178, 0.12)',
  border: '1px solid rgba(255, 224, 178, 0.18)',
})

/* Same etched farm scene as the app sider — tan line-art reads as engraving
   on espresso. Faded up top so it dissolves into the panel, not pasted on. */
globalStyle('.tartar-auth-hero-art', {
  position: 'absolute',
  insetInline: 0,
  bottom: 0,
  height: '46%',
  backgroundImage: farmSceneUrl,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'bottom center',
  backgroundSize: '520px auto',
  opacity: 0.4,
  pointerEvents: 'none',
  maskImage: 'linear-gradient(to bottom, transparent 0%, #000 60%)',
  WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, #000 60%)',
})

/* --- Form side --------------------------------------------------------------- */
globalStyle('.tartar-auth-main', {
  position: 'relative',
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: `${vars.space.xl} ${vars.space.lg}`,
  overflow: 'hidden',
  '@media': {
    'screen and (max-width: 480px)': {
      padding: `${vars.space.lg} ${vars.space.md}`,
    },
  },
})

/* Blurred palette blobs — the "abstract background" without an illustration.
   Oversized blur radii keep them ambient; drift is slow and alternating. */
globalStyle('.tartar-auth-blob', {
  position: 'absolute',
  borderRadius: '50%',
  filter: 'blur(80px)',
  pointerEvents: 'none',
  animation: `${authBlobDrift} 14s ease-in-out infinite alternate`,
})

globalStyle('.tartar-auth-blob-a', {
  width: '420px',
  height: '420px',
  top: '-120px',
  right: '-90px',
  background: 'rgba(255, 224, 178, 0.85)',
})

globalStyle('.tartar-auth-blob-b', {
  width: '360px',
  height: '360px',
  bottom: '-140px',
  left: '-110px',
  background: 'rgba(211, 163, 118, 0.35)',
  animationDelay: '-7s',
})

globalStyle('.tartar-auth-blob-c', {
  width: '260px',
  height: '260px',
  top: '55%',
  right: '6%',
  background: 'rgba(140, 110, 99, 0.16)',
  animationDuration: '18s',
})

/* --- Card -------------------------------------------------------------------- */
globalStyle('.tartar-auth-card.ant-card', {
  position: 'relative',
  zIndex: 1,
  width: '100%',
  maxWidth: '440px',
  /* Subtle glass: near-white over the blobs, blur only where supported. */
  background: 'rgba(255, 255, 255, 0.88)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: '1px solid rgba(255, 224, 178, 0.9)',
  borderRadius: '24px',
  boxShadow: `
    0 1px 2px rgba(62, 37, 34, 0.05),
    0 12px 32px rgba(62, 37, 34, 0.10),
    0 32px 80px rgba(62, 37, 34, 0.12)`,
  animation: `${authCardIn} 0.55s cubic-bezier(0.21, 0.61, 0.35, 1) both`,
  '@media': {
    'screen and (max-width: 480px)': { borderRadius: '20px' },
  },
})

globalStyle('.tartar-auth-card.ant-card .ant-card-body', {
  padding: '44px 40px',
  '@media': {
    'screen and (max-width: 480px)': { padding: '32px 24px' },
  },
})

/* Compact brand row inside the card — only surfaces when the hero is hidden. */
globalStyle('.tartar-auth-card-brand', {
  display: 'none',
  alignItems: 'center',
  gap: '10px',
  marginBottom: vars.space.lg,
  '@media': {
    'screen and (max-width: 960px)': { display: 'flex' },
  },
})

globalStyle('.tartar-auth-wordmark', {
  fontFamily: vars.font.heading,
  fontWeight: 700,
  fontSize: '17px',
  letterSpacing: '0.18em',
  color: vars.color.brandDark,
})

/* Logo mark chip, shared by hero and card. */
globalStyle('.tartar-auth-mark', {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '42px',
  height: '42px',
  flexShrink: 0,
  borderRadius: '14px',
  fontFamily: vars.font.heading,
  fontWeight: 700,
  fontSize: '22px',
  color: vars.color.brandDark,
  background: `linear-gradient(135deg, ${vars.color.accent}, ${vars.color.brandLight})`,
  boxShadow: '0 6px 16px rgba(62, 37, 34, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.45)',
})

globalStyle('.tartar-auth-card h2.ant-typography', {
  margin: '0 0 6px',
  fontFamily: vars.font.heading,
  fontSize: '26px',
  color: vars.color.brandDark,
})

globalStyle('.tartar-auth-subtitle', {
  display: 'block',
  fontSize: '14px',
  color: vars.color.textMuted,
})

/* --- Form ---------------------------------------------------------------------
   Inputs sit on a faint cream tint, sharpen to white with a tan glow on focus.
   antd draws prefixed inputs as .ant-input-affix-wrapper > input.ant-input. */
globalStyle('.tartar-auth-form', {
  marginTop: '28px',
})

globalStyle('.tartar-auth-form .ant-form-item', {
  marginBottom: '18px',
})

globalStyle('.tartar-auth-form .ant-form-item-label > label', {
  fontSize: '13px',
  fontWeight: 600,
  color: 'rgba(62, 37, 34, 0.85)',
})

globalStyle('.tartar-auth-form .ant-input-affix-wrapper', {
  padding: '12px 16px',
  borderRadius: '14px',
  background: 'rgba(255, 242, 223, 0.5)',
  borderColor: 'rgba(211, 163, 118, 0.45)',
  transition: 'border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease',
})

globalStyle('.tartar-auth-form .ant-input-affix-wrapper:hover', {
  borderColor: vars.color.brandLight,
  background: 'rgba(255, 242, 223, 0.8)',
})

globalStyle('.tartar-auth-form .ant-input-affix-wrapper:focus-within', {
  borderColor: vars.color.brandLight,
  background: vars.color.surface,
  boxShadow: '0 0 0 4px rgba(211, 163, 118, 0.22)',
})

globalStyle('.tartar-auth-form .ant-input-affix-wrapper .ant-input', {
  background: 'transparent',
  fontSize: '15px',
})

globalStyle('.tartar-auth-form .ant-input::placeholder', {
  color: 'rgba(140, 110, 99, 0.55)',
})

globalStyle('.tartar-auth-form .ant-input-prefix', {
  marginInlineEnd: '10px',
  fontSize: '16px',
  color: vars.color.textMuted,
  transition: 'color 0.2s ease',
})

globalStyle('.tartar-auth-form .ant-input-affix-wrapper:focus-within .ant-input-prefix', {
  color: vars.color.brandDark,
})

/* Password visibility toggle. */
globalStyle('.tartar-auth-form .ant-input-suffix .anticon', {
  color: vars.color.textMuted,
  transition: 'color 0.2s ease',
})

globalStyle('.tartar-auth-form .ant-input-suffix .anticon:hover', {
  color: vars.color.brandDark,
})

/* --- Meta row (forgot password) ---------------------------------------------- */
globalStyle('.tartar-auth-meta', {
  display: 'flex',
  justifyContent: 'flex-end',
  margin: '-6px 0 20px',
})

globalStyle('.tartar-auth-hint.ant-btn-link', {
  padding: 0,
  height: 'auto',
  fontSize: '13px',
  fontWeight: 500,
  color: vars.color.textMuted,
})

globalStyle('.tartar-auth-hint.ant-btn-link:not(:disabled):hover', {
  color: vars.color.brandDark,
  background: 'transparent',
  textDecoration: 'underline',
  textUnderlineOffset: '3px',
})

globalStyle('.tartar-auth-pop', {
  maxWidth: '260px',
  fontSize: '13px',
  lineHeight: 1.55,
  color: vars.color.text,
})

/* --- Primary CTA ---------------------------------------------------------------
   Gradient brown→espresso; hover lifts and slides the gradient, press dips.
   Selectors carry :not() guards so they outweigh antd's own solid-button rules
   regardless of style-tag injection order. */
globalStyle('.tartar-auth-form .tartar-auth-submit.ant-btn-primary', {
  height: '50px',
  borderRadius: '14px',
  fontSize: '15px',
  fontWeight: 600,
  border: 'none',
  background: `linear-gradient(135deg, ${vars.color.brand} 0%, ${vars.color.brandDark} 100%)`,
  backgroundSize: '160% 160%',
  backgroundPosition: '0% 0%',
  boxShadow: '0 12px 28px rgba(62, 37, 34, 0.28)',
  transition:
    'transform 0.18s ease, box-shadow 0.25s ease, background-position 0.35s ease',
})

globalStyle(
  '.tartar-auth-form .tartar-auth-submit.ant-btn-primary:not(:disabled):not(.ant-btn-disabled):hover',
  {
    background: `linear-gradient(135deg, ${vars.color.brand} 0%, ${vars.color.brandDark} 100%)`,
    backgroundSize: '160% 160%',
    backgroundPosition: '100% 100%',
    transform: 'translateY(-2px)',
    boxShadow: '0 16px 34px rgba(62, 37, 34, 0.34)',
  },
)

globalStyle(
  '.tartar-auth-form .tartar-auth-submit.ant-btn-primary:not(:disabled):not(.ant-btn-disabled):active',
  {
    background: `linear-gradient(135deg, ${vars.color.brand} 0%, ${vars.color.brandDark} 100%)`,
    backgroundSize: '160% 160%',
    backgroundPosition: '100% 100%',
    transform: 'translateY(0) scale(0.985)',
    boxShadow: '0 8px 18px rgba(62, 37, 34, 0.24)',
  },
)

globalStyle('.tartar-auth-form .tartar-auth-submit.ant-btn-primary:focus-visible', {
  outline: '3px solid rgba(211, 163, 118, 0.7)',
  outlineOffset: '2px',
})

/* --- Footer link --------------------------------------------------------------- */
globalStyle('.tartar-auth-alt', {
  display: 'block',
  textAlign: 'center',
  marginTop: '26px',
  paddingTop: '20px',
  borderTop: '1px solid rgba(255, 224, 178, 0.8)',
  fontSize: '14px',
  color: vars.color.textMuted,
})

globalStyle('.tartar-auth-alt a', {
  fontWeight: 600,
  color: vars.color.brandDark,
  textDecoration: 'none',
  borderBottom: '1px solid rgba(211, 163, 118, 0.6)',
  paddingBottom: '1px',
  transition: 'border-color 0.2s ease, color 0.2s ease',
})

globalStyle('.tartar-auth-alt a:hover', {
  color: vars.color.brand,
  borderBottomColor: vars.color.brandDark,
})

globalStyle('.tartar-auth-alt a:focus-visible, .tartar-auth-hint.ant-btn-link:focus-visible', {
  outline: '2px solid rgba(211, 163, 118, 0.8)',
  outlineOffset: '2px',
  borderRadius: vars.radius.sm,
})

/* --- Motion preferences ---------------------------------------------------------- */
globalStyle('.tartar-auth-card.ant-card, .tartar-auth-blob, .tartar-auth-hero-body', {
  '@media': {
    '(prefers-reduced-motion: reduce)': { animation: 'none' },
  },
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

globalStyle('.tartar-filter-status', {
  minWidth: '140px',
})

/* --- Customer Ledger modal: two panes sliding horizontally ----------------- */
globalStyle('.tartar-slide-panes', {
  overflow: 'hidden',
})

globalStyle('.tartar-slide-track', {
  display: 'flex',
  width: '200%',
  alignItems: 'flex-start',
  transition: 'transform 0.3s ease',
  '@media': {
    '(prefers-reduced-motion: reduce)': { transition: 'none' },
  },
})

globalStyle('.tartar-slide-track.tartar-slide-detail', {
  transform: 'translateX(-50%)',
})

globalStyle('.tartar-slide-pane', {
  width: '50%',
  flexShrink: 0,
  minWidth: 0,
})

globalStyle('.tartar-ledger-head', {
  marginBottom: vars.space.md,
})

/* --- Transaction edit-history modal ---------------------------------------- */
globalStyle('.tartar-audit-entry', {
  marginBottom: vars.space.md,
})

globalStyle('.tartar-audit-changes', {
  margin: `${vars.space.xs} 0 0`,
  paddingLeft: vars.space.lg,
})

globalStyle('.tartar-payment-total', {
  marginTop: vars.space.md,
  textAlign: 'right',
})

/* Section heading inside the customer-ledger pane (payments history). */
globalStyle('.tartar-ledger-section', {
  marginTop: vars.space.lg,
  marginBottom: vars.space.sm,
})

/* Overdue rows glow red across every ledger table (client decision 9). */
globalStyle('.tartar-table .tartar-row-overdue > td', {
  background: 'rgba(255, 77, 79, 0.07)',
})

globalStyle('.tartar-filter-amount', {
  width: '110px',
})

/* --- Cards / charts / reports --------------------------------------------- */
globalStyle('.tartar-chart-card', {
  marginTop: vars.space.lg,
})

/* Placeholder while a chart loads, sized to the chart it will become so the
   card doesn't jump from spinner-height to 300px when data lands. */
globalStyle('.tartar-chart-loading', {
  height: '300px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
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
