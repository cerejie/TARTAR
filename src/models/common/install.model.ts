export interface IBeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export type InstallMode = "installed" | "prompt" | "ios" | "manual";

export const installModeSubtitles: Record<InstallMode, string> = {
  installed: "TARTAR is installed on this device.",
  prompt: "Open TARTAR from your home screen or Start menu, full screen and ready offline.",
  ios: "Add TARTAR to your home screen to use it full screen, offline and with alerts.",
  manual: "Install TARTAR from your browser to open it like any other app.",
};
