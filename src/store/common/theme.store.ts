import type { ThemeConfig } from "antd";
import { create } from "zustand";
import { colors, fontFamilyBase } from "../../styles/common/vars.css";

type States = {
  theme: ThemeConfig;
  siderCollapsed: boolean;
  siderBroken: boolean;
};

type Actions = {
  setTheme: (theme: ThemeConfig) => void;
  toggleSider: () => void;
  setSiderCollapsed: (siderCollapsed: boolean) => void;
  setSiderBroken: (siderBroken: boolean) => void;
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
      fontFamily: fontFamilyBase,
      borderRadius: 8,
    },
    components: {
      Layout: {
        siderBg: colors.brandDark,
        headerBg: colors.bg,
        bodyBg: colors.bg,
      },
      Button: { controlHeight: 40, paddingInline: 18, fontWeight: 500 },
      Card: { borderRadiusLG: 16 },
      Menu: {
        darkItemBg: "transparent",
        darkSubMenuItemBg: "transparent",
        darkItemColor: colors.accent,
        darkItemHoverBg: "rgba(255, 242, 223, 0.09)",
        darkItemHoverColor: colors.bg,
        darkItemSelectedBg: colors.bg,
        darkItemSelectedColor: colors.brandDark,
      },
    },
  },
  siderCollapsed: false,
  siderBroken: false,
};

export const useThemeStore = create<States & Actions>((set) => ({
  ...initialValues,
  setTheme: (theme: ThemeConfig) => set(() => ({ theme })),
  toggleSider: () =>
    set((state) => ({ siderCollapsed: !state.siderCollapsed })),
  setSiderCollapsed: (siderCollapsed: boolean) =>
    set(() => ({ siderCollapsed })),
  setSiderBroken: (siderBroken: boolean) =>
    set(() => ({ siderBroken, siderCollapsed: siderBroken })),
}));
