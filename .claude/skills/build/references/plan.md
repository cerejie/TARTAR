# Planning — design before code

Produces a plan, not code. The plan is short enough to read in ten seconds and specific enough to implement without further exploration.

## Steps

1. **Locate** the touch points with the path map in `pathfind.md`. Do not read anything you will not modify.
2. **Place** each piece of logic using the ownership table in `architecture.md`.
3. **Surface decisions.** Anything on the *Must ask* list goes to `AskUserQuestion` — at most 3 questions, at most 4 options each, recommended option first and labelled. Ask before planning, not after: an unanswered decision invalidates the plan.
4. **Write the plan.** ≤15 lines, exact paths, `+` for new and `~` for modified, in build order.
5. **Stop.** Wait for approval. Do not begin implementing.

## Plan format

```
Goal: <one line>

Files
  + src/models/data/discount/discount.request.ts    zod schema
  + src/services/data/discount.services.ts          CRUD
  ~ src/keys/query.keys.ts                          + discountListKey
  ~ src/routes/protected.view.routes.ts             register /discounts

Order: models -> keys -> service -> hooks -> view -> route
Risk:  percentage vs fixed amount changes the column type
Open:  should an expired discount stay visible in the list?
```

No prose paragraphs. No restating the request back. No listing options you are not recommending.

## Decisions that always need a human

Business rules · money, rounding, tax · status transitions · what a column means · permissions and roles · destructive database work · adding a dependency · breaking an existing flow, route, or public shape · two designs with genuine trade-offs.

Everything else is a judgement call you make and state in one line.

## When a plan is not needed

One layer, ≤3 files, no new dependency, no migration, no route change. Just implement it. Proposing a plan for a two-line fix wastes the user's time as surely as skipping one for a new module wastes their trust.

## Trade-offs

When two approaches are genuinely viable, give one sentence each and a recommendation. Never present a menu without a recommendation, and never write a survey of everything that could theoretically be done.
