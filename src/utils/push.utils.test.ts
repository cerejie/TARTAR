import { describe, expect, it } from "vitest";
import { pushPlatformOf } from "./push.utils";

const androidAgent =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36";
const desktopAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36";

describe("pushPlatformOf", () => {
  it("reads an Apple touch device as iOS", () => {
    expect(pushPlatformOf(desktopAgent, true)).toBe("ios");
  });

  it("reads an Android agent as Android", () => {
    expect(pushPlatformOf(androidAgent, false)).toBe("android");
  });

  it("falls back to desktop", () => {
    expect(pushPlatformOf(desktopAgent, false)).toBe("desktop");
  });
});
