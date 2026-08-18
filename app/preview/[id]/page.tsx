import type { Metadata } from 'next';

import { notFound } from 'next/navigation';
import {
  createSlateEditor,
  NodeApi,
  normalizeStaticValue,
  type TElement,
  type Value,
} from 'platejs';
import { isHeading } from '@platejs/toc';

import { BaseEditorKit } from '@/components/editor/editor-base-kit';
import { PreviewNavigation } from '@/app/preview/preview-navigation';
import { EditorStatic } from '@/components/ui/editor-static';
import { createAdminClient } from '@/lib/supabase/admin';

interface PreviewPageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0;

async function getPublicNote(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('notes')
    .select('id, title, content, updated_at, parent_id, position, user_id')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;

  return data;
}

async function getPublicArticles(userId: string | null) {
  const supabase = createAdminClient();
  let query = supabase.from('notes').select('id, title, parent_id, position');

  query = userId === null ? query.is('user_id', null) : query.eq('user_id', userId);

  const { data, error } = await query
    .order('position', { ascending: true })
    .order('title', { ascending: true });

  if (error) return [];

  return data ?? [];
}

const headingDepth: Record<string, number> = {
  h1: 1,
  h2: 2,
  h3: 3,
  h4: 4,
  h5: 5,
  h6: 6,
};

interface PreviewHeading {
  depth: number;
  id: string;
  title: string;
}

function addHeadingIds(value: Value, headings: PreviewHeading[], counter = { value: 0 }): Value {
  return value.map((node) => {
    const nextNode = { ...node } as TElement;

    if (isHeading(nextNode)) {
      const title = NodeApi.string(nextNode);
      const id =
        typeof nextNode.id === 'string' && nextNode.id
          ? nextNode.id
          : `preview-heading-${counter.value}`;

      counter.value += 1;
      nextNode.id = id;

      if (title) {
        headings.push({
          depth: headingDepth[nextNode.type] ?? 1,
          id,
          title,
        });
      }
    }

    if (Array.isArray(nextNode.children)) {
      nextNode.children = nextNode.children.map((child) => {
        if (!('children' in child)) return child;
        return addHeadingIds([child as TElement], headings, counter)[0];
      });
    }

    return nextNode;
  });
}

export async function generateMetadata({
  params,
}: PreviewPageProps): Promise<Metadata> {
  const { id } = await params;
  const note = await getPublicNote(id);

  return {
    title: note ? `${note.title || '无标题'} - 灵犀笔记` : '笔记不存在 - 灵犀笔记',
  };
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { id } = await params;
  const note = await getPublicNote(id);

  if (!note) notFound();

  const articles = await getPublicArticles(note.user_id);
  const rawValue = normalizeStaticValue(
    Array.isArray(note.content)
      ? (note.content as Value)
      : [{ children: [{ text: '' }], type: 'p' }]
  );
  const headings: PreviewHeading[] = [];
  const value = addHeadingIds(rawValue, headings);
  const titleValue = value.slice(0, 1);
  const contentValue = value.slice(1);
  const titleEditor = createSlateEditor({
    plugins: BaseEditorKit,
    value: titleValue,
  });
  const contentEditor = createSlateEditor({
    plugins: BaseEditorKit,
    value: contentValue,
  });

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 sm:px-10 lg:flex-row">
        <PreviewNavigation
          articles={articles.map((article) => ({
            id: article.id,
            parentId: article.parent_id,
            position: article.position,
            title: article.title,
          }))}
          currentId={note.id}
          headings={headings}
        />

        <article className="min-w-0 flex-1 max-w-3xl">
          <EditorStatic
          className="min-h-0 p-0 text-base leading-7"
          editor={titleEditor}
          value={titleValue}
        />

        <p className="mb-8 mt-2 text-sm text-slate-500">
          更新于 {new Date(note.updated_at).toLocaleString('zh-CN')}
        </p>

          <EditorStatic
            className="min-h-0 p-0 text-base leading-7"
            editor={contentEditor}
            value={contentValue}
          />
        </article>
      </div>
    </main>
  );
}
