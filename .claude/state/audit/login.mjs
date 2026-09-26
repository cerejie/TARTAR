import { chromium } from "playwright-core";

const profile = new URL("./profile", import.meta.url).pathname.slice(1);
const context = await chromium.launchPersistentContext(profile, {
  channel: "chrome",
  headless: false,
  viewport: { width: 1440, height: 900 },
});
const page = context.pages()[0] ?? (await context.newPage());
await page.goto("http://localhost:5199/login");
console.log("Waiting for sign-in (10 min max)...");
await page.waitForURL((url) => !/\/(login|register)$/.test(url.pathname), { timeout: 600000 });
await page.waitForTimeout(4000);
console.log("Signed in at", page.url());
await context.close();
