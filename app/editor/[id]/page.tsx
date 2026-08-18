'use client';

import * as React from 'react';

import type { Value } from 'platejs';

import { PlateEditor, DEFAULT_VALUE } from '@/components/editor/plate-editor';
import { useRouter } from 'next/navigation';

import { TocSidebar } from '@/components/toc-sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from 'sonner';

import {
  createNote,
  deleteNote,
  getNote,
  listNotes,
  type NoteRow,
} from '@/lib/notes';
import type { SessionUser } from '@/lib/auth/session';

export default function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = React.use(params);

  const [notes, setNotes] = React.useState<NoteRow[]>([]);
  const [current, setCurrent] = React.useState<NoteRow | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [authed, setAuthed] = React.useState(true);
  const [me, setMe] = React.useState<SessionUser | null>(null);

  // 初始加载：校验登录态 + 加载文章列表与当前文章。
  React.useEffect(() => {
    (async () => {
      try {
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) {
          window.location.href = '/login';
          setAuthed(false);
          return;
        }
        const meData = (await meRes.json()) as { user: SessionUser | null };
        setMe(meData.user);
        const [list, note] = await Promise.all([listNotes(), getNote(id)]);
        setNotes(list);
        setCurrent(note);
      } catch (err) {
        console.error('加载失败', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSelect = (noteId: string) => router.push(`/editor/${noteId}`);

  const handleCreate = async () => {
    try {
      const note = await createNote();
      setNotes((prev) => [note, ...prev]);
      router.push(`/editor/${note.id}`);
    } catch (err) {
      console.error('新建文章失败', err);
    }
  };

  const handleDelete = async (noteId: string) => {
    try {
      await deleteNote(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      if (noteId === id) router.push('/');
    } catch (err) {
      console.error('删除文章失败', err);
    }
  };

  // 保存后刷新列表（标题/更新时间可能变化）。
  const handleSaved = () => {
    listNotes()
      .then(setNotes)
      .catch((err) => console.error('刷新列表失败', err));
  };

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const initialValue: Value = current?.content
    ? (current.content as unknown as Value)
    : DEFAULT_VALUE;

  if (!authed) return null;

  return (
    <TooltipProvider>
      <div className="flex h-svh flex-col">
        <div className="flex min-h-0 flex-1">
          <TocSidebar
            notes={notes}
            currentId={id}
            loading={loading}
            user={me}
            onSelect={handleSelect}
            onCreate={handleCreate}
            onDelete={handleDelete}
            onSignOut={handleSignOut}
          />
          <div className="min-h-0 flex-1 bg-background">
            {current ? (
              <PlateEditor
                key={id}
                noteId={id}
                initialValue={initialValue}
                onSaved={handleSaved}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                {loading ? '加载中…' : '文章不存在或无权访问'}
              </div>
            )}
          </div>
        </div>
        <Toaster />
      </div>
    </TooltipProvider>
  );
}
