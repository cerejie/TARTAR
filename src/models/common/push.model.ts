export type PushMode =
  | "unconfigured"
  | "unsupported"
  | "needs-install"
  | "blocked"
  | "off"
  | "on";

export interface IPushSubscriptionInput {
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent: string;
}
