import { useEffect } from "react";

type IHeadEntry = {
  readonly tag: "link" | "meta";
  readonly key: "rel" | "name";
  readonly keyValue: string;
  readonly attribute: "href" | "content";
  readonly value: string;
};

const adminAppTitle = "TARTAR Admin";
const adminManifestHref = "/admin.webmanifest";
const adminTouchIconHref = "/apple-touch-icon-admin.png";
const adminFaviconHref = "/admin-icon.svg";
const themeColorToken = "--panel";
const adminViewport = "width=device-width, initial-scale=1.0, viewport-fit=cover";
const themeColorSelector = 'meta[name="theme-color"]';

const readThemeColor = (): string =>
  getComputedStyle(document.documentElement)
    .getPropertyValue(themeColorToken)
    .trim();

const swapHeadEntry = ({
  tag,
  key,
  keyValue,
  attribute,
  value,
}: IHeadEntry): (() => void) => {
  const existing = document.head.querySelector(`${tag}[${key}="${keyValue}"]`);

  if (!existing) {
    const created = document.createElement(tag);
    created.setAttribute(key, keyValue);
    created.setAttribute(attribute, value);
    document.head.append(created);
    return () => created.remove();
  }

  const previous = existing.getAttribute(attribute);
  existing.setAttribute(attribute, value);

  return () =>
    previous === null
      ? existing.removeAttribute(attribute)
      : existing.setAttribute(attribute, previous);
};

export const useAdminManifestHook = (enabled = true) => {
  useEffect(() => {
    if (!enabled) return;

    const previousTitle = document.title;

    const restorers = [
      swapHeadEntry({
        tag: "link",
        key: "rel",
        keyValue: "manifest",
        attribute: "href",
        value: adminManifestHref,
      }),
      swapHeadEntry({
        tag: "link",
        key: "rel",
        keyValue: "icon",
        attribute: "href",
        value: adminFaviconHref,
      }),
      swapHeadEntry({
        tag: "link",
        key: "rel",
        keyValue: "apple-touch-icon",
        attribute: "href",
        value: adminTouchIconHref,
      }),
      swapHeadEntry({
        tag: "meta",
        key: "name",
        keyValue: "theme-color",
        attribute: "content",
        value: readThemeColor(),
      }),
      swapHeadEntry({
        tag: "meta",
        key: "name",
        keyValue: "viewport",
        attribute: "content",
        value: adminViewport,
      }),
      swapHeadEntry({
        tag: "meta",
        key: "name",
        keyValue: "apple-mobile-web-app-title",
        attribute: "content",
        value: adminAppTitle,
      }),
    ];

    document.title = adminAppTitle;

    const syncThemeColor = () =>
      document.head.querySelector(themeColorSelector)?.setAttribute("content", readThemeColor());
    const modeObserver = new MutationObserver(syncThemeColor);
    modeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      modeObserver.disconnect();
      restorers.forEach((restore) => restore());
      document.title = previousTitle;
    };
  }, [enabled]);
};
