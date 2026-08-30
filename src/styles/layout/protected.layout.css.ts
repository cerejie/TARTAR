import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "../common/vars.css";

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
  height: "100%",
  overflow: "hidden",
  flexShrink: 0,
  "@media": {
    "screen and (min-width: 992px)": {
      borderRadius: vars.radius.shell,
    },
  },
  selectors: {
    "&.ant-layout-sider": {
      background: vars.color.brandDark,
    },
  },
});

globalStyle(`.${siderWrapper} .ant-layout-sider-children`, {
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  height: "100%",
  paddingBottom: vars.space.md,
});

export const siderLogo = style({
  height: 84,
  display: "flex",
  alignItems: "center",
  gap: vars.space.md,
  padding: `0 ${vars.space.lg}`,
  fontFamily: vars.font.heading,
  fontWeight: 700,
  flexShrink: 0,
});

export const siderLogoMark = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 36,
  height: 36,
  flexShrink: 0,
  borderRadius: vars.radius.lg,
  fontSize: 17,
  fontWeight: 700,
  color: vars.color.ink,
  background: vars.color.accent,
});

export const siderLogoLockup = style({
  display: "flex",
  flexDirection: "column",
  gap: 2,
  lineHeight: 1.2,
  minWidth: 0,
});

export const siderLogoWord = style({
  fontSize: 15,
  letterSpacing: "0.01em",
  color: vars.color.onInk,
  whiteSpace: "nowrap",
});

export const siderLogoSub = style({
  fontFamily: vars.font.body,
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: "0.01em",
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
  overscrollBehavior: "contain",
  scrollbarWidth: "thin",
  scrollbarColor: `${vars.color.inkBorder} transparent`,
});

globalStyle(`.${menuWrapper}::-webkit-scrollbar`, {
  width: 6,
});

globalStyle(`.${menuWrapper}::-webkit-scrollbar-track`, {
  background: "transparent",
});

globalStyle(`.${menuWrapper}::-webkit-scrollbar-thumb`, {
  background: vars.color.inkBorder,
  borderRadius: vars.radius.pill,
});

globalStyle(`.${menuWrapper}.${menuWrapper} .ant-menu-item`, {
  position: "relative",
  height: 42,
  lineHeight: "42px",
  marginBlock: 1,
  marginInline: 0,
  paddingInlineEnd: vars.space.md,
  borderRadius: vars.radius.md,
  fontSize: 14,
});

globalStyle(`.${menuWrapper}.${menuWrapper} .ant-menu-item-group-title`, {
  position: "relative",
  marginTop: vars.space.sm,
  padding: `${vars.space.lg} ${vars.space.md} ${vars.space.sm}`,
  fontFamily: vars.font.body,
  fontSize: 12,
  fontWeight: 700,
  lineHeight: 1.4,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: vars.color.onInkMuted,
});

globalStyle(
  `.${menuWrapper}.${menuWrapper} .ant-menu-item-group-title::before`,
  {
    content: "",
    position: "absolute",
    top: 0,
    insetInline: vars.space.sm,
    height: 1,
    background: vars.color.inkBorder,
  }
);

globalStyle(`.${menuWrapper}.${menuWrapper} .ant-menu-item-selected`, {
  fontWeight: 600,
  color: vars.color.ink,
  background: `linear-gradient(90deg, ${vars.color.accentStrong}, ${vars.color.accent})`,
});

globalStyle(`.${menuWrapper}.${menuWrapper} .ant-menu-item-selected::before`, {
  content: "",
  position: "absolute",
  insetBlock: 0,
  insetInlineStart: 0,
  width: 4,
  borderStartStartRadius: vars.radius.lg,
  borderEndStartRadius: vars.radius.lg,
  background: vars.color.accentStrong,
});

export const siderFooter = style({
  flexShrink: 0,
  marginInline: vars.space.lg,
  marginTop: vars.space.sm,
  paddingTop: vars.space.md,
  borderTop: `1px solid ${vars.color.inkBorder}`,
});

export const siderUser = style({});

globalStyle(`.${siderUser}.${siderUser}.ant-btn`, {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: vars.space.md,
  width: "100%",
  height: "auto",
  padding: `${vars.space.sm} ${vars.space.xs}`,
  border: "none",
  boxShadow: "none",
  borderRadius: vars.radius.lg,
  background: "transparent",
  color: vars.color.onInk,
  fontFamily: vars.font.body,
  fontWeight: 400,
  textAlign: "left",
  minWidth: 0,
});

globalStyle(`.${siderUser}.${siderUser}.ant-btn:not(:disabled):hover`, {
  background: vars.color.inkOverlay,
  color: vars.color.onInk,
});

export const siderUserAvatar = style({
  flexShrink: 0,
});

globalStyle(`.${siderUserAvatar}.${siderUserAvatar}.ant-avatar`, {
  background: vars.color.accent,
  color: vars.color.ink,
  fontFamily: vars.font.heading,
  fontSize: 14,
  fontWeight: 700,
});

export const siderUserMeta = style({
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  gap: 2,
  lineHeight: 1.2,
});

export const siderUserName = style({
  fontSize: 14,
  fontWeight: 600,
  color: vars.color.onInk,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const siderUserRole = style({
  fontSize: 11,
  fontWeight: 400,
  color: vars.color.onInkMuted,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const siderUserCaret = style({
  fontSize: 12,
  color: vars.color.onInkMuted,
  flexShrink: 0,
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

export const headerTitle = style({
  fontFamily: vars.font.heading,
  fontSize: 18,
  fontWeight: 700,
  letterSpacing: "-0.01em",
  color: vars.color.text,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
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
    `.${siderUser}.ant-btn:focus-visible`,
    `.${branchScope}.ant-btn:focus-visible`,
  ].join(", "),
  {
    outline: `3px solid ${vars.color.accentAlt}`,
    outlineOffset: 2,
  }
);
