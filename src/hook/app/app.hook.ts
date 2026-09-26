import { useEffect } from "react";
import {
  selectThemeMode,
  useThemeStore,
} from "../../store/common/theme.store";

export const useAppHook = () => {
  const mode = useThemeStore(selectThemeMode);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
  }, [mode]);
};
