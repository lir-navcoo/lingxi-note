'use client';

import * as React from 'react';

interface ArticleItem {
  id: string;
  parentId: string | null;
  position: number;
  title: string;
}

interface PreviewHeading {
  depth: number;
  id: string;
  title: string;
}

interface PreviewNavigationProps {
  articles: ArticleItem[];
  currentId: string;
  headings: PreviewHeading[];
}

function ArticleTree({
  articles,
  currentId,
  parentId = null,
  level = 0,
}: {
  articles: ArticleItem[];
  currentId: string;
  parentId?: string | null;
  level?: number;
}) {
  const items = articles
    .filter((article) => article.parentId === parentId)
    .sort((a, b) => a.position - b.position || a.title.localeCompare(b.title, 'zh-CN'));

  if (items.length === 0) return null;

  return (
    <ul className={level > 0 ? 'mt-1 space-y-1' : 'space-y-1'}>
      {items.map((article) => (
        <li key={article.id}>
          <a
            className={`block rounded-md py-1.5 pr-2 text-sm leading-5 transition-colors ${
              article.id === currentId
                ? 'bg-slate-100 font-medium text-slate-900'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
            href={`/preview/${article.id}`}
            style={{ paddingLeft: `${8 + level * 16}px` }}
          >
            {article.title || '无标题'}
          </a>
          <ArticleTree
            articles={articles}
            currentId={currentId}
            level={level + 1}
            parentId={article.id}
          />
        </li>
      ))}
    </ul>
  );
}

export function PreviewNavigation({
  articles,
  currentId,
  headings,
}: PreviewNavigationProps) {
  const [view, setView] = React.useState<'articles' | 'headings'>('articles');

  return (
    <aside className="h-fit w-full shrink-0 self-start lg:sticky lg:top-8 lg:w-56">
      <div className="mb-3 flex items-center gap-1 border-b border-slate-200">
        <button
          className={`border-b-2 px-1 pb-2 text-sm font-semibold transition-colors ${
            view === 'articles'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
          onClick={() => setView('articles')}
          type="button"
        >
          文章目录
        </button>
        {headings.length > 0 && (
          <button
            className={`border-b-2 px-1 pb-2 text-sm font-semibold transition-colors ${
              view === 'headings'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
            onClick={() => setView('headings')}
            type="button"
          >
            本文目录
          </button>
        )}
      </div>

      <nav aria-label={view === 'articles' ? '文章目录' : '本文目录'}>
        {view === 'articles' ? (
          <ArticleTree articles={articles} currentId={currentId} />
        ) : (
          <ul className="space-y-1 border-l border-slate-200">
            {headings.map((heading) => (
              <li key={heading.id}>
                <a
                  className="block py-1.5 pr-2 text-sm leading-5 text-slate-500 transition-colors hover:text-slate-900"
                  href={`#${heading.id}`}
                  style={{ paddingLeft: `${8 + (heading.depth - 1) * 16}px` }}
                >
                  {heading.title}
                </a>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </aside>
  );
}
