import type { LLMProviderConfig } from './types';
import { SYSTEM_PROMPT } from './types';

/**
 * 解析 LLM 响应，提取 JSON
 */
export function parseLLMResponse(content: string): string {
  let cleaned = content.trim();
  // 清理 markdown 代码块标记
  if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
  if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
  cleaned = cleaned.trim();
  // 尝试提取 JSON 对象
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }
  return cleaned;
}

/**
 * OpenAI 兼容格式调用（适用于 Ollama, DeepSeek, 通义千问, 智谱 GLM）
 */
async function callOpenAICompatible(
  config: LLMProviderConfig,
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  const body: Record<string, unknown> = {
    model: config.model,
    messages,
    temperature: 0.3,
    max_tokens: 4000,
  };

  if (config.supportsJsonFormat) {
    body.response_format = { type: 'json_object' };
  }

  const res = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`${config.name} API error: ${res.status} - ${errorText}`);
  }

  const data = await res.json() as {
    choices: Array<{ message: { content: string } }>;
  };

  return data.choices[0]?.message?.content || '{}';
}

/**
 * Google Gemini API 调用
 */
async function callGemini(
  config: LLMProviderConfig,
  userPrompt: string
): Promise<string> {
  const url = `${config.baseUrl}/models/${config.model}:generateContent?key=${config.apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${SYSTEM_PROMPT}\n\n${userPrompt}` }],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 4000,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gemini API error: ${res.status} - ${errorText}`);
  }

  const data = await res.json() as {
    candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
  };

  return data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
}

/**
 * 统一调用接口
 */
export async function callLLM(
  config: LLMProviderConfig,
  userPrompt: string
): Promise<string> {
  if (config.type === 'gemini') {
    return callGemini(config, userPrompt);
  }

  // Ollama 和 OpenAI 兼容格式
  return callOpenAICompatible(config, [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ]);
}

/**
 * 获取当前活跃的提供商配置
 */
export function getActiveProvider(): LLMProviderConfig {
  const providerId = process.env.LLM_PROVIDER || 'ollama-gemma4';

  // 从环境变量构建自定义配置
  if (process.env.LLM_API_BASE_URL) {
    return {
      id: 'custom',
      name: '自定义配置',
      type: (process.env.LLM_TYPE as any) || 'openai-compatible',
      baseUrl: process.env.LLM_API_BASE_URL,
      apiKey: process.env.LLM_API_KEY || '',
      model: process.env.LLM_MODEL || 'gemma4:e4b',
      description: '通过环境变量配置',
      batchSize: parseInt(process.env.LLM_BATCH_SIZE || '15'),
      supportsJsonFormat: process.env.LLM_SUPPORTS_JSON === 'true',
    };
  }

  // 从内置列表查找
  const { BUILTIN_PROVIDERS } = require('./types');
  const provider = BUILTIN_PROVIDERS.find((p: LLMProviderConfig) => p.id === providerId);
  if (provider) {
    // 用环境变量覆盖 apiKey（如果设置了）
    if (process.env.LLM_API_KEY) {
      return { ...provider, apiKey: process.env.LLM_API_KEY };
    }
    return provider;
  }

  // 默认回退到 Ollama
  return BUILTIN_PROVIDERS[0];
}
