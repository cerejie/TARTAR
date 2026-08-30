import { globalStyle, style } from "@vanilla-extract/css";
import { tone } from "../common/tone.css";
import { vars } from "../common/vars.css";

export const statCard = style({
  height: "100%",
  borderRadius: vars.radius.xxl,
  border: `1px solid ${vars.color.borderSubtle}`,
  boxShadow: vars.shadow.card,
});

globalStyle(`.${statCard}.ant-card .ant-card-body`, {
  padding: `${vars.space.md} ${vars.space.lg}`,
  "@media": {
    "screen and (max-width: 420px)": {
      padding: `${vars.space.sm} ${vars.space.md}`,
    },
  },
});

export const statGrid = style({
  marginBottom: vars.space.md,
});

globalStyle(`.${statCard} .ant-statistic-title`, {
  color: vars.color.textMuted,
  fontSize: 12.5,
  marginBottom: 2,
});

globalStyle(`.${statCard} .ant-statistic-content`, {
  fontFamily: vars.font.heading,
  color: vars.color.brandDark,
  fontSize: 28,
  fontWeight: 700,
  letterSpacing: "-0.03em",
  lineHeight: 1.1,
  overflowWrap: "anywhere",
});

globalStyle(`.${statCard} .ant-statistic-content-suffix`, {
  fontFamily: vars.font.body,
  fontSize: 12,
  fontWeight: 500,
  letterSpacing: 0,
  color: vars.color.textMuted,
  marginInlineStart: 5,
});

globalStyle(`.${tone.positive} .ant-statistic-content`, {
  color: vars.color.positive,
});

globalStyle(`.${tone.negative} .ant-statistic-content`, {
  color: vars.color.danger,
});

globalStyle(`.${tone.brand} .ant-statistic-content`, {
  color: vars.color.brand,
});

export const statHead = style({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: vars.space.sm,
});

export const statValue = style({});

globalStyle(`.${statHead} .${statValue}`, {
  flex: 1,
  minWidth: 0,
});

export const statAside = style({
  display: "flex",
  alignItems: "center",
  gap: 2,
  flexShrink: 0,
});

export const statIcon = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 38,
  height: 38,
  flexShrink: 0,
  borderRadius: vars.radius.pill,
  fontSize: 17,
});

globalStyle(`.${statIcon}.${tone.default}`, {
  background: vars.color.surfaceSubtle,
  color: vars.color.text,
});

globalStyle(`.${statIcon}.${tone.brand}`, {
  background: vars.color.ink,
  color: vars.color.onInk,
});

globalStyle(`.${statIcon}.${tone.accent}`, {
  background: vars.color.accent,
  color: vars.color.ink,
});

globalStyle(`.${statIcon}.${tone.info}`, {
  background: vars.color.accentAltSoft,
  color: vars.color.ink,
});

globalStyle(`.${statIcon}.${tone.positive}`, {
  background: "rgba(62, 155, 38, 0.12)",
  color: vars.color.positive,
});

globalStyle(`.${statIcon}.${tone.negative}`, {
  background: vars.color.dangerBg,
  color: vars.color.danger,
});

globalStyle(`.${statIcon}.${tone.warning}`, {
  background: "rgba(183, 121, 31, 0.12)",
  color: vars.color.warning,
});

export const statChipRow = style({
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 6,
  marginTop: 10,
});

export const statCaption = style({
  marginTop: 6,
  fontSize: 12,
  color: vars.color.textMuted,
});

export const statMenu = style({});

globalStyle(`.${statMenu}.ant-btn`, {
  width: 28,
  height: 28,
  minWidth: 28,
  padding: 0,
  border: "none",
  borderRadius: vars.radius.pill,
  background: "transparent",
  color: vars.color.textMuted,
});

globalStyle(`.${statMenu}.ant-btn:not(:disabled):hover`, {
  background: vars.color.surfaceSubtle,
  color: vars.color.text,
});
