# 灵犀笔记

灵犀笔记是一个基于 Next.js App Router 与 Plate.js 构建的富文本笔记应用，支持用户鉴权、笔记管理、自动保存、富文本编辑和文件上传。

## 功能

- 用户注册、登录、退出及会话续期
- 按用户隔离笔记数据
- 创建、浏览、编辑和删除笔记
- 富文本块编辑器与自动保存
- 表格、代码块、数学公式、链接、媒体、目录等 Plate.js 插件
- Markdown、DOCX 等内容处理能力
- 通过 UploadThing 上传图片、文档、音视频等文件
- AI 编辑命令与 Copilot 接口（部分前端逻辑仍使用模拟响应）

## 技术栈

- Next.js 16.3、React 19、TypeScript
- Plate.js 53
- Tailwind CSS 4、Radix UI、Lucide React
- Supabase PostgreSQL
- UploadThing
- 自建用户表、HS256 JWT、HttpOnly Cookie

## 环境要求

- Node.js 20 或更高版本
- pnpm 9
- 可用的 Supabase 项目或本地 Supabase 实例

## 本地开发

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

复制示例文件：

```bash
cp .env.local.example .env.local
```

在 `.env.local` 中填写以下配置：

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

AUTH_JWT_SECRET=replace-with-a-long-random-secret

UPLOADTHING_TOKEN=your-uploadthing-token

# 可选：启用真实 AI Gateway 请求时配置
AI_GATEWAY_API_KEY=your-ai-gateway-api-key
```

安全注意：

- `SUPABASE_SERVICE_ROLE_KEY`、`AUTH_JWT_SECRET`、`UPLOADTHING_TOKEN` 只能在服务端使用。
- 不要给这些变量添加 `NEXT_PUBLIC_` 前缀。
- 不要提交包含真实密钥的 `.env.local`。

### 3. 初始化数据库

在 Supabase SQL Editor 中依次执行：

1. `supabase/schema.sql`：创建 `notes` 表、索引和更新时间触发器。
2. `supabase/users.sql`：创建自建鉴权使用的 `users` 表。

`supabase/rls.sql` 面向 Supabase Auth 的 `auth.uid()` 方案。当前项目使用自建 JWT 鉴权和服务端用户 ID 过滤，不需要执行该文件。

### 4. 启动开发服务器

```bash
pnpm dev
```

打开 [http://localhost:8081](http://localhost:8081)。

## 常用命令

```bash
pnpm dev     # 启动开发服务器，端口 8081
pnpm build   # 创建生产构建
pnpm start   # 启动生产服务器，端口 8081
pnpm lint    # 执行 ESLint 检查
```

## 主要路由

| 路由 | 说明 |
| --- | --- |
| `/` | 笔记列表首页 |
| `/login` | 登录与注册 |
| `/editor/[id]` | 笔记编辑页 |

## API

| 路由 | 方法 | 说明 |
| --- | --- | --- |
| `/api/auth/register` | `POST` | 注册并创建会话 |
| `/api/auth/login` | `POST` | 登录并创建会话 |
| `/api/auth/logout` | `POST` | 退出登录 |
| `/api/auth/me` | `GET` | 获取当前用户 |
| `/api/notes` | `GET`、`POST` | 查询和创建笔记 |
| `/api/notes/[id]` | `GET`、`PUT`、`DELETE` | 查询、更新和删除单篇笔记 |
| `/api/uploadthing` | `GET`、`POST` | UploadThing 上传处理器 |
| `/api/ai/command` | `POST` | AI 编辑命令 |
| `/api/ai/copilot` | `POST` | AI Copilot 接口 |

## 鉴权说明

项目不使用 Supabase Auth。用户信息存储在 `public.users` 表中，登录成功后由服务端签发 HS256 JWT，并写入名为 `lx_session` 的 HttpOnly Cookie。会话默认有效期为 7 天。

`proxy.ts` 负责受保护路由的登录校验和会话处理；笔记 API 使用会话中的用户 ID 查询及修改数据。

## 文件上传

上传端点由 `lib/uploadthing.ts` 中的 `editorUploader` 定义，支持图片、文本、Blob、PDF、视频和音频。使用前必须配置有效的 `UPLOADTHING_TOKEN`，修改环境变量后需要重启开发服务器。

## 项目结构

```text
app/                  页面与 API 路由
components/auth/      登录和注册组件
components/editor/    Plate 编辑器及插件
components/ui/        通用 UI 组件
hooks/                 React Hooks
lib/auth/              用户、密码、JWT 和会话逻辑
lib/supabase/          Supabase 服务端访问
lib/notes.ts           笔记 API 客户端
lib/uploadthing.ts     UploadThing 文件路由
supabase/              数据库初始化 SQL
proxy.ts               路由鉴权与会话处理
```
