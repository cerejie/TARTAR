import { writeFileSync } from "node:fs";
const rec = { note: "toast recorder", always: true, js: "(()=>{window.__t=[];new MutationObserver(()=>document.querySelectorAll('[data-sonner-toast]').forEach(t=>{const x=t.innerText.replace(/\n/g,' ');if(!window.__t.includes(x))window.__t.push(x)})).observe(document.body,{childList:true,subtree:true});return 1})()" };
const qf = { note: "queue+failed", always: true, js: "(()=>{const s=JSON.parse(localStorage.getItem('tartar-sync-queue')||'{}').state||{};return {queue:(s.queue||[]).map(w=>w.label),failed:(s.failed||[]).map(f=>f.write.label+' => '+f.reason)}})()" };
const fin = (u) => ({ note: `${u} final`, always: true, goto: "/sales", settle: 3000, js: "[...document.querySelectorAll('tbody tr')].map(r=>r.innerText.replace(/\s+/g,' ')).filter(t=>/1,25\d|12,5\d\d/.test(t)).join(' || ')" });
const toasts = { note: "toasts seen", always: true, js: "window.__t||[]" };
const login = (u) => ({ note: `login ${u}`, login: [`${u}@qa.test`, "QaTest#2026"], stop: true });
const edit = (from, to) => [
  { note: `Edit sale ${from}`, always: true, row: `₱${from}`, item: "Edit sale", wait: 1000 },
  { always: true, fill: { amount: to } },
  { always: true, submit: "Save", keepOpen: true, wait: 1500 },
  { press: "Escape", always: true },
];
const emp2 = [login("qaemp2"), { goto: "/sales", settle: 3000 },
  { note: "sale 1251", button: "Record sale", page: true, fill: { amount: "1251" }, pick: { "Cash account": "Cash Drawer" } }, { submit: "Record", wait: 2500 },
  { note: "sale 1252", button: "Record sale", page: true, fill: { amount: "1252" }, pick: { "Cash account": "Cash Drawer" } }, { submit: "Record", wait: 2500 },
  { sync: "ready", always: true }, { goto: "/sales", settle: 3000, always: true }, rec,
  { sync: "A", always: true },
  { note: "Mark deposited 1,251", always: true, row: "₱1,251.00", item: "Mark deposited", wait: 1000 }, { always: true, submit: "Mark deposited", wait: 2500 },
  qf, { sync: "B", always: true }, { sync: "C", always: true }, { wait: 20000, always: true }, toasts, fin("emp2")];
const admin1 = [login("qaadmin1"), { goto: "/sales", settle: 3000 },
  { sync: "ready", always: true }, { goto: "/sales", settle: 3000, always: true }, rec,
  { sync: "A", always: true }, ...edit("1,252.00", "1253"),
  qf, { sync: "B", always: true }, { sync: "C", always: true }, { wait: 20000, always: true }, toasts, fin("admin1")];
const admin2 = [login("qaadmin2"), { goto: "/sales", settle: 3000 },
  { sync: "ready", always: true }, { goto: "/sales", settle: 3000, always: true, name: "stale-page" }, rec,
  { offline: true, always: true }, { sync: "A", always: true }, { sync: "B", always: true },
  ...edit("1,251.00", "12511"), ...edit("1,252.00", "12522"),
  qf, { sync: "C", always: true }, { offline: false, always: true, wait: 20000 },
  qf, toasts, { always: true, name: "after-sync" }, fin("admin2")];
for (const [n, s] of Object.entries({ emp2, admin1, admin2 })) writeFileSync(`c2/${n}.json`, JSON.stringify(s));
