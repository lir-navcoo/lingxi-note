import { createRouteHandler } from 'uploadthing/next';

import { ourFileRouter } from '@/lib/uploadthing';

if (!process.env.UPLOADTHING_TOKEN) {
  console.error('缺少 UPLOADTHING_TOKEN，文件上传功能不可用。');
}

export const { GET, POST } = createRouteHandler({ router: ourFileRouter });
