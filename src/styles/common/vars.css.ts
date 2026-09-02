import { createGlobalTheme } from "@vanilla-extract/css";

export const palette = {
  ink: "#16161A",
  inkDeep: "#0B0B0E",
  inkSoft: "#232329",
  inkLift: "#2E2E36",
  lime: "#D6F25B",
  limeDeep: "#BCDE47",
  limeSoft: "#EAF7A9",
  limeMist: "#FAFDEA",
  lilac: "#B9A5F5",
  lilacSoft: "#E7E0FC",
  cloud: "#F2F3EE",
  mist: "#FAFAF7",
  white: "#ffffff",
} as const;

export const colors = {
  brand: palette.ink,
  brandDark: palette.inkDeep,
  brandLight: palette.inkSoft,
  accent: palette.lime,
  bg: palette.white,
  surface: palette.white,
  surfaceSubtle: palette.mist,
  text: palette.ink,
  textMuted: "#6B6B72",
  border: "#E3E4DE",
  borderSubtle: "#EDEEE8",
  danger: "#C2372B",
  dangerBg: "#FDF2F0",
  dangerBorder: "#F3D3CE",
  positive: "#3E9B26",
  positiveBright: "#4FB831",
  warning: "#B7791F",
  ink: palette.ink,
  inkSoft: palette.inkSoft,
  inkLift: palette.inkLift,
  onInk: "#F4F5EF",
  onInkMuted: "#9A9AA2",
  inkOverlay: "rgba(244, 245, 239, 0.08)",
  inkOverlayStrong: "rgba(244, 245, 239, 0.16)",
  inkBorder: "rgba(244, 245, 239, 0.14)",
  accentStrong: palette.limeDeep,
  accentSoft: palette.limeSoft,
  accentTint: palette.limeMist,
  accentAlt: palette.lilac,
  accentAltSoft: palette.lilacSoft,
} as const;

export const chartSeries = [
  colors.ink,
  colors.accentAlt,
  colors.accent,
  colors.positive,
  colors.warning,
  colors.danger,
] as const;

export const fontFamilyBase =
  "'Segoe UI Variable Text', 'Segoe UI', system-ui, -apple-system, Roboto, 'Helvetica Neue', Arial, sans-serif";

export const fontFamilyHeading =
  "'Segoe UI Variable Display', 'Segoe UI', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif";

export const vars = createGlobalTheme(":root", {
  color: colors,
  space: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    xxl: "40px",
  },
  radius: {
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    xxl: "24px",
    shell: "32px",
    pill: "999px",
  },
  shadow: {
    card: "0 1px 2px rgba(22, 22, 26, 0.04), 0 10px 30px rgba(22, 22, 26, 0.05)",
    raised: "0 8px 30px rgba(22, 22, 26, 0.12)",
    pop: "0 12px 40px rgba(22, 22, 26, 0.16)",
  },
  font: {
    body: fontFamilyBase,
    heading: fontFamilyHeading,
  },
});
