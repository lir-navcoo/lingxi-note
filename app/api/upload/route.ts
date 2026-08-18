import { NextResponse } from 'next/server';

import { getSessionUser } from '@/lib/auth/session';
import { createAdminClient } from '@/lib/supabase/admin';

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? 'note-media';
const MAX_FILE_SIZE = 50 * 1024 * 1024;

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120) || 'file';
}

async function ensureBucket(supabase: ReturnType<typeof createAdminClient>) {
  const { data, error } = await supabase.storage.getBucket(BUCKET);

  if (data) return null;
  if (error && !/not found|does not exist/i.test(error.message)) return error;

  const { error: createError } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: `${MAX_FILE_SIZE}`,
  });

  return createError ?? null;
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: '请选择要上传的文件' }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json({ error: '不能上传空文件' }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: '文件不能超过 50 MB' }, { status: 413 });
  }

  const supabase = createAdminClient();
  const bucketError = await ensureBucket(supabase);
  if (bucketError) {
    console.error('Supabase Storage bucket 初始化失败:', bucketError.message);
    return NextResponse.json(
      { error: 'Supabase Storage 未配置，请先创建 note-media 存储桶' },
      { status: 500 }
    );
  }

  const key = `${user.id}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
  const { error } = await supabase.storage.from(BUCKET).upload(key, file, {
    cacheControl: '3600',
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  });

  if (error) {
    console.error('Supabase Storage 上传失败:', error.message);
    return NextResponse.json({ error: '文件上传失败，请稍后重试' }, { status: 500 });
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(key);

  return NextResponse.json({
    key,
    name: file.name,
    size: file.size,
    type: file.type,
    url: data.publicUrl,
  });
}
