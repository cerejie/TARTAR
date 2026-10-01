import { writeFileSync } from "node:fs";
const row = (amt) => ({ always: true, js: `(()=>{const r=[...document.querySelectorAll('tbody tr')].find(r=>r.innerText.includes('${amt}'));return r?r.innerText.split(String.fromCharCode(10)).join(' '):'no row'})()` });
writeFileSync("c5/v-emp2.json", JSON.stringify([
  { login: ["qaemp2@qa.test", "QaTest#2026"], stop: true },
  { nav: "Expenses", settle: 3000 },
  { note: "expense 964", button: "Record expense", page: true, wait: 900, fill: { amount: "964", particulars: "QA C5 LIVE" }, pick: { "Expense type": "QA Utilities", "Payee": "QA Power Co" } },
  { submit: "Record", wait: 3000 },
  { sync: "recorded", always: true },
  { sync: "rejected", always: true },
]));
writeFileSync("c5/v-admin1.json", JSON.stringify([
  { login: ["qaadmin1@qa.test", "QaTest#2026"], stop: true },
  { sync: "recorded", always: true },
  { goto: "/vouchers", settle: 3000, always: true },
  { ...row("₱964.00"), note: "admin1 before reject" },
  { sync: "watching", always: true },
  { sync: "rejected", always: true },
  { wait: 5000, ...row("₱964.00"), note: "5s after admin2 reject, no navigation" },
  { always: true, name: "c5-admin1-live-voucher" },
]));
writeFileSync("c5/v-admin2.json", JSON.stringify([
  { login: ["qaadmin2@qa.test", "QaTest#2026"], stop: true },
  { sync: "recorded", always: true },
  { goto: "/vouchers", settle: 3000, always: true },
  { sync: "watching", always: true },
  { note: "reject 964", always: true, row: "₱964.00", item: "Reject voucher", wait: 1000, fill: { reason: "QA C5 live check" } },
  { submit: "Reject", always: true, wait: 3000 },
  { ...row("₱964.00"), note: "admin2 after reject" },
  { sync: "rejected", always: true },
]));
