-- ============================================================================
-- 30. Pre-29 request notifications (2026-10-02) — apply after 29, one-off
--
--   Rows written before 29 have pending = false, so a "Voucher needs
--   approval" or "Payment needs verification" row stays in every manager's
--   inbox after the request was decided. A row whose voucher or payment is
--   still pending becomes pending = true (29 resolves it from now on); every
--   other such row is deleted. Data only: no table, column or function changes.
-- ============================================================================

update public.notifications n
set pending = true
where not n.pending
  and n.title = 'Voucher needs approval'
  and exists (
    select 1 from public.vouchers v
    where n.tag = 'voucher-' || v.id and v.status = 'pending'
  );

update public.notifications n
set pending = true
where not n.pending
  and n.title = 'Payment needs verification'
  and exists (
    select 1 from public.payments p
    where n.tag = 'payment-' || p.id and p.status = 'pending'
  );

delete from public.notifications n
where not n.pending
  and n.title in ('Voucher needs approval', 'Payment needs verification');
