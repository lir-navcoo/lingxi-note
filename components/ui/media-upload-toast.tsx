'use client';

import * as React from 'react';

import { PlaceholderPlugin, UploadErrorCode } from '@platejs/media/react';
import { usePluginOption } from 'platejs/react';
import { toast } from 'sonner';

export function MediaUploadToast() {
  useUploadErrorToast();

  return null;
}

const useUploadErrorToast = () => {
  const uploadError = usePluginOption(PlaceholderPlugin, 'error');

  React.useEffect(() => {
    if (!uploadError) return;

    const { code, data } = uploadError;

    switch (code) {
      case UploadErrorCode.INVALID_FILE_SIZE: {
        toast.error('文件大小无效', {
          description: `请检查：${data.files.map((f) => f.name).join('、')}`,
        });
        break;
      }
      case UploadErrorCode.INVALID_FILE_TYPE: {
        toast.error('文件类型不支持', {
          description: `请检查：${data.files.map((f) => f.name).join('、')}`,
        });
        break;
      }
      case UploadErrorCode.TOO_LARGE: {
        toast.error('文件过大', {
          description: `单次上传不能超过 ${data.maxFileSize}`,
        });
        break;
      }
      case UploadErrorCode.TOO_LESS_FILES: {
        toast.error('上传文件数量不足', {
          description: `至少需要上传 ${data.minFileCount} 个${data.fileType ?? '文件'}`,
        });
        break;
      }
      case UploadErrorCode.TOO_MANY_FILES: {
        toast.error('上传文件数量过多', {
          description: `最多上传 ${data.maxFileCount} 个${data.fileType ?? '文件'}`,
        });
        break;
      }
    }
  }, [uploadError]);
};
