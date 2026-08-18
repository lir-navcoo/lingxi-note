'use client';

import * as React from 'react';

import { Check, Loader2 } from 'lucide-react';
import { normalizeStaticValue, type Value } from 'platejs';
import { Plate, usePlateEditor } from 'platejs/react';

import { EditorKit } from '@/components/editor/editor-kit';
import { SettingsDialog } from '@/components/editor/settings-dialog';
import { Editor, EditorContainer } from '@/components/ui/editor';

import { updateNoteContent, updateNoteTitle } from '@/lib/notes';

const DEFAULT_VALUE: Value = normalizeStaticValue([
  {
    children: [{ text: '欢迎使用灵犀笔记' }],
    type: 'h1',
  },
  {
    children: [
      {
        text: '在左侧「文章」菜单点击 + 新建一篇笔记，开始你的写作。所有内容会自动保存到云端。',
      },
    ],
    type: 'p',
  },
]);

interface PlateEditorProps {
  noteId: string;
  initialValue: Value;
  onSaved?: () => void;
}

export function PlateEditor({ noteId, initialValue, onSaved }: PlateEditorProps) {
  const editor = usePlateEditor({
    plugins: EditorKit,
    value: initialValue,
  });

  // 保存状态：idle 空闲 / saving 保存中 / saved 已保存 / error 失败。
  const [saveState, setSaveState] = React.useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // noteId 用 ref 固定，避免防抖保存时拿到切换后的新文章 id。
  const noteIdRef = React.useRef(noteId);
  noteIdRef.current = noteId;

  // 内容变更后防抖保存。
  const saveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  // 卸载或切换文章时取消挂起的保存，避免写入错误文章。
  React.useEffect(() => {
    setSaveState('idle');
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [noteId]);

  const handleChange = () => {
    setSaveState('saving');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const targetId = noteIdRef.current;
      const content = editor.children as unknown as Parameters<typeof updateNoteContent>[1];
      const title = extractTitle(editor.children);

      try {
        await updateNoteContent(targetId, content);
        if (title) await updateNoteTitle(targetId, title);
        setSaveState('saved');
        onSaved?.();
      } catch (err) {
        console.error('保存失败', err);
        setSaveState('error');
      }
    }, 800);
  };

  return (
    <Plate key={noteId} editor={editor} onChange={handleChange}>
      <div className="flex h-9 shrink-0 items-center justify-end border-b border-slate-200 px-4 text-xs text-muted-foreground">
        {saveState === 'saving' && (
          <span className="flex items-center gap-1.5">
            <Loader2 className="size-3.5 animate-spin" />
            保存中…
          </span>
        )}
        {saveState === 'saved' && (
          <span className="flex items-center gap-1.5">
            <Check className="size-3.5 text-emerald-600" />
            已自动保存
          </span>
        )}
        {saveState === 'error' && <span className="text-red-600">保存失败，请检查网络</span>}
      </div>

      <EditorContainer variant="default">
        <Editor variant="default" />
      </EditorContainer>

      <SettingsDialog />
    </Plate>
  );
}

/** 从文档第一行提取标题（取首个 heading 或首段纯文本）。 */
function extractTitle(children: unknown): string | null {
  const nodes = (children as Array<{ children?: Array<{ text?: string }>; type?: string }>) ?? [];
  for (const node of nodes) {
    const text = node.children?.[0]?.text?.trim();
    if (text) return text.slice(0, 80);
  }
  return null;
}

export { DEFAULT_VALUE };
