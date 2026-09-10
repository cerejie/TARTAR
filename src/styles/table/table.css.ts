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
  whiteSpace: "normal",
  overflowWrap: "break-word",
  transition:
    "background 0.15s ease, border-color 0.15s ease, border-radius 0.2s ease",
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

globalStyle(`.${tableContainer} .ant-table-content`, {
  overflowX: "auto",
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

export const nowrapCell = style({});

globalStyle(`.${tableContainer} .ant-table-tbody > tr > td.${nowrapCell}`, {
  whiteSpace: "nowrap",
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

export const typeTag = style({});

globalStyle(`.ant-tag.${typeTag}`, {
  fontFamily: "inherit",
  fontSize: 13,
  fontWeight: 500,
  lineHeight: 1.6,
  paddingBlock: vars.space.xs,
  paddingInline: vars.space.sm,
  borderRadius: vars.radius.pill,
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

const expandTriggerSize = "26px";
const expandTriggerGap = vars.space.md;

export const leadCell = style({
  display: "inline-flex",
  alignItems: "center",
  gap: expandTriggerGap,
});

export const leadHeader = style({
  display: "inline-block",
  marginInlineStart: `calc(${expandTriggerSize} + ${expandTriggerGap})`,
});

export const expandTrigger = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flex: "none",
  width: expandTriggerSize,
  height: expandTriggerSize,
  padding: 0,
  border: "none",
  borderRadius: vars.radius.sm,
  background: "transparent",
  color: vars.color.textMuted,
  fontSize: 14,
  cursor: "pointer",
  transition:
    "color 0.15s ease, transform 0.2s cubic-bezier(0.2, 0.9, 0.24, 1.2)",
  ":focus-visible": {
    outline: `3px solid ${vars.color.accentAlt}`,
    outlineOffset: 2,
  },
});

export const expandTriggerOpen = style({
  color: vars.color.text,
  transform: "rotate(90deg)",
});

const detailReveal = keyframes({
  from: { gridTemplateRows: "0fr", opacity: 0 },
  to: { gridTemplateRows: "1fr", opacity: 1 },
});

const detailConceal = keyframes({
  from: { gridTemplateRows: "1fr", opacity: 1 },
  to: { gridTemplateRows: "0fr", opacity: 0 },
});

const detailRise = keyframes({
  from: { opacity: 0, transform: "translateY(-10px)" },
  to: { opacity: 1, transform: "translateY(0)" },
});

const instantMotion = {
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      animationDuration: "0.01ms",
      animationDelay: "0ms",
    },
  },
};

const staggeredRise = (step: number) => ({
  animationDelay: `${step * 50}ms`,
  "@media": {
    "(prefers-reduced-motion: reduce)": { animationDelay: "0ms" },
  },
});

export const rowDetailReveal = style({
  display: "grid",
  gridTemplateRows: "1fr",
  overflow: "hidden",
  marginTop: `-${rowGap}`,
  animation: `${detailReveal} 0.28s cubic-bezier(0.22, 1, 0.3, 1) both`,
  ...instantMotion,
});

export const rowDetailRevealClosing = style({
  animationName: detailConceal,
  animationDuration: "0.16s",
  animationTimingFunction: "cubic-bezier(0.4, 0, 1, 1)",
  ...instantMotion,
});

export const rowDetailPanel = style({
  minHeight: 0,
  padding: vars.space.md,
  background: vars.color.accentTint,
  borderInline: `1px solid ${vars.color.accent}`,
  borderBottom: `1px solid ${vars.color.accent}`,
  borderEndStartRadius: rowRadius,
  borderEndEndRadius: rowRadius,
});

export const rowDetailContent = style({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: vars.space.lg,
  padding: vars.space.md,
  background: `linear-gradient(135deg, ${vars.color.accentTintier} 30%, ${vars.color.accentTintier} 40%, ${vars.color.accentTint} 90%)`,
  border: rowBorder,
  borderRadius: vars.radius.md,
});

export const rowDetailSection = style({
  minWidth: 0,
  animation: `${detailRise} 0.34s cubic-bezier(0.22, 1, 0.3, 1) both`,
  selectors: {
    "& + &": {
      paddingInlineStart: vars.space.lg,
      borderInlineStart: rowBorder,
    },
    "&:nth-child(2)": staggeredRise(1),
    "&:nth-child(3)": staggeredRise(2),
    "&:nth-child(4)": staggeredRise(3),
  },
  ...instantMotion,
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
  { background: vars.color.accentWash }
);

globalStyle(
  `.${rowActionMenu}.${rowActionMenu} .ant-dropdown-menu-item-danger`,
  { color: vars.color.danger }
);

globalStyle(
  `.${rowActionMenu}.${rowActionMenu} .ant-dropdown-menu-item-danger:hover`,
  { background: vars.color.dangerBg, color: vars.color.danger }
);

globalStyle(
  `.${tableContainer} .ant-table-tbody > tr.ant-table-row:not(.${rowExpanded}):hover > td`,
  { borderColor: vars.color.accent }
);

globalStyle(
  `.${tableContainer} .ant-table-tbody > tr.ant-table-row:not(.${rowExpanded}):hover .${expandTrigger}`,
  { color: vars.color.text }
);

globalStyle(
  `.${tableContainer}.${tableContainer} .ant-table-tbody > tr.${rowExpanded}.${rowExpanded}:hover > td`,
  {
    background: vars.color.accentTint,
    borderColor: vars.color.accent,
    borderBottomColor: "transparent",
  }
);

export const tablePanel = style({
  background: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.lg,
  marginBottom: vars.space.sm,
  overflow: "hidden",
});

export const tablePanelToolbar = style({
  padding: vars.space.md,
  borderBottom: `1px solid ${vars.color.borderSubtle}`,
});

export const tablePanelBody = style({
  paddingInline: vars.space.md,
  paddingBottom: vars.space.sm,
});

export const tablePanelFooter = style({
  padding: vars.space.md,
  borderTop: `1px solid ${vars.color.borderSubtle}`,
});
