import { style } from "@vanilla-extract/css";
import { vars } from "../common/vars.css";

export const filterBar = style({
  marginBottom: vars.space.md,
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
