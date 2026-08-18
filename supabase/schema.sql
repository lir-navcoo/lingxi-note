-- 灵犀笔记 · Supabase 表结构
-- 在你的 Supabase Studio → SQL Editor 中执行本文件即可建表。

create table if not exists public.notes (
  id          uuid primary key default gen_random_uuid(),
  title       text not null default '无标题',
  content     jsonb,
  parent_id   uuid references public.notes (id) on delete cascade,
  position    integer not null default 0,
  icon        text,
  user_id     uuid,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists notes_parent_id_idx on public.notes (parent_id);
create index if not exists notes_user_id_idx on public.notes (user_id);

-- 更新时间自动维护
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists notes_set_updated_at on public.notes;
create trigger notes_set_updated_at
  before update on public.notes
  for each row execute function public.set_updated_at();

-- 行级安全（RLS）
-- 开发期：先放行所有请求，便于快速联调（见 supabase/rls.sql 的 notes_dev_open）。
-- 接入 Auth 后执行 supabase/rls.sql 切换到基于 auth.uid() 的隔离策略。
alter table public.notes enable row level security;

-- 开发期全开放（接入 Auth 前使用；接入后由 rls.sql 覆盖）。
drop policy if exists "notes_dev_open" on public.notes;
create policy "notes_dev_open"
  on public.notes
  for all
  to anon, authenticated
  using (true)
  with check (true);
