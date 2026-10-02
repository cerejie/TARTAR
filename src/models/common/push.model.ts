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

export interface IPushSubscriptionInput {
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent: string;
}
