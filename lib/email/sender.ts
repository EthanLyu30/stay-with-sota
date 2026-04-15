import nodemailer from 'nodemailer';
import { generateEmailHtml } from './template';
import type { Digest } from '../types';

const transporter = nodemailer.createTransport({
  host: 'smtp.qq.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.QQ_EMAIL,
    pass: process.env.QQ_EMAIL_AUTH_CODE,
  },
});

/**
 * 发送简报邮件
 */
export async function sendDigestEmail(digest: Digest): Promise<boolean> {
  const email = process.env.QQ_EMAIL;
  if (!email || !process.env.QQ_EMAIL_AUTH_CODE) {
    console.error('QQ Email not configured');
    return false;
  }

  try {
    const html = generateEmailHtml(digest);

    await transporter.sendMail({
      from: `"SOTA Daily" <${email}>`,
      to: email,
      subject: digest.title,
      html,
    });

    return true;
  } catch (err) {
    console.error('Failed to send email:', err);
    return false;
  }
}

/**
 * 发送测试邮件
 */
export async function sendTestEmail(): Promise<boolean> {
  const email = process.env.QQ_EMAIL;
  if (!email || !process.env.QQ_EMAIL_AUTH_CODE) {
    throw new Error('QQ 邮箱未配置，请设置 QQ_EMAIL 和 QQ_EMAIL_AUTH_CODE 环境变量');
  }

  const testDigest: Digest = {
    id: 'test',
    date: new Date().toISOString().split('T')[0],
    title: '📧 SOTA Daily — 测试邮件',
    items: [
      {
        id: 'test-1',
        sourceType: 'github-trending',
        sourceName: 'GitHub Trending',
        title: '测试项目 — AI Agent Framework',
        summary: '这是一个测试摘要，用于验证邮件推送功能是否正常工作。',
        url: 'https://github.com',
        relevanceScore: 85,
        tags: ['测试', 'AI'],
      },
      {
        id: 'test-2',
        sourceType: 'arxiv',
        sourceName: 'ArXiv',
        title: 'Test Paper: Attention Is All You Need (Revisited)',
        summary: '一篇关于 Transformer 架构最新进展的测试论文。',
        url: 'https://arxiv.org',
        relevanceScore: 90,
        tags: ['论文', 'Transformer'],
      },
    ],
    totalFetched: 2,
    totalFiltered: 2,
    emailSent: false,
    createdAt: new Date().toISOString(),
  };

  const html = generateEmailHtml(testDigest);

  await transporter.sendMail({
    from: `"SOTA Daily" <${email}>`,
    to: email,
    subject: '📧 SOTA Daily — 测试邮件',
    html,
  });

  return true;
}
