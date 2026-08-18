-- 灵犀笔记 · 接入 Auth 后的 RLS 策略
-- 在 Supabase Studio → SQL Editor 执行（或 docker exec psql 跑本文件）。

-- 1) 移除开发期全开放策略
drop policy if exists "notes_dev_open" on public.notes;

-- 2) 已登录用户：只能读写自己 user_id 的文章
drop policy if exists "notes_owner_all" on public.notes;
create policy "notes_owner_all"
  on public.notes
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 3) 兼容开发期遗留数据：user_id 为 NULL 的文章对所有人只读可见，
--    避免收紧后旧文章「消失」。新建文章会带 user_id，不受此条影响。
drop policy if exists "notes_legacy_read" on public.notes;
create policy "notes_legacy_read"
  on public.notes
  for select
  to anon, authenticated
  using (user_id is null);

alter table public.notes enable row level security;
