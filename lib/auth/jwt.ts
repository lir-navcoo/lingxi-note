import { createHmac, timingSafeEqual } from 'node:crypto';

import type { SessionUser } from '@/lib/auth/session';

const base64url = (buf: Buffer) => buf.toString('base64url');

function sign(data: string, secret: string): string {
  return createHmac('sha256', secret).update(data).digest('base64url');
}

/**
 * 签发会话 JWT（HS256，零外部依赖）。
 * payload 仅含必要字段，过期时间由 exp 控制。
 */
export function signSession(user: SessionUser, secret: string, maxAgeSec: number): string {
  const header = base64url(Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const now = Math.floor(Date.now() / 1000);
  const payload = base64url(
    Buffer.from(
      JSON.stringify({
        sub: user.id,
        email: user.email,
        name: user.name ?? null,
        iat: now,
        exp: now + maxAgeSec,
      })
    )
  );
  const signature = sign(`${header}.${payload}`, secret);
  return `${header}.${payload}.${signature}`;
}

/** 校验 JWT 签名与过期时间，返回 payload；无效则返回 null。 */
export function verifySession(token: string, secret: string): SessionUser | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts;
  const expected = sign(`${header}.${payload}`, secret);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      sub: string;
      email: string;
      name?: string | null;
      exp?: number;
    };
    if (!data.sub || !data.email) return null;
    if (typeof data.exp === 'number' && data.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return { id: data.sub, email: data.email, name: data.name ?? null };
  } catch {
    return null;
  }
}
