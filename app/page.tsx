'use client';

import * as React from 'react';

import { useRouter } from 'next/navigation';

import { TocSidebar } from '@/components/toc-sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from 'sonner';

import { createNote, deleteNote, listNotes, type NoteRow } from '@/lib/notes';
import type { SessionUser } from '@/lib/auth/session';

export default function Home() {
  const router = useRouter();
  const [notes, setNotes] = React.useState<NoteRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [authed, setAuthed] = React.useState(true);
  const [me, setMe] = React.useState<SessionUser | null>(null);

  // 初始加载：校验登录态，未登录跳登录页。首页仅作文章列表。
  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          window.location.href = '/login';
          setAuthed(false);
          return;
        }
        const meData = (await res.json()) as { user: SessionUser | null };
        setMe(meData.user);
        const data = await listNotes();
        setNotes(data);
      } catch (err) {
        console.error('加载文章失败', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSelect = (id: string) => router.push(`/editor/${id}`);

  const handleCreate = async () => {
    try {
      const note = await createNote();
      setNotes((prev) => [note, ...prev]);
      router.push(`/editor/${note.id}`);
    } catch (err) {
      console.error('新建文章失败', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('删除文章失败', err);
    }
  };

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  if (!authed) return null;

  return (
    <TooltipProvider>
      <div className="flex h-svh flex-col">
        <div className="flex min-h-0 flex-1">
          <TocSidebar
            notes={notes}
            currentId={null}
            loading={loading}
            user={me}
            onSelect={handleSelect}
            onCreate={handleCreate}
            onDelete={handleDelete}
            onSignOut={handleSignOut}
          />
          <div className="min-h-0 flex-1 bg-background">
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-400">
              {loading
                ? '加载中…'
                : '从左侧「文章」选择一篇开始编辑，或点击右上角 + 新建'}
            </div>
          </div>
        </div>
        <Toaster />
      </div>
    </TooltipProvider>
  );
}
