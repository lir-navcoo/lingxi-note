'use client';

import * as React from 'react';

import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function PreviewPage() {
  const router = useRouter();
  const [open, setOpen] = React.useState(true);

  const goHome = React.useCallback(() => {
    setOpen(false);
    toast.info('预览功能仅支持在编辑器中打开图片');
    router.replace('/');
  }, [router]);

  return (
    <>
      <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && goHome()}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>暂不支持独立预览</DialogTitle>
            <DialogDescription>
              请在笔记编辑器中点击图片打开预览。当前地址没有可直接预览的内容。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" onClick={goHome}>
              返回笔记
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster position="top-center" />
    </>
  );
}
