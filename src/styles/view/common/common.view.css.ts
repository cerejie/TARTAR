import { style } from "@vanilla-extract/css";
import { vars } from "../../common/vars.css";

export const pageHeader = style({
  gap: vars.space.md,
  marginBottom: vars.space.lg,
});

export const pageHeading = style({
  minWidth: 0,
});

export const pageTitle = style({
  marginBottom: 2,
  fontSize: 36,
  lineHeight: 1.1,
  letterSpacing: "-0.03em",
  color: vars.color.brandDark,
  "@media": {
    "screen and (max-width: 575.98px)": { fontSize: 28 },
  },
});

export const pageSubtitle = style({
  fontSize: 13.5,
  color: vars.color.textMuted,
});

export const pageAside = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.md,
  flexShrink: 0,
});

export const pageMeta = style({
  fontSize: 12,
  fontWeight: 500,
  color: vars.color.textMuted,
  whiteSpace: "nowrap",
});

export const pageActions = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.sm,
  flexWrap: "wrap",
});

export const chartLoading = style({
  height: 300,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});
