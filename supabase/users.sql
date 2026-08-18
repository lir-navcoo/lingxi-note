-- 灵犀笔记 · 自建用户表（不依赖 Supabase Auth）
-- 在 Supabase Studio → SQL Editor 执行，或用 docker exec psql 跑本文件。

create table if not exists public.users (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  password_hash text not null,
  name        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists users_email_idx on public.users (email);

-- 更新时间自动维护
create or replace function public.set_users_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_users_updated_at();

-- 备注：notes 表的 user_id 不再由 Supabase Auth 提供，
-- 而是由自建用户表的 id 填充；RLS 的 auth.uid() 已不再适用，
-- 数据隔离改由应用层（后端 API 按 session.userId 过滤）保证。
-- 保留 notes 表结构不变，仅 user_id 来源切换。
