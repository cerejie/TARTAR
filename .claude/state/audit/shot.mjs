import { chromium } from "playwright-core";
import { mkdirSync, readFileSync } from "node:fs";

const base = "http://localhost:5199";
const dir = new URL(".", import.meta.url).pathname.slice(1);
const specs = JSON.parse(readFileSync(process.argv[2], "utf8"));
const usePublic = process.argv[3] === "public";
mkdirSync(`${dir}shots`, { recursive: true });

const options = { channel: "chrome", headless: true, viewport: { width: 1440, height: 900 } };
const context = usePublic
  ? await (await chromium.launch(options)).newContext({ viewport: options.viewport })
  : await chromium.launchPersistentContext(`${dir}profile`, options);
const page = context.pages()[0] ?? (await context.newPage());
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

const setDark = async (dark) => {
  await page.evaluate((on) => document.documentElement.classList.toggle("dark", on), dark);
};

for (const spec of specs) {
  try {
    await page.setViewportSize({ width: spec.w ?? 1440, height: spec.h ?? 900 });
    if (spec.path) {
      await page.goto(base + spec.path, { waitUntil: "networkidle" });
      await page.waitForTimeout(spec.settle ?? 1500);
    }
    for (const action of spec.actions ?? []) {
      if (action.click) await page.locator(action.click).first().click({ timeout: 5000 });
      if (action.hover) await page.locator(action.hover).first().hover({ timeout: 5000 });
      if (action.press) await page.keyboard.press(action.press);
      if (action.fill) await page.locator(action.fill[0]).first().fill(action.fill[1]);
      if (action.scroll) await page.locator(action.scroll).first().evaluate((el) => (el.scrollTop = el.scrollHeight));
      await page.waitForTimeout(action.wait ?? 700);
    }
    await setDark(!!spec.dark);
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${dir}shots/${spec.name}.png` });
    console.log("ok", spec.name);
  } catch (e) {
    console.log("FAIL", spec.name, e.message.split("\n")[0]);
  }
}
if (errors.length) console.log("console errors:", [...new Set(errors)].slice(0, 15).join("\n"));
await context.close();
