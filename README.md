# ⚡ Stay with SOTA

> 专属 SOTA 信息推送系统 — 自动抓取 AI 领域最新动态，通过 LLM 智能筛选摘要，每日推送至邮箱，并提供精美的 Web 看板浏览历史简报。

## ✨ 功能特性

- **📡 多数据源抓取** — GitHub Trending、GitHub Releases、ArXiv 论文、HuggingFace Daily Papers、Hacker News、自定义 RSS
- **🧠 AI 智能筛选** — 多模型支持（Ollama 本地 / DeepSeek / Gemini / 通义千问 / 智谱 GLM），自动评估相关性和生成中文摘要
- **📧 邮件推送** — 精美 HTML 暗色主题邮件，每日定时推送至 QQ 邮箱
- **🔗 跨源去重** — 基于 URL 匹配 + 标题相似度的智能去重
- **🔍 全文搜索** — 历史简报关键词搜索
- **📄 Markdown 导出** — 一键导出简报为 Markdown 文件
- **📊 Web 看板** — 暗色科技风 Dashboard，浏览最新和历史简报
- **⚙️ 灵活配置** — 数据源管理、模型切换、推送测试，全部在设置页完成

## 🏗️ 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 框架 | Next.js 15 (App Router) | React 全栈框架 |
| 部署 | Vercel | 零配置部署 + Cron Jobs |
| 数据库 | Upstash Redis (Vercel KV) | 简报存储 + 源配置 |
| 邮件 | Nodemailer + QQ SMTP | HTML 邮件推送 |
| AI | 多模型提供商 | Ollama / DeepSeek / Gemini / 通义 / 智谱 |
| 样式 | Vanilla CSS | 暗色科技感主题 |

## 📁 项目结构

```
stay-with-sota/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # 根布局
│   ├── page.tsx                  # Dashboard 首页
│   ├── globals.css               # 暗色科技风设计系统
│   ├── history/page.tsx          # 历史简报
│   ├── digest/[id]/page.tsx      # 简报详情
│   ├── settings/page.tsx         # 设置页
│   └── api/                      # API 路由
│       ├── cron/route.ts         # 定时任务入口
│       ├── digests/route.ts      # 简报列表
│       ├── digests/[id]/route.ts # 简报详情
│       ├── sources/route.ts      # 数据源管理
│       ├── sources/[id]/route.ts # 数据源更新/删除
│       ├── search/route.ts       # 全文搜索
│       ├── export/[id]/route.ts  # Markdown 导出
│       ├── providers/route.ts    # 模型提供商列表
│       ├── fetch-now/route.ts    # 手动触发抓取
│       └── test-email/route.ts   # 测试邮件
├── components/                   # React 组件
│   ├── Navigation.tsx            # 侧边导航栏
│   ├── StatsBar.tsx              # 统计信息栏
│   ├── DigestCard.tsx            # 简报卡片
│   ├── DigestDetail.tsx          # 简报详情
│   ├── SourceManager.tsx         # 数据源管理
│   ├── SearchBar.tsx             # 搜索组件
│   ├── ExportButton.tsx          # 导出按钮
│   └── ProviderSelector.tsx      # 模型选择器
├── lib/                          # 核心逻辑
│   ├── ai/
│   │   ├── types.ts              # 提供商类型定义
│   │   ├── provider.ts           # 统一调用抽象层
│   │   └── summarizer.ts         # AI 摘要引擎
│   ├── email/
│   │   ├── sender.ts             # QQ 邮箱 SMTP
│   │   └── template.ts           # HTML 邮件模板
│   ├── fetchers/                 # 6 个数据抓取器
│   │   ├── github-trending.ts
│   │   ├── github-releases.ts
│   │   ├── arxiv.ts
│   │   ├── huggingface.ts
│   │   ├── hackernews.ts
│   │   └── rss.ts
│   ├── db.ts                     # 数据库操作层
│   ├── dedup.ts                  # 跨源去重
│   ├── types.ts                  # TypeScript 类型
│   └── utils.ts                  # 工具函数
├── vercel.json                   # Cron Job 配置
├── package.json
├── tsconfig.json
└── next.config.ts
```

## 🚀 快速开始

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

编辑 `.env.local`，填入实际配置：

```env
# ====== 必填 ======

# QQ 邮箱（用于接收推送）
QQ_EMAIL=your-email@qq.com
QQ_EMAIL_AUTH_CODE=your-smtp-auth-code

# 安全密钥（随机字符串）
CRON_SECRET=your-random-secret

# ====== AI 模型（选一个）======

# 方式一：本地 Ollama（推荐，免费）
LLM_PROVIDER=ollama-gemma4
# 需要先安装 Ollama: https://ollama.com/download
# 然后拉取模型: ollama pull gemma4:e4b

# 方式二：云端 API（选一个）
# LLM_PROVIDER=deepseek
# LLM_API_KEY=your-deepseek-api-key
#
# LLM_PROVIDER=gemini
# LLM_API_KEY=your-gemini-api-key
#
# LLM_PROVIDER=qwen
# LLM_API_KEY=your-dashscope-api-key
#
# LLM_PROVIDER=zhipu
# LLM_API_KEY=your-zhipu-api-key
```

### 3. 本地运行

```bash
npm run dev
```

打开 http://localhost:3000 即可看到 Dashboard。

### 4. 手动测试

- 点击 **「立即抓取」** 按钮触发一次完整流程
- 点击 **「发送测试邮件」** 验证 QQ 邮箱 SMTP 配置

## 🧠 AI 模型配置

系统支持 6 个内置提供商，通过 `LLM_PROVIDER` 环境变量切换：

| 提供商 | 类型 | 免费额度 | 切换命令 |
|--------|------|----------|----------|
| Ollama + Gemma 4 | 本地 | 完全免费 | `LLM_PROVIDER=ollama-gemma4` |
| Ollama + Qwen3 | 本地 | 完全免费 | `LLM_PROVIDER=ollama-qwen3` |
| DeepSeek | 云端 API | 有 | `LLM_PROVIDER=deepseek` |
| Google Gemini | 云端 API | 有 | `LLM_PROVIDER=gemini` |
| 通义千问 | 云端 API | 有 | `LLM_PROVIDER=qwen` |
| 智谱 GLM | 云端 API | 有 | `LLM_PROVIDER=zhipu` |

### 本地部署 Ollama（推荐）

```bash
# 1. 安装 Ollama
# macOS: brew install ollama
# Linux: curl -fsSL https://ollama.com/install.sh | sh
# Windows: 下载 https://ollama.com/download

# 2. 拉取模型
ollama pull gemma4:e4b    # 推荐 4B 参数版本
# 可选: gemma4:e2b (轻量) / gemma4:e9b / gemma4:e27b

# 3. 启动服务（通常安装后自动启动）
ollama serve
```

## 📧 QQ 邮箱配置

1. 登录 QQ 邮箱 → 设置 → 账户
2. 开启 **POP3/SMTP 服务**
3. 生成 **授权码**（不是 QQ 密码）
4. 将授权码填入 `QQ_EMAIL_AUTH_CODE`

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

### ⚠️ 关于本地模型 + Vercel

Vercel Serverless Functions 无法直接访问你本地的 Ollama。解决方案：

- **方案 A**：在云服务器上部署 Ollama，设置 `LLM_API_BASE_URL` 指向服务器公网 IP
- **方案 B**：使用云端 API（DeepSeek / Gemini / 通义 / 智谱）作为 Vercel 生产环境配置
- **方案 C**：本地运行 `npm run dev`，不部署到 Vercel

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
```

## 📋 原始计划完成度

| 模块 | 状态 | 说明 |
|------|------|------|
| 项目初始化 | ✅ | Next.js 15 + TypeScript + Vercel 配置 |
| 设计系统 | ✅ | 暗色科技风 CSS，响应式布局 |
| 类型定义 + 数据库层 | ✅ | 完整 TypeScript 类型 + Vercel KV CRUD |
| 数据抓取器 (6 个) | ✅ | GitHub Trending/Releases, ArXiv, HuggingFace, HN, RSS |
| AI 摘要引擎 | ✅ | 多模型提供商支持（6 个内置 + 自定义） |
| 邮件推送 | ✅ | QQ 邮箱 SMTP + 精美 HTML 模板 |
| API 路由 (10 个) | ✅ | 完整 RESTful API |
| 前端组件 (8 个) | ✅ | 导航、统计、卡片、详情、搜索、导出、源管理、模型选择 |
| 页面 (5 个) | ✅ | Dashboard、历史、详情、设置、404 |
| Cron 定时任务 | ✅ | vercel.json 配置，每日 08:00 |
| 跨源内容去重 | ✅ | URL 匹配 + Jaccard 标题相似度 |
| 全文搜索 | ✅ | 历史简报关键词搜索 |
| Markdown 导出 | ✅ | 一键导出简报 |
| Vercel 部署 | ⏳ | 代码已完成，需用户配置环境变量后部署 |

## 📄 License

MIT
