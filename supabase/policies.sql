-- Ý Lâm: Supabase Auth Roles & RLS
-- Yêu cầu: Bật extension pgcrypto nếu cần
-- create extension if not exists pgcrypto;

-- Bảng role người dùng
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('creator','partner','guest')),
  created_at timestamp with time zone default now()
);

-- Bảng knowledge_vault (lõi) nếu chưa tồn tại
create table if not exists public.knowledge_vault (
  source_id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  raw_transcript text,
  core_summary text,
  vector_embedding vector(768),
  generated_content jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Trigger cập nhật updated_at
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_kv_updated_at on public.knowledge_vault;
create trigger trg_kv_updated_at before update on public.knowledge_vault
for each row execute function public.set_updated_at();

-- Bật RLS
alter table public.knowledge_vault enable row level security;

-- Policy: Người dùng chỉ đọc/ghi dòng của chính họ
drop policy if exists "kv_select_owner" on public.knowledge_vault;
create policy "kv_select_owner"
on public.knowledge_vault
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "kv_insert_owner" on public.knowledge_vault;
create policy "kv_insert_owner"
on public.knowledge_vault
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "kv_update_owner" on public.knowledge_vault;
create policy "kv_update_owner"
on public.knowledge_vault
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- View thông tin tinh hoa (Metadata) hạn chế cột
create or replace view public.knowledge_metadata as
select
  source_id,
  user_id,
  left(coalesce(core_summary, ''), 300) as core_summary_preview,
  (generated_content ->> 'model') as model,
  created_at
from public.knowledge_vault;

grant select on public.knowledge_metadata to anon, authenticated;

-- Policy: role 'creator' xem metadata toàn hệ thống
-- Sử dụng bảng user_roles để phân quyền
alter table public.knowledge_metadata enable row level security;
drop policy if exists "metadata_select_creator" on public.knowledge_metadata;
create policy "metadata_select_creator"
on public.knowledge_metadata
for select
to authenticated
using (
  exists (
    select 1 from public.user_roles r
    where r.user_id = auth.uid() and r.role = 'creator'
  )
);

-- Policy mặc định: user thường chỉ xem metadata của riêng họ
drop policy if exists "metadata_select_owner" on public.knowledge_metadata;
create policy "metadata_select_owner"
on public.knowledge_metadata
for select
to authenticated
using (auth.uid() = user_id);

