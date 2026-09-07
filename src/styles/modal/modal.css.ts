import { globalStyle, style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../common/vars.css";

export const appModal = style({});


globalStyle(`.${appModal} .ant-modal-content`, {
  borderRadius: vars.radius.xxl,
  padding: 0,
  overflow: "hidden",
});


globalStyle(`.${appModal} .ant-modal-header`, {
  display: "flex",
  alignItems: "center",
  margin: 0,
  paddingBlock: vars.space.lg,
  paddingInline: `0 ${vars.space.lg}`,
  borderRadius: 0,
});


globalStyle(`.${appModal} .ant-modal-body`, {
  padding: 0,
  maxHeight: "68dvh",
  overflowY: "auto",
});


globalStyle(`.${appModal} .ant-modal-footer`, {
  margin: 0,
  padding: `${vars.space.md} ${vars.space.lg} ${vars.space.lg}`,
  borderTop: `1px solid ${vars.color.borderSubtle}`,
});


globalStyle(`.${appModal} .ant-modal-close`, {
  insetInlineEnd: vars.space.md,
  top: vars.space.md,
  borderRadius: vars.radius.pill,
});


export const modalTitle = style({
  fontFamily: vars.font.heading,
  fontSize: 20,
  fontWeight: 700,
  letterSpacing: "-0.02em",
  lineHeight: 1.2,
  color: vars.color.brandDark,
});

export const modalSubtitle = style({
  marginTop: 2,
  fontFamily: vars.font.body,
  fontSize: 12.5,
  fontWeight: 400,
  color: vars.color.textMuted,
});

export const modalEmpty = style({
  padding: `${vars.space.lg} 0`,
});

globalStyle(`.${appModal} .ant-descriptions-bordered .ant-descriptions-view`, {
  borderRadius: vars.radius.lg,
  overflow: "hidden",
});

export const confirmBody = style({
  paddingBlock: vars.space.sm,
});

export const confirmIcon = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 40,
  height: 40,
  flexShrink: 0,
  borderRadius: vars.radius.pill,
  fontSize: 18,
});

export const confirmIconTone = styleVariants({
  confirm: {
    background: vars.color.accentSoft,
    color: vars.color.ink,
  },
  delete: {
    background: vars.color.dangerBg,
    color: vars.color.danger,
  },
});

export const confirmMessage = style({
  fontSize: 14,
  lineHeight: 1.5,
  color: vars.color.text,
});
