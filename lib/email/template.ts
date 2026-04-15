import type { Digest } from '../types';
import { SOURCE_META } from '../utils';

export function generateEmailHtml(digest: Digest): string {
  const date = new Date(digest.date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  // 按数据源分组
  const grouped = new Map<string, typeof digest.items>();
  for (const item of digest.items) {
    const key = item.sourceType;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(item);
  }

  const sectionsHtml = Array.from(grouped.entries()).map(([sourceType, items]) => {
    const meta = SOURCE_META[sourceType] || { icon: '📡', label: sourceType, color: '#666' };
    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.06);">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <a href="${item.url}" target="_blank" style="color: #e0e0e0; text-decoration: none; font-size: 15px; font-weight: 600; line-height: 1.4;">
                  ${escapeHtml(item.title)}
                </a>
                <div style="margin-top: 6px; color: #999; font-size: 13px; line-height: 1.5;">
                  ${escapeHtml(item.summary)}
                </div>
                <div style="margin-top: 8px;">
                  ${item.tags.map(tag => `<span style="display: inline-block; background: rgba(${hexToRgb(meta.color)}, 0.15); color: ${meta.color}; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-right: 4px;">#${escapeHtml(tag)}</span>`).join('')}
                </div>
              </td>
              <td style="text-align: right; vertical-align: top; width: 50px;">
                <span style="color: ${item.relevanceScore >= 70 ? '#4ade80' : item.relevanceScore >= 50 ? '#fbbf24' : '#999'}; font-size: 13px; font-weight: 600;">${item.relevanceScore}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `).join('');

    return `
      <tr>
        <td style="padding: 20px 20px 0;">
          <div style="font-size: 16px; font-weight: 700; color: ${meta.color}; margin-bottom: 4px;">
            ${meta.icon} ${meta.label}
            <span style="color: #666; font-weight: 400; font-size: 13px; margin-left: 8px;">${items.length} 条</span>
          </div>
        </td>
      </tr>
      ${itemsHtml}
    `;
  }).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(digest.title)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 680px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <tr>
      <td style="padding: 30px 20px 20px; text-align: center;">
        <div style="font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #00ff88, #00bbff); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
          ⚡ SOTA Daily
        </div>
        <div style="color: #666; font-size: 14px; margin-top: 8px;">${date}</div>
      </td>
    </tr>

    <!-- Stats -->
    <tr>
      <td style="padding: 0 20px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255,255,255,0.03); border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="padding: 14px 20px; text-align: center; border-right: 1px solid rgba(255,255,255,0.06);">
              <div style="color: #00ff88; font-size: 20px; font-weight: 700;">${digest.totalFetched}</div>
              <div style="color: #666; font-size: 12px;">抓取</div>
            </td>
            <td style="padding: 14px 20px; text-align: center; border-right: 1px solid rgba(255,255,255,0.06);">
              <div style="color: #00bbff; font-size: 20px; font-weight: 700;">${digest.totalFiltered}</div>
              <div style="color: #666; font-size: 12px;">精选</div>
            </td>
            <td style="padding: 14px 20px; text-align: center;">
              <div style="color: #ff6b9d; font-size: 20px; font-weight: 700;">${Math.round((digest.totalFiltered / Math.max(digest.totalFetched, 1)) * 100)}%</div>
              <div style="color: #666; font-size: 12px;">通过率</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Content Sections -->
    ${sectionsHtml}

    <!-- Footer -->
    <tr>
      <td style="padding: 30px 20px; text-align: center; border-top: 1px solid rgba(255,255,255,0.06);">
        <div style="color: #444; font-size: 12px;">
          由 SOTA Daily 自动生成 · Powered by AI
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '255,255,255';
  return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`;
}
