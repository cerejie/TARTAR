import { login, get, rpc, req } from "./rest.mjs";
const uuid = () => crypto.randomUUID();
const [e1, e2, a1, a2, c1, c2] = await Promise.all(["qaemp1", "qaemp2", "qaadmin1", "qaadmin2", "qaacc1", "qaacc2"].map(login));
const sum = (rs) => { const by = {}; rs.forEach((r) => { const k = `${r.status} ${r.status >= 300 ? (JSON.parse(r.body || "{}").message ?? r.body).slice(0, 70) : (r.body || "").slice(0, 40)}`; by[k] = (by[k] ?? 0) + 1; }); return by; };
const today = "2026-10-01";
const log = (t, v) => console.log(t.padEnd(46), JSON.stringify(v));

const sale = async (amt, who) => { const id = uuid(); await req("POST", "transactions", { id, type: "sale", branch: "qa_test", txn_date: today, amount: amt, income_source: null, cash_account: "cash_drawer", created_by: who.id }, who.token); return id; };
const s1 = await sale(801, e1);
const cur = await get(`transactions?select=id,amount,cash_account,income_source,sale_status&id=eq.${s1}`, a1.token);
log("setup sale 801", cur);

log("R1 6x parallel deposit (2 emps, 2 admins)", sum(await Promise.all([e1, e2, a1, a2, e1, e2].map((u) => rpc("mark_sale_deposited", { p_idempotency_key: uuid(), p_transaction_id: s1, p_deposit_date: today }, u.token)))));
log("R2 verify x2 + reject x2 parallel", sum(await Promise.all([rpc("verify_sale", { p_idempotency_key: uuid(), p_transaction_id: s1 }, a1.token), rpc("reject_sale", { p_idempotency_key: uuid(), p_transaction_id: s1, p_reason: "race" }, a2.token), rpc("verify_sale", { p_idempotency_key: uuid(), p_transaction_id: s1 }, a2.token), rpc("reject_sale", { p_idempotency_key: uuid(), p_transaction_id: s1, p_reason: "race" }, a1.token)])));
log("  sale 801 final", await get(`transactions?select=sale_status&id=eq.${s1}`, a1.token));

const s2 = await sale(802, e2);
const key = uuid();
log("R3 same idem key x6 parallel (2 tabs replay)", sum(await Promise.all(Array.from({ length: 6 }, () => rpc("mark_sale_deposited", { p_idempotency_key: key, p_transaction_id: s2, p_deposit_date: today }, e2.token)))));

const id3 = uuid();
log("R4 same insert id x4 parallel", sum(await Promise.all(Array.from({ length: 4 }, () => req("POST", "transactions", { id: id3, type: "sale", branch: "qa_test", txn_date: today, amount: 803, cash_account: "cash_drawer", created_by: e1.id }, e1.token)))));
log("  rows with that id", (await get(`transactions?select=id&id=eq.${id3}`, a1.token)).length);

const rcv = (await get("receivables?select=id,amount,paid_amount&customer_id=eq.e257fb9a-cc2c-4bae-a85c-193b0075d425&status=neq.paid&order=created_at.desc&limit=1", a1.token))[0];
const rem = rcv.amount - rcv.paid_amount;
log("setup receivable", rcv);
const pay = (u, amt) => rpc("record_ledger_payment", { p_idempotency_key: uuid(), p_kind: "receivable", p_party_id: "e257fb9a-cc2c-4bae-a85c-193b0075d425", p_party_name: "QA Customer A", p_amount: amt, p_paid_at: today, p_reference_number: null, p_allocations: [{ ledger_id: rcv.id, amount: amt }], p_created_by: u.id }, u.token);
log(`R5 4 users pay full remaining ${rem} parallel`, sum(await Promise.all([pay(e1, rem), pay(e2, rem), pay(a1, rem), pay(a2, rem)])));
log("  receivable after", await get(`receivables?select=amount,paid_amount,status&id=eq.${rcv.id}`, a1.token));
log("  payments on it", await get(`payment_allocations?select=amount,payments(status,created_by)&receivable_id=eq.${rcv.id}&order=created_at.desc&limit=6`, a1.token));

const exp = (u, n) => rpc("create_transaction_with_voucher", { p_idempotency_key: uuid(), p_type: "purchase", p_branch: "qa_test", p_txn_date: today, p_amount: 810 + n, p_supplier_id: null, p_payee: "QA Race Payee", p_cash_account: "cash_drawer", p_created_by: u.id }, u.token);
const rs = await Promise.all([e1, e2, a1, a2, e1, e2, a1, a2].map(exp));
log("R6 8 parallel purchases (ref numbers)", sum(rs));
const refs = await get("transactions?select=reference_number,amount&type=eq.purchase&amount=gte.810&amount=lte.818&txn_date=eq.2026-10-01", a1.token);
log("  refs", refs.map((r) => r.reference_number));
log("  unique refs", new Set(refs.map((r) => r.reference_number)).size + "/" + refs.length);

log("R7 accountant insert sale", sum([await req("POST", "transactions", { type: "sale", branch: "qa_test", txn_date: today, amount: 1, cash_account: "cash_drawer" }, c1.token)]));
log("R7 accountant update sale", sum([await req("PATCH", `transactions?id=eq.${s2}`, { description: "acc" }, c1.token)]));
log("R7 accountant delete sale", sum([await req("DELETE", `transactions?id=eq.${s2}`, null, c2.token)]));
log("R7 accountant deposit rpc", sum([await rpc("mark_sale_deposited", { p_idempotency_key: uuid(), p_transaction_id: id3, p_deposit_date: today }, c1.token)]));
log("R7 accountant verify rpc", sum([await rpc("verify_sale", { p_idempotency_key: uuid(), p_transaction_id: s2 }, c2.token)]));
log("R7 accountant purchase rpc", sum([await exp(c1, 9)]));
log("R7 accountant customer insert", sum([await req("POST", "customers", { name: "ACC PROBE" }, c1.token)]));
log("R7 accountant bank insert", sum([await req("POST", "banks", { name: "ACC PROBE BANK" }, c1.token)]));
log("R7 accountant voucher update", sum([await req("PATCH", "vouchers?status=eq.pending", { purpose: "acc" }, c1.token)]));
log("R7 accountant claim_write", sum([await rpc("claim_write", { p_key: uuid(), p_fn: "x" }, c1.token)]));
console.log("ids", JSON.stringify({ s1, s2, id3 }));
