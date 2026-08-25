import { globalStyle, style } from "@vanilla-extract/css";
import { tone } from "../common/tone.css";
import { vars } from "../common/vars.css";

export const statCard = style({
  height: "100%",
  borderRadius: vars.radius.lg,
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
  marginBottom: vars.space.lg,
});

globalStyle(`.${statCard} .ant-statistic-title`, {
  color: vars.color.textMuted,
  fontSize: 13,
});

globalStyle(`.${statCard} .ant-statistic-content`, {
  fontFamily: vars.font.heading,
  color: vars.color.brandDark,
  fontSize: 24,
  overflowWrap: "anywhere",
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

export const statBody = style({});

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

export const statIcon = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 40,
  height: 40,
  flexShrink: 0,
  borderRadius: vars.radius.pill,
  fontSize: 18,
});

globalStyle(`.${statIcon}.${tone.default}`, {
  background: vars.color.accent,
  color: vars.color.brand,
});

globalStyle(`.${statIcon}.${tone.brand}`, {
  background: vars.color.brand,
  color: vars.color.surface,
});

globalStyle(`.${statIcon}.${tone.positive}`, {
  background: "rgba(35, 120, 4, 0.12)",
  color: vars.color.positive,
});

globalStyle(`.${statIcon}.${tone.negative}`, {
  background: vars.color.dangerBg,
  color: vars.color.danger,
});

export const statCaption = style({
  marginTop: 6,
  fontSize: 12,
  color: vars.color.textMuted,
});

export const statDelta = style({
  display: "inline-flex",
  alignItems: "center",
  gap: 3,
  fontWeight: 600,
});

globalStyle(`.${statDelta}.${tone.positive}`, {
  color: vars.color.positive,
});

globalStyle(`.${statDelta}.${tone.negative}`, {
  color: vars.color.danger,
});
