import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "../common/vars.css";

const COLLAPSED = "ant-layout-sider-collapsed";

export const protectedLayout = style({
  height: "100dvh",
  overflow: "hidden",
  background: vars.color.bg,
  "@media": {
    "screen and (min-width: 992px)": {
      padding: vars.space.md,
      gap: vars.space.md,
    },
  },
});

export const shellMain = style({
  display: "flex",
  flexDirection: "column",
  background: "transparent",
  minWidth: 0,
  minHeight: 0,
});

export const siderWrapper = style({
  "@media": {
    "screen and (min-width: 992px)": {
      position: "sticky",
      top: vars.space.md,
      height: `calc(100dvh - (${vars.space.md} * 2))`,
      borderRadius: vars.radius.shell,
      overflow: "hidden",
    },
    "screen and (max-width: 991.98px)": {
      position: "fixed",
      insetBlock: 0,
      insetInlineStart: 0,
      zIndex: 100,
      height: "100dvh",
      overflow: "hidden",
    },
  },
  selectors: {
    "&.ant-layout-sider": {
      background: vars.color.brandDark,
    },
  },
});

globalStyle(`.${siderWrapper}:not(.${COLLAPSED})`, {
  "@media": {
    "screen and (max-width: 991.98px)": {
      boxShadow: vars.shadow.pop,
    },
  },
});

globalStyle(`.${siderWrapper} .ant-layout-sider-children`, {
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  height: "100%",
  paddingBottom: vars.space.sm,
  "@media": {
    "screen and (max-width: 991.98px)": { overflowY: "auto" },
  },
});

export const siderScrim = style({
  position: "fixed",
  inset: 0,
  zIndex: 99,
  background: "rgba(11, 11, 14, 0.45)",
});

export const siderLogo = style({
  height: 72,
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: `0 ${vars.space.md}`,
  fontFamily: vars.font.heading,
  fontWeight: 700,
  flexShrink: 0,
});

globalStyle(`.${siderWrapper}.${COLLAPSED} .${siderLogo}`, {
  justifyContent: "center",
  padding: 0,
});

export const siderLogoMark = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 34,
  height: 34,
  flexShrink: 0,
  borderRadius: vars.radius.lg,
  fontSize: 16,
  fontWeight: 700,
  color: vars.color.ink,
  background: vars.color.accent,
});

export const siderLogoLockup = style({
  display: "flex",
  flexDirection: "column",
  lineHeight: 1.2,
  minWidth: 0,
});

export const siderLogoWord = style({
  fontSize: 15,
  letterSpacing: "0.02em",
  color: vars.color.onInk,
  whiteSpace: "nowrap",
});

export const siderLogoSub = style({
  fontFamily: vars.font.body,
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.06em",
  color: vars.color.onInkMuted,
  whiteSpace: "nowrap",
});

export const menuWrapper = style({
  position: "relative",
  borderInlineEnd: "none",
  background: "transparent",
  paddingInline: vars.space.sm,
  minHeight: 0,
  flex: 1,
  overflowY: "auto",
  overflowX: "hidden",
});

globalStyle(`.${menuWrapper} .ant-menu-item`, {
  position: "relative",
  borderRadius: vars.radius.pill,
  marginBlock: 3,
  fontSize: 13,
});

globalStyle(`.${menuWrapper} .ant-menu-item-group-title`, {
  padding: "18px 14px 6px",
  fontFamily: vars.font.body,
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: vars.color.onInkMuted,
});

globalStyle(
  `.${siderWrapper}.${COLLAPSED} .${menuWrapper} .ant-menu-item-group-title`,
  {
    height: 0,
    padding: 0,
    margin: "10px auto",
    width: 28,
    overflow: "hidden",
    borderTop: `1px solid ${vars.color.inkBorder}`,
  }
);

globalStyle(`.${menuWrapper} .ant-menu-item-selected`, {
  fontWeight: 600,
});

export const siderCallout = style({
  margin: `${vars.space.sm} ${vars.space.sm} 0`,
  padding: `${vars.space.md} 14px`,
  borderRadius: vars.radius.xl,
  background: vars.color.accent,
  color: vars.color.ink,
  flexShrink: 0,
});

globalStyle(`.${siderWrapper}.${COLLAPSED} .${siderCallout}`, {
  display: "none",
});

export const siderCalloutTitle = style({
  fontFamily: vars.font.heading,
  fontSize: 14,
  fontWeight: 700,
  lineHeight: 1.25,
});

export const siderCalloutBody = style({
  marginTop: 4,
  fontSize: 12,
  lineHeight: 1.45,
  color: vars.color.inkSoft,
});

export const siderCalloutAction = style({});

globalStyle(`.${siderCalloutAction}.ant-btn`, {
  marginTop: vars.space.sm,
  width: "100%",
  height: 32,
  padding: 0,
  border: "none",
  borderRadius: vars.radius.pill,
  background: vars.color.ink,
  color: vars.color.onInk,
  fontSize: 12,
  fontWeight: 600,
});

globalStyle(`.${siderCalloutAction}.ant-btn:not(:disabled):hover`, {
  background: vars.color.inkSoft,
  color: vars.color.onInk,
});

export const header = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.space.md,
  flexShrink: 0,
  height: 64,
  paddingInline: vars.space.md,
  background: vars.color.surface,
  border: `1px solid ${vars.color.borderSubtle}`,
  borderRadius: vars.radius.pill,
  marginBottom: vars.space.md,
  "@media": {
    "screen and (max-width: 991.98px)": {
      borderRadius: 0,
      border: "none",
      borderBottom: `1px solid ${vars.color.borderSubtle}`,
      marginBottom: 0,
    },
    "screen and (max-width: 480px)": { paddingInline: vars.space.sm },
  },
});

export const headerLeft = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.sm,
  minWidth: 0,
});

export const headerRight = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.sm,
  flexShrink: 0,
});

export const collapseButton = style({});

globalStyle(`.${collapseButton}.ant-btn`, {
  background: vars.color.surfaceSubtle,
  border: `1px solid ${vars.color.borderSubtle}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 36,
  height: 36,
  padding: 0,
  fontSize: 15,
  color: vars.color.text,
  borderRadius: vars.radius.pill,
  flexShrink: 0,
});

globalStyle(`.${collapseButton}.ant-btn:not(:disabled):hover`, {
  background: vars.color.accent,
  color: vars.color.ink,
});

export const headerUser = style({});

globalStyle(`.${headerUser}.ant-btn`, {
  display: "flex",
  alignItems: "center",
  gap: 10,
  height: "auto",
  padding: "5px 14px 5px 5px",
  border: `1px solid ${vars.color.borderSubtle}`,
  borderRadius: vars.radius.pill,
  background: vars.color.surfaceSubtle,
  fontFamily: vars.font.body,
  fontWeight: 400,
  textAlign: "left",
  minWidth: 0,
});

globalStyle(`.${headerUser}.ant-btn:not(:disabled):hover`, {
  background: vars.color.accentSoft,
  borderColor: vars.color.accent,
});

globalStyle(`.${headerUser} .ant-avatar`, {
  background: vars.color.ink,
  color: vars.color.onInk,
});

export const headerUserAvatar = style({
  position: "relative",
  display: "inline-flex",
  flexShrink: 0,
});

export const statusDot = style({
  position: "absolute",
  right: -1,
  bottom: -1,
  width: 11,
  height: 11,
  borderRadius: "50%",
  border: `2px solid ${vars.color.surface}`,
  background: vars.color.danger,
});

export const statusDotOnline = style({
  background: vars.color.positiveBright,
});

export const headerUserMeta = style({
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  lineHeight: 1.25,
  "@media": {
    "screen and (max-width: 575.98px)": { display: "none" },
  },
});

export const headerUserName = style({
  fontSize: 13,
  fontWeight: 600,
  color: vars.color.text,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const headerUserRole = style({
  fontSize: 11,
  color: vars.color.textMuted,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const headerUserCaret = style({
  fontSize: 10,
  color: vars.color.textMuted,
  flexShrink: 0,
  "@media": {
    "screen and (max-width: 575.98px)": { display: "none" },
  },
});

export const branchScope = style({});

globalStyle(`.${branchScope}.ant-btn`, {
  display: "flex",
  alignItems: "center",
  gap: vars.space.sm,
  height: 36,
  padding: "0 14px",
  border: `1px solid ${vars.color.borderSubtle}`,
  borderRadius: vars.radius.pill,
  background: vars.color.surfaceSubtle,
  color: vars.color.text,
  fontFamily: vars.font.body,
  fontSize: 13,
  fontWeight: 500,
  maxWidth: 220,
});

globalStyle(`.${branchScope}.ant-btn:not(:disabled):hover`, {
  background: vars.color.accentSoft,
  borderColor: vars.color.accent,
  color: vars.color.text,
});

export const branchScopeActive = style({});

globalStyle(`.${branchScope}.${branchScopeActive}.ant-btn`, {
  borderColor: vars.color.ink,
  background: vars.color.ink,
  color: vars.color.onInk,
});

globalStyle(`.${branchScope}.${branchScopeActive} .anticon`, {
  color: vars.color.accent,
});

export const branchScopeLabel = style({
  flex: 1,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  "@media": {
    "screen and (max-width: 767.98px)": { display: "none" },
  },
});

export const branchScopeCaret = style({
  fontSize: 10,
  opacity: 0.7,
  "@media": {
    "screen and (max-width: 767.98px)": { display: "none" },
  },
});

/** The only scroll container in the shell — the chrome around it stays fixed to the viewport. */
export const content = style({
  flex: 1,
  minWidth: 0,
  minHeight: 0,
  padding: 0,
  overflowY: "auto",
  overflowX: "hidden",
  scrollbarWidth: "thin",
  scrollbarGutter: "stable",
  scrollbarColor: `${vars.color.border} transparent`,
  "@media": {
    "screen and (min-width: 992px)": {
      padding: vars.space.lg,
      background: vars.color.surfaceSubtle,
      border: `1px solid ${vars.color.borderSubtle}`,
      borderRadius: vars.radius.shell,
      boxShadow: vars.shadow.card,
    },
    "screen and (max-width: 991.98px)": { padding: vars.space.md },
    "screen and (max-width: 480px)": { padding: vars.space.sm },
  },
});

globalStyle(`.${content}::-webkit-scrollbar`, {
  width: 12,
  height: 12,
});

globalStyle(`.${content}::-webkit-scrollbar-track`, {
  background: "transparent",
});

globalStyle(`.${content}::-webkit-scrollbar-thumb`, {
  background: vars.color.border,
  borderRadius: vars.radius.pill,
  border: "4px solid transparent",
  backgroundClip: "content-box",
});

globalStyle(`.${content}::-webkit-scrollbar-thumb:hover`, {
  background: vars.color.textMuted,
  backgroundClip: "content-box",
});

export const footer = style({
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: vars.space.sm,
  padding: `${vars.space.md} ${vars.space.lg}`,
  background: "transparent",
  color: vars.color.textMuted,
  fontSize: 12,
});

export const footerNote = style({
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
});

globalStyle(
  [
    `.${collapseButton}.ant-btn:focus-visible`,
    `.${headerUser}.ant-btn:focus-visible`,
    `.${branchScope}.ant-btn:focus-visible`,
    `.${siderCalloutAction}.ant-btn:focus-visible`,
  ].join(", "),
  {
    outline: `3px solid ${vars.color.accentAlt}`,
    outlineOffset: 2,
  }
);
