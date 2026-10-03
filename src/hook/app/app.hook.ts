import { useEffect } from "react";
import {
  selectThemeMode,
  useThemeStore,
} from "../../store/common/theme.store";
import { useAccountExpiryHook } from "../account/account.expiry.hook";
import { useInstallPromptListener } from "../common/install.hook";
import { usePushStatusListener } from "../common/push.hook";
import { useKeyboardInsetHook } from "./keyboard.hook";
import { usePrimeLookupsHook, usePrimeViewsHook } from "./prime.hook";
import { useRealtimeRefreshHook } from "./realtime.hook";
import { useAppUpdateHook } from "./update.hook";

export const useAppHook = () => {
  const mode = useThemeStore(selectThemeMode);
  useAccountExpiryHook();
  useRealtimeRefreshHook();
  usePrimeLookupsHook();
  usePrimeViewsHook();
  useAppUpdateHook();
  useInstallPromptListener();
  usePushStatusListener();
  useKeyboardInsetHook();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
  }, [mode]);
};
