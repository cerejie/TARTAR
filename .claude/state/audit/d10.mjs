import { mkdirSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const { chromium } = await import(process.env.PW ? pathToFileURL(process.env.PW).href : "playwright-core");
const base = process.env.BASE ?? "http://localhost:5199";
const out = process.env.OUT ?? new URL("./shots/d10", import.meta.url).pathname.slice(1);
mkdirSync(out, { recursive: true });

const password = process.env.QA_PASSWORD;
if (!password) throw new Error("Set QA_PASSWORD to the QA accounts' password");
const roles = { emp: "qaemp1", acc: "qaacc1", admin: "qaadmin2" };
const only = process.env.ROLES ? process.env.ROLES.split(",") : Object.keys(roles);
const devices = [
  { id: "phone", w: 390, h: 844 },
  { id: "tabP", w: 820, h: 1180 },
  { id: "tabL", w: 1180, h: 820 },
  { id: "desk", w: 1440, h: 900 },
];
const mainPaths = ["/", "/transactions", "/sales", "/purchases", "/expenses", "/vouchers", "/receivables", "/payables", "/reports", "/branches", "/master-data", "/users", "/account"];
const adminPaths = ["/admin", "/admin/payables", "/admin/receivables", "/admin/notifications"];

const probe = () => {
  const vw = document.documentElement.clientWidth;
  const clipped = (el) => {
    for (let p = el.parentElement; p; p = p.parentElement) {
      const ox = getComputedStyle(p).overflowX;
      if (ox !== "visible") return true;
    }
    return false;
  };
  const offenders = [...document.querySelectorAll("body *")]
    .filter((el) => el.getClientRects().length && el.getBoundingClientRect().right > vw + 1 && !clipped(el))
    .slice(0, 4)
    .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(" ").slice(0, 3).join(".")}:${Math.round(el.getBoundingClientRect().right)}`);
  const visible = (sel) => [...document.querySelectorAll(sel)].some((el) => el.getBoundingClientRect().width > 0);
  return {
    overflow: document.documentElement.scrollWidth - vw,
    offenders,
    sidebar: visible("[data-slot=sidebar-container]"),
    table: visible("main table, [data-slot=table]"),
    h1: document.querySelector("h1")?.textContent?.trim() ?? "",
  };
};

const browser = await chromium.launch({ channel: "chrome", headless: true });
const report = [];
for (const role of only) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const faked = new Set();
  await context.route(/supabase\.co\/(rest|functions)\//, (route) => {
    const request = route.request();
    const method = request.method();
    const readRpc = method === "POST" && /\/rpc\/(login_email|user_display_names|my_authority_role|purchase_ids_paid_between|voucher_signatories|account_email_exists)\b/.test(request.url());
    if (method === "GET" || method === "HEAD" || method === "OPTIONS" || readRpc) return route.continue();
    faked.add(`${method} ${request.url().split("?")[0].replace(/^.*supabase\.co/, "")}`);
    return route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(`pageerror ${e.message.split("\n")[0]}`));
  page.on("console", (m) => m.type() === "error" && !/favicon|DevTools/.test(m.text()) && errors.push(`console ${m.text().slice(0, 200)}`));
  await page.goto(`${base}/login`, { waitUntil: "networkidle" });
  await page.getByLabel("Email").fill(`${roles[role]}@qa.test`);
  await page.getByLabel("Password").fill(password);
  await page.locator("button[type=submit]").click();
  await page.waitForURL((u) => !u.pathname.endsWith("/login"), { timeout: 20000 });
  await page.waitForTimeout(3000);
  const landing = new URL(page.url()).pathname;
  const paths = role === "admin" ? [...mainPaths, ...adminPaths] : mainPaths;
  console.log(`[${role}] landed ${landing}`);
  for (const path of paths) {
    for (const device of devices) {
      errors.length = 0;
      await page.setViewportSize({ width: device.w, height: device.h });
      await page.goto(base + path, { waitUntil: "networkidle" }).catch(() => {});
      await page.waitForTimeout(1800);
      const finalPath = new URL(page.url()).pathname;
      const row = { role, path, device: device.id, finalPath, errors: [...new Set(errors)] };
      for (const dark of [false, true]) {
        await page.evaluate((on) => document.documentElement.classList.toggle("dark", on), dark);
        await page.waitForTimeout(250);
        row[dark ? "dark" : "light"] = await page.evaluate(probe);
        const name = `${role}-${device.id}-${dark ? "dark" : "light"}-${path.replace(/\//g, "_") || "_"}`;
        await page.screenshot({ path: `${out}/${name}.png` });
      }
      report.push(row);
      const bad = row.light.overflow > 0 || row.dark.overflow > 0 || row.errors.length;
      console.log(`${bad ? "!!" : "ok"} ${role} ${device.id} ${path} -> ${finalPath} ov=${row.light.overflow}/${row.dark.overflow} sidebar=${row.light.sidebar} table=${row.light.table} h1="${row.light.h1}"${row.errors.length ? ` errors=${row.errors.join(" | ")}` : ""}${row.light.offenders.length ? ` off=${row.light.offenders.join(" ")}` : ""}`);
    }
  }
  if (faked.size) console.log(`[${role}] writes faked: ${[...faked].join(", ")}`);
  await context.close();
}
writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 1));
await browser.close();
