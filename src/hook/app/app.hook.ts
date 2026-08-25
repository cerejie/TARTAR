import { useThemeStore } from "../../store/common/theme.store";

export const useAppHook = () => {
  const config = useThemeStore((state) => state.theme);

  return { config };
};
