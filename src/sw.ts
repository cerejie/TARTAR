import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";

declare const self: ServiceWorkerGlobalScope;

type IPushMessage = {
  title: string;
  body: string;
  url: string;
  tag?: string;
};

const adminScope = "/admin";
const fallbackMessage: IPushMessage = { title: "TARTAR", body: "", url: "/" };

const isAdminPath = (pathname: string): boolean =>
  pathname === adminScope || pathname.startsWith(`${adminScope}/`);

const pushMessageOf = (data: PushMessageData | null): IPushMessage => {
  if (!data) return fallbackMessage;
  try {
    const message: unknown = data.json();
    if (typeof message !== "object" || message === null) return fallbackMessage;
    const candidate = message as Partial<IPushMessage>;
    return {
      title: candidate.title ?? fallbackMessage.title,
      body: candidate.body ?? fallbackMessage.body,
      url: candidate.url ?? fallbackMessage.url,
      tag: candidate.tag,
    };
  } catch {
    return { ...fallbackMessage, body: data.text() };
  }
};

const urlOf = (notification: Notification): URL => {
  const data: unknown = notification.data;
  const path =
    typeof data === "object" && data !== null && "url" in data && typeof data.url === "string"
      ? data.url
      : "/";
  return new URL(path, self.location.origin);
};

const openTarget = async (target: URL): Promise<void> => {
  const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  const targetIsAdmin = isAdminPath(target.pathname);
  const sameScope = windows.find(
    (client) => isAdminPath(new URL(client.url).pathname) === targetIsAdmin
  );

  if (!sameScope) {
    await self.clients.openWindow(target.href);
    return;
  }

  const focused = await sameScope.focus();
  if (new URL(focused.url).pathname === target.pathname) return;
  await focused.navigate(target.href).catch(() => self.clients.openWindow(target.href));
};

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") void self.skipWaiting();
});

self.addEventListener("push", (event) => {
  const message = pushMessageOf(event.data);
  event.waitUntil(
    self.registration.showNotification(message.title, {
      body: message.body,
      tag: message.tag,
      icon: "/icon-192.png",
      data: { url: message.url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(openTarget(urlOf(event.notification)));
});

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();
registerRoute(new NavigationRoute(createHandlerBoundToURL("index.html")));
