import { createGlobalTheme } from "@vanilla-extract/css";

export const palette = {
  cream: "#FFF2DF",
  sand: "#FFE0B2",
  tan: "#D3A376",
  brown: "#8C6E63",
  espresso: "#3E2522",
} as const;

export const colors = {
  brand: palette.brown,
  brandDark: palette.espresso,
  brandLight: palette.tan,
  accent: palette.sand,
  bg: palette.cream,
  surface: "#ffffff",
  text: palette.espresso,
  textMuted: "#7A5B4F",
  border: palette.tan,
  borderSubtle: palette.sand,
  danger: "#a8071a",
  dangerBg: "#fff1f0",
  dangerBorder: "#ffccc7",
  positive: "#237804",
  positiveBright: "#49aa19",
  warning: "#ad6800",
} as const;

export const fontFamilyBase =
  "'Segoe UI', system-ui, -apple-system, Roboto, Helvetica, Arial, sans-serif";

export const fontFamilyHeading =
  "Georgia, 'Iowan Old Style', 'Palatino Linotype', Palatino, 'Times New Roman', serif";

export const vars = createGlobalTheme(":root", {
  color: colors,
  space: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
  },
  radius: {
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    pill: "999px",
  },
  shadow: {
    card: "0 1px 2px rgba(62, 37, 34, 0.04), 0 8px 24px rgba(62, 37, 34, 0.06)",
    raised: "0 8px 30px rgba(62, 37, 34, 0.12)",
  },
  font: {
    body: fontFamilyBase,
    heading: fontFamilyHeading,
  },
});
