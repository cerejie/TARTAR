import { style } from "@vanilla-extract/css";
import { vars } from "../../common/vars.css";

export const pageHeader = style({
  background: vars.color.surface,
  border: `1px solid ${vars.color.borderSubtle}`,
  borderRadius: vars.radius.xl,
  boxShadow: vars.shadow.card,
  padding: vars.space.lg,
  marginBottom: vars.space.lg,
});

export const pageTitle = style({
  marginBottom: 4,
  fontSize: 32,
  lineHeight: 1.2,
  color: vars.color.brandDark,
});

export const pageActions = style({});

export const chartLoading = style({
  height: 300,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});
