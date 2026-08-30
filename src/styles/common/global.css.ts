import { globalStyle } from "@vanilla-extract/css";
import { vars } from "./vars.css";

globalStyle("html, body, #root", {
  margin: 0,
  padding: 0,
  height: "100%",
});

globalStyle("body", {
  fontFamily: vars.font.body,
  color: vars.color.text,
  background: vars.color.bg,
});

globalStyle("#root", {
  display: "flex",
  flexDirection: "column",
  minHeight: "100dvh",
});

globalStyle(
  [
    "h1, h2, h3, h4, h5",
    "body h1.ant-typography, body h2.ant-typography, body h3.ant-typography",
    "body h4.ant-typography, body h5.ant-typography",
  ].join(", "),
  {
    fontFamily: vars.font.heading,
    fontWeight: 600,
    letterSpacing: "-0.02em",
  }
);

globalStyle(
  [
    ".ant-statistic-content",
    ".ant-table-cell",
    ".ant-picker-input > input",
    ".ant-input-number-input",
  ].join(", "),
  {
    fontVariantNumeric: "tabular-nums",
  }
);
