import type { ThemeConfig } from "antd";
import { create } from "zustand";
import { colors, fontFamilyBase } from "../../styles/common/vars.css";

type States = {
  theme: ThemeConfig;
};

type Actions = {
  setTheme: (theme: ThemeConfig) => void;
};

const initialValues: States = {
  theme: {
    token: {
      colorPrimary: colors.brand,
      colorLink: colors.brand,
      colorBgLayout: colors.bg,
      colorBgContainer: colors.surface,
      colorText: colors.text,
      colorTextSecondary: colors.textMuted,
      colorTextDescription: colors.textMuted,
      colorBorder: colors.border,
      colorBorderSecondary: colors.borderSubtle,
      colorSuccess: colors.positive,
      colorError: colors.danger,
      colorWarning: colors.warning,
      fontFamily: fontFamilyBase,
      borderRadius: 12,
      borderRadiusLG: 24,
      controlOutline: colors.accentSoft,
    },
    components: {
      Layout: {
        siderBg: colors.brandDark,
        headerBg: colors.bg,
        bodyBg: colors.bg,
      },
      Button: {
        controlHeight: 40,
        paddingInline: 20,
        fontWeight: 500,
        borderRadius: 20,
        borderRadiusLG: 22,
        borderRadiusSM: 16,
        defaultBorderColor: colors.border,
        primaryShadow: "none",
        defaultShadow: "none",
      },
      Card: { borderRadiusLG: 24 },
      Modal: { borderRadiusLG: 24, paddingContentHorizontalLG: 28 },
      Segmented: {
        borderRadius: 999,
        borderRadiusSM: 999,
        itemSelectedBg: colors.ink,
        itemSelectedColor: colors.onInk,
        trackBg: colors.surfaceSubtle,
        trackPadding: 4,
      },
      Table: {
        headerBg: colors.accentSoft,
        headerColor: colors.textMuted,
        headerSplitColor: "transparent",
        headerSortActiveBg: colors.accent,
        headerSortHoverBg: colors.accent,
        bodySortBg: "transparent",
        borderColor: colors.borderSubtle,
        rowHoverBg: colors.surfaceSubtle,
        rowSelectedBg: colors.accentSoft,
        rowSelectedHoverBg: colors.accentSoft,
        cellPaddingBlockMD: 14,
        cellPaddingInlineMD: 16,
      },
      Menu: {
        darkItemBg: "transparent",
        darkSubMenuItemBg: "transparent",
        darkItemColor: colors.onInk,
        darkItemHoverBg: colors.inkOverlay,
        darkItemHoverColor: colors.onInk,
        darkItemSelectedBg: colors.accent,
        darkItemSelectedColor: colors.ink,
        itemBorderRadius: 999,
        itemHeight: 34,
        itemMarginBlock: 2,
        itemMarginInline: 0,
        itemPaddingInline: 12,
      },
      Tag: { borderRadiusSM: 999 },
      Input: { paddingBlock: 8 },
      Select: { borderRadius: 12 },
    },
  },
};

export const useThemeStore = create<States & Actions>((set) => ({
  ...initialValues,
  setTheme: (theme: ThemeConfig) => set(() => ({ theme })),
}));
