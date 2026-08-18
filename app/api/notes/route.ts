import { NextResponse, type NextRequest } from 'next/server';

import { getSessionUser } from '@/lib/auth/session';
import { createAdminClient } from '@/lib/supabase/admin';
import type { NoteRow } from '@/lib/notes';

/** GET /api/notes —— 返回当前用户的文章列表（按更新时间倒序）。 */
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('读取文章失败', error);
    return NextResponse.json({ error: '读取失败' }, { status: 500 });
  }
  return NextResponse.json({ notes: (data ?? []) as NoteRow[] });
}

/** POST /api/notes —— 新建一篇属于当前用户的文章。 */
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 });

  let body: { title?: string; content?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    // 允许空 body，使用默认标题。
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('notes')
    .insert({
      title: body.title ?? '无标题',
      content: (body.content as never) ?? null,
      user_id: user.id,
    })
    .select('*')
    .single();

  if (error) {
    console.error('新建文章失败', error);
    return NextResponse.json({ error: '新建失败' }, { status: 500 });
  }
  return NextResponse.json({ note: data as NoteRow });
}
