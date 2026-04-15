// Cloudflare Workers - HuggingFace API 代理
// 部署步骤：
// 1. 注册 Cloudflare 账号 https://dash.cloudflare.com
// 2. 进入 Workers & Pages → 创建 Worker
// 3. 粘贴此代码
// 4. 部署后获得 URL，如 https://your-worker.your-subdomain.workers.dev
// 5. 在 .env.local 中设置 HF_PROXY_URL=https://your-worker.your-subdomain.workers.dev

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const targetPath = url.searchParams.get('path') || '/api/daily_papers';
    const targetUrl = `https://huggingface.co${targetPath}`;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
      });

      const data = await response.text();
      return new Response(data, {
        status: response.status,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
