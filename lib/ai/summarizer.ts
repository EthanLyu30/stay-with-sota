import type { FetchedItem, DigestItem } from '../types';
import { generateId } from '../utils';
import { callLLM, parseLLMResponse, getActiveProvider } from './provider';

interface LLMResponse {
  items: Array<{
    title: string;
    summary: string;
    relevanceScore: number;
    tags: string[];
  }>;
  digestTitle: string;
}

/**
 * 调用 LLM 对抓取内容进行筛选和摘要（支持多提供商）
 */
export async function summarizeItems(items: FetchedItem[]): Promise<{
  digestItems: DigestItem[];
  digestTitle: string;
}> {
  if (items.length === 0) {
    return { digestItems: [], digestTitle: '今日无新内容' };
  }

  const provider = getActiveProvider();
  const BATCH_SIZE = provider.batchSize;
  const batches: FetchedItem[][] = [];
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    batches.push(items.slice(i, i + BATCH_SIZE));
  }

  const allDigestItems: DigestItem[] = [];
  let digestTitle = '';

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    try {
      const result = await callLLMForBatch(provider, batch, i === 0);

      for (let j = 0; j < result.items.length; j++) {
        const llmItem = result.items[j];
        const originalItem = batch[j];
        if (!originalItem) continue;

        if (llmItem.relevanceScore < 30) continue;

        allDigestItems.push({
          id: generateId(),
          sourceType: originalItem.sourceType,
          sourceName: originalItem.sourceName,
          title: llmItem.title || originalItem.title,
          summary: llmItem.summary,
          url: originalItem.url,
          relevanceScore: llmItem.relevanceScore,
          tags: llmItem.tags || [],
          metadata: originalItem.metadata,
        });
      }

      if (i === 0 && result.digestTitle) {
        digestTitle = result.digestTitle;
      }
    } catch (err) {
      console.error(`Failed to summarize batch ${i} with ${provider.name}:`, err);
      // 降级：直接使用原始内容
      for (const item of batch) {
        allDigestItems.push({
          id: generateId(),
          sourceType: item.sourceType,
          sourceName: item.sourceName,
          title: item.title,
          summary: item.description.substring(0, 200),
          url: item.url,
          relevanceScore: 50,
          tags: [],
          metadata: item.metadata,
        });
      }
    }
  }

  if (!digestTitle) {
    const today = new Date().toISOString().split('T')[0];
    digestTitle = `SOTA Daily — ${today}`;
  }

  allDigestItems.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return { digestItems: allDigestItems, digestTitle };
}

async function callLLMForBatch(
  provider: any,
  items: FetchedItem[],
  isFirstBatch: boolean
): Promise<LLMResponse> {
  const itemsText = items.map((item, idx) =>
    `[${idx + 1}] 来源: ${item.sourceName} | 标题: ${item.title} | 描述: ${item.description.substring(0, 300)}`
  ).join('\n');

  const titleInstruction = isFirstBatch
    ? '同时，请为今日所有内容生成一个简短的简报标题（一句话概括今日亮点），放在 digestTitle 字段中。'
    : 'digestTitle 设为空字符串即可。';

  const prompt = `你是一个 AI 领域的信息筛选助手。请对以下 ${items.length} 条内容进行评估：

## 评估标准
- 与 AI/机器学习/深度学习/大语言模型/计算机视觉/NLP 等领域的相关性
- 内容的新颖性和重要性
- 对从业者的实用价值

## 输出要求
请以 JSON 格式返回，严格遵循以下结构：
{
  "items": [
    {
      "title": "保留或优化后的标题",
      "summary": "一句话中文摘要（20-50字），概括核心内容",
      "relevanceScore": 0-100的相关性评分,
      "tags": ["标签1", "标签2"]
    }
  ],
  "digestTitle": "今日简报标题"
}

## 注意事项
- relevanceScore 低于 30 的内容请保留但标记低分，我会过滤
- tags 使用中文标签，如 #大模型 #RAG #CV #开源 #论文 #工具 等
- summary 必须是简洁的中文摘要
- ${titleInstruction}

## 待评估内容
${itemsText}`;

  const content = await callLLM(provider, prompt);
  const cleaned = parseLLMResponse(content);
  return JSON.parse(cleaned) as LLMResponse;
}
