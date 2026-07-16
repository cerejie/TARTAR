-- ============================================================================
-- Branch management (runtime CRUD + soft archive)
-- ----------------------------------------------------------------------------
-- Branches were originally a fixed seeded set. Managers can now add branches at
-- runtime, so we:
--   * add an `active` flag for soft-archive (slugs are FK targets from
--     transactions/cash_accounts/vouchers/etc. and can never be hard-deleted
--     once used) — archived branches drop out of selectors but keep history;
--   * pin the slug format to lower-case alphanumerics + underscore, mirroring
--     the frontend `slugifyBranch` / `branchSlugSchema`.
--
-- Writes are already restricted to managers by the existing `ref_write_branches`
-- RLS policy, so no new policy is required.
-- ============================================================================

alter table public.branches
  add column if not exists active boolean not null default true;

-- Existing seeded slugs (hardware/rental/woodworks/farm) already satisfy this.
alter table public.branches
  add constraint branches_slug_format_chk check (slug ~ '^[a-z0-9_]+$');
