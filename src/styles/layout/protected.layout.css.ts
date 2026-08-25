import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "../common/vars.css";
import { farmSceneSize, farmSceneUrl } from "../scene/farm.scene";

const COLLAPSED = "ant-layout-sider-collapsed";

export const protectedLayout = style({
  minHeight: "100vh",
});

export const siderWrapper = style({
  "@media": {
    "screen and (min-width: 992px)": {
      position: "sticky",
      top: 0,
      height: "100dvh",
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
      background: `
        radial-gradient(130% 70% at 110% -5%, rgba(140, 110, 99, 0.42), transparent 55%),
        radial-gradient(110% 60% at -25% 105%, rgba(211, 163, 118, 0.16), transparent 60%),
        ${vars.color.brandDark}`,
    },
  },
});

globalStyle(`.${siderWrapper}:not(.${COLLAPSED})`, {
  "@media": {
    "screen and (max-width: 991.98px)": {
      boxShadow: vars.shadow.raised,
    },
  },
});

globalStyle(`.${siderWrapper} .ant-layout-sider-children`, {
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  height: "100%",
  "@media": {
    "screen and (max-width: 991.98px)": { overflowY: "auto" },
  },
});

export const siderScrim = style({
  position: "fixed",
  inset: 0,
  zIndex: 99,
  background: "rgba(62, 37, 34, 0.4)",
});

export const siderArt = style({
  flex: 1,
  minHeight: 0,
  backgroundImage: farmSceneUrl,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "bottom center",
  backgroundSize: `${farmSceneSize.width}px auto`,
  opacity: 0.45,
  pointerEvents: "none",
  maskImage: "linear-gradient(to bottom, transparent 0%, #000 55%)",
  WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 55%)",
  transition: "opacity 0.2s ease",
});

globalStyle(`.${siderWrapper}.${COLLAPSED} .${siderArt}`, {
  opacity: 0,
});

export const siderLogo = style({
  height: 64,
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: `0 ${vars.space.md}`,
  fontFamily: vars.font.heading,
  fontWeight: 700,
  position: "relative",
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
  borderRadius: 12,
  fontSize: 18,
  color: vars.color.brandDark,
  background: `linear-gradient(135deg, ${vars.color.accent}, ${vars.color.brandLight})`,
  boxShadow:
    "0 4px 12px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.45)",
});

export const siderLogoLockup = style({
  display: "flex",
  flexDirection: "column",
  lineHeight: 1.2,
  minWidth: 0,
});

export const siderLogoWord = style({
  fontSize: 15,
  letterSpacing: "0.1em",
  color: vars.color.bg,
  whiteSpace: "nowrap",
});

export const siderLogoSub = style({
  fontFamily: vars.font.body,
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.06em",
  color: "rgba(255, 224, 178, 0.65)",
  whiteSpace: "nowrap",
});

export const branchField = style({
  position: "relative",
  margin: `${vars.space.xs} ${vars.space.sm} 10px`,
});

export const branchFieldLabel = style({
  position: "absolute",
  top: -7,
  insetInlineStart: 12,
  zIndex: 1,
  padding: "0 6px",
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  lineHeight: "14px",
  color: "rgba(255, 224, 178, 0.75)",
  background: vars.color.brandDark,
  borderRadius: vars.radius.sm,
});

export const branchScope = style({});

globalStyle(`.${branchScope}.ant-btn`, {
  position: "relative",
  display: "flex",
  alignItems: "center",
  gap: vars.space.sm,
  width: "100%",
  height: "auto",
  padding: "9px 12px",
  border: "1px solid rgba(255, 224, 178, 0.28)",
  borderRadius: vars.radius.md,
  background: "rgba(255, 255, 255, 0.06)",
  color: vars.color.accent,
  fontFamily: vars.font.body,
  fontSize: 13,
  fontWeight: 400,
  textAlign: "left",
  cursor: "pointer",
  transition: "background 0.2s ease, border-color 0.2s ease",
});

globalStyle(`.${branchScope}.ant-btn:not(:disabled):hover`, {
  background: "rgba(255, 255, 255, 0.14)",
  borderColor: "rgba(255, 224, 178, 0.55)",
  color: vars.color.accent,
});

export const branchScopeActive = style({});

globalStyle(`.${branchScope}.${branchScopeActive}.ant-btn`, {
  borderColor: vars.color.accent,
  background: "rgba(255, 224, 178, 0.14)",
});

globalStyle(`.${branchScope} .anticon`, {
  color: vars.color.accent,
});

export const branchScopeLabel = style({
  flex: 1,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const branchScopeCaret = style({
  fontSize: 10,
  opacity: 0.7,
});

globalStyle(`.${siderWrapper}.${COLLAPSED} .${branchScope}.ant-btn`, {
  justifyContent: "center",
  padding: "7px 0",
});

globalStyle(
  [
    `.${siderWrapper}.${COLLAPSED} .${branchFieldLabel}`,
    `.${siderWrapper}.${COLLAPSED} .${branchScopeLabel}`,
    `.${siderWrapper}.${COLLAPSED} .${branchScopeCaret}`,
  ].join(", "),
  { display: "none" }
);

export const menuWrapper = style({
  position: "relative",
  borderInlineEnd: "none",
  background: "transparent",
  paddingInline: vars.space.sm,
  minHeight: 0,
  overflowY: "auto",
  overflowX: "hidden",
});

globalStyle(`.${menuWrapper} .ant-menu-item`, {
  position: "relative",
  borderRadius: vars.radius.md,
  marginBlock: 3,
});

globalStyle(`.${menuWrapper} .ant-menu-item-group-title`, {
  padding: "18px 12px 6px",
  fontFamily: vars.font.body,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "rgba(211, 163, 118, 0.8)",
});

globalStyle(
  `.${siderWrapper}.${COLLAPSED} .${menuWrapper} .ant-menu-item-group-title`,
  {
    height: 0,
    padding: 0,
    margin: "10px auto",
    width: 28,
    overflow: "hidden",
    borderTop: "1px solid rgba(255, 224, 178, 0.22)",
  }
);

globalStyle(`.${menuWrapper} .ant-menu-item-selected`, {
  fontWeight: 600,
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.28)",
});

export const header = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  position: "sticky",
  top: 0,
  zIndex: 50,
  background: "rgba(255, 242, 223, 0.85)",
  backdropFilter: "saturate(150%) blur(12px)",
  WebkitBackdropFilter: "saturate(150%) blur(12px)",
  paddingInline: vars.space.lg,
  height: 64,
  borderBottom: `1px solid ${vars.color.borderSubtle}`,
  "@media": {
    "screen and (max-width: 480px)": { paddingInline: vars.space.sm },
  },
});

export const headerRight = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.md,
});

export const collapseButton = style({});

globalStyle(`.${collapseButton}.ant-btn`, {
  background: vars.color.surface,
  border: `1px solid ${vars.color.borderSubtle}`,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 36,
  height: 36,
  padding: 0,
  fontSize: 16,
  color: vars.color.text,
  borderRadius: vars.radius.pill,
});

globalStyle(`.${collapseButton}.ant-btn:not(:disabled):hover`, {
  background: vars.color.accent,
  color: vars.color.text,
});

export const siderUser = style({});

globalStyle(`.${siderUser}.ant-btn`, {
  position: "relative",
  display: "flex",
  alignItems: "center",
  gap: 10,
  width: `calc(100% - ${vars.space.md})`,
  height: "auto",
  margin: `10px ${vars.space.sm} 14px`,
  padding: "7px 12px 7px 7px",
  border: "1px solid rgba(255, 224, 178, 0.22)",
  borderRadius: vars.radius.pill,
  background: "rgba(255, 255, 255, 0.07)",
  fontFamily: vars.font.body,
  fontWeight: 400,
  textAlign: "left",
  cursor: "pointer",
  transition: "background 0.2s ease, border-color 0.2s ease",
});

globalStyle(`.${siderUser}.ant-btn:not(:disabled):hover`, {
  background: "rgba(255, 255, 255, 0.13)",
  borderColor: "rgba(255, 224, 178, 0.5)",
});

globalStyle(`.${siderUser} .ant-avatar`, {
  background: "rgba(255, 224, 178, 0.16)",
  color: vars.color.accent,
});

export const siderUserAvatar = style({
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
  border: `2px solid ${vars.color.brandDark}`,
  background: vars.color.danger,
});

export const statusDotOnline = style({
  background: vars.color.positiveBright,
});

export const siderUserMeta = style({
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  lineHeight: 1.25,
});

export const siderUserName = style({
  fontSize: 13,
  fontWeight: 600,
  color: vars.color.bg,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const siderUserRole = style({
  fontSize: 11,
  color: "rgba(255, 224, 178, 0.65)",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const siderUserCaret = style({
  fontSize: 10,
  color: "rgba(255, 224, 178, 0.55)",
  flexShrink: 0,
});

globalStyle(`.${siderWrapper}.${COLLAPSED} .${siderUser}.ant-btn`, {
  justifyContent: "center",
  padding: "7px 0",
});

globalStyle(
  [
    `.${siderWrapper}.${COLLAPSED} .${siderUserMeta}`,
    `.${siderWrapper}.${COLLAPSED} .${siderUserCaret}`,
  ].join(", "),
  { display: "none" }
);

export const content = style({
  padding: vars.space.xl,
  "@media": {
    "screen and (max-width: 768px)": { padding: vars.space.md },
  },
});

globalStyle(
  [
    `.${collapseButton}.ant-btn:focus-visible`,
    `.${siderUser}.ant-btn:focus-visible`,
    `.${branchScope}.ant-btn:focus-visible`,
  ].join(", "),
  {
    outline: "3px solid rgba(211, 163, 118, 0.7)",
    outlineOffset: 2,
  }
);
