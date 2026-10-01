import { readFileSync } from "node:fs";
const env = Object.fromEntries(readFileSync(process.env.ENVFILE, "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]));
export const URL_ = env.VITE_SUPABASE_URL, KEY = env.VITE_SUPABASE_ANON_KEY;
const h = (t) => ({ apikey: KEY, Authorization: `Bearer ${t ?? KEY}`, "Content-Type": "application/json", Prefer: "return=representation" });
export const rpc = async (fn, args, t) => { const r = await fetch(`${URL_}/rest/v1/rpc/${fn}`, { method: "POST", headers: h(t), body: JSON.stringify(args) }); const b = await r.text(); return { status: r.status, body: b }; };
export const get = async (path, t) => { const r = await fetch(`${URL_}/rest/v1/${path}`, { headers: h(t) }); return r.json(); };
export const req = async (method, path, body, t) => { const r = await fetch(`${URL_}/rest/v1/${path}`, { method, headers: h(t), body: body ? JSON.stringify(body) : undefined }); const b = await r.text(); return { status: r.status, body: b.slice(0, 400) }; };
export const login = async (u) => { const r = await rpc("login_email", { p_email: `${u}@qa.test`, p_password: "QaTest#2026" }); const j = JSON.parse(r.body); return { token: j.token, id: j.user?.id ?? j.id, raw: j }; };
