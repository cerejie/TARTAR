import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "../../common/vars.css";

export const slidePanes = style({
  overflow: "hidden",
});

export const slideTrack = style({
  display: "flex",
  width: "200%",
  alignItems: "flex-start",
  transition: "transform 0.3s ease",
  "@media": {
    "(prefers-reduced-motion: reduce)": { transition: "none" },
  },
});

export const slideDetail = style({});

globalStyle(`.${slideTrack}.${slideDetail}`, {
  transform: "translateX(-50%)",
});

export const slidePane = style({
  width: "50%",
  flexShrink: 0,
  minWidth: 0,
});

export const ledgerHead = style({
  marginBottom: vars.space.md,
});

export const ledgerSection = style({
  marginTop: vars.space.lg,
  marginBottom: vars.space.sm,
});

export const auditEntry = style({
  marginBottom: vars.space.md,
});

export const auditChanges = style({
  margin: `${vars.space.xs} 0 0`,
  paddingLeft: vars.space.lg,
});

export const paymentTotal = style({
  marginTop: vars.space.md,
  textAlign: "right",
});
