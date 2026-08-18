export const SESSION_COOKIE = 'lx_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 天

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
}

/**
 * 服务端读取并校验会话 cookie，返回当前登录用户；未登录或无效返回 null。
 * 必须在请求上下文中调用（依赖 next/headers 的 cookies）。
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret) return null;
  const { cookies } = await import('next/headers');
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const { verifySession } = await import('@/lib/auth/jwt');
  return verifySession(token, secret);
}
