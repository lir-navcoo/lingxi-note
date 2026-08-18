import type { Metadata } from "next";

import { AuthForm } from '@/components/auth/auth-form';

export const metadata: Metadata = {
  title: "登录 · 灵犀笔记",
};

export default function LoginPage() {
  return <AuthForm />;
}
