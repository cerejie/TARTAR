import { chromium } from "playwright-core";
import { mkdirSync, readFileSync } from "node:fs";

const base = "http://localhost:5199";
const dir = new URL(".", import.meta.url).pathname.slice(1);
const specs = JSON.parse(readFileSync(process.argv[2], "utf8"));
mkdirSync(`${dir}shots`, { recursive: true });

const options = { channel: "chrome", headless: true, viewport: { width: 1440, height: 900 } };
const context = await chromium.launchPersistentContext(`${dir}profile`, options);
const blocked = [];
let rewrite = null;
await context.route(/supabase\.co\/(rest|functions)\//, async (route) => {
  const request = route.request();
  const isRead = request.method() === "GET" || request.method() === "HEAD" || request.method() === "OPTIONS";
  const isReadRpc = request.method() === "POST" && /\/rpc\/(get_|list_|count_|dashboard|report|has_|is_|current_)/.test(request.url());
  if (request.method() === "GET" && rewrite && request.url().includes(`/rest/v1/${rewrite.table}`)) {
    const response = await route.fetch();
    const body = await response.json();
    const patch = (row) => ({ ...row, ...rewrite.set });
    const patched = Array.isArray(body) ? body.map(patch) : patch(body);
    return route.fulfill({ response, json: patched });
  }
  if (isRead || isReadRpc) return route.continue();
  blocked.push(`${request.method()} ${request.url().split("?")[0]}`);
  return route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
});
const page = context.pages()[0] ?? (await context.newPage());
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

for (const spec of specs) {
  try {
    rewrite = spec.rewrite ?? null;
    await page.setViewportSize({ width: spec.w ?? 1440, height: spec.h ?? 900 });
    if (spec.path) {
      await page.goto(base + spec.path, { waitUntil: "networkidle" });
      await page.waitForTimeout(spec.settle ?? 1500);
    }
    let popup = null;
    for (const action of spec.actions ?? []) {
      if (action.popup) {
        const [opened] = await Promise.all([
          context.waitForEvent("page", { timeout: 8000 }),
          page.locator(action.popup).first().click({ timeout: 5000 }),
        ]);
        popup = opened;
      }
      if (action.click) await page.locator(action.click).first().click({ timeout: 5000 });
      if (action.hover) await page.locator(action.hover).first().hover({ timeout: 5000 });
      if (action.press) await page.keyboard.press(action.press);
      if (action.fill) await page.locator(action.fill[0]).first().fill(action.fill[1]);
      if (action.scroll) await page.locator(action.scroll).first().evaluate((el) => (el.scrollTop = el.scrollHeight));
      await page.waitForTimeout(action.wait ?? 700);
    }
    await page.evaluate((on) => document.documentElement.classList.toggle("dark", on), !!spec.dark);
    await page.waitForTimeout(300);
    if (popup) {
      await popup.setViewportSize({ width: 900, height: 1200 });
      await popup.waitForTimeout(800);
      await popup.screenshot({ path: `${dir}shots/${spec.name}.png`, fullPage: true });
      await popup.close();
    } else {
      await page.screenshot({ path: `${dir}shots/${spec.name}.png` });
    }
    console.log("ok", spec.name);
  } catch (e) {
    console.log("FAIL", spec.name, e.message.split("\n")[0]);
  }
}
if (blocked.length) console.log("writes faked:", [...new Set(blocked)].join("\n"));
if (errors.length) console.log("console errors:", [...new Set(errors)].slice(0, 15).join("\n"));
await context.close();
