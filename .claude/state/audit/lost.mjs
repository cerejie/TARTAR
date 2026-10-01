import { chromium } from "playwright-core";
const base = "http://localhost:4199";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const P = await ctx.newPage();
const log = (...a) => console.log(...a);
await P.goto(`${base}/`, { waitUntil: "networkidle" });
await P.getByLabel("Email").fill("qaadmin1@qa.test"); await P.getByLabel("Password").fill("QaTest#2026");
await P.locator("button[type=submit]").click(); await P.waitForTimeout(6000);
await P.goto(`${base}/sales`, { waitUntil: "networkidle" }); await P.getByRole("button", { name: "Record sale" }).first().waitFor({ timeout: 20000 }); await P.waitForTimeout(3000);
const queue = () => P.evaluate(() => { const s = JSON.parse(localStorage.getItem("tartar-sync-queue") || "{}").state || {}; return { q: (s.queue || []).map((w) => w.label), f: (s.failed || []).map((x) => x.write.label + " => " + x.reason) }; });
let dropped = 0;
await P.route(/rest\/v1\/(transactions|rpc)/, async (route) => {
  const m = route.request().method();
  if (m !== "GET" && dropped < 1) { dropped++; const r = await route.fetch(); log("server applied", m, r.status(), "-> reply dropped"); return route.abort("connectionreset"); }
  return route.continue();
});
const menu = async (amt, item) => { const row = P.locator("tbody tr").filter({ hasText: amt }).first(); await row.locator("td:last-child button").last().click(); await P.waitForTimeout(500); await P.locator("[role=menuitem]").filter({ hasText: item }).first().click(); await P.waitForTimeout(800); };
await menu("₱931.00", "Delete sale");
const d = P.locator("[role=alertdialog],[role=dialog]").last(); await d.locator("button").last().click(); await P.waitForTimeout(4000);
log("after delete w/ dropped reply:", JSON.stringify(await queue()));
await P.waitForTimeout(35000);
log("after 35s retry:", JSON.stringify(await queue()));
await browser.close();
