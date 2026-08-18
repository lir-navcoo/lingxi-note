import { createClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/supabase/database';

/**
 * 服务端管理员客户端（service_role）。
 * 绕过 RLS，仅在受信任的后端 API 内使用；
 * 所有查询必须手动叠加 user_id 过滤，保证多用户数据隔离。
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
