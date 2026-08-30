import { globalStyle, style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../../common/vars.css";

export const contentView = style({
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
});

export const viewToolbar = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.sm,
  marginBottom: vars.space.md,
  maxWidth: "100%",
});

export const viewToolbarStart = style({
  flex: 1,
  minWidth: 0,
});

export const viewToolbarActions = style({
  marginInlineStart: "auto",
  flexShrink: 0,
});

export const viewMeta = style({
  fontSize: 12,
  color: vars.color.textMuted,
  whiteSpace: "nowrap",
});

export const viewBody = style({
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
});

globalStyle(`.${viewBody} > *:last-child`, {
  marginBottom: 0,
});

export const viewFooter = style({
  marginTop: vars.space.md,
  paddingTop: vars.space.md,
  borderTop: `1px solid ${vars.color.borderSubtle}`,
  fontSize: 12,
  color: vars.color.textMuted,
});

export const bentoGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
  gap: vars.space.md,
  alignItems: "stretch",
});

export const bentoSpan = styleVariants({
  quarter: {
    gridColumn: "span 3",
    "@media": {
      "screen and (max-width: 1199.98px)": { gridColumn: "span 6" },
      "screen and (max-width: 575.98px)": { gridColumn: "span 12" },
    },
  },
  third: {
    gridColumn: "span 4",
    "@media": {
      "screen and (max-width: 1199.98px)": { gridColumn: "span 6" },
      "screen and (max-width: 767.98px)": { gridColumn: "span 12" },
    },
  },
  half: {
    gridColumn: "span 6",
    "@media": {
      "screen and (max-width: 767.98px)": { gridColumn: "span 12" },
    },
  },
  twoThirds: {
    gridColumn: "span 8",
    "@media": {
      "screen and (max-width: 1199.98px)": { gridColumn: "span 12" },
    },
  },
  full: {
    gridColumn: "span 12",
  },
});

export const bentoCell = style({
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
});
