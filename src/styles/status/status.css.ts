import { globalStyle, style } from "@vanilla-extract/css";
import { tone } from "../common/tone.css";
import { vars } from "../common/vars.css";

export const syncIndicator = style({
  display: "inline-flex",
  alignItems: "center",
  height: 32,
  paddingInline: 12,
  borderRadius: vars.radius.pill,
  marginInlineEnd: 0,
  fontSize: 12,
});

export const syncOnline = style({
  display: "inline-flex",
  alignItems: "center",
});

globalStyle(`.${syncOnline} .ant-badge-status-text`, {
  fontSize: 13,
  color: vars.color.textMuted,
});

export const statDelta = style({
  display: "inline-flex",
  alignItems: "center",
  gap: 3,
  padding: "3px 10px",
  borderRadius: vars.radius.pill,
  fontSize: 11.5,
  fontWeight: 600,
  lineHeight: 1.4,
  background: vars.color.surfaceSubtle,
  color: vars.color.text,
});

globalStyle(`.${statDelta}.${tone.positive}`, {
  background: vars.color.accent,
  color: vars.color.ink,
});

globalStyle(`.${statDelta}.${tone.negative}`, {
  background: vars.color.dangerBg,
  color: vars.color.danger,
});

export const progressRow = style({
  display: "flex",
  flexDirection: "column",
  gap: 6,
  paddingBlock: 10,
});

export const progressHead = style({
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: vars.space.sm,
});

export const progressValue = style({
  fontFamily: vars.font.heading,
  fontSize: 26,
  fontWeight: 700,
  letterSpacing: "-0.03em",
  lineHeight: 1,
  color: vars.color.brandDark,
});

export const progressUnit = style({
  fontFamily: vars.font.body,
  fontSize: 11,
  fontWeight: 500,
  color: vars.color.textMuted,
  marginInlineStart: 3,
});

export const progressLabel = style({
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontSize: 12.5,
  color: vars.color.textMuted,
});

export const progressDot = style({
  width: 8,
  height: 8,
  borderRadius: "50%",
  flexShrink: 0,
});

export const progressTrack = style({
  position: "relative",
  height: 8,
  borderRadius: vars.radius.pill,
  background: vars.color.surfaceSubtle,
  overflow: "hidden",
});

export const progressFill = style({
  position: "absolute",
  insetBlock: 0,
  insetInlineStart: 0,
  borderRadius: vars.radius.pill,
});

globalStyle(
  [`.${progressFill}.${tone.default}`, `.${progressDot}.${tone.default}`].join(", "),
  {
    background: vars.color.ink,
  }
);

globalStyle(
  [`.${progressFill}.${tone.brand}`, `.${progressDot}.${tone.brand}`].join(", "),
  {
    background: vars.color.ink,
  }
);

globalStyle(
  [`.${progressFill}.${tone.accent}`, `.${progressDot}.${tone.accent}`].join(", "),
  {
    background: vars.color.accent,
  }
);

globalStyle(
  [`.${progressFill}.${tone.info}`, `.${progressDot}.${tone.info}`].join(", "),
  {
    background: vars.color.accentAlt,
  }
);

globalStyle(
  [`.${progressFill}.${tone.positive}`, `.${progressDot}.${tone.positive}`].join(", "),
  {
    background: vars.color.positive,
  }
);

globalStyle(
  [`.${progressFill}.${tone.negative}`, `.${progressDot}.${tone.negative}`].join(", "),
  {
    background: vars.color.danger,
  }
);

globalStyle(
  [`.${progressFill}.${tone.warning}`, `.${progressDot}.${tone.warning}`].join(", "),
  {
    background: vars.color.warning,
  }
);
