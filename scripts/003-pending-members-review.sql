-- Adds review fields if they don't exist
do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_name='pending_members' and column_name='review_status'
  ) then
    alter table pending_members
      add column review_status text not null default 'pending' check (review_status in ('pending','approved','rejected')),
      add column reviewed_by uuid,
      add column reviewed_at timestamptz,
      add column notes text;
  end if;
end $$;
