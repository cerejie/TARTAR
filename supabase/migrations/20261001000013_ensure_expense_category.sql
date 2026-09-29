-- ============================================================================
-- Expense types created from the Expense form (2026-09-29)
--
--   The Expense form's "Expense type" is a creatable combobox. A name that
--   matches no category is created here, so an employee can add one even
--   though expense_categories is writable by managers only.
--
--   The voucher code is derived from the name: its first three letters, then
--   the first two plus A-Z, then the first one plus AA-ZZ, skipping any code in
--   use and the codes voucher_category already hands out (PUR, EXP, GEN).
--   Nothing is dropped or renamed.
-- ============================================================================

create or replace function public.ensure_expense_category(
  p_slug text,
  p_name text
) returns text
language plpgsql security definer set search_path = public, app as $$
declare
  v_name text := trim(p_name);
  v_letters text := upper(regexp_replace(coalesce(p_name, ''), '[^A-Za-z]', '', 'g'));
  v_base text;
  v_code text;
  v_step int := 0;
begin
  if not (app.is_manager() or app.user_role() = 'employee') then
    raise exception 'Not allowed to add expense types';
  end if;
  if p_slug is null or p_slug !~ '^[a-z0-9_]+$' then
    raise exception 'Expense type must contain letters or numbers';
  end if;
  if char_length(v_name) < 2 or char_length(v_name) > 80 then
    raise exception 'Expense type name must be 2 to 80 characters';
  end if;

  lock table public.expense_categories in share row exclusive mode;

  if exists (select 1 from public.expense_categories where slug = p_slug) then
    return p_slug;
  end if;

  v_base := rpad(substr(v_letters, 1, 3), 3, 'X');
  v_code := v_base;

  while v_code in ('PUR', 'EXP', 'GEN')
    or exists (select 1 from public.expense_categories where code = v_code)
  loop
    if v_step < 26 then
      v_code := substr(v_base, 1, 2) || chr(65 + v_step);
    elsif v_step < 26 + 676 then
      v_code := substr(v_base, 1, 1)
        || chr(65 + (v_step - 26) / 26)
        || chr(65 + (v_step - 26) % 26);
    else
      raise exception 'No free voucher code for expense type %', v_name;
    end if;
    v_step := v_step + 1;
  end loop;

  insert into public.expense_categories (slug, name, code, sort)
  values (
    p_slug,
    v_name,
    v_code,
    coalesce((select max(sort) from public.expense_categories), 0) + 1
  );

  return p_slug;
end;
$$;

grant execute on function public.ensure_expense_category(text, text) to authenticated;
