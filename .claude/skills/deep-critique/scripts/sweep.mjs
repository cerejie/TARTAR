import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const configPath = process.argv[2];
if (!configPath) throw new Error("usage: node sweep.mjs <sweep.config.json>");
const config = JSON.parse(readFileSync(configPath, "utf8"));
const { chromium } = await import(process.env.PW ? pathToFileURL(process.env.PW).href : "playwright-core");

const base = process.env.BASE ?? config.base;
const password = process.env.SWEEP_PASSWORD ?? config.password;
const out = process.env.OUT ?? config.out;
const onlyRoles = process.env.ROLES ? process.env.ROLES.split(",") : Object.keys(config.roles);
const onlyDevices = process.env.DEVICES ? process.env.DEVICES.split(",") : config.devices.map((d) => d.id);
const sel = config.selectors;
mkdirSync(`${out}/shots`, { recursive: true });

const manifest = [];
const browser = await chromium.launch({ channel: "chrome", headless: true });
const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "x";

const overlayOpen = (page) =>
  page.evaluate((selector) => [...document.querySelectorAll(selector)].some((el) => el.getBoundingClientRect().width > 0), sel.overlay);
const overlayTitle = (page) =>
  page.evaluate((selector) => {
    const nodes = [...document.querySelectorAll(selector)].filter((el) => el.getBoundingClientRect().width > 0);
    const top = nodes.pop();
    if (!top) return "";
    const heading = top.querySelector("h1, h2, h3, [slot=title]");
    return (heading?.textContent ?? top.getAttribute("aria-label") ?? top.textContent ?? "").trim().slice(0, 60);
  }, sel.overlay);
const closeOverlays = async (page) => {
  for (let i = 0; i < 3 && (await overlayOpen(page)); i++) {
    await page.keyboard.press("Escape");
    await page.waitForTimeout(350);
  }
};

const run = async (role, device) => {
  const context = await browser.newContext({ viewport: { width: device.w, height: device.h }, hasTouch: device.touch ?? false });
  const allow = new RegExp(`/rpc/(${config.readRpcs.join("|")})\\b`);
  await context.route(new RegExp(config.apiPattern), (route) => {
    const request = route.request();
    const method = request.method();
    if (["GET", "HEAD", "OPTIONS"].includes(method) || allow.test(request.url())) return route.continue();
    return route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });
  context.on("page", async (popup) => { await popup.waitForTimeout(800).catch(() => {}); await popup.close().catch(() => {}); });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message.split("\n")[0]));

  const shoot = async (route, surface, kind, extra = {}) => {
    const name = `${role}-${device.id}-${slug(route)}-${slug(surface)}`;
    await page.screenshot({ path: `${out}/shots/${name}.png` });
    manifest.push({ role, device: device.id, route, surface, kind, shot: `shots/${name}.png`, errors: [...errors], ...extra });
    errors.length = 0;
  };

  await page.goto(`${base}${config.loginPath}`, { waitUntil: "networkidle" });
  await page.getByLabel(config.login.emailLabel).fill(config.roles[role]);
  await page.getByLabel(config.login.passwordLabel).fill(password);
  await page.getByLabel(config.login.passwordLabel).press("Enter");
  await page.locator(sel.signedIn).first().waitFor({ state: "attached", timeout: 20000 });
  await page.waitForTimeout(2000);

  const routes = config.routes.filter((r) => !r.roles || r.roles.includes(role));
  const deep = device.deep ?? false;

  const openEach = async (route, locatorOf, labelOf, kind, max) => {
    const count = Math.min(await locatorOf().count(), max);
    for (let index = 0; index < count; index++) {
      const target = locatorOf().nth(index);
      const label = await labelOf(target, index);
      try {
        await target.scrollIntoViewIfNeeded({ timeout: 3000 });
        await target.click({ timeout: 4000, force: true });
        await page.waitForTimeout(1100);
        if (new URL(page.url()).pathname !== route.path) {
          await shoot(route.path, `${kind}-${label}`, `${kind}:navigates`);
          await page.goto(base + route.path, { waitUntil: "networkidle" });
          await page.waitForTimeout(1200);
          continue;
        }
        await shoot(route.path, `${kind}-${label}`, kind, { title: await overlayTitle(page) });
        if (kind === "card" && deep) {
          const sheetMenu = page.locator(sel.sheetMenuTrigger).last();
          if (await sheetMenu.count()) {
            await sheetMenu.click({ force: true });
            await page.waitForTimeout(600);
            await shoot(route.path, `${kind}-${label}-menu`, "sheet-menu");
          }
        }
      } catch (error) {
        manifest.push({ role, device: device.id, route: route.path, surface: `${kind}-${label}`, kind, shot: null, failure: String(error.message).split("\n")[0] });
      }
      await closeOverlays(page);
    }
  };

  for (const route of routes) {
    await page.goto(base + route.path, { waitUntil: "networkidle" }).catch(() => {});
    await page.waitForTimeout(route.settle ?? 1800);
    await shoot(route.path, "page", "page", { finalPath: new URL(page.url()).pathname });
    if (device.dark) {
      await page.evaluate(() => document.documentElement.classList.add("dark"));
      await page.waitForTimeout(250);
      await shoot(route.path, "page-dark", "page");
      await page.evaluate(() => document.documentElement.classList.remove("dark"));
    }
    if (!deep) continue;

    await openEach(route, () => page.locator(sel.toolbarTriggers), async (t, i) => (await t.getAttribute("aria-label")) ?? ((await t.innerText()).trim() || `btn${i}`), "toolbar", 6);

    const tabs = page.locator(sel.tabs);
    const tabCount = Math.min(await tabs.count(), 6);
    const tabNames = [];
    for (let i = 0; i < tabCount; i++) tabNames.push((await tabs.nth(i).innerText()).trim());
    for (const tabName of tabCount ? tabNames : [""]) {
      if (tabName) {
        await page.locator(sel.tabs).filter({ hasText: tabName }).first().click({ force: true }).catch(() => {});
        await page.waitForTimeout(1500);
        await shoot(route.path, `tab-${tabName}`, "tab");
      }
      if (device.cards) {
        await openEach(route, () => page.locator(sel.cards), async (_, i) => `${slug(tabName || "all")}-${i}`, "card", route.cards ?? 2);
      } else {
        const menus = page.locator(sel.rowMenus);
        if (await menus.count()) {
          await menus.first().click({ force: true });
          await page.waitForTimeout(600);
          const items = (await page.locator(sel.menuItems).allInnerTexts()).map((t) => t.split("\n")[0].trim()).filter(Boolean);
          await shoot(route.path, `row-menu-${tabName || "all"}`, "row-menu", { items });
          await closeOverlays(page);
          for (const item of items) {
            if (config.skipItems?.some((skip) => new RegExp(skip, "i").test(item))) continue;
            await page.locator(sel.rowMenus).first().click({ force: true });
            await page.waitForTimeout(500);
            await openEach(route, () => page.locator(sel.menuItems).filter({ hasText: item }), async () => slug(`${tabName}-${item}`), "menu-item", 1);
          }
        }
      }
    }
    await page.goto(base + route.path, { waitUntil: "networkidle" }).catch(() => {});
  }

  if (deep) {
    await page.goto(base + config.homePath, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await openEach({ path: config.homePath }, () => page.locator(sel.headerTriggers), async (t, i) => (await t.getAttribute("aria-label")) ?? ((await t.innerText()).trim().split("\n")[0] || `hdr${i}`), "header", 10);
  }
  await context.close();
};

for (const role of onlyRoles) {
  for (const device of config.devices.filter((d) => onlyDevices.includes(d.id))) {
    const started = manifest.length;
    await run(role, device).catch((error) => manifest.push({ role, device: device.id, route: "*", surface: "run", shot: null, failure: String(error.message).split("\n")[0] }));
    console.log(`${role} ${device.id}: ${manifest.length - started} surfaces`);
    writeFileSync(`${out}/manifest.json`, JSON.stringify(manifest, null, 1));
  }
}

const sheetPage = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const groups = new Map();
for (const entry of manifest.filter((m) => m.shot)) {
  const key = `${entry.role}-${entry.device}`;
  groups.set(key, [...(groups.get(key) ?? []), entry]);
}
const sheets = [];
for (const [key, entries] of groups) {
  const perSheet = entries[0].device === "desk" || entries[0].device === "tabL" ? 6 : 8;
  const columns = perSheet === 6 ? 3 : 4;
  for (let start = 0; start < entries.length; start += perSheet) {
    const chunk = entries.slice(start, start + perSheet);
    const html = `<html><body style="margin:0;font:12px sans-serif;background:#888;display:grid;grid-template-columns:repeat(${columns},1fr);gap:6px;padding:6px">${chunk
      .map((e) => `<figure style="margin:0;background:#fff"><figcaption style="padding:3px 5px;background:#222;color:#fff">#${manifest.indexOf(e)} ${e.route} · ${e.surface}</figcaption><img style="width:100%;display:block" src="${pathToFileURL(`${out}/${e.shot}`).href}"></figure>`)
      .join("")}</body></html>`;
    await sheetPage.setContent(html, { waitUntil: "load" });
    const file = `${out}/sheet-${key}-${String(start / perSheet + 1).padStart(2, "0")}.png`;
    await sheetPage.screenshot({ path: file, fullPage: true });
    sheets.push(file);
  }
}
writeFileSync(`${out}/sheets.json`, JSON.stringify(sheets, null, 1));
console.log(`done: ${manifest.length} surfaces, ${manifest.filter((m) => !m.shot).length} failed, ${sheets.length} contact sheets in ${out}`);
await browser.close();
