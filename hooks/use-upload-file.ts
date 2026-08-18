import * as React from 'react';

import { toast } from 'sonner';

export interface UploadedFile<T = unknown> {
  key: string;
  name: string;
  size: number;
  type: string;
  url: string;
  customData?: T;
}

interface UseUploadFileProps {
  onUploadComplete?: (file: UploadedFile) => void;
  onUploadError?: (error: unknown) => void;
}

export function useUploadFile({
  onUploadComplete,
  onUploadError,
}: UseUploadFileProps = {}) {
  const [uploadedFile, setUploadedFile] = React.useState<UploadedFile>();
  const [uploadingFile, setUploadingFile] = React.useState<File>();
  const [progress, setProgress] = React.useState(0);
  const [isUploading, setIsUploading] = React.useState(false);

  async function uploadFile(file: File) {
    setIsUploading(true);
    setUploadingFile(file);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploaded = await uploadWithProgress(formData, setProgress);

      setUploadedFile(uploaded);
      onUploadComplete?.(uploaded);
      toast.success('文件上传成功', { description: file.name });
      return uploaded;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error('图片上传失败', {
        description: message,
        duration: 6000,
      });
      onUploadError?.(error);
      return undefined;
    } finally {
      setProgress(0);
      setIsUploading(false);
      setUploadingFile(undefined);
    }
  }

  return {
    isUploading,
    progress,
    uploadedFile,
    uploadFile,
    uploadingFile,
  };
}

function uploadWithProgress(
  formData: FormData,
  onProgress: (progress: number) => void
): Promise<UploadedFile> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('POST', '/api/upload');
    request.responseType = 'json';

    request.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    request.addEventListener('load', () => {
      const body = request.response as { error?: string } | UploadedFile | null;
      if (request.status >= 200 && request.status < 300 && body && 'url' in body) {
        resolve(body);
        return;
      }

      reject(new Error(body && 'error' in body ? body.error : '上传失败，请稍后重试。'));
    });
    request.addEventListener('error', () => reject(new Error('网络连接失败，请检查 Supabase 配置。')));
    request.addEventListener('abort', () => reject(new Error('上传已取消。')));
    request.send(formData);
  });
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return '上传失败，请稍后重试。';
}

export function showErrorToast(error: unknown) {
  return toast.error(getErrorMessage(error));
}
