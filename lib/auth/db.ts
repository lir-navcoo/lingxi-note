import { createAdminClient } from '@/lib/supabase/admin';

import type { SessionUser } from '@/lib/auth/session';

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  name: string | null;
}

/** 按邮箱查用户（含密码哈希，仅后端使用）。 */
export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('users')
    .select('id, email, password_hash, name')
    .eq('email', email.toLowerCase())
    .maybeSingle();
  if (error) throw error;
  return (data as UserRow | null) ?? null;
}

/** 创建用户，返回脱敏后的会话用户。 */
export async function createUser(
  email: string,
  passwordHash: string,
  name: string | null
): Promise<SessionUser> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('users')
    .insert({ email: email.toLowerCase(), password_hash: passwordHash, name })
    .select('id, email, name')
    .single();
  if (error) throw error;
  return data as SessionUser;
}

/**
 * 认领遗留文章：把 user_id 为 NULL 的文章归属给指定用户。
 * 用于平滑迁移旧数据（自建鉴权前无 user_id 的文章对所有账号不可见）。
 * 首个注册用户会接管这些文章，后续注册用户不受影响。
 */
export async function claimOrphanNotes(userId: string): Promise<number> {
  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from('notes')
    .update({ user_id: userId })
    .is('user_id', null)
    .select('*', { count: 'exact', head: true });
  if (error) throw error;
  return count ?? 0;
}
