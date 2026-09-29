import { useEffect } from "react";
import {
  selectThemeMode,
  useThemeStore,
} from "../../store/common/theme.store";
import { useRealtimeRefreshHook } from "./realtime.hook";

export const useAppHook = () => {
  const mode = useThemeStore(selectThemeMode);
  useRealtimeRefreshHook();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
  }, [mode]);
};
