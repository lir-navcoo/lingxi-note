import * as React from 'react';

import type { OurFileRouter } from '@/lib/uploadthing';
import type {
  ClientUploadedFileData,
  UploadFilesOptions,
} from 'uploadthing/types';

import { generateReactHelpers } from '@uploadthing/react';
import { toast } from 'sonner';
import { z } from 'zod';

export type UploadedFile<T = unknown> = ClientUploadedFileData<T>;

interface UseUploadFileProps
  extends Pick<
    UploadFilesOptions<OurFileRouter['editorUploader']>,
    'headers' | 'onUploadBegin' | 'onUploadProgress' | 'skipPolling'
  > {
  onUploadComplete?: (file: UploadedFile) => void;
  onUploadError?: (error: unknown) => void;
}

export function useUploadFile({
  onUploadComplete,
  onUploadError,
  ...props
}: UseUploadFileProps = {}) {
  const [uploadedFile, setUploadedFile] = React.useState<UploadedFile>();
  const [uploadingFile, setUploadingFile] = React.useState<File>();
  const [progress, setProgress] = React.useState<number>(0);
  const [isUploading, setIsUploading] = React.useState(false);

  async function uploadThing(file: File) {
    setIsUploading(true);
    setUploadingFile(file);

    try {
      const res = await uploadFiles('editorUploader', {
        ...props,
        files: [file],
        onUploadProgress: ({ progress }) => {
          setProgress(Math.min(progress, 100));
        },
      });

      const uploaded = res[0];
      setUploadedFile(uploaded);
      onUploadComplete?.(uploaded);

      return uploaded;
    } catch (error) {
      const errorMessage = getErrorMessage(error);

      const message =
        errorMessage.length > 0
          ? errorMessage
          : '上传失败，请稍后重试。';

      const isTokenError = /token|unauthorized|forbidden|401|403/i.test(
        errorMessage
      );

      toast.error(isTokenError ? '图片上传配置无效' : '图片上传失败', {
        description: isTokenError
          ? '请配置有效的 UPLOADTHING_TOKEN，并重启开发服务器后重试。'
          : message,
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
    uploadFile: uploadThing,
    uploadingFile,
  };
}

export const { uploadFiles, useUploadThing } =
  generateReactHelpers<OurFileRouter>();

export function getErrorMessage(err: unknown) {
  const unknownError = 'Something went wrong, please try again later.';

  if (err instanceof z.ZodError) {
    const errors = err.issues.map((issue) => issue.message);

    return errors.join('\n');
  }
  if (err instanceof Error) {
    return err.message;
  }
  return unknownError;
}

export function showErrorToast(err: unknown) {
  const errorMessage = getErrorMessage(err);

  return toast.error(errorMessage);
}
