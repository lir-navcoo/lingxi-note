'use client';

import * as React from 'react';

import { FileText, LogOut, Plus } from 'lucide-react';

import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';

import type { NoteRow } from '@/lib/notes';
import type { SessionUser } from '@/lib/auth/session';

interface TocSidebarProps extends React.ComponentProps<'aside'> {
  notes: NoteRow[];
  currentId: string | null;
  loading?: boolean;
  user?: SessionUser | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onSignOut?: () => void;
}

export function Logo() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="size-6 shrink-0 text-primary"
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M8 15c1.2-1 2.3-1.5 4-1.5s2.8.5 4 1.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="9.5" cy="9.5" r="1.2" fill="currentColor" />
      <circle cx="14.5" cy="9.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function TocSidebar({
  notes,
  currentId,
  loading,
  user,
  onSelect,
  onCreate,
  onDelete,
  onSignOut,
  className,
}: TocSidebarProps) {
  const router = useRouter();
  const displayUser = user
    ? { name: user.name || user.email.split('@')[0] || '用户', email: user.email }
    : null;

  return (
    <aside
      className={cn(
        'hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex',
        className
      )}
    >
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-sidebar-border px-3">
        <div className="flex min-w-0 items-center gap-2">
          <Logo />
          <span className="truncate text-sm font-semibold">灵犀笔记</span>
        </div>
        <button
          type="button"
          onClick={onCreate}
          title="新建文章"
          className="flex size-8 items-center justify-center rounded-md text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Plus className="size-4" />
        </button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto p-2">
        {loading ? (
          <p className="px-2 py-1.5 text-sm text-muted-foreground">加载中…</p>
        ) : notes.length === 0 ? (
          <p className="px-2 py-1.5 text-sm text-muted-foreground">
            还没有文章，点击右上角 + 新建
          </p>
        ) : (
          <ul className="space-y-1">
            {notes.map((note) => {
              const active = note.id === currentId;
              return (
                <li key={note.id}>
                  <div
                    className={cn(
                      'group flex items-center rounded-md transition-colors',
                      active
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'hover:bg-sidebar-accent/60'
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => onSelect(note.id)}
                      className="flex min-w-0 flex-1 items-center gap-2 truncate px-2 py-2 text-left text-sm"
                    >
                      <FileText
                        className={cn(
                          'size-4 shrink-0',
                          active
                            ? 'text-sidebar-accent-foreground'
                            : 'text-muted-foreground'
                        )}
                      />
                      <span className="truncate">{note.title || '无标题'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(note.id)}
                      title="删除文章"
                      className="hidden size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-sidebar-foreground group-hover:flex"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-3.5"
                        aria-hidden
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </nav>

      <div className="flex shrink-0 items-center gap-2 border-t border-sidebar-border px-3 py-2.5">
        <button
          type="button"
          onClick={() => (displayUser ? undefined : router.push('/login'))}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-medium text-sidebar-accent-foreground">
            {displayUser ? displayUser.name.slice(0, 1).toUpperCase() : '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{displayUser ? displayUser.name : '未登录'}</p>
            <p className="truncate text-xs text-muted-foreground">
              {displayUser ? displayUser.email : '点击登录'}
            </p>
          </div>
        </button>
        {displayUser && (
          <button
            type="button"
            onClick={onSignOut}
            title="退出登录"
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="size-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
