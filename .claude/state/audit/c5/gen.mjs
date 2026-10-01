import { writeFileSync } from "node:fs";
const row = (amt) => ({ always: true, js: `(()=>{const r=[...document.querySelectorAll('tbody tr')].find(r=>r.innerText.includes('${amt}'));return r?r.innerText.split(String.fromCharCode(10)).join(' '):'no row'})()` });
writeFileSync("c5/emp2.json", JSON.stringify([
  { login: ["qaemp2@qa.test", "QaTest#2026"], stop: true },
  { goto: "/sales", settle: 3000 },
  { note: "sale 963", button: "Record sale", page: true, fill: { amount: "963" }, pick: { "Cash account": "Cash Drawer" } },
  { submit: "Record", wait: 3000 },
  { note: "deposit 963", row: "₱963.00", item: "Mark deposited", wait: 1000 },
  { submit: "Mark deposited", wait: 3000 },
  { ...row("₱963.00"), note: "before verify" },
  { sync: "ready", always: true },
  { sync: "verified", always: true },
  { wait: 5000, ...row("₱963.00"), note: "5s after admin verify, no navigation" },
  { always: true, name: "c5-emp2-live" },
]));
writeFileSync("c5/admin1.json", JSON.stringify([
  { login: ["qaadmin1@qa.test", "QaTest#2026"], stop: true },
  { sync: "ready", always: true },
  { goto: "/sales", settle: 3000, always: true },
  { note: "Verify 963", always: true, row: "₱963.00", item: "Verify", wait: 1000 },
  { note: "press confirm", always: true, js: "(()=>{const d=[...document.querySelectorAll('[role=alertdialog],[role=dialog]')].pop();if(!d)return 'no dialog';const b=[...d.querySelectorAll('button')].filter(b=>b.offsetParent).pop();const t=b.textContent.trim();b.click();return t})()", wait: 3000 },
  { ...row("₱963.00"), note: "admin1 after verify" },
  { sync: "verified", always: true },
]));
