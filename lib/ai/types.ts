// LLM 提供商配置
export interface LLMProviderConfig {
  id: string;
  name: string;
  type: 'ollama' | 'openai-compatible' | 'gemini';
  baseUrl: string;
  apiKey: string;
  model: string;
  description: string;
  batchSize: number;  // 每批处理条数（本地模型较小）
  supportsJsonFormat: boolean;
}

// 系统提示词
export const SYSTEM_PROMPT = '你是一个专业的 AI 领域信息筛选助手。你只返回 JSON 格式的结果，不要包含任何其他文字或 markdown 代码块标记。';

// 内置提供商列表
export const BUILTIN_PROVIDERS: LLMProviderConfig[] = [
  {
    id: 'ollama-gemma4',
    name: 'Ollama + Gemma 4 (本地)',
    type: 'ollama',
    baseUrl: 'http://localhost:11434/v1',
    apiKey: 'ollama',
    model: 'gemma4:e4b',
    description: '本地部署，免费，需要安装 Ollama 并拉取模型',
    batchSize: 15,
    supportsJsonFormat: false,
  },
  {
    id: 'ollama-qwen3',
    name: 'Ollama + Qwen3 (本地)',
    type: 'ollama',
    baseUrl: 'http://localhost:11434/v1',
    apiKey: 'ollama',
    model: 'qwen3:8b',
    description: '通义千问开源版，中文能力强',
    batchSize: 15,
    supportsJsonFormat: false,
  },
  {
    id: 'deepseek',
    name: 'DeepSeek API',
    type: 'openai-compatible',
    baseUrl: 'https://api.deepseek.com/v1',
    apiKey: '',
    model: 'deepseek-chat',
    description: '国内直连，性价比高，中文能力强',
    batchSize: 20,
    supportsJsonFormat: true,
  },
  {
    id: 'gemini',
    name: 'Google Gemini API',
    type: 'gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    apiKey: '',
    model: 'gemini-2.0-flash',
    description: 'Google 提供，有免费额度',
    batchSize: 20,
    supportsJsonFormat: true,
  },
  {
    id: 'qwen',
    name: '通义千问 API',
    type: 'openai-compatible',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    apiKey: '',
    model: 'qwen-plus',
    description: '阿里云，国内直连，有免费额度',
    batchSize: 20,
    supportsJsonFormat: true,
  },
  {
    id: 'zhipu',
    name: '智谱 GLM API',
    type: 'openai-compatible',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    apiKey: '',
    model: 'glm-4-flash',
    description: '智谱 AI，国内直连，有免费额度',
    batchSize: 20,
    supportsJsonFormat: true,
  },
];
