import { globalStyle, style } from "@vanilla-extract/css";
import { cardBody } from "../card/card.css";
import { vars } from "../common/vars.css";

export const filterBar = style({
  marginBottom: vars.space.md,
});

globalStyle(`.${cardBody} > .${filterBar}`, {
  marginBottom: 0,
});

export const filterBranch = style({
  minWidth: 200,
});

export const filterReference = style({
  width: 160,
});

export const filterStatus = style({
  minWidth: 140,
});

export const filterAmount = style({
  width: 110,
});

export const filterToolbar = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.sm,
  marginBottom: vars.space.md,
});

export const filterToolbarCard = style({
  flex: 1,
  minWidth: 0,
});

globalStyle(`.${filterToolbarCard} > .ant-card`, {
  marginBottom: 0,
});

export const filterToolbarActions = style({
  flexShrink: 0,
});
