import { globalStyle, style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../common/vars.css";

export const blockControl = style({
  width: "100%",
});

export const entityForm = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space.md,
});

export const formIntro = style({
  display: "flex",
  flexWrap: "wrap",
  gap: vars.space.md,
  padding: vars.space.md,
  borderRadius: vars.radius.lg,
  background: vars.color.surfaceSubtle,
});

export const formIntroItem = style({
  display: "flex",
  flexDirection: "column",
  gap: 2,
  minWidth: 120,
});

export const formIntroLabel = style({
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: vars.color.textMuted,
});

export const formIntroValue = style({
  fontSize: 14,
  fontWeight: 600,
  color: vars.color.text,
});

export const formGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  columnGap: vars.space.md,
  rowGap: vars.space.sm,
  "@media": {
    "screen and (max-width: 575.98px)": { gridTemplateColumns: "1fr" },
  },
});

globalStyle(`.${formGrid} .ant-form-item`, {
  marginBottom: 0,
});

export const fieldSpan = styleVariants({
  half: { gridColumn: "span 1" },
  full: { gridColumn: "1 / -1" },
});

export const formSection = style({
  padding: vars.space.md,
  border: `1px solid ${vars.color.borderSubtle}`,
  borderRadius: vars.radius.lg,
  background: vars.color.surface,
});

export const formSectionHeader = style({
  marginBottom: vars.space.md,
});

export const formSectionTitle = style({
  fontFamily: vars.font.heading,
  fontSize: 15,
  fontWeight: 700,
  letterSpacing: "-0.01em",
  color: vars.color.brandDark,
});

export const formSectionDescription = style({
  marginTop: 2,
  fontFamily: vars.font.body,
  fontSize: 12.5,
  color: vars.color.textMuted,
});
