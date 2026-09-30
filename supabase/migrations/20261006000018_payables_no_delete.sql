drop policy if exists pay_manager_all on public.payables;

create policy pay_manager_read on public.payables
  for select to authenticated using (app.is_manager());
create policy pay_manager_write on public.payables
  for insert to authenticated with check (app.is_manager());
create policy pay_manager_update on public.payables
  for update to authenticated using (app.is_manager()) with check (app.is_manager());

revoke delete on public.payables from authenticated, anon;
