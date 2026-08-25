import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "../common/vars.css";

export const card = style({
  background: vars.color.surface,
  border: `1px solid ${vars.color.borderSubtle}`,
  borderRadius: vars.radius.xl,
  boxShadow: vars.shadow.card,
  marginBottom: vars.space.lg,
  overflow: "hidden",
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
  fontSize: 20,
  color: vars.color.brandDark,
});

export const cardSubtitle = style({
  fontSize: 13,
  fontWeight: 400,
});

export const cardExtra = style({
  maxWidth: "100%",
  overflowX: "auto",
});

export const cardBody = style({
  padding: vars.space.lg,
});

export const cardFlush = style({});

globalStyle(`.${cardFlush} .${cardBody}`, {
  padding: `${vars.space.sm} ${vars.space.md} 0`,
});
