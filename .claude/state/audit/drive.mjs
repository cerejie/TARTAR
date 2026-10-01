import { chromium } from "playwright-core";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";

const base = process.env.BASE ?? "http://localhost:5199";
const dir = new URL(".", import.meta.url).pathname.slice(1);
const steps = JSON.parse(readFileSync(process.argv[2], "utf8"));
const profileName = process.env.PROFILE ?? "profile";
const tag = process.env.TAG ?? profileName;
mkdirSync(`${dir}shots/drive`, { recursive: true });

const launchOptions = [`${dir}${profileName}`, {
  channel: "chrome",
  headless: process.env.HEADED ? false : true,
  viewport: { width: Number(process.env.W ?? 1440), height: Number(process.env.H ?? 900) },
}];
const browser = process.env.EPHEMERAL ? await chromium.launch({ channel: "chrome", headless: !process.env.HEADED }) : null;
const context = browser ? await browser.newContext({ viewport: launchOptions[1].viewport }) : await chromium.launchPersistentContext(...launchOptions);
const page = context.pages()[0] ?? (await context.newPage());
const out = [];
const log = (s) => { out.push(s); console.log(`[${tag}] ${s}`); };
page.on("pageerror", (e) => log(`  !! pageerror ${e.message.split("\n")[0]}`));
page.on("console", (m) => m.type() === "error" && !/favicon|Download the React DevTools|ERR_INTERNET_DISCONNECTED/.test(m.text()) && log(`  !! console ${m.text().slice(0, 300)}`));
page.on("response", async (r) => {
  if (r.status() < 400 || /favicon/.test(r.url())) return;
  let body = "";
  try { body = (await r.text()).slice(0, 300); } catch {}
  log(`  !! HTTP ${r.status()} ${r.request().method()} ${r.url().split("?")[0].replace(/^.*supabase\.co|^http:\/\/localhost:5199/, "")} ${body}`);
});
const dialog = () => page.locator("[role=dialog]").last();
const scope = (s) => (s.inDialog === false ? page : (s.page ? page : null)) ?? page;
const shot = async (name) => page.screenshot({ path: `${dir}shots/drive/${tag}-${name}.png`, fullPage: false });
const dumpDialog = () => page.evaluate(() => {
  const d = [...document.querySelectorAll("[role=dialog]")].pop();
  if (!d) return "NO DIALOG";
  return [...d.querySelectorAll("label, input, button, textarea, [role=combobox], [role=radio], [role=checkbox], [role=switch]")]
    .filter((e) => e.offsetParent !== null)
    .map((e) => `${e.tagName.toLowerCase()}${e.getAttribute("role") ? `[${e.getAttribute("role")}]` : ""}${e.getAttribute("name") ? ` name=${e.getAttribute("name")}` : ""}${e.getAttribute("aria-label") ? ` aria="${e.getAttribute("aria-label")}"` : ""} "${(e.textContent || "").trim().slice(0, 50)}"${e.value ? ` =${e.value}` : ""}`)
    .join("\n");
});
const combobox = (label) => page.getByRole("combobox", { name: label }).last();

const pick = async (label, text) => {
  const box = combobox(label);
  await box.click({ timeout: 5000 });
  if (text && (await box.evaluate((e) => e.tagName === "INPUT"))) { await box.fill(""); await box.pressSequentially(text, { delay: 25 }); }
  await page.waitForTimeout(600);
  const options = page.locator("[role=option]");
  const opt = text ? options.filter({ hasText: text }).first() : options.first();
  if (text && (!(await opt.count()) || /No close match/.test(await opt.innerText()))) { await dialog().locator("h2, [slot=title]").first().click({ position: { x: 2, y: 2 } }); await page.waitForTimeout(300); return `typed "${text}" (no option)`; }
  const chosen = (await opt.innerText({ timeout: 4000 })).trim().replace(/\n/g, " ");
  await opt.click();
  await page.waitForTimeout(300);
  return chosen;
};
const pickDate = async (fieldText, dayLabel) => {
  await dialog().locator(`button:has-text('${fieldText}')`).first().click({ timeout: 5000 });
  await page.waitForTimeout(500);
  const cell = () => page.locator(`[role=button][aria-label$="${dayLabel}"]:not([aria-disabled=true])`);
  for (let i = 0; i < 3 && !(await cell().count()); i++) {
    await page.locator('button[aria-label="Next"]').first().click();
    await page.waitForTimeout(300);
  }
  await cell().first().click({ timeout: 5000 });
  await page.waitForTimeout(400);
  if (await page.locator('button[aria-label="month"]').count()) { log("  (calendar stayed open after picking; Escape)"); await page.keyboard.press("Escape"); await page.waitForTimeout(400); }
};
const rowOf = (text) => page.locator("tbody tr").filter({ hasText: text }).first();

let failed = false;
for (const s of steps) {
  if (failed && !s.always) continue;
  const label = s.note ?? JSON.stringify(s).slice(0, 120);
  try {
    if (s.login) {
      await context.clearCookies();
      await page.goto(`${base}/login`);
      await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
      await page.goto(`${base}/`, { waitUntil: "networkidle" });
      await page.getByLabel("Email").fill(s.login[0]);
      await page.getByLabel("Password").fill(s.login[1]);
      await page.locator("button[type=submit]").click();
      await page.waitForURL((u) => !/\/login$/.test(u.pathname), { timeout: 15000 });
      await page.waitForTimeout(2500);
    }
    if (s.sync) {
      const barDir = `${dir}bar/${process.env.RUN}`;
      mkdirSync(barDir, { recursive: true });
      writeFileSync(`${barDir}/${s.sync}--${tag}`, "");
      const parties = Number(process.env.PARTIES ?? 1);
      for (let i = 0; i < 600 && readdirSync(barDir).filter((f) => f.startsWith(`${s.sync}--`)).length < parties; i++) await page.waitForTimeout(500);
      log(`  sync ${s.sync} @ ${new Date().toISOString().slice(11, 23)}`);
    }
    if (s.offline !== undefined) { await context.setOffline(s.offline); await page.waitForTimeout(s.offline ? 1200 : 6000); }
    if (s.blockApi !== undefined) { if (s.blockApi) await page.route(/supabase\.co/, (r) => r.abort("internetdisconnected")); else await page.unroute(/supabase\.co/); }
    if (s.nav) { await page.getByRole("link", { name: s.nav, exact: true }).first().click({ timeout: 6000 }); await page.waitForTimeout(s.settle ?? 2500); }
    if (s.js) log(`  js: ${JSON.stringify(await page.evaluate(s.js)).slice(0, 1500)}`);
    if (s.queue) {
      const q = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem("tartar-sync-queue") ?? "{}")?.state?.queue ?? []; } catch { return "unreadable"; } });
      log(`  queue(${Array.isArray(q) ? q.length : q}): ${Array.isArray(q) ? q.map((w) => w.label).join(" ; ") : ""}`);
    }
    if (s.goto) { await page.goto(base + s.goto, { waitUntil: "networkidle" }); await page.waitForTimeout(s.settle ?? 1500); }
    if (s.reload) { await page.reload({ waitUntil: "networkidle" }); await page.waitForTimeout(1500); }
    if (s.button) await (s.page ? page : (await page.locator("[role=dialog]").count()) ? dialog() : page).getByRole("button", { name: s.button, exact: s.exact ?? false }).first().click({ timeout: 6000 });
    if (s.tab) await page.getByRole("tab", { name: s.tab }).first().click({ timeout: 6000 });
    if (s.click) await page.locator(s.click).first().click({ timeout: 6000 });
    if (s.popupItem || s.popupButton) {
      const trigger = s.popupItem ? page.locator("[role=menuitem]").filter({ hasText: s.popupItem }).first() : page.locator("[role=dialog]").last().getByRole("button", { name: s.popupButton }).last();
      const [popup] = await Promise.all([context.waitForEvent("page", { timeout: 10000 }), trigger.click({ timeout: 6000 })]);
      await popup.waitForTimeout(1500);
      await popup.setViewportSize({ width: 900, height: 1200 });
      log(`  popup text: ${(await popup.locator("body").innerText()).split(/\n+/).join(" | ").slice(0, 1500)}`);
      await popup.screenshot({ path: `${dir}shots/drive/${tag}-${s.name ?? "popup"}-popup.png`, fullPage: true });
      await popup.close();
    }
    if (s.row) {
      const row = rowOf(s.row);
      await row.scrollIntoViewIfNeeded({ timeout: 6000 });
      if (s.expand) await row.locator("td:first-child button").first().click();
      if (s.item) {
        await row.locator("td:last-child button, button[aria-label*='ction']").last().click({ timeout: 6000 });
        await page.waitForTimeout(500);
        await page.locator("[role=menuitem]").filter({ hasText: s.item }).first().click({ timeout: 6000 });
      }
      if (s.dbl) await row.dblclick();
    }
    if (s.fill) for (const [sel, value] of Object.entries(s.fill)) {
      const target = /^[a-z_]+$/.test(sel) ? dialog().locator(`[name="${sel}"]`).first() : /[\[\]=]/.test(sel) ? page.locator(sel).first() : page.getByLabel(sel).last();
      await target.fill(String(value), { timeout: 5000 });
    }
    if (s.pick) for (const [lab, text] of Object.entries(s.pick)) log(`  picked ${lab}: ${await pick(lab, text || undefined)}`);
    if (s.date) await pickDate(s.date[0], s.date[1]);
    if (s.check) await dialog().getByRole(s.checkRole ?? "checkbox", { name: s.check }).first().click();
    if (s.press) await page.keyboard.press(s.press);
    await page.waitForTimeout(s.wait ?? 800);
    if (s.submit) {
      await dialog().getByRole("button", { name: s.submit, exact: true }).last().click({ timeout: 6000 });
      await page.waitForTimeout(s.submitWait ?? 3500);
      if (s.confirm) {
        await page.locator("[role=alertdialog], [role=dialog]").last().getByRole("button", { name: s.confirm, exact: true }).last().click({ timeout: 6000 });
        await page.waitForTimeout(3500);
      }
      if ((await page.locator("[role=dialog], [role=alertdialog]").count()) && !s.keepOpen) {
        await shot(`${s.name ?? "stuck"}-stuck`);
        throw new Error(`dialog still open: ${(await page.locator("[role=dialog], [role=alertdialog]").last().innerText()).replace(/\n+/g, " | ").slice(0, 500)}`);
      }
    }
    if (s.confirmOnly) {
      await page.locator("[role=alertdialog], [role=dialog]").last().getByRole("button", { name: s.confirmOnly, exact: true }).last().click({ timeout: 6000 });
      await page.waitForTimeout(3500);
    }
    if (s.dump) log(`  dialog:\n${(await dumpDialog()).replace(/^/gm, "    ")}`);
    if (s.text) log(`  text(${s.text}): ${(await page.locator(s.text).first().innerText({ timeout: 5000 })).replace(/\n+/g, " | ").slice(0, s.max ?? 1500)}`);
    if (s.count) log(`  count(${s.count}): ${await page.locator(s.count).count()}`);
    if (s.expect) {
      const has = await page.getByText(s.expect, { exact: false }).first().isVisible().catch(() => false);
      log(`  expect "${s.expect}": ${has ? "YES" : "NO"}`);
    }
    if (s.absent) {
      const has = await page.getByText(s.absent, { exact: false }).first().isVisible().catch(() => false);
      log(`  absent "${s.absent}": ${has ? "PRESENT (!)" : "ok"}`);
    }
    if (s.url) log(`  url: ${page.url()}`);
    if (s.toasts) log(`  toasts: ${(await page.locator("[data-sonner-toast]").allInnerTexts()).join(" || ").replace(/\n/g, " ")}`);
    if (s.name) await shot(s.name);
    log(`ok ${label}`);
  } catch (e) {
    log(`FAIL ${label} :: ${e.message.split("\n")[0]}`);
    await shot(`${s.name ?? "fail"}-FAIL`).catch(() => {});
    if (s.stop) failed = true;
    await page.keyboard.press("Escape").catch(() => {});
  }
}
await context.close();
if (browser) await browser.close();
