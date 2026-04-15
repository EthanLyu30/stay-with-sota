# Cloudflare Workers 代理

用于解决国内网络无法直接访问 HuggingFace 的问题。

## 部署步骤

1. 注册 [Cloudflare](https://dash.cloudflare.com) 账号（免费）
2. 进入 **Workers & Pages** → **创建 Worker**
3. 将 `hf-proxy.js` 的内容粘贴到编辑器中
4. 点击 **部署**
5. 复制 Worker URL（如 `https://xxx.workers.dev`）
6. 在项目 `.env.local` 中添加：
   ```
   HF_PROXY_URL=https://your-worker.workers.dev
   ```

## 支持的代理路径

- `/api/daily_papers` — HuggingFace 每日论文
- 任何 HuggingFace API 路径

## 使用方式

访问 `https://your-worker.workers.dev?path=/api/daily_papers` 即可获取数据。
