import { globalStyle, style } from "@vanilla-extract/css";
import { cardBody } from "../card/card.css";
import { vars } from "../common/vars.css";

export const filterBar = style({
  marginBottom: vars.space.md,
});

/** Inside a card the card owns the outer spacing, so the bar drops its own. */
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
