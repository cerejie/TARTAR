import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "../common/vars.css";

export const filterBar = style({
  marginBottom: vars.space.md,
});

export const filterReference = style({
  width: 180,
});

export const filterStatus = style({
  minWidth: 140,
});

export const filterAmount = style({
  width: 120,
});

export const filterClear = style({});

globalStyle(`.${filterClear}.ant-btn`, {
  border: "none",
  boxShadow: "none",
  background: "transparent",
  color: vars.color.textMuted,
  paddingInline: vars.space.sm,
});

globalStyle(`.${filterClear}.ant-btn:not(:disabled):hover`, {
  background: "transparent",
  color: vars.color.text,
});

export const filterToolbar = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.sm,
  marginBottom: vars.space.md,
});

export const filterToolbarStart = style({
  flex: 1,
  minWidth: 0,
});

globalStyle(`.${filterToolbarStart} > .${filterBar}`, {
  marginBottom: 0,
});

export const filterToolbarActions = style({
  flexShrink: 0,
});
