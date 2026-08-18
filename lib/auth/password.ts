import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

const KEYLEN = 64;

/** 使用 scrypt 哈希密码，返回 `salt:derivedHex` 形式。零外部依赖。 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derived = (await scryptAsync(password, salt, KEYLEN)) as Buffer;
  return `${salt}:${derived.toString('hex')}`;
}

/** 校验明文密码与存储的哈希是否匹配（恒定时间比较，抗时序攻击）。 */
export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const derived = (await scryptAsync(password, salt, KEYLEN)) as Buffer;
  const hashBuf = Buffer.from(hash, 'hex');
  if (hashBuf.length !== derived.length) return false;
  return timingSafeEqual(hashBuf, derived);
}
