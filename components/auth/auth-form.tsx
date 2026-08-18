'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

import { Logo } from '@/components/toc-sidebar';

type Mode = 'signin' | 'signup';

export function AuthForm() {
  const [mode, setMode] = React.useState<Mode>('signin');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('请输入邮箱和密码');
      return;
    }
    if (mode === 'signup' && password.length < 6) {
      setError('密码至少 6 位');
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === 'signup' ? '/api/auth/register' : '/api/auth/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // 携带 cookie，登录后服务端写入会话。
        credentials: 'same-origin',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error ?? '操作失败，请重试');
        return;
      }
      // 登录/注册成功，跳转首页触发会话生效。
      window.location.href = '/';
    } catch {
      setError('网络异常，请检查连接后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Logo />
          <h1 className="text-xl font-semibold text-foreground">灵犀笔记</h1>
          <p className="text-sm text-muted-foreground">
            {mode === 'signin' ? '登录你的笔记空间' : '创建新账号开始记录'}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-card p-6"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              邮箱
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-10 rounded-md border border-slate-200 bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-slate-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              密码
            </label>
            <input
              id="password"
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 6 位"
              className="h-10 rounded-md border border-slate-200 bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-slate-400"
            />
          </div>

          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={cn(
              'h-10 rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors',
              'hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60'
            )}
          >
            {loading ? '处理中…' : mode === 'signin' ? '登录' : '注册并登录'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode((m) => (m === 'signin' ? 'signup' : 'signin'));
            setError(null);
          }}
          className="mt-4 w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {mode === 'signin' ? '没有账号？点击注册' : '已有账号？返回登录'}
        </button>
      </div>
    </div>
  );
}
