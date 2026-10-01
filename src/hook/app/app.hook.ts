import { useEffect } from "react";
import {
  selectThemeMode,
  useThemeStore,
} from "../../store/common/theme.store";
import { useAccountExpiryHook } from "../account/account.expiry.hook";
import { useInstallPromptListener } from "../common/install.hook";
import { usePrimeLookupsHook } from "./prime.hook";
import { useRealtimeRefreshHook } from "./realtime.hook";
import { useAppUpdateHook } from "./update.hook";

export const useAppHook = () => {
  const mode = useThemeStore(selectThemeMode);
  useAccountExpiryHook();
  useRealtimeRefreshHook();
  usePrimeLookupsHook();
  useAppUpdateHook();
  useInstallPromptListener();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
  }, [mode]);
};
