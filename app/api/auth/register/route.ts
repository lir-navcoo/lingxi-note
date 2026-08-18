import { NextResponse, type NextRequest } from 'next/server';

import { SESSION_COOKIE, SESSION_MAX_AGE, type SessionUser } from '@/lib/auth/session';
import { signSession } from '@/lib/auth/jwt';
import { hashPassword } from '@/lib/auth/password';
import { claimOrphanNotes, createUser, findUserByEmail } from '@/lib/auth/db';

export async function POST(req: NextRequest) {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret) {
    return NextResponse.json({ error: '服务器未配置鉴权密钥' }, { status: 500 });
  }

  let body: { email?: string; password?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
  }

  const email = (body.email ?? '').trim().toLowerCase();
  const password = body.password ?? '';
  const name = (body.name ?? '').trim() || email.split('@')[0];

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: '邮箱格式不正确' }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: '密码至少 6 位' }, { status: 400 });
  }

  try {
    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: '该邮箱已注册，请直接登录' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser(email, passwordHash, name);

    // 首个注册用户接管遗留的 NULL 文章，避免旧数据不可见。
    await claimOrphanNotes(user.id).catch((e) =>
      console.error('认领遗留文章失败', e)
    );

    const sessionUser: SessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
    };
    const token = signSession(sessionUser, secret, SESSION_MAX_AGE);

    const res = NextResponse.json({ user: sessionUser });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    });
    return res;
  } catch (err) {
    console.error('注册失败', err);
    return NextResponse.json({ error: '注册失败，请稍后重试' }, { status: 500 });
  }
}
