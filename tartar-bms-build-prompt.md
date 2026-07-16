# Build Spec — TARTAR Business Management System (Web App / PWA)

You are building a multi-branch business management system for **TARTAR**. Follow this spec exactly. Do not add features, libraries, or design systems not listed here. Ask before assuming.

---

## 1. Locked Tech Stack (do not change versions or add packages without asking)

Use **exactly** this `package.json`. Run everything with **yarn** (`yarn dev`, `yarn build`, `yarn lint`, `yarn preview`). Never use npm.

```json
{
  "name": "tartar-system",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "oxlint",
    "preview": "vite preview"
  },
  "dependencies": {
    "@ant-design/charts": "^2.6.4",
    "@ant-design/icons": "^6.3.1",
    "@hookform/resolvers": "^5.4.0",
    "@tanstack/react-router": "^1.170.16",
    "@tanstack/router-devtools": "^1.167.0",
    "@vanilla-extract/css": "^1.21.0",
    "@vanilla-extract/vite-plugin": "^5.2.3",
    "antd": "^6.4.5",
    "axios": "^1.18.1",
    "dayjs": "^1.11.21",
    "react": "^19.2.7",
    "react-dom": "^19.2.7",
    "react-hook-form": "^7.80.0",
    "zod": "^4.4.3",
    "zustand": "^5.0.14"
  },
  "devDependencies": {
    "@types/node": "^24.13.2",
    "@types/react": "^19.2.17",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^4.7.0",
    "oxlint": "^1.69.0",
    "typescript": "~6.0.2",
    "vite": "^5.4.21",
    "vite-plugin-pwa": "^1.3.0"
  }
}
```

Add Supabase JS client as the only extra dependency (ask before adding anything else).

## 2. Hard Rules (non-negotiable)

- **UI:** Use Ant Design (antd) components only. No custom-built UI primitives. Customize antd via **Vanilla Extract `globalStyle`** — no other styling method, no inline styles, no Tailwind, no CSS modules.
- **State:** Use **Zustand** for all state. **Never use `useState`.** Local component state, forms state coordination, UI toggles — all go through Zustand stores.
- **Routing:** TanStack Router.
- **Forms + validation:** react-hook-form + zod (`@hookform/resolvers`).
- **Dates:** dayjs. **HTTP:** axios.
- **Offline:** PWA via `vite-plugin-pwa`. **Read-only offline:** cache the app shell + last-loaded data so the user can still view it with no connection. **Writes are queued** while offline and automatically flushed/synced to Supabase when the connection returns. Show a clear offline/online indicator and a pending-sync count.
- **Charts:** Use `@ant-design/charts` for all graphs (e.g. the daily sales graph). No other charting library.
- **Platform:** Desktop web app only (responsive not required, but don't break on smaller screens).

## 3. Architecture (keep code clean, short, DRY)

Enforce this structure. Every repeated piece of logic or UI must be reusable.

```
src/
  components/   # reusable global UI (wrappers over antd)
  hooks/        # reusable logic
  services/     # supabase + axios data access, one per domain
  stores/       # zustand stores
  models/       # types + zod schemas
  routes/       # tanstack router routes
  styles/       # vanilla-extract globalStyle + theme tokens
  utils/
```

Rules: no duplicated logic; shared tables/forms/modals are one reusable component driven by props/config; every entity has a model (type + zod schema), a service, and a store.

## 4. Authentication (read carefully — non-standard)

- **Only ONE Supabase Auth account exists: the `superAdmin` (the Developer).** This is the sole email/password login handled by Supabase Auth. It is deliberately kept to a single account to stay within the free-tier auth limit. The superAdmin has overall access.
- **All other users — INCLUDING the `admin` (the business Owner) — do NOT use email and do NOT use Supabase Auth.** They live in a custom **`users` table** with: `username`, hashed password, `role`, `access_flags`, `approval_status`, `branch_access`, and authenticate against that table via backend logic (Supabase RPC). Hash passwords server-side (pgcrypto); never store plaintext. Enforce Row Level Security.
- **superAdmin (Developer) can:** everything — add/delete users, update credentials, approve registrations, and assign **any** role (admin, accountant, employee, and future roles). Only the superAdmin can create/modify admins. Nobody can manage the superAdmin (it is the only one).
- **admin (Owner) can:** run the whole business (dashboards, financial standing, branch monitoring, approve vouchers) and manage **non-admin** users (accountants, employees, other roles) — approve their registrations, assign their roles/flags/branches. The admin **cannot** manage the superAdmin or other admins. The admin has its own **Users** tab for managing non-admin users.

## 5. Roles & Permissions

| Role | Can do | Cannot do |
|------|--------|-----------|
| **superAdmin** (Developer) | Everything; sole email/Supabase-Auth login; assign all roles incl. admins | — |
| **Admin** (Owner) | Full business control: dashboards, financial standing, branch monitoring, approve vouchers; manage non-admin users | Manage the superAdmin; create/modify other admins |
| **Accountant** | View Expenses & Income (for BIR) | View financial standing |
| **Employee** | Encode transactions, view reminders | View financial standing |

## 6. Business Structure (branches)

Parent company **TARTAR**, four business units (one branch each):

- **Hardware** — LGC Hardware & General Merchandise
- **Rental** — LGC Rental
- **Woodworks** — AFC Wood Industry
- **Farm** — split into sections: **Banana, Rubber, Coconut, Fruit**

Data is scoped/filterable by branch (and by farm section for the Farm unit).

## 7. Transactions employees record

Sales · Expenses · Customer Payments · Supplier Payments · Cash Deposit · Petty Cash · Purchases · Collections.

## 8. Income & Expenses

- **Income sources:** Product Sales, Rental Income.
- **Expense types:** Electricity, Water, Internet, Salaries, Office Supplies, Repairs & Maintenance, Taxes.

## 9. Receivables & Payables

- **Receivables** (customers pay later) record: Customer Name, Amount, Due Date, Reference Number.
- **Payables** (buy on credit) record: Supplier Name, Amount, Due Date, Reference Number.

## 10. Cash Management

Company money is held in: **Cash Drawer** and **Bank Account**. Track balances for both.

## 11. Admin Dashboard (shown immediately after Admin/superAdmin login)

Current Cash · Today's Sales · Today's Expenses · Accounts Receivable · Accounts Payable · Monthly Summary · Bank Balance · **daily sales graph** (chart of daily sales standing, built with `@ant-design/charts`).

## 12. Reports

Daily · Weekly · Monthly · Cash Flow · Receivables · Payables · Expenses.

## 13. Branch Monitoring (Admin/superAdmin view, per branch)

Cash Balance · Sales · Expenses · Receivables · Payables.

## 14. Notifications & Alerts

- Overdue Receivables
- Overdue Payables **+ near-due-date alerts**

## 15. Search & Filtering

Searchable/filterable by: Customer · Supplier · Reference Number · Date · Amount.

## 16. Voucher Approval Workflow

Create **check/cash vouchers** for expenses and purchases. Flow: **Employee creates voucher → Admin (or superAdmin) must approve → only after approval is it released for printing.** Unapproved vouchers cannot be printed.

---

## Delivery expectations

1. Scaffold the project with the exact stack above, confirm `yarn dev` runs.
2. Set up Supabase schema (tables, RLS, RPC for custom-user login, voucher approval) — output SQL.
3. Build shared components/hooks/services/stores/models first, then features.
4. Work in small, reviewable increments. Stop and confirm at each milestone before continuing.
