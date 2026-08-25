import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "../common/vars.css";

export const tableContainer = style({});

globalStyle(`.${tableContainer} .ant-table`, {
  background: "transparent",
});

globalStyle(`.${tableContainer} .ant-table-thead > tr > th`, {
  background: "transparent",
  color: vars.color.brandDark,
  fontWeight: 600,
  borderBottom: `1px solid ${vars.color.borderSubtle}`,
});

globalStyle(`.${tableContainer} .ant-table-thead > tr > th::before`, {
  display: "none",
});

globalStyle(`.${tableContainer} .ant-table-tbody > tr > td`, {
  borderBottom: `1px solid ${vars.color.borderSubtle}`,
});

globalStyle(`.${tableContainer} .ant-table-tbody > tr:last-child > td`, {
  borderBottom: "none",
});

globalStyle(`.${tableContainer} .ant-table-tbody > tr:hover > td`, {
  background: vars.color.bg,
});

export const rowClickable = style({
  cursor: "pointer",
});

export const rowOverdue = style({});

globalStyle(`.${tableContainer} .${rowOverdue} > td`, {
  background: "rgba(255, 77, 79, 0.07)",
});

export const rowIcon = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 28,
  height: 28,
  flexShrink: 0,
  borderRadius: vars.radius.md,
  background: vars.color.accent,
  color: vars.color.brand,
  fontSize: 14,
});

export const nameCell = style({
  display: "inline-flex",
  alignItems: "center",
  gap: vars.space.sm,
});

export const columnLabel = style({
  display: "inline-flex",
  alignItems: "center",
  gap: vars.space.xs,
  whiteSpace: "nowrap",
});

export const columnIcon = style({
  color: vars.color.brandLight,
  fontSize: 14,
  display: "inline-flex",
});

globalStyle(
  `.${tableContainer} .ant-table-cell.ant-table-cell-ellipsis .${columnLabel}`,
  { overflow: "visible" }
);

export const slugTag = style({
  fontFamily: "inherit",
  background: vars.color.accent,
  color: vars.color.brand,
  border: "none",
  borderRadius: vars.radius.sm,
  fontSize: 12,
  marginInlineEnd: 0,
});

export const rowActions = style({
  display: "inline-flex",
  alignItems: "center",
  gap: vars.space.sm,
});

export const iconButton = style({
  width: 32,
  height: 32,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.borderSubtle}`,
  background: vars.color.surface,
  color: vars.color.brand,
  ":hover": {
    background: vars.color.accent,
    borderColor: vars.color.brandLight,
    color: vars.color.brandDark,
  },
  ":focus-visible": {
    outline: "3px solid rgba(211, 163, 118, 0.7)",
    outlineOffset: 2,
  },
});

globalStyle(`.${iconButton}.ant-btn-dangerous`, {
  color: vars.color.danger,
  borderColor: vars.color.dangerBorder,
  background: vars.color.dangerBg,
});

globalStyle(`.${iconButton}.ant-btn-dangerous:hover`, {
  color: vars.color.surface,
  borderColor: vars.color.danger,
  background: vars.color.danger,
});

globalStyle(`.${iconButton}:disabled, .${iconButton}:disabled:hover`, {
  color: vars.color.brandLight,
  background: vars.color.surface,
  borderColor: vars.color.borderSubtle,
  cursor: "not-allowed",
});
