import { globalStyle, keyframes, style } from "@vanilla-extract/css";
import { vars } from "../common/vars.css";
import { farmSceneUrl } from "../scene/farm.scene";

const tint = {
  lime: (alpha: number) => `rgba(214, 242, 91, ${alpha})`,
  lilac: (alpha: number) => `rgba(185, 165, 245, ${alpha})`,
  ink: (alpha: number) => `rgba(22, 22, 26, ${alpha})`,
} as const;

const cardIn = keyframes({
  from: { opacity: 0, transform: "translateY(18px) scale(0.98)" },
  to: { opacity: 1, transform: "translateY(0) scale(1)" },
});

const heroIn = keyframes({
  from: { opacity: 0, transform: "translateY(14px)" },
  to: { opacity: 1, transform: "translateY(0)" },
});

const blobDrift = keyframes({
  from: { transform: "translate3d(0, 0, 0) scale(1)" },
  to: { transform: "translate3d(26px, -20px, 0) scale(1.07)" },
});

const reducedMotion = {
  "@media": {
    "(prefers-reduced-motion: reduce)": { animation: "none" },
  },
} as const;

export const authPage = style({
  flex: 1,
  display: "flex",
  minHeight: "100vh",
  background: `
    radial-gradient(1100px 700px at 88% -10%, ${tint.lime(0.32)}, transparent 60%),
    radial-gradient(900px 650px at -12% 108%, ${tint.lilac(0.3)}, transparent 60%),
    ${vars.color.bg}`,
});

export const authHero = style({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  width: "clamp(360px, 42vw, 560px)",
  padding: 48,
  overflow: "hidden",
  color: vars.color.onInk,
  background: `
    radial-gradient(120% 90% at 110% -10%, ${tint.lime(0.14)}, transparent 55%),
    radial-gradient(110% 90% at -25% 110%, ${tint.lilac(0.18)}, transparent 60%),
    ${vars.color.brandDark}`,
});

globalStyle(`.${authHero}.ant-flex`, {
  "@media": {
    "screen and (max-width: 960px)": { display: "none" },
  },
});

export const authHeroBrand = style({
  display: "flex",
  alignItems: "center",
  gap: 12,
  fontFamily: vars.font.heading,
  fontWeight: 700,
  fontSize: 19,
  letterSpacing: "0.18em",
  color: vars.color.onInk,
});

export const authHeroBody = style([
  {
    position: "relative",
    zIndex: 1,
    margin: "auto 0",
    paddingBottom: 96,
    animation: `${heroIn} 0.7s 0.1s cubic-bezier(0.21, 0.61, 0.35, 1) both`,
  },
  reducedMotion,
]);

export const authHeroTitle = style({});

globalStyle(`.${authHero} h1.${authHeroTitle}.ant-typography`, {
  margin: "0 0 12px",
  fontFamily: vars.font.heading,
  fontSize: "clamp(28px, 2.6vw, 36px)",
  lineHeight: 1.15,
  letterSpacing: "-0.02em",
  color: vars.color.onInk,
});

export const authHeroCopy = style({});

globalStyle(`.${authHero} .${authHeroCopy}.ant-typography`, {
  margin: 0,
  maxWidth: "42ch",
  fontSize: 15,
  lineHeight: 1.6,
  color: vars.color.onInkMuted,
});

export const authHeroList = style({
  listStyle: "none",
  margin: `${vars.space.xl} 0 0`,
  padding: 0,
  gap: 14,
});

export const authHeroItem = style({
  display: "flex",
  alignItems: "center",
  gap: 12,
  fontSize: 14,
  color: vars.color.onInk,
});

export const authHeroIcon = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 34,
  height: 34,
  flexShrink: 0,
  borderRadius: vars.radius.lg,
  fontSize: 15,
  color: vars.color.accent,
  background: vars.color.inkOverlay,
  border: `1px solid ${vars.color.inkBorder}`,
});

export const authHeroArt = style({
  position: "absolute",
  insetInline: 0,
  bottom: 0,
  height: "46%",
  backgroundImage: farmSceneUrl,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "bottom center",
  backgroundSize: "520px auto",
  opacity: 0.3,
  pointerEvents: "none",
  maskImage: "linear-gradient(to bottom, transparent 0%, #000 60%)",
  WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 60%)",
});

export const authMain = style({
  position: "relative",
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: `${vars.space.xl} ${vars.space.lg}`,
  overflow: "hidden",
  "@media": {
    "screen and (max-width: 480px)": {
      padding: `${vars.space.lg} ${vars.space.md}`,
    },
  },
});

export const authBlob = style([
  {
    position: "absolute",
    borderRadius: "50%",
    filter: "blur(80px)",
    pointerEvents: "none",
    animation: `${blobDrift} 14s ease-in-out infinite alternate`,
  },
  reducedMotion,
]);

export const authBlobA = style({
  width: 420,
  height: 420,
  top: -120,
  right: -90,
  background: tint.lime(0.5),
});

export const authBlobB = style({
  width: 360,
  height: 360,
  bottom: -140,
  left: -110,
  background: tint.lilac(0.42),
  animationDelay: "-7s",
});

export const authBlobC = style({
  width: 260,
  height: 260,
  top: "55%",
  right: "6%",
  background: tint.ink(0.1),
  animationDuration: "18s",
});

export const authCard = style({});

globalStyle(`.${authCard}.ant-card`, {
  position: "relative",
  zIndex: 1,
  width: "100%",
  maxWidth: 440,
  background: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.xxl,
  boxShadow: `
    0 1px 2px ${tint.ink(0.04)},
    0 12px 32px ${tint.ink(0.08)},
    0 32px 80px ${tint.ink(0.1)}`,
  animation: `${cardIn} 0.55s cubic-bezier(0.21, 0.61, 0.35, 1) both`,
  "@media": {
    "screen and (max-width: 480px)": { borderRadius: vars.radius.xl },
    "(prefers-reduced-motion: reduce)": { animation: "none" },
  },
});

globalStyle(`.${authCard}.ant-card .ant-card-body`, {
  padding: "44px 40px",
  "@media": {
    "screen and (max-width: 480px)": { padding: "32px 24px" },
  },
});

export const authCardBrand = style({
  alignItems: "center",
  gap: 10,
  marginBottom: vars.space.lg,
});

globalStyle(`.${authCardBrand}.ant-flex`, {
  display: "none",
  "@media": {
    "screen and (max-width: 960px)": { display: "flex" },
  },
});

export const authWordmark = style({
  fontFamily: vars.font.heading,
  fontWeight: 700,
  fontSize: 17,
  letterSpacing: "0.18em",
  color: vars.color.brandDark,
});

export const authMark = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 42,
  height: 42,
  flexShrink: 0,
  borderRadius: vars.radius.lg,
  fontFamily: vars.font.heading,
  fontWeight: 700,
  fontSize: 22,
  color: vars.color.ink,
  background: vars.color.accent,
});

export const authTitle = style({});

globalStyle(`.${authCard} h2.${authTitle}.ant-typography`, {
  margin: "0 0 6px",
  fontFamily: vars.font.heading,
  fontSize: 26,
  letterSpacing: "-0.02em",
  color: vars.color.brandDark,
});

export const authSubtitle = style({
  display: "block",
  fontSize: 14,
  color: vars.color.textMuted,
});

export const authForm = style({
  marginTop: 28,
});

globalStyle(`.${authForm} .ant-form-item`, {
  marginBottom: 18,
});

globalStyle(`.${authForm} .ant-form-item-label > label`, {
  fontSize: 13,
  fontWeight: 600,
  color: vars.color.text,
});

globalStyle(`.${authForm} .ant-input-affix-wrapper`, {
  padding: "12px 16px",
  borderRadius: vars.radius.lg,
  background: vars.color.surfaceSubtle,
  borderColor: vars.color.border,
  transition:
    "border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease",
});

globalStyle(`.${authForm} .ant-input-affix-wrapper:hover`, {
  borderColor: vars.color.ink,
  background: vars.color.surface,
});

globalStyle(`.${authForm} .ant-input-affix-wrapper:focus-within`, {
  borderColor: vars.color.ink,
  background: vars.color.surface,
  boxShadow: `0 0 0 4px ${tint.lilac(0.4)}`,
});

globalStyle(`.${authForm} .ant-input-affix-wrapper .ant-input`, {
  background: "transparent",
  fontSize: 15,
});

globalStyle(`.${authForm} .ant-input::placeholder`, {
  color: vars.color.textMuted,
});

globalStyle(`.${authForm} .ant-input-prefix`, {
  marginInlineEnd: 10,
  fontSize: 16,
  color: vars.color.textMuted,
  transition: "color 0.2s ease",
});

globalStyle(
  `.${authForm} .ant-input-affix-wrapper:focus-within .ant-input-prefix`,
  { color: vars.color.ink }
);

globalStyle(`.${authForm} .ant-input-suffix .anticon`, {
  color: vars.color.textMuted,
  transition: "color 0.2s ease",
});

globalStyle(`.${authForm} .ant-input-suffix .anticon:hover`, {
  color: vars.color.ink,
});

export const authMeta = style({
  display: "flex",
  justifyContent: "flex-end",
  margin: "-6px 0 20px",
});

export const authHint = style({});

globalStyle(`.${authHint}.ant-btn-link`, {
  padding: 0,
  height: "auto",
  fontSize: 13,
  fontWeight: 500,
  color: vars.color.textMuted,
});

globalStyle(`.${authHint}.ant-btn-link:not(:disabled):hover`, {
  color: vars.color.brandDark,
  background: "transparent",
  textDecoration: "underline",
  textUnderlineOffset: 3,
});

export const authPopover = style({
  maxWidth: 260,
  fontSize: 13,
  lineHeight: 1.55,
  color: vars.color.text,
});

export const authSubmit = style({});

const submitGradient = `linear-gradient(135deg, ${vars.color.brand} 0%, ${vars.color.brandDark} 100%)`;

globalStyle(`.${authForm} .${authSubmit}.ant-btn-primary`, {
  height: 50,
  borderRadius: vars.radius.lg,
  fontSize: 15,
  fontWeight: 600,
  border: "none",
  background: submitGradient,
  backgroundSize: "160% 160%",
  backgroundPosition: "0% 0%",
  boxShadow: `0 12px 28px ${tint.ink(0.24)}`,
  transition:
    "transform 0.18s ease, box-shadow 0.25s ease, background-position 0.35s ease",
});

globalStyle(
  `.${authForm} .${authSubmit}.ant-btn-primary:not(:disabled):not(.ant-btn-disabled):hover`,
  {
    background: submitGradient,
    backgroundSize: "160% 160%",
    backgroundPosition: "100% 100%",
    transform: "translateY(-2px)",
    boxShadow: `0 16px 34px ${tint.ink(0.3)}`,
  }
);

globalStyle(
  `.${authForm} .${authSubmit}.ant-btn-primary:not(:disabled):not(.ant-btn-disabled):active`,
  {
    background: submitGradient,
    backgroundSize: "160% 160%",
    backgroundPosition: "100% 100%",
    transform: "translateY(0) scale(0.985)",
    boxShadow: `0 8px 18px ${tint.ink(0.2)}`,
  }
);

globalStyle(`.${authForm} .${authSubmit}.ant-btn-primary:focus-visible`, {
  outline: `3px solid ${vars.color.accentAlt}`,
  outlineOffset: 2,
});

export const authAlt = style({
  display: "block",
  textAlign: "center",
  marginTop: 26,
  paddingTop: 20,
  borderTop: `1px solid ${vars.color.borderSubtle}`,
  fontSize: 14,
  color: vars.color.textMuted,
});

globalStyle(`.${authAlt} a`, {
  fontWeight: 600,
  color: vars.color.brandDark,
  textDecoration: "none",
  borderBottom: `1px solid ${vars.color.border}`,
  paddingBottom: 1,
  transition: "border-color 0.2s ease, color 0.2s ease",
});

globalStyle(`.${authAlt} a:hover`, {
  color: vars.color.brand,
  borderBottomColor: vars.color.ink,
});

globalStyle(
  [
    `.${authAlt} a:focus-visible`,
    `.${authHint}.ant-btn-link:focus-visible`,
  ].join(", "),
  {
    outline: `3px solid ${vars.color.accentAlt}`,
    outlineOffset: 2,
    borderRadius: vars.radius.sm,
  }
);

export const errorPage = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  padding: vars.space.lg,
  background: `
    radial-gradient(900px 600px at 50% -20%, ${tint.lime(0.28)}, transparent 60%),
    ${vars.color.bg}`,
});

export const errorCard = style({
  width: "100%",
  maxWidth: 560,
  background: vars.color.surface,
  border: `1px solid ${vars.color.borderSubtle}`,
  borderRadius: vars.radius.xxl,
  boxShadow: vars.shadow.card,
});
