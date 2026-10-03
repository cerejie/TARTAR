-- ============================================================================
-- PROPOSAL — migration 33: retire the "collection" transaction type
-- Status: NOT APPLIED. Lives outside supabase/migrations/ so `db push` cannot
-- pick it up. The user decides the conversion (a business rule) before it is
-- copied into supabase/migrations/<timestamp>_retire_collection.sql.
-- ----------------------------------------------------------------------------
-- Context (decided 2026-10-03): customer payments are the collection. The client
-- (Development v2.68) no longer offers, filters or labels "collection"; a legacy
-- row still renders as type "Other" and is counted in neither Cash In nor Cash
-- Out. No data is dropped by any option below.
--
-- Step 0 — measure first (read only):
--   select branch, count(*), sum(amount)
--   from public.transactions where type = 'collection' group by branch;
--
-- Step 1 — convert existing rows. Pick ONE:
--   A (recommended) to 'customer_payment': matches "customer payments are the
--     collection"; the rows start counting in Cash In and in a customer's
--     "last payment". Cash In for the affected periods rises by their sum.
--   B leave them as 'collection': nothing moves; they stay "Other" forever and
--     count nowhere. Only Step 2 runs.
--   C to 'cash_deposit': they count in Cash In without a customer meaning;
--     customer_id stays set but is no longer shown on that type.
--   Approved and printed vouchers lock transactions through triggers, but a
--   collection row never carries a voucher, so the update is not blocked.
--   The audit trigger records each conversion in transaction_audit.
-- ----------------------------------------------------------------------------

begin;

update public.transactions
   set type = 'customer_payment'
 where type = 'collection';

-- Step 2 — stop new ones. Removing a value from a Postgres enum is not
-- supported in place: it needs a type rebuild (create a new enum without the
-- value, alter every column and function signature that uses
-- app.transaction_type to it, drop the old type), which rewrites the table
-- and touches every RPC. A check constraint gives the same guarantee without
-- that risk. `not valid` + `validate` avoids a long lock on a large table;
-- under option B the validate step fails while old rows remain, so keep the
-- constraint `not valid` there (it still blocks every new insert and update).

alter table public.transactions
  add constraint transactions_type_not_collection
  check (type <> 'collection') not valid;

alter table public.transactions
  validate constraint transactions_type_not_collection;

commit;

-- Rollback:
--   alter table public.transactions
--     drop constraint transactions_type_not_collection;
--   Converted rows can be found through transaction_audit (changes ? 'type'
--   with old = 'collection') if option A or C ever has to be undone.
