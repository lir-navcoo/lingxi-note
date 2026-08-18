import { NextResponse, type NextRequest } from 'next/server';

import { getSessionUser } from '@/lib/auth/session';
import { createAdminClient } from '@/lib/supabase/admin';
import type { NoteRow } from '@/lib/notes';

/** GET /api/notes/[id] —— 读取单篇（仅当归属当前用户）。 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('读取文章失败', error);
    return NextResponse.json({ error: '读取失败' }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: '文章不存在' }, { status: 404 });
  return NextResponse.json({ note: data as NoteRow });
}

/** PUT /api/notes/[id] —— 更新标题/内容（仅当归属当前用户）。 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const { id } = await params;
  let body: { title?: string; content?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const update: Record<string, unknown> = {};
  if (body.title !== undefined) update.title = body.title;
  if (body.content !== undefined) update.content = body.content as never;

  const { data, error } = await supabase
    .from('notes')
    .update(update)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*')
    .maybeSingle();

  if (error) {
    console.error('更新文章失败', error);
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: '文章不存在' }, { status: 404 });
  return NextResponse.json({ note: data as NoteRow });
}

/** DELETE /api/notes/[id] —— 删除（仅当归属当前用户）。 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('删除文章失败', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
