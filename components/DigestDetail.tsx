import type { Digest } from '@/lib/types';
import { SOURCE_META } from '@/lib/utils';

interface DigestDetailProps {
  digest: Digest;
}

export default function DigestDetail({ digest }: DigestDetailProps) {
  // 按数据源分组
  const grouped = new Map<string, typeof digest.items>();
  for (const item of digest.items) {
    const key = item.sourceType;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(item);
  }

  const passRate = Math.round(
    (digest.totalFiltered / Math.max(digest.totalFetched, 1)) * 100
  );

  return (
    <div className="digest-detail">
      <div className="digest-detail-header">
        <div className="digest-detail-title">{digest.title}</div>
        <div className="digest-detail-meta">
          <span>📅 {new Date(digest.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</span>
          <span>📥 抓取 {digest.totalFetched} 条</span>
          <span>✅ 精选 {digest.totalFiltered} 条</span>
          <span>📊 通过率 {passRate}%</span>
          {digest.emailSent && <span>📧 已推送邮件</span>}
        </div>
      </div>

      {Array.from(grouped.entries()).map(([sourceType, items]) => {
        const meta = SOURCE_META[sourceType] || { icon: '📡', label: sourceType, color: '#666' };
        return (
          <div key={sourceType} className="source-section">
            <div className="source-section-header" style={{ color: meta.color }}>
              <span className="source-section-icon">{meta.icon}</span>
              {meta.label}
              <span className="source-section-count">({items.length} 条)</span>
            </div>
            <div>
              {items.map(item => (
                <div key={item.id} className="digest-item">
                  <div className={`digest-item-score ${
                    item.relevanceScore >= 70 ? 'high' :
                    item.relevanceScore >= 50 ? 'medium' : 'low'
                  }`}>
                    {item.relevanceScore}
                  </div>
                  <div className="digest-item-content">
                    <div className="digest-item-title">
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        {item.title}
                      </a>
                    </div>
                    <div className="digest-item-summary">{item.summary}</div>
                    {item.tags.length > 0 && (
                      <div className="digest-item-tags">
                        {item.tags.map(tag => (
                          <span key={tag} className="tag">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
