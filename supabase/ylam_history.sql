begin;

create extension if not exists "pgcrypto";

create table if not exists public.ylam_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  youtube_url text not null,
  original_text text not null,
  summary text not null,
  scripts jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists ylam_history_user_id_created_at_idx
on public.ylam_history (user_id, created_at desc);

alter table public.ylam_history enable row level security;

drop policy if exists ylam_history_select_own on public.ylam_history;
create policy ylam_history_select_own
on public.ylam_history for select
using (auth.uid() = user_id);

drop policy if exists ylam_history_insert_own on public.ylam_history;
create policy ylam_history_insert_own
on public.ylam_history for insert
with check (auth.uid() = user_id);

grant select, insert on table public.ylam_history to authenticated;

commit;
