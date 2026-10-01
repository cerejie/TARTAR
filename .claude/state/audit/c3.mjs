import { writeFileSync } from "node:fs";
const qf = { always: true, js: "(()=>{const s=JSON.parse(localStorage.getItem('tartar-sync-queue')||'{}').state||{};return {queue:(s.queue||[]).map(w=>w.label),failed:(s.failed||[]).map(f=>f.write.label+' => '+f.reason)}})()" };
writeFileSync("c3-emp.json", JSON.stringify([
  { login: ["qaemp1@qa.test", "QaTest#2026"], stop: true },
  { goto: "/sales", settle: 3000 },
  { note: "sale 962 online", button: "Record sale", page: true, fill: { amount: "962" }, pick: { "Cash account": "Cash Drawer" } },
  { submit: "Record", wait: 3000 },
]));
writeFileSync("c3.json", JSON.stringify([
  { login: ["qaadmin1@qa.test", "QaTest#2026"], stop: true },
  { goto: "/sales", settle: 3000 },
  { note: "delete 962, reply dropped", dropReply: true, row: "₱962.00", item: "Delete sale", wait: 800 },
  { confirmOnly: "Delete", wait: 4000, always: true },
  { ...qf, note: "after dropped delete" },
  { dropReply: false, wait: 40000, always: true },
  { ...qf, note: "after retry (delete)" },
  { goto: "/sales", settle: 3000, absent: "₱962.00", always: true, name: "c3-sales" },
  { note: "category online", goto: "/master-data?section=expense-categories", settle: 2500, always: true },
  { button: "Add category", page: true, wait: 900, fill: { name: "QA C3 Type", code: "QCT" }, always: true },
  { note: "add category, reply dropped", dropReply: true, submit: "Add category", wait: 4000, always: true },
  { ...qf, note: "after dropped insert" },
  { dropReply: false, wait: 40000, always: true },
  { ...qf, note: "after retry (insert)" },
  { js: "1", always: true, name: "c3-cat" },
]));
