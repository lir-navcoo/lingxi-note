import { NextResponse, type NextRequest } from 'next/server';

import { SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/auth/session';
import { verifySession } from '@/lib/auth/jwt';

// 免鉴权路径：登录页、公开预览、鉴权 API、静态资源。
const PUBLIC_PATHS = ['/login', '/preview', '/api/auth'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.AUTH_JWT_SECRET;
  const user = secret && token ? verifySession(token, secret) : null;

  // 已登录访问登录页 -> 首页。
  if (pathname === '/login' && user) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 未登录访问受保护路径 -> 登录页。
  if (!isPublic && !user) {
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }

  // 续期：每次请求刷新 cookie 过期时间，保持活跃登录。
  const res = NextResponse.next();
  if (user && token) {
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    });
  }
  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
