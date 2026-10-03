export type PushMode =
  | "unconfigured"
  | "unsupported"
  | "needs-install"
  | "blocked"
  | "off"
  | "on";

export const pushModeSubtitles: Record<PushMode, string> = {
  on: "Notifications are on for this device.",
  off: "Get notified on this device when something needs you.",
  blocked: "Notifications are blocked on this device.",
  "needs-install": "Install TARTAR to get notifications on this iPhone or iPad.",
  unsupported: "This browser cannot show notifications from TARTAR.",
  unconfigured: "Notifications are not set up for TARTAR yet.",
};

export type PushToggleMode = Extract<PushMode, "on" | "off">;

export const pushModeNotes: Record<Exclude<PushMode, PushToggleMode>, string> = {
  blocked:
    "Allow notifications for TARTAR in your browser or device settings, then come back here.",
  "needs-install":
    "Add TARTAR to your home screen (see Install app), open it from there, then turn notifications on here.",
  unsupported: "Open TARTAR in Chrome, Edge or Safari, or install it as an app.",
  unconfigured: "Ask your administrator to finish the notification setup.",
};

export interface IPushSubscriptionInput {
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent: string;
}
