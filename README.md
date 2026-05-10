# ❄️ SOTA Daily

AI 领域信息聚合推送系统 — 自动抓取、智能筛选、每日推送

## ✨ 功能特性

- 📡 **6 大数据源** — GitHub Trending / Releases、ArXiv 论文、HuggingFace、Hacker News、自定义 RSS
- 🤖 **多模型 AI 筛选** — 支持 Ollama 本地模型 (Gemma 4 / Qwen 3) 及 DeepSeek / Gemini / Qwen / 智谱等云端 API
- 🔍 **跨源智能去重** — 基于 URL 匹配 + Jaccard bigram 相似度的跨数据源内容去重
- 📧 **邮件推送** — QQ 邮箱 SMTP 自动推送，支持 HTML 格式邮件
- 🔎 **全文搜索** — 跨简报全文搜索
- 📥 **Markdown 导出** — 一键导出简报为 Markdown 文件
- 🎨 **Nord 暗色主题** — 温暖舒适的暗色 UI
- 🔒 **安全防护** — API 认证、速率限制、安全头、输入验证
- 🐳 **Docker 部署** — 一键 Docker / Docker Compose 部署

## 🏗️ 技术栈

| 技术 | 用途 |
|------|------|
| Next.js 15 (App Router) | 全栈框架 |
| TypeScript | 类型安全 |
| Upstash Redis | 数据存储 |
| Ollama | 本地 LLM 部署 |
| Nodemailer | 邮件发送 |
| Nord Color Palette | UI 设计系统 |

## 🚀 快速开始

### 环境要求

- Node.js >= 18.17.0
- Ollama (可选，用于本地 AI 模型)
- Upstash Redis 账号 (免费)

### 1. 克隆项目

```bash
git clone https://github.com/EthanLyu30/stay-with-sota.git
cd stay-with-sota
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入必要配置：

```env
# === 必填 ===
# Upstash Redis
KV_REST_API_URL=https://xxx.upstash.io
KV_REST_API_TOKEN=xxx

# AI 模型 (至少配置一个)
LLM_PROVIDER=ollama-gemma4          # ollama-gemma4 | ollama-qwen3 | deepseek | gemini | qwen | zhipu
# Ollama 本地模型无需 API Key
# 云端模型需要对应的 API Key:
# LLM_API_KEY=sk-xxx

# 邮件推送
QQ_EMAIL=your@qq.com
QQ_EMAIL_AUTH_CODE=xxx              # QQ 邮箱 SMTP 授权码

# === 可选 ===
API_SECRET=your-secret-key          # API 认证密钥 (生产环境强烈建议设置)
CRON_SECRET=xxx                     # Cron 触发密钥
GITHUB_TOKEN=xxx                    # GitHub Token (提升 API 限额)
HF_PROXY_URL=https://xxx.workers.dev # HuggingFace 代理 (解决网络问题)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 4. 本地部署 Ollama (可选)

```bash
# 安装 Ollama: https://ollama.com/download
ollama pull gemma4:e4b
```

## 🐳 Docker 部署

```bash
# 使用 Docker Compose (推荐)
cp .env.example .env.local
# 编辑 .env.local 填入配置
docker-compose up -d
```

或手动构建：

```bash
docker build -t sota-daily .
docker run -p 3000:3000 --env-file .env.local sota-daily
```

## ☁️ 部署到 Vercel

### 前提条件

- [Vercel 账号](https://vercel.com)
- [Upstash Redis](https://upstash.com)（Vercel 集成商店搜索 Redis）

### 部署步骤

1. **Fork 或连接仓库** — 在 Vercel 中导入 GitHub 仓库

2. **绑定 Upstash Redis** — Vercel Dashboard → Integrations → 搜索 "Redis" → 安装 Upstash Redis

3. **配置环境变量** — Vercel Dashboard → Settings → Environment Variables：

| 变量名 | 值 |
|--------|-----|
| `QQ_EMAIL` | 你的 QQ 邮箱 |
| `QQ_EMAIL_AUTH_CODE` | SMTP 授权码 |
| `CRON_SECRET` | 随机字符串 |
| `LLM_PROVIDER` | `ollama-gemma4`（或云端 API） |
| `LLM_API_KEY` | 云端 API 的 Key（本地模型不需要） |

4. **部署** — Vercel 会自动构建和部署

5. **Cron Job** — 已配置在 `vercel.json` 中，每天 UTC 00:00（北京时间 08:00）自动触发

### 关于本地模型 + Vercel

Vercel Serverless Functions 无法直接访问本地的 Ollama。解决方案：

- **方案 A**：在云服务器上部署 Ollama，设置 `LLM_API_BASE_URL` 指向服务器公网 IP
- **方案 B**：使用云端 API（DeepSeek / Gemini / 通义 / 智谱）作为 Vercel 生产环境配置
- **方案 C**：本地运行 `npm run dev`，不部署到 Vercel

## 📡 数据源说明

| 数据源 | 说明 | 默认启用 |
|--------|------|----------|
| GitHub Trending | 每日热门项目 | ✅ |
| GitHub Releases | 热门仓库新版本发布 | ✅ |
| ArXiv | AI 相关论文 (cs.AI/CL/CV/LG) | ✅ |
| HuggingFace | 每日热门论文 | ✅ |
| Hacker News | Top 100 热门帖子 | ✅ |
| RSS | 自定义 RSS 订阅源 | ❌ (需手动添加) |

## 🤖 AI 模型配置

系统支持多个 AI 模型提供商，通过 `LLM_PROVIDER` 环境变量切换：

| Provider | ID | 说明 | 需要配置 |
|----------|-----|------|----------|
| Ollama + Gemma 4 | `ollama-gemma4` | 本地部署，免费 | Ollama + `gemma4:e4b` 模型 |
| Ollama + Qwen 3 | `ollama-qwen3` | 本地部署，中文能力强 | Ollama + `qwen3:8b` 模型 |
| DeepSeek | `deepseek` | 国内直连，性价比高 | `LLM_API_KEY` |
| Gemini | `gemini` | Google AI，有免费额度 | `LLM_API_KEY` |
| 通义千问 | `qwen` | 阿里云，国内直连 | `LLM_API_KEY` |
| 智谱 GLM | `zhipu` | 清华系，国内直连 | `LLM_API_KEY` |

### 高级：自定义模型配置

除内置提供商外，还支持通过环境变量自定义任意 OpenAI 兼容 API：

```env
LLM_TYPE=openai-compatible
LLM_API_BASE_URL=http://localhost:11434/v1
LLM_API_KEY=your-api-key
LLM_MODEL=gemma4:e4b
LLM_BATCH_SIZE=15
LLM_SUPPORTS_JSON=false
```

## 📁 项目结构

```
stay-with-sota/
├── app/                        # Next.js App Router
│   ├── page.tsx                # Dashboard 首页
│   ├── layout.tsx              # 根布局
│   ├── globals.css             # 全局样式 (Nord 主题)
│   ├── not-found.tsx           # 404 页面
│   ├── error.tsx               # 错误边界
│   ├── loading.tsx             # 加载状态
│   ├── icon.tsx                # Favicon
│   ├── opengraph-image.tsx     # OG 图片
│   ├── sitemap.ts              # 站点地图
│   ├── robots.ts               # 爬虫规则
│   ├── digest/[id]/            # 简报详情页
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── history/                # 历史简报页
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── settings/               # 设置页
│   │   └── page.tsx
│   └── api/                    # API 路由
│       ├── cron/route.ts       # 定时任务入口
│       ├── digests/            # 简报 CRUD
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── sources/            # 数据源管理
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── fetch-now/route.ts  # 手动触发抓取
│       ├── search/route.ts     # 全文搜索
│       ├── export/[id]/route.ts # Markdown 导出
│       ├── providers/route.ts  # AI 模型列表
│       ├── test-email/route.ts # 测试邮件
│       ├── health/route.ts     # 健康检查
│       └── proxy/              # HuggingFace 代理
│           └── huggingface/route.ts
├── components/                 # React 组件
│   ├── Navigation.tsx          # 顶部导航栏
│   ├── StatsBar.tsx            # 统计卡片
│   ├── SearchBar.tsx           # 搜索栏
│   ├── DigestDetail.tsx        # 简报详情
│   ├── DigestCard.tsx          # 简报卡片
│   ├── SourceManager.tsx       # 数据源管理
│   ├── ProviderSelector.tsx    # AI 模型选择
│   ├── ExportButton.tsx        # 导出按钮
│   ├── LoadingSpinner.tsx      # 加载动画
│   └── EmptyState.tsx          # 空状态
├── lib/                        # 核心逻辑
│   ├── types.ts                # TypeScript 类型
│   ├── db.ts                   # Redis 数据层
│   ├── utils.ts                # 工具函数
│   ├── dedup.ts                # 跨源去重 (URL + Jaccard bigram)
│   ├── ai/                     # AI 模型层
│   │   ├── types.ts            # Provider 配置与内置列表
│   │   ├── provider.ts         # LLM 调用抽象层
│   │   └── summarizer.ts       # 批量摘要引擎
│   ├── fetchers/               # 数据抓取器
│   │   ├── github-trending.ts
│   │   ├── github-releases.ts
│   │   ├── arxiv.ts
│   │   ├── huggingface.ts
│   │   ├── hackernews.ts
│   │   └── rss.ts
│   └── email/                  # 邮件发送
│       ├── sender.ts           # QQ 邮箱 SMTP
│       └── template.ts         # HTML 邮件模板
├── middleware.ts                # 安全中间件 (认证 + 速率限制 + 安全头)
├── Dockerfile                   # 多阶段 Docker 构建
├── docker-compose.yml           # Docker Compose 配置
├── vercel.json                  # Vercel Cron Job 配置
├── next.config.ts
├── package.json
├── tsconfig.json
└── workers/                     # Cloudflare Workers
    └── hf-proxy.js              # HuggingFace 代理
```

## 🔒 安全

- **API 认证** — 敏感接口 (fetch-now / test-email / cron / sources 写操作) 支持 Bearer Token 认证 (`API_SECRET`)
- **速率限制** — 防止 API 滥用 (fetch-now: 3次/10min, test-email: 5次/10min, sources POST: 10次/10min, 默认 API: 60次/min)
- **安全头** — X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy
- **输入验证** — 所有 API 参数校验
- **SSRF 防护** — HuggingFace 代理路径白名单
- **错误隔离** — API 错误响应不泄露内部信息

## 📧 QQ 邮箱配置

1. 登录 QQ 邮箱 → 设置 → 账户
2. 开启 **POP3/SMTP 服务**
3. 生成 **授权码**（不是 QQ 密码）
4. 将授权码填入 `QQ_EMAIL_AUTH_CODE`

## 🎨 页面预览

- **Dashboard** — 最新简报 + 统计信息 + 搜索 + 快速操作
- **历史简报** — 卡片网格布局，分页加载
- **简报详情** — 按数据源分组，含评分、标签、摘要
- **设置页** — AI 模型配置 + 数据源管理 + 系统信息

## 🔧 开发

```bash
# 开发
npm run dev

# 构建
npm run build

# 生产运行
npm start

# 类型检查
npm run type-check
```

## 📄 License

MIT © 2025 [EthanLyu30](https://github.com/EthanLyu30)
