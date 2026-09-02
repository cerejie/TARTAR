import { globalStyle, keyframes, style } from "@vanilla-extract/css";
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
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
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

globalStyle(
  `.${tableContainer}.ant-table-wrapper .ant-table-pagination.ant-pagination`,
  {
    marginBlock: vars.space.md,
  }
);

export const tablePagination = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.space.md,
  flexWrap: "wrap",
});

export const tablePaginationInfo = style({
  color: vars.color.textMuted,
  fontSize: 12.5,
  whiteSpace: "nowrap",
});

export const tablePaginationPages = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.xs,
});

export const tablePaginationSelect = style({
  width: 80,
});

export const tablePaginationSize = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.sm,
  color: vars.color.textMuted,
  fontSize: 12.5,
  whiteSpace: "nowrap",
});

globalStyle(`.${tablePaginationPages} .ant-pagination li.ant-pagination-item`, {
  borderRadius: vars.radius.md,
  background: "transparent",
  borderColor: "transparent",
});

globalStyle(
  `.${tablePaginationPages} .ant-pagination li.ant-pagination-item-active, .${tablePaginationPages} .ant-pagination li.ant-pagination-item-active:hover`,
  {
    background: vars.color.accentSoft,
    borderColor: "transparent",
  }
);

globalStyle(
  `.${tablePaginationPages} .ant-pagination li.ant-pagination-item-active a`,
  {
    color: vars.color.text,
    fontWeight: 600,
  }
);

globalStyle(`.${tablePaginationPages} .ant-pagination`, {
  display: "flex",
  alignItems: "center",
  gap: vars.space.xs,
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

export const rowExpanded = style({});

globalStyle(`.${tableContainer} .ant-table-tbody > tr.${rowExpanded} > td`, {
  background: vars.color.accentTint,
  borderColor: vars.color.accent,
  borderBottomColor: "transparent",
  borderEndStartRadius: 0,
  borderEndEndRadius: 0,
});

globalStyle(
  `.${tableContainer} .ant-table-tbody > tr.ant-table-expanded-row > td`,
  {
    background: "transparent",
    border: "none",
    borderRadius: 0,
    overflow: "visible",
    whiteSpace: "normal",
    padding: "0 !important",
  }
);

globalStyle(
  `.${tableContainer} .ant-table-tbody > tr.ant-table-expanded-row > td:first-child, .${tableContainer} .ant-table-tbody > tr.ant-table-expanded-row > td:last-child`,
  {
    border: "none",
    borderRadius: 0,
  }
);

globalStyle(
  `.${tableContainer} .ant-table-tbody > tr.ant-table-expanded-row:hover > td`,
  {
    background: "transparent",
  }
);

export const tableDetachedView = style({});

export const viewColumnWidth = 56;

const viewColumnGutter = `${viewColumnWidth}px`;
const viewBoxInset = `0 ${rowGap} 0 0`;

globalStyle(
  `.${tableContainer}.${tableDetachedView} .ant-table-thead > tr > th:first-child`,
  {
    position: "relative",
    background: "transparent",
    padding: 0,
    borderRadius: 0,
  }
);

globalStyle(
  `.${tableContainer}.${tableDetachedView} .ant-table-thead > tr > th:nth-child(2)`,
  {
    borderStartStartRadius: rowRadius,
    borderEndStartRadius: rowRadius,
  }
);

globalStyle(
  `.${tableContainer}.${tableDetachedView} .ant-table-tbody > tr > td.ant-table-row-expand-icon-cell`,
  {
    position: "relative",
    background: "transparent",
    border: "none",
    borderRadius: 0,
    padding: 0,
    overflow: "visible",
  }
);

globalStyle(
  `.${tableContainer}.${tableDetachedView} .ant-table-tbody > tr > td.ant-table-row-expand-icon-cell + td`,
  {
    borderInlineStart: rowBorder,
    borderStartStartRadius: rowRadius,
    borderEndStartRadius: rowRadius,
  }
);

globalStyle(
  `.${tableContainer}.${tableDetachedView} .ant-table-tbody > tr.${rowExpanded} > td.ant-table-row-expand-icon-cell + td`,
  {
    borderInlineStartColor: vars.color.accent,
    borderEndStartRadius: 0,
  }
);

export const viewHeaderLabel = style({
  position: "absolute",
  inset: viewBoxInset,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: rowRadius,
  background: vars.color.accentSoft,
  color: vars.color.textMuted,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
});

export const viewTrigger = style({
  position: "absolute",
  inset: viewBoxInset,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
  border: rowBorder,
  borderRadius: rowRadius,
  background: vars.color.surface,
  color: vars.color.textMuted,
  fontSize: 15,
  cursor: "pointer",
  transition: "background 0.15s ease, border-color 0.15s ease, color 0.15s ease",
  ":hover": {
    background: vars.color.accentSoft,
    borderColor: vars.color.accentStrong,
    color: vars.color.text,
  },
  ":focus-visible": {
    outline: `3px solid ${vars.color.accentAlt}`,
    outlineOffset: 2,
  },
});
export const viewTriggerOpen = style({
  background: vars.color.accentTint,
  borderColor: vars.color.accent,
  color: vars.color.text,
});

const detailReveal = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

export const rowDetailPanel = style({
  marginInlineStart: viewColumnGutter,
  marginTop: `-${rowGap}`,
  padding: vars.space.md,
  background: vars.color.accentTint,
  borderInline: `1px solid ${vars.color.accent}`,
  borderBottom: `1px solid ${vars.color.accent}`,
  borderEndStartRadius: rowRadius,
  borderEndEndRadius: rowRadius,
  animation: `${detailReveal} 0.16s ease`,
});

export const rowDetailContent = style({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: vars.space.lg,
  padding: vars.space.md,
  background: vars.color.surface,
  border: rowBorder,
  borderRadius: vars.radius.md,
});

export const rowDetailSection = style({
  minWidth: 0,
  selectors: {
    "& + &": {
      paddingInlineStart: vars.space.lg,
      borderInlineStart: rowBorder,
    },
  },
});

export const rowDetailSectionTitle = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.sm,
  marginBottom: vars.space.md,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: vars.color.textMuted,
});

export const rowDetailSectionIcon = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 24,
  height: 24,
  flexShrink: 0,
  borderRadius: vars.radius.md,
  background: vars.color.accentSoft,
  color: vars.color.text,
  fontSize: 12,
});

export const rowDetailField = style({
  minWidth: 0,
  selectors: {
    "& + &": {
      marginTop: vars.space.sm,
      paddingTop: vars.space.sm,
      borderTop: rowBorder,
    },
  },
});

export const rowDetailLabel = style({
  display: "block",
  marginBottom: 2,
  fontSize: 12,
  color: vars.color.textMuted,
});

export const rowDetailValue = style({
  display: "block",
  fontSize: 13.5,
  fontWeight: 600,
  color: vars.color.text,
  wordBreak: "break-word",
});

export const rowActionMenu = style({});

globalStyle(`.${rowActionMenu} .ant-dropdown-menu`, {
  minWidth: 176,
  padding: vars.space.xs,
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.borderSubtle}`,
  background: vars.color.surface,
  boxShadow: vars.shadow.pop,
});

globalStyle(`.${rowActionMenu}.${rowActionMenu} .ant-dropdown-menu-item`, {
  padding: `${vars.space.xs} ${vars.space.sm}`,
  borderRadius: vars.radius.md,
  color: vars.color.text,
  fontSize: 13,
  fontWeight: 500,
});

globalStyle(
  `.${rowActionMenu}.${rowActionMenu} .ant-dropdown-menu-item:hover`,
  { background: vars.color.accentSoft }
);

globalStyle(
  `.${rowActionMenu}.${rowActionMenu} .ant-dropdown-menu-item-danger`,
  { color: vars.color.danger }
);

globalStyle(
  `.${rowActionMenu}.${rowActionMenu} .ant-dropdown-menu-item-danger:hover`,
  { background: vars.color.dangerBg, color: vars.color.danger }
);
