# Architecture rules

Read this when adding a module, or when it is unclear which layer owns a piece of logic.

## Where does this logic go?

Ask the questions in order and stop at the first "yes".

| Question | Home |
|---|---|
| Is it a pure transform of values, with no React and no data source? | `utils/<topic>.utils.ts` |
| Is it a fixed set of values with labels/colours? | `enums/<domain>.enum.ts` |
| Is it the shape of data going out or coming in? | `models/data/<domain>/<domain>.request.ts` / `.response.ts` |
| Does it talk to the database or an API? | `services/data/<domain>.services.ts` |
| Is it client state that survives navigation or is read by unrelated screens? | `store/data/<domain>/<domain>.store.ts` |
| Is it state or orchestration for one screen or one entity? | `hook/data/<domain>/<domain>.manage.hook.ts` |
| Is it reusable across domains and purely visual? | `components/common/<group>/` |
| Is it visual but only meaningful to one domain? | `components/<domain>/` |
| Otherwise | the View |

## The one-hook rule

A View depends on **one** `*.manage.hook`. If a View starts calling three hooks, mutating, and computing totals, the composition belongs in the manage hook instead. This is what keeps the pages thin and the logic testable by inspection.

The manage hook is a composition root, not a dumping ground: it composes the list hook, the modals, the mutations and the defaults. Anything reusable it grows should be extracted down into a list hook, a service, or a util.

## Caching and invalidation

- Every read gets a stable key from `keys/query.keys.ts`.
- A key that varies by scope is built with `scopedKey(...)`, never string-concatenated inline.
- Every mutation declares `invalidate: [<listKey>]`. A mutation that changes data without invalidating is a bug — the UI will lie.
- Invalidation is prefix-based: invalidating `"customers"` also refreshes `"customers:branch-a"`. Design key prefixes with that in mind.

## Modals

Modal open state lives in the modal store, keyed by a constant from `keys/modal.keys.ts`, not in component `useState`. A modal that needs a target record passes `recordId` through `openModal(id)`, and the manage hook resolves the record from the already-loaded list. Do not fetch a record just to edit it when the list already holds it.

## Offline / queued writes

Writes go through the shared write path rather than calling the data client directly, so they can be queued when offline. A mutation result carrying a `queued` flag must surface the queued message rather than a success message — `useMutation` already does this; do not reimplement it.

## Permissions and routes

- A screen is registered in `routes/<scope>.view.routes.ts` with `key`, `path`, `label`, `description`, `icon`, `group`, `can`, and `Component`. The navigation menu is generated from this list — there is no second place to register a page.
- `can` gates visibility. A `loader: permissionLoader(<can>, <fallbackPath>)` gates access. A screen that must not be reachable by URL needs **both**.
- Never hand-roll a permission check in a component when `can` or `RequirePermission` covers it.

## Database changes

- Schema changes are migrations in `supabase/migrations/<timestamp>_<name>.sql`, additive by default.
- Never drop or rename a column, and never write a data backfill, without explicit approval.
- New tables need: a primary key, foreign keys for every relationship, indexes on the columns you filter or join by, and row-level security consistent with the existing tables.
- Multi-statement writes that must succeed or fail together belong in a database function called through the service's `rpc` path, not in a sequence of client calls.

## When to propose a plan

Propose before writing code when the change involves any of:

- a new domain or module
- more than three files
- a migration or any schema change
- a new dependency
- a change to routing, permissions, or an existing public shape
- a refactor that crosses layers

The plan is at most 15 lines:

```
Goal: <one line>
Files:
  + src/models/data/x/x.request.ts       new zod schema
  + src/services/data/x.services.ts      CRUD
  ~ src/keys/query.keys.ts               add xListKey
  ~ src/routes/protected.view.routes.ts  register /x
Order: models -> keys -> service -> hooks -> view -> route
Risk: <the one thing most likely to be wrong>
Ask: <any decision still open>
```

Then stop and wait. Do not begin implementing a plan you have not been given approval for.
