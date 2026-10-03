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

export type PushPlatform = "ios" | "android" | "desktop";

export const pushBlockedSteps: Record<PushPlatform, string> = {
  ios: "Notifications are blocked. Open Settings › Notifications › TARTAR and turn on Allow Notifications, then come back here.",
  android:
    "Notifications are blocked. In Chrome, tap the icon left of the address bar (or ⋮ › Settings › Site settings), open Notifications and choose Allow. For the installed app, long-press the TARTAR icon › App info › Notifications. Then come back here.",
  desktop:
    "Notifications are blocked. Click the lock or settings icon left of the address bar, set Notifications to Allow, then come back here.",
};

export const pushModeNotes: Record<
  Exclude<PushMode, PushToggleMode | "blocked">,
  string
> = {
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
