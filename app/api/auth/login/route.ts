import { NextResponse, type NextRequest } from 'next/server';

import { SESSION_COOKIE, SESSION_MAX_AGE, type SessionUser } from '@/lib/auth/session';
import { signSession } from '@/lib/auth/jwt';
import { verifyPassword } from '@/lib/auth/password';
import { findUserByEmail } from '@/lib/auth/db';

export async function POST(req: NextRequest) {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret) {
    return NextResponse.json({ error: '服务器未配置鉴权密钥' }, { status: 500 });
  }

  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
  }

  const email = (body.email ?? '').trim().toLowerCase();
  const password = body.password ?? '';

  if (!email || !password) {
    return NextResponse.json({ error: '请输入邮箱和密码' }, { status: 400 });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return NextResponse.json({ error: '邮箱或密码不正确' }, { status: 401 });
    }

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
    console.error('登录失败', err);
    return NextResponse.json({ error: '登录失败，请稍后重试' }, { status: 500 });
  }
}
