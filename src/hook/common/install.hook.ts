import { useEffect } from "react";
import {
  selectInstalled,
  selectInstallPrompt,
  useInstallStore,
} from "../../store/common/install.store";

import type {
  IBeforeInstallPromptEvent,
  InstallMode,
} from "../../models/common/install.model";

const isInstallPromptEvent = (event: Event): event is IBeforeInstallPromptEvent =>
  "prompt" in event && "userChoice" in event;

export const isAppleTouchDevice = (): boolean => {
  const agent = navigator.userAgent;
  const iPadAsDesktop = agent.includes("Macintosh") && navigator.maxTouchPoints > 1;
  return /iPhone|iPad|iPod/.test(agent) || iPadAsDesktop;
};

export const useInstallPromptListener = () => {
  const setInstallPrompt = useInstallStore((state) => state.setInstallPrompt);
  const setInstalled = useInstallStore((state) => state.setInstalled);

  useEffect(() => {
    const listeners = new AbortController();

    window.addEventListener(
      "beforeinstallprompt",
      (event) => {
        if (!isInstallPromptEvent(event)) return;
        event.preventDefault();
        setInstallPrompt(event);
      },
      { signal: listeners.signal }
    );

    window.addEventListener(
      "appinstalled",
      () => {
        setInstallPrompt(null);
        setInstalled(true);
      },
      { signal: listeners.signal }
    );

    return () => listeners.abort();
  }, [setInstallPrompt, setInstalled]);
};

export const useInstallApp = () => {
  const installPrompt = useInstallStore(selectInstallPrompt);
  const installed = useInstallStore(selectInstalled);
  const setInstallPrompt = useInstallStore((state) => state.setInstallPrompt);

  const modeOf = (): InstallMode => {
    if (installed) return "installed";
    if (installPrompt) return "prompt";
    return isAppleTouchDevice() ? "ios" : "manual";
  };

  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  return { mode: modeOf(), install };
};
