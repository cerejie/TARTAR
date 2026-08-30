import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "../common/vars.css";

export const tableContainer = style({});

const rowGap = "8px";
const rowRadius = vars.radius.lg;
const rowBorder = `1px solid ${vars.color.borderSubtle}`;

globalStyle(`.${tableContainer} .ant-table`, {
  background: "transparent",
});

globalStyle(`.${tableContainer} .ant-table table`, {
  borderCollapse: "separate",
  borderSpacing: `0 ${rowGap}`,
});

globalStyle(`.${tableContainer} .ant-table-thead > tr > th`, {
  background: vars.color.accentSoft,
  color: vars.color.textMuted,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  border: "none",
});

globalStyle(`.${tableContainer} .ant-table-thead > tr > th:first-child`, {
  borderStartStartRadius: rowRadius,
  borderEndStartRadius: rowRadius,
});

globalStyle(`.${tableContainer} .ant-table-thead > tr > th:last-child`, {
  borderStartEndRadius: rowRadius,
  borderEndEndRadius: rowRadius,
});

globalStyle(`.${tableContainer} .ant-table-thead > tr > th::before`, {
  display: "none",
});

globalStyle(`.${tableContainer} .ant-table-tbody > tr > td`, {
  background: vars.color.surface,
  borderBlock: rowBorder,
  borderInline: "none",
  transition: "background 0.15s ease, border-color 0.15s ease",
});

globalStyle(`.${tableContainer} .ant-table-tbody > tr > td:first-child`, {
  borderInlineStart: rowBorder,
  borderStartStartRadius: rowRadius,
  borderEndStartRadius: rowRadius,
});

globalStyle(`.${tableContainer} .ant-table-tbody > tr > td:last-child`, {
  borderInlineEnd: rowBorder,
  borderStartEndRadius: rowRadius,
  borderEndEndRadius: rowRadius,
});

globalStyle(`.${tableContainer} .ant-table-tbody > tr.ant-table-row:hover > td`, {
  borderColor: vars.color.border,
});

globalStyle(`.${tableContainer} .ant-table-measure-row > td`, {
  background: "transparent",
  border: "none",
});

globalStyle(`.${tableContainer} .ant-pagination .ant-pagination-item`, {
  borderRadius: vars.radius.pill,
});

export const rowClickable = style({
  cursor: "pointer",
});

globalStyle(`.${tableContainer} .ant-table-tbody > tr.${rowClickable}:hover > td`, {
  borderColor: vars.color.accent,
});

export const rowOverdue = style({});

globalStyle(`.${tableContainer} .ant-table-tbody > tr.${rowOverdue} > td`, {
  background: vars.color.dangerBg,
  borderColor: vars.color.dangerBorder,
});

export const rowIcon = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 28,
  height: 28,
  flexShrink: 0,
  borderRadius: vars.radius.md,
  background: vars.color.surfaceSubtle,
  color: vars.color.text,
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
  color: vars.color.textMuted,
  fontSize: 14,
  display: "inline-flex",
});

globalStyle(
  `.${tableContainer} .ant-table-cell.ant-table-cell-ellipsis .${columnLabel}`,
  { overflow: "visible" }
);

export const slugTag = style({
  fontFamily: "inherit",
  background: vars.color.surfaceSubtle,
  color: vars.color.textMuted,
  border: `1px solid ${vars.color.borderSubtle}`,
  borderRadius: vars.radius.pill,
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
  borderRadius: vars.radius.pill,
  border: `1px solid ${vars.color.borderSubtle}`,
  background: vars.color.surface,
  color: vars.color.text,
  ":hover": {
    background: vars.color.accent,
    borderColor: vars.color.accent,
    color: vars.color.ink,
  },
  ":focus-visible": {
    outline: `3px solid ${vars.color.accentAlt}`,
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
  color: vars.color.textMuted,
  background: vars.color.surfaceSubtle,
  borderColor: vars.color.borderSubtle,
  cursor: "not-allowed",
});
