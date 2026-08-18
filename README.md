# 灵犀笔记

灵犀笔记（Lingxi Note）是一款面向个人知识整理的现代化富文本笔记应用。

它以文档为核心，将快速记录、结构化编辑和内容预览结合在一起，帮助用户沉淀可持续维护的个人知识库。项目基于 Next.js App Router 与 Plate.js 构建，支持多用户数据隔离、自动保存、丰富的富文本节点以及文件上传。

## 项目亮点

- **专注文档创作**：提供清晰的笔记列表、编辑和只读预览体验。
- **强大的富文本编辑器**：支持表格、代码块、数学公式、链接、媒体、折叠块和目录等内容类型。
- **可靠的编辑体验**：编辑内容自动保存，减少意外丢失风险。
- **完善的账户体系**：支持注册、登录、退出和会话续期，笔记数据按用户隔离。
- **灵活的内容处理**：支持 Markdown、DOCX 等格式处理，并可上传图片、文档和音视频文件。
- **AI 辅助能力**：提供 AI 编辑命令与 Copilot 接口，便于后续扩展智能写作和内容整理能力。

## 功能

- 用户注册、登录、退出及会话续期
- 按用户隔离笔记数据
- 创建、浏览、编辑和删除笔记
- 富文本块编辑器与自动保存
- 表格、代码块、数学公式、链接、媒体、目录等 Plate.js 插件
- Markdown、DOCX 等内容处理能力
- 通过 Supabase Storage 上传图片、文档、音视频等文件
- AI 编辑命令与 Copilot 接口（部分前端逻辑仍使用模拟响应）

## 技术栈

- Next.js 16.3、React 19、TypeScript
- Plate.js 53
- Tailwind CSS 4、Radix UI、Lucide React
- Supabase PostgreSQL
- Supabase Storage
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

SUPABASE_STORAGE_BUCKET=note-media

# 可选：启用真实 AI Gateway 请求时配置
AI_GATEWAY_API_KEY=your-ai-gateway-api-key
```

安全注意：

- `SUPABASE_SERVICE_ROLE_KEY`、`AUTH_JWT_SECRET` 只能在服务端使用。
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

## 部署手册

### 部署前准备

部署前需要准备：

- 一个可访问的 Supabase 项目。
- Node.js 20 或更高版本。
- pnpm 9，与 `package.json` 中的版本保持一致。
- 一个不少于 32 字节的随机 JWT 密钥。

可以使用以下命令生成 JWT 密钥：

```bash
openssl rand -base64 48
```

在 Supabase SQL Editor 中依次执行：

1. `supabase/schema.sql`
2. `supabase/users.sql`

然后在 Supabase 项目设置中取得项目 URL、公开密钥和 `service_role` 密钥。

生产环境必须配置以下变量：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
AUTH_JWT_SECRET=your-long-random-secret
SUPABASE_STORAGE_BUCKET=note-media

# 可选
AI_GATEWAY_API_KEY=your-ai-gateway-api-key
```

安全要求：

- `SUPABASE_SERVICE_ROLE_KEY` 和 `AUTH_JWT_SECRET` 不得暴露到浏览器或提交到 Git。
- 只有 `NEXT_PUBLIC_` 开头的变量可以作为公开变量。
- 生产环境必须使用 HTTPS，否则安全 Cookie 无法正常工作。
- 更换 `AUTH_JWT_SECRET` 会使现有用户会话全部失效。

### 方案一：部署到 Vercel

1. 将项目推送到 GitHub。
2. 登录 Vercel，选择 **Add New Project** 并导入仓库。
3. Framework Preset 选择 **Next.js**。
4. Install Command 使用：

   ```bash
   pnpm install --frozen-lockfile
   ```

5. Build Command 使用：

   ```bash
   pnpm build
   ```

6. 在项目的 **Settings → Environment Variables** 中添加上述生产环境变量。
7. 点击部署，完成后访问 Vercel 分配的 HTTPS 域名。

修改环境变量后需要重新部署，新的服务实例才会读取最新配置。

### 方案二：使用 Docker Compose 本地化部署

项目提供 `Dockerfile` 和 `docker-compose.yml`，可同时启动：

- 灵犀笔记应用
- Supabase PostgreSQL
- PostgREST
- Supabase Storage
- Kong API 网关

项目使用自建用户与 JWT 鉴权，因此不额外启动 Supabase Auth；Studio 和 Realtime 也不属于应用运行依赖。数据库与上传文件分别保存在 Docker Volume 中。

#### 服务器配置建议

以下配置包含应用、PostgreSQL、PostgREST、Storage 和 Kong。首次构建 Next.js 镜像时的资源占用明显高于日常运行：

| 场景 | CPU | 内存 | 可用磁盘 | 适用情况 |
| --- | --- | --- | --- | --- |
| 最低配置 | 2 核 | 4 GB | 10 GB | 个人低频使用；构建时应关闭其他高占用服务 |
| 推荐配置 | 4 核 | 8 GB | 20 GB 以上 | 日常使用、多人访问及后续升级 |
| 较高负载 | 8 核 | 16 GB 以上 | 50 GB 以上 | 较多用户、大量媒体文件或频繁构建 |

资源说明：

- **构建阶段**：建议保证 Docker 可用内存不少于 4 GB；低于该值时，Next.js 构建可能显示 `Killed` 或无明确错误直接退出。
- **运行阶段**：空闲时整套服务通常可在 2–3 GB 内存内运行，但数据库缓存、并发请求和文件处理会提高占用，因此生产环境建议使用 8 GB 内存。
- **磁盘空间**：应用镜像、基础镜像和首次构建缓存会占用数 GB；数据库和上传文件会持续增长。若需要保存较多图片、音视频，应按实际文件量额外预留空间。
- **Docker Desktop**：在 macOS 或 Windows 上部署时，需要在 Docker Desktop 的资源设置中分配至少 4 GB 内存，推荐 6–8 GB；该数值不是整台机器的总内存。
- **网络与端口**：默认需要开放应用端口 `8081`；Supabase API 默认使用 `8000`，如仅供应用内部访问，生产环境不建议直接暴露到公网。
- **生产环境**：建议使用 Linux x86_64/amd64 主机，并在服务前配置 HTTPS 反向代理。建议同时为 Docker Volume 和 `.env.docker` 制定备份策略。

1. 自动生成本地密钥：

   ```bash
   sh scripts/docker-setup.sh
   ```

   命令会创建已被 Git 忽略的 `.env.docker`，其中包含数据库密码、Supabase JWT、anon/service_role key 和应用会话密钥。不要提交该文件。

2. 一键构建并启动：

   ```bash
   docker compose --env-file .env.docker up -d --build
   ```

3. 访问服务：

   - 应用：`http://localhost:8081`
   - 本地 Supabase API：`http://localhost:8000`

   如果端口已被占用，可修改 `.env.docker` 中的 `APP_PORT` 或 `SUPABASE_PORT`。

4. 查看状态和日志：

   ```bash
   docker compose --env-file .env.docker ps
   docker compose --env-file .env.docker logs -f app
   ```

5. 停止服务：

   ```bash
   docker compose --env-file .env.docker down
   ```

   默认不会删除数据库和上传文件。需要彻底清空本地数据时使用：

   ```bash
   docker compose --env-file .env.docker down -v
   ```

6. 更新项目：

   ```bash
   git pull
   docker compose --env-file .env.docker up -d --build
   ```

首次启动会自动执行 `supabase/schema.sql`、`supabase/users.sql`，并初始化 PostgREST 与 Storage 权限。生产环境建议在应用和 Supabase 网关前配置 Nginx、Caddy 或云负载均衡，并通过 HTTPS 暴露服务。

该项目依赖较多，构建应用镜像时建议为 Docker 分配至少 4 GB 内存；如果 Next.js 构建中途仅显示 `Killed` 或无错误直接退出，通常是 Docker 内存不足。

### 方案三：部署到自建服务器

以下示例适用于 Ubuntu、Debian 等 Linux 服务器。

1. 拉取代码并安装依赖：

   ```bash
   git clone <your-repository-url> lingxi-note
   cd lingxi-note
   corepack enable
   corepack prepare pnpm@9.15.9 --activate
   pnpm install --frozen-lockfile
   ```

2. 创建生产环境变量文件：

   ```bash
   cp .env.local.example .env.local
   ```

   编辑 `.env.local`，补充全部生产环境变量，特别是 `SUPABASE_SERVICE_ROLE_KEY` 和 `AUTH_JWT_SECRET`。

3. 构建并启动：

   ```bash
   pnpm build
   pnpm start
   ```

   应用默认监听 `8081` 端口。

4. 使用进程管理器保持服务运行。以 PM2 为例：

   ```bash
   npm install --global pm2
   pm2 start pnpm --name lingxi-note -- start
   pm2 save
   pm2 startup
   ```

5. 使用 Nginx 配置 HTTPS 反向代理：

   ```nginx
   server {
       listen 80;
       server_name note.example.com;

       location / {
           proxy_pass http://127.0.0.1:8081;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

6. 使用 Certbot 或云服务商提供的证书为域名启用 HTTPS。

### 部署验证

部署完成后依次检查：

1. 打开 `/login`，确认可以注册和登录。
2. 创建一篇笔记，刷新页面后确认内容仍然存在。
3. 上传一张图片，确认 Supabase Storage 返回的资源可以访问。
4. 打开 `/preview/[id]`，确认预览页和文章目录正常。
5. 退出后访问 `/editor/[id]`，确认会被重定向到登录页。

如果构建失败，可先在本地执行：

```bash
pnpm lint
pnpm build
```

如果运行时提示 Supabase 配置缺失，请检查部署平台中的环境变量是否完整，并在修改后重新构建或重启服务。

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
| `/api/upload` | `POST` | Supabase Storage 文件上传 |
| `/api/ai/command` | `POST` | AI 编辑命令 |
| `/api/ai/copilot` | `POST` | AI Copilot 接口 |

## 鉴权说明

项目不使用 Supabase Auth。用户信息存储在 `public.users` 表中，登录成功后由服务端签发 HS256 JWT，并写入名为 `lx_session` 的 HttpOnly Cookie。会话默认有效期为 7 天。

`proxy.ts` 负责受保护路由的登录校验和会话处理；笔记 API 使用会话中的用户 ID 查询及修改数据。

## 文件上传

上传端点为 `/api/upload`，文件会按用户 ID 保存到 Supabase Storage 的 `note-media` 存储桶。服务端使用 `SUPABASE_SERVICE_ROLE_KEY`，本地 Supabase 需要先创建同名公开存储桶，或让接口自动创建。

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
app/api/upload/        Supabase Storage 上传接口
supabase/              数据库初始化 SQL
proxy.ts               路由鉴权与会话处理
```
