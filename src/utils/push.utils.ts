import type { IPushSubscriptionInput } from "../models/common/push.model";

export const vapidPublicKey: string = import.meta.env.VITE_VAPID_PUBLIC_KEY ?? "";

export const applicationServerKeyOf = (base64Url: string): Uint8Array<ArrayBuffer> => {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const key = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    key[index] = binary.charCodeAt(index);
  }
  return key;
};

export const usesServerKey = (
  subscription: PushSubscription,
  base64Url: string
): boolean => {
  const subscribedKey = subscription.options.applicationServerKey;
  if (!subscribedKey) return false;
  const subscribedBytes = new Uint8Array(subscribedKey);
  const expectedBytes = applicationServerKeyOf(base64Url);
  return (
    subscribedBytes.length === expectedBytes.length &&
    subscribedBytes.every((byte, index) => byte === expectedBytes[index])
  );
};

export const subscriptionInputOf = (
  subscription: PushSubscription,
  userAgent: string
): IPushSubscriptionInput | null => {
  const { endpoint, keys } = subscription.toJSON();
  const p256dh = keys?.p256dh;
  const auth = keys?.auth;
  if (!endpoint || !p256dh || !auth) return null;
  return { endpoint, p256dh, auth, userAgent };
};
