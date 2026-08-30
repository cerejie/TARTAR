import { globalStyle, style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../common/vars.css";

export const card = style({
  background: vars.color.surface,
  border: `1px solid ${vars.color.borderSubtle}`,
  borderRadius: vars.radius.xxl,
  boxShadow: vars.shadow.card,
  marginBottom: vars.space.md,
  overflow: "hidden",
});

export const cardTone = styleVariants({
  surface: {},
  ink: {
    background: vars.color.ink,
    borderColor: vars.color.ink,
  },
  accent: {
    background: vars.color.accentSoft,
    borderColor: vars.color.accent,
  },
});

globalStyle(`.${cardTone.ink}.ant-card`, {
  background: vars.color.ink,
  color: vars.color.onInk,
});

globalStyle(
  [
    `.${cardTone.ink} .ant-typography`,
    `.${cardTone.ink} .ant-card-head-title`,
  ].join(", "),
  { color: vars.color.onInk }
);

globalStyle(`.${cardTone.ink} .ant-typography-secondary`, {
  color: vars.color.onInkMuted,
});

globalStyle(`.${cardTone.ink} .ant-empty-description`, {
  color: vars.color.onInkMuted,
});

globalStyle(`.${cardTone.ink} .ant-spin-dot-item`, {
  background: vars.color.accent,
});

globalStyle(`.${cardTone.accent}.ant-card`, {
  background: vars.color.accentSoft,
});

export const cardHead = style({
  borderBottom: "none",
  minHeight: "auto",
  padding: `${vars.space.lg} ${vars.space.lg} 0`,
});

globalStyle(`.${cardHead} .ant-card-head-wrapper`, {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: vars.space.md,
  flexWrap: "wrap",
  width: "100%",
});

globalStyle(`.${cardHead} .ant-card-head-title`, {
  overflow: "visible",
  whiteSpace: "normal",
  padding: 0,
});

globalStyle(`.${cardHead} .ant-card-extra`, {
  marginInlineStart: 0,
  maxWidth: "100%",
  padding: 0,
});

export const cardTitle = style({
  marginBottom: 0,
  fontSize: 18,
  letterSpacing: "-0.02em",
  color: vars.color.brandDark,
});

globalStyle(`.${cardTone.ink} .${cardTitle}`, {
  color: vars.color.onInk,
});

export const cardSubtitle = style({
  fontSize: 12.5,
  fontWeight: 400,
});

export const cardExtra = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.sm,
  maxWidth: "100%",
  overflowX: "auto",
});

export const cardMenu = style({});

globalStyle(`.${cardMenu}.ant-btn`, {
  width: 30,
  height: 30,
  minWidth: 30,
  padding: 0,
  borderRadius: vars.radius.pill,
  border: "none",
  background: "transparent",
  color: vars.color.textMuted,
  flexShrink: 0,
});

globalStyle(`.${cardMenu}.ant-btn:not(:disabled):hover`, {
  background: vars.color.surfaceSubtle,
  color: vars.color.text,
});

globalStyle(`.${cardTone.ink} .${cardMenu}.ant-btn`, {
  color: vars.color.onInkMuted,
});

globalStyle(`.${cardTone.ink} .${cardMenu}.ant-btn:not(:disabled):hover`, {
  background: vars.color.inkOverlay,
  color: vars.color.onInk,
});

export const cardBody = style({
  padding: vars.space.lg,
});

export const cardDense = style({});

/** Minimum padding — the card is chrome around a control row, not a content panel. */
globalStyle(`.${cardDense} .${cardBody}`, {
  padding: vars.space.sm,
});

export const cardFlush = style({});

globalStyle(`.${cardFlush} .${cardBody}`, {
  padding: `${vars.space.sm} ${vars.space.md} 0`,
});

export const cardFooter = style({
  marginTop: vars.space.md,
  paddingTop: vars.space.md,
  borderTop: `1px solid ${vars.color.borderSubtle}`,
  fontSize: 12.5,
  color: vars.color.textMuted,
});

globalStyle(`.${cardTone.ink} .${cardFooter}`, {
  borderTopColor: vars.color.inkBorder,
  color: vars.color.onInkMuted,
});
