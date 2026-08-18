# 项目长期记忆 (MEMORY.md)

## 项目概况
- 项目名：lingxi-note（灵犀笔记），基于 Next.js 16.3.0 (Turbopack) + Plate.js 53.x 的富文本笔记应用
- 技术栈：React 19.2.8，Plate.js 编辑器，shadcn/ui 风格组件，Tailwind v4，lucide 图标，sonner 提示
- 核心目录：`components/editor/`（编辑器，含 40 个 kit + 60 个插件文件）、`components/ui/`（122 个 shadcn 组件）、`app/`（页面+API）

## 用户视觉偏好（强约束，2026-08-13 确认）
- ❌ 禁止黑色/深色：所有界面必须亮色（white / slate-50 / slate-100）
- ❌ 禁止阴影（shadow-*）：所有 Card/按钮/容器不允许 shadow 类
- ✅ 使用 shadcn 干净样式：border-slate-200、轻量分隔、平铺布局、点缀式微交互
- ❌ 禁止 Emoji（含 ✨ ✓ 等）出现在 UI；用 lucide 图标或纯文字替代
- 侧边栏：白底 + 浅灰边框，不允许 slate-900 深色侧边栏

## 已知代码质量痛点（待优化）
- （已修复 2026-08-14）`plate-editor.tsx` 编辑器原无持久化，现已接防抖自动保存（800ms→PUT /api/notes/[id]）
- （已修复 2026-08-14）`settings-dialog.tsx` 注释块内含 `dark:bg-red-900`（不渲染但违反亮色约定），已删除该注释块；提示语改为"仅会话内存"

## 自建鉴权架构（2026-08-14 完成）
- 已彻底替代 Supabase Auth：自建 users 表 + scrypt 哈希 + 手写 HS256 JWT + HttpOnly cookie（lx_session, 7d）
- 数据隔离：后端 API 用 service_role + `where user_id = session.userId`，RLS auth.uid() 已失效
- 遗留 NULL 文章：注册时首个用户通过 `claimOrphanNotes()` 接管 `user_id IS NULL` 文章（app/api/auth/register + lib/auth/db.ts）
- dev 端口 8081（勿与 5180 混淆，5180 是其他项目）

## 待办
- 旧 NULL 文章认领策略已采用"首个注册用户接管"，如需改为"仅手动分配"需改 register 逻辑
- `settings-dialog.tsx` AI key 仍仅会话内存、无后端持久化（设计如此，非 bug）

## 用户协作偏好
- 优化按模块逐步推进，每步可见可验收
- 优化方向兼顾：代码质量与架构 / 功能完善 / 视觉与交互体验
