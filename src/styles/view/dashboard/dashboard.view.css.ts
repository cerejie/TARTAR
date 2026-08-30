import { globalStyle, style } from "@vanilla-extract/css";
import { cardTone } from "../../card/card.css";
import { tone } from "../../common/tone.css";
import { vars } from "../../common/vars.css";

export const notificationGroup = style({
  marginBottom: vars.space.md,
  selectors: {
    "&:last-child": { marginBottom: 0 },
  },
});

export const notificationGroupHead = style({
  display: "flex",
  alignItems: "center",
  gap: 6,
  marginBottom: 2,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
});

globalStyle(`.${notificationGroupHead}.${tone.negative}`, {
  color: vars.color.danger,
});

globalStyle(`.${notificationGroupHead}.${tone.warning}`, {
  color: vars.color.warning,
});

export const notificationCount = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 16,
  height: 16,
  padding: "0 5px",
  borderRadius: vars.radius.pill,
  fontSize: 10,
  fontWeight: 700,
  color: vars.color.surface,
});

globalStyle(`.${notificationCount}.${tone.negative}`, {
  background: vars.color.danger,
});

globalStyle(`.${notificationCount}.${tone.warning}`, {
  background: vars.color.warning,
});

export const notificationItem = style({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: vars.space.sm,
  padding: "9px 0",
  borderBottom: `1px solid ${vars.color.borderSubtle}`,
});

globalStyle(
  `.${notificationGroup}:last-child .${notificationItem}:last-child`,
  { borderBottom: "none" }
);

export const notificationItemMain = style({
  display: "flex",
  alignItems: "flex-start",
  flex: 1,
  gap: 10,
  minWidth: 0,
});

export const notificationDot = style({
  marginTop: 6,
  width: 8,
  height: 8,
  flexShrink: 0,
  borderRadius: "50%",
});

globalStyle(`.${notificationDot}.${tone.negative}`, {
  background: vars.color.danger,
});

globalStyle(`.${notificationDot}.${tone.warning}`, {
  background: vars.color.warning,
});

export const notificationText = style({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minWidth: 0,
});

export const notificationName = style({
  fontSize: 13,
  fontWeight: 600,
  color: vars.color.text,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const notificationSub = style({
  fontSize: 12,
  color: vars.color.textMuted,
});

export const notificationFigures = style({
  flexShrink: 0,
  textAlign: "right",
});

export const notificationAmount = style({
  fontSize: 13,
  fontWeight: 700,
  whiteSpace: "nowrap",
});

globalStyle(`.${notificationAmount}.${tone.negative}`, {
  color: vars.color.danger,
});

globalStyle(`.${notificationAmount}.${tone.warning}`, {
  color: vars.color.brandDark,
});

export const notificationDate = style({
  fontSize: 11,
  color: vars.color.textMuted,
  whiteSpace: "nowrap",
});

export const notificationMore = style({
  display: "block",
  marginTop: 4,
  fontSize: 12,
});

export const notificationEmpty = style({
  padding: `${vars.space.lg} 0`,
  textAlign: "center",
});

export const notificationFooter = style({
  marginTop: vars.space.md,
  paddingTop: vars.space.sm,
  borderTop: `1px solid ${vars.color.borderSubtle}`,
  textAlign: "center",
});

export const donutWrap = style({
  position: "relative",
});

export const donutCenter = style({
  position: "absolute",
  inset: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  pointerEvents: "none",
});

export const donutCenterValue = style({
  fontFamily: vars.font.heading,
  fontSize: 19,
  fontWeight: 700,
  color: vars.color.brandDark,
  lineHeight: 1.2,
});

globalStyle(`.${cardTone.ink} .${donutCenterValue}`, {
  color: vars.color.onInk,
});

export const donutCenterLabel = style({
  fontSize: 12,
  color: vars.color.textMuted,
});

globalStyle(`.${cardTone.ink} .${donutCenterLabel}`, {
  color: vars.color.onInkMuted,
});

export const donutLegend = style({
  display: "flex",
  flexDirection: "column",
  gap: 10,
  marginTop: vars.space.md,
});

export const donutLegendRow = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  fontSize: 13,
});

export const donutLegendKey = style({
  display: "flex",
  alignItems: "center",
  gap: 8,
  color: vars.color.text,
});

globalStyle(`.${cardTone.ink} .${donutLegendKey}`, {
  color: vars.color.onInk,
});

export const donutLegendDot = style({
  width: 10,
  height: 10,
  flexShrink: 0,
  borderRadius: "50%",
});

export const donutLegendValue = style({
  fontFamily: vars.font.heading,
  fontWeight: 700,
  color: vars.color.brandDark,
});

globalStyle(`.${cardTone.ink} .${donutLegendValue}`, {
  color: vars.color.onInk,
});
