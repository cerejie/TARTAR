import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "../common/vars.css";

export const protectedLayout = style({
  height: "100dvh",
  overflow: "hidden",
  background: vars.color.surface,
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

export const siderScope = style({
  flexShrink: 0,
  padding: `0 ${vars.space.lg}`,
  marginBottom: vars.space.sm,
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

globalStyle(`.${menuWrapper}.${menuWrapper} .ant-menu-item-selected`, {
  fontWeight: 600,
  color: vars.color.onInk,
  background: vars.color.inkOverlay,
});

globalStyle(`.${menuWrapper}.${menuWrapper} .ant-menu-item-selected::before`, {
  content: "",
  position: "absolute",
  insetBlock: vars.space.xs,
  insetInlineStart: 0,
  width: 3,
  borderRadius: vars.radius.pill,
  background: vars.color.accent,
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
  height: 88,
  paddingInline: vars.space.xxl,
  background: "transparent",
  borderBottom: `1px solid ${vars.color.borderSubtle}`,
  "@media": {
    "screen and (max-width: 991.98px)": {
      height: 72,
      paddingInline: vars.space.md,
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
  fontSize: 26,
  fontWeight: 700,
  lineHeight: 1.2,
  letterSpacing: "-0.02em",
  color: vars.color.text,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  "@media": {
    "screen and (max-width: 575.98px)": { fontSize: 20 },
  },
});

export const branchScope = style({});

globalStyle(`.${branchScope}.ant-btn`, {
  display: "flex",
  alignItems: "center",
  gap: vars.space.sm,
  width: "100%",
  height: 44,
  padding: `0 ${vars.space.md}`,
  border: `1px solid ${vars.color.inkBorder}`,
  borderRadius: vars.radius.lg,
  background: vars.color.inkOverlay,
  color: vars.color.onInk,
  fontFamily: vars.font.body,
  fontSize: 13,
  fontWeight: 500,
});

globalStyle(`.${branchScope}.ant-btn:not(:disabled):hover`, {
  background: vars.color.inkOverlayStrong,
  borderColor: vars.color.inkOverlayStrong,
  color: vars.color.onInk,
});

export const branchScopeActive = style({});

globalStyle(`.${branchScope}.${branchScopeActive}.ant-btn`, {
  borderColor: vars.color.accent,
  background: vars.color.inkOverlayStrong,
  color: vars.color.onInk,
});

globalStyle(`.${branchScope}.${branchScopeActive} .anticon`, {
  color: vars.color.accent,
});

export const branchScopeLabel = style({
  flex: 1,
  textAlign: "left",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const branchScopeCaret = style({
  fontSize: 10,
  opacity: 0.7,
  flexShrink: 0,
});

export const content = style({
  flex: 1,
  minWidth: 0,
  minHeight: 0,
  background: "transparent",
  padding: `${vars.space.lg} ${vars.space.xxl}`,
  overflowY: "auto",
  overflowX: "hidden",
  scrollbarWidth: "thin",
  scrollbarGutter: "stable",
  scrollbarColor: `${vars.color.border} transparent`,
  "@media": {
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
  marginInline: vars.space.xxl,
  padding: `${vars.space.md} 0`,
  background: "transparent",
  borderTop: `1px solid ${vars.color.borderSubtle}`,
  color: vars.color.textMuted,
  fontSize: 12,
  "@media": {
    "screen and (max-width: 991.98px)": { marginInline: vars.space.md },
    "screen and (max-width: 480px)": { marginInline: vars.space.sm },
  },
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

globalStyle(`.${menuWrapper}.${menuWrapper} .ant-menu-item .anticon`, {
  fontSize: 16,
  color: vars.color.onInkMuted,
});

globalStyle(
  `.${menuWrapper}.${menuWrapper} .ant-menu-item-selected .anticon`,
  { color: vars.color.onInk }
);

globalStyle(`.${branchScope}.ant-dropdown-open.ant-btn`, {
  borderColor: vars.color.accent,
  background: vars.color.inkOverlayStrong,
  color: vars.color.onInk,
});

export const branchScopePopup = style({});

export const branchScopePanel = style({
  display: "flex",
  flexDirection: "column",
  minWidth: 232,
  padding: vars.space.sm,
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.inkBorder}`,
  background: vars.color.inkSoft,
  boxShadow: vars.shadow.pop,
});

globalStyle(`.${branchScopePopup} .ant-dropdown-menu`, {
  padding: 0,
  maxHeight: 240,
  overflowY: "auto",
  background: "transparent",
  boxShadow: "none",
  scrollbarWidth: "thin",
  scrollbarColor: `${vars.color.inkBorder} transparent`,
});

globalStyle(
  `.${branchScopePopup}.${branchScopePopup} .ant-dropdown-menu-item`,
  {
    borderRadius: vars.radius.md,
    color: vars.color.onInk,
    fontSize: 13,
  }
);

globalStyle(
  `.${branchScopePopup}.${branchScopePopup} .ant-dropdown-menu-title-content`,
  { color: vars.color.onInk }
);

globalStyle(
  `.${branchScopePopup}.${branchScopePopup} .ant-dropdown-menu-item:hover`,
  { background: vars.color.inkOverlay, color: vars.color.onInk }
);

globalStyle(
  `.${branchScopePopup}.${branchScopePopup} .ant-dropdown-menu-item-selected`,
  {
    background: vars.color.inkOverlay,
    color: vars.color.onInk,
    fontWeight: 600,
  }
);

globalStyle(`.${branchScopePopup} .ant-dropdown-menu-item-divider`, {
  background: vars.color.inkBorder,
  marginBlock: vars.space.xs,
});

export const branchScopeSearch = style({});

globalStyle(`.${branchScopeSearch}.ant-input-affix-wrapper`, {
  marginBottom: vars.space.sm,
  border: "none",
  borderBottom: `1px solid ${vars.color.inkBorder}`,
  borderRadius: 0,
  background: "transparent",
  color: vars.color.onInk,
  boxShadow: "none",
});

globalStyle(`.${branchScopeSearch}.ant-input-affix-wrapper .ant-input`, {
  background: "transparent",
  color: vars.color.onInk,
  fontSize: 13,
});

globalStyle(
  `.${branchScopeSearch}.ant-input-affix-wrapper .ant-input::placeholder`,
  { color: vars.color.onInkMuted }
);

globalStyle(`.${branchScopeSearch}.ant-input-affix-wrapper .anticon`, {
  color: vars.color.onInkMuted,
});

export const branchScopeOption = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.space.sm,
});

export const branchScopeCheck = style({
  fontSize: 12,
  color: vars.color.accent,
});

export const branchScopeManage = style({});

globalStyle(`.${branchScopeManage}.${branchScopeManage}.ant-btn`, {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: vars.space.xs,
  width: "100%",
  height: 36,
  marginTop: vars.space.sm,
  paddingInline: vars.space.sm,
  borderTop: `1px solid ${vars.color.inkBorder}`,
  borderRadius: 0,
  background: "transparent",
  color: vars.color.accent,
  fontSize: 13,
  fontWeight: 600,
});

globalStyle(
  `.${branchScopeManage}.${branchScopeManage}.ant-btn:not(:disabled):hover`,
  { background: vars.color.inkOverlay, color: vars.color.accent }
);

export const siderUserMenu = style({});

globalStyle(`.${siderUserMenu} .ant-dropdown-menu`, {
  minWidth: 200,
  border: `1px solid ${vars.color.inkBorder}`,
  background: vars.color.inkSoft,
});

globalStyle(
  `.${siderUserMenu}.${siderUserMenu} .ant-dropdown-menu-item`,
  { color: vars.color.accentSoft, fontSize: 13 }
);

globalStyle(
  `.${siderUserMenu}.${siderUserMenu} .ant-dropdown-menu-title-content`,
  { color: "inherit" }
);

globalStyle(
  `.${siderUserMenu}.${siderUserMenu} .ant-dropdown-menu-item-danger`,
  { color: vars.color.danger }
);

globalStyle(
  `.${siderUserMenu}.${siderUserMenu} .ant-dropdown-menu-item:hover`,
  { background: vars.color.inkOverlay }
);

export const siderUserBadge = style({
  flexShrink: 0,
  lineHeight: 0,
});

export const siderUserOnline = style({});

globalStyle(`.${siderUserBadge} .${siderUserOnline}`, {
  insetBlockStart: "auto",
  insetBlockEnd: 1,
  insetInlineEnd: 1,
  transform: "none",
  width: 9,
  height: 9,
  background: vars.color.positiveBright,
  boxShadow: `0 0 0 2px ${vars.color.brandDark}`,
});
