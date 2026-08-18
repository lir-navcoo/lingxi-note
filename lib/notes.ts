export interface NoteRow {
  id: string;
  title: string;
  content: unknown | null;
  parent_id: string | null;
  position: number;
  icon: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * 文章数据访问层（改为走自建后端 API）。
 * 多用户隔离由后端按会话用户过滤，前端仅透传 cookie。
 * 函数签名保持与之前一致，页面/侧边栏无需改动。
 */

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    // 携带会话 cookie（HttpOnly），确保后端能识别用户。
    credentials: 'same-origin',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((json as { error?: string }).error ?? '请求失败');
  }
  return json as T;
}

/** 读取当前用户的文章列表（按更新时间倒序）。 */
export async function listNotes(): Promise<NoteRow[]> {
  const data = await request<{ notes: NoteRow[] }>('/api/notes');
  return data.notes ?? [];
}

/** 读取单篇文章（归属当前用户）。 */
export async function getNote(id: string): Promise<NoteRow | null> {
  try {
    const data = await request<{ note: NoteRow }>(`/api/notes/${id}`);
    return data.note ?? null;
  } catch (err) {
    if (err instanceof Error && err.message === '文章不存在') return null;
    throw err;
  }
}

/** 创建一篇新文章，返回新建记录。 */
export async function createNote(
  title = '无标题',
  content: unknown = null
): Promise<NoteRow> {
  const data = await request<{ note: NoteRow }>('/api/notes', {
    method: 'POST',
    body: JSON.stringify({ title, content }),
  });
  return data.note;
}

/** 更新文章标题。 */
export async function updateNoteTitle(id: string, title: string): Promise<void> {
  await request(`/api/notes/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ title }),
  });
}

/** 保存文章内容（块编辑器序列化后的 JSON）。 */
export async function updateNoteContent(id: string, content: unknown): Promise<void> {
  await request(`/api/notes/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ content }),
  });
}

/** 删除文章。 */
export async function deleteNote(id: string): Promise<void> {
  await request(`/api/notes/${id}`, { method: 'DELETE' });
}
