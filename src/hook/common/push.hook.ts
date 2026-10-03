import { useEffect } from "react";
import { toast } from "sonner";
import { pushModeNotes } from "../../models/common/push.model";
import pushServices from "../../services/data/push.services";
import { selectInstalled, useInstallStore } from "../../store/common/install.store";
import { selectOnline, useNetworkStore } from "../../store/common/network.store";
import {
  selectPushPermission,
  selectPushPromptDismissed,
  selectPushPromptOffered,
  selectPushSubscribed,
  usePushStore,
} from "../../store/common/push.store";
import {
  applicationServerKeyOf,
  subscriptionInputOf,
  usesServerKey,
  vapidPublicKey,
} from "../../utils/push.utils";
import { usePermissions } from "../account/account.permission.hook";
import { isAppleTouchDevice } from "./install.hook";
import { useMutation } from "./mutation.hook";

import type { IPermissions } from "../../models/common/permission.model";
import type { PushMode } from "../../models/common/push.model";

const offerDurationMs = 10_000;
const blockedMessage =
  "Notifications are blocked. Allow them for TARTAR in your browser or device settings.";
const noWorkerMessage =
  "Notifications need the installed app or the published site. Reload and try again.";
const incompleteMessage = "This device returned an incomplete push subscription.";

const pushSummaryOf = ({ isManager, encodeTransactions }: IPermissions): string => {
  if (isManager) {
    return "Vouchers, payments and deposited sales waiting for your review, and a due digest every morning at 8.";
  }
  if (encodeTransactions) {
    return "Your vouchers and sales as soon as they are approved, verified or rejected.";
  }
  return "A digest every morning at 8 of the receivables and payables due today or overdue.";
};

const isPushSupported = (): boolean =>
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window;

const currentRegistration = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!isPushSupported()) return null;
  return (await navigator.serviceWorker.getRegistration()) ?? null;
};

const currentSubscription = async (): Promise<PushSubscription | null> => {
  const registration = await currentRegistration();
  return registration ? registration.pushManager.getSubscription() : null;
};

const currentKeySubscriptionOf = async (
  registration: ServiceWorkerRegistration
): Promise<PushSubscription | null> => {
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription || usesServerKey(subscription, vapidPublicKey)) return subscription;
  await pushServices.remove(subscription.endpoint).catch(() => undefined);
  await subscription.unsubscribe();
  return null;
};

const subscribeThisDevice = async (): Promise<void> => {
  const permission = await Notification.requestPermission();
  usePushStore.getState().setPermission(permission);
  if (permission !== "granted") throw new Error(blockedMessage);

  const registration = await currentRegistration();
  if (!registration) throw new Error(noWorkerMessage);

  const subscription =
    (await currentKeySubscriptionOf(registration)) ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKeyOf(vapidPublicKey),
    }));
  const input = subscriptionInputOf(subscription, navigator.userAgent);
  if (!input) throw new Error(incompleteMessage);

  await pushServices.save(input);
  usePushStore.getState().setSubscribed(true);
};

const unsubscribeThisDevice = async (): Promise<void> => {
  const subscription = await currentSubscription();
  if (subscription) {
    await pushServices.remove(subscription.endpoint);
    await subscription.unsubscribe();
  }
  usePushStore.getState().setSubscribed(false);
};

export const releasePushSubscription = async (): Promise<void> => {
  const subscription = await currentSubscription().catch(() => null);
  if (!subscription) return;
  await pushServices.remove(subscription.endpoint).catch(() => undefined);
  await subscription.unsubscribe().catch(() => false);
  usePushStore.getState().setSubscribed(false);
};

export const usePushStatusListener = () => {
  const setPermission = usePushStore((state) => state.setPermission);
  const setSubscribed = usePushStore((state) => state.setSubscribed);

  useEffect(() => {
    if (!isPushSupported()) return;
    const listeners = new AbortController();

    const sync = () => {
      setPermission(Notification.permission);
      void currentSubscription()
        .then((subscription) =>
          setSubscribed(
            subscription !== null && usesServerKey(subscription, vapidPublicKey)
          )
        )
        .catch(() => setSubscribed(false));
    };

    sync();
    document.addEventListener("visibilitychange", sync, { signal: listeners.signal });

    return () => listeners.abort();
  }, [setPermission, setSubscribed]);
};

export const usePushNotifications = () => {
  const permission = usePushStore(selectPushPermission);
  const subscribed = usePushStore(selectPushSubscribed);
  const installed = useInstallStore(selectInstalled);
  const permissions = usePermissions();

  const enableMutation = useMutation(subscribeThisDevice, {
    successMessage: "Notifications are on for this device",
  });
  const disableMutation = useMutation(unsubscribeThisDevice, {
    successMessage: "Notifications are off for this device",
  });

  const modeOf = (): PushMode => {
    if (!vapidPublicKey) return "unconfigured";
    if (!isPushSupported()) {
      return isAppleTouchDevice() && !installed ? "needs-install" : "unsupported";
    }
    if (permission === "denied") return "blocked";
    return subscribed ? "on" : "off";
  };

  const mode = modeOf();
  const summary = pushSummaryOf(permissions);
  const canToggle = mode === "on" || mode === "off";

  return {
    mode,
    summary,
    canToggle,
    note: mode === "on" || mode === "off" ? summary : pushModeNotes[mode],
    enable: () => void enableMutation.mutate(),
    disable: () => void disableMutation.mutate(),
    enabling: enableMutation.loading,
    disabling: disableMutation.loading,
  };
};

export const usePushPrompt = () => {
  const { mode, summary, enable, enabling } = usePushNotifications();
  const promptDismissed = usePushStore(selectPushPromptDismissed);
  const dismissPrompt = usePushStore((state) => state.dismissPrompt);

  return {
    pushPromptVisible: mode === "off" && !promptDismissed,
    pushSummary: summary,
    enablePush: enable,
    enablingPush: enabling,
    dismissPushPrompt: dismissPrompt,
  };
};

export const usePushOffer = () => {
  const { mode, enable } = usePushNotifications();
  const { isManager } = usePermissions();
  const promptDismissed = usePushStore(selectPushPromptDismissed);
  const promptOffered = usePushStore(selectPushPromptOffered);
  const dismissPrompt = usePushStore((state) => state.dismissPrompt);
  const markPromptOffered = usePushStore((state) => state.markPromptOffered);

  return () => {
    if (isManager || mode !== "off" || promptDismissed || promptOffered) return;
    if (!selectOnline(useNetworkStore.getState())) return;
    markPromptOffered();
    toast("Get a notification when it is decided?", {
      duration: offerDurationMs,
      action: { label: "Notify me", onClick: enable },
      cancel: { label: "Not now", onClick: dismissPrompt },
    });
  };
};
