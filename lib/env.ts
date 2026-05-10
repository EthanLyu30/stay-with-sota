/**
 * Environment variable validation
 * Run this at app startup to catch missing configuration early
 */

const REQUIRED_ENV_VARS = [
  'KV_REST_API_URL',
  'KV_REST_API_TOKEN',
] as const;

const OPTIONAL_BUT_RECOMMENDED = [
  'API_SECRET',
  'CRON_SECRET',
] as const;

export function validateEnv(): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required vars
  for (const key of REQUIRED_ENV_VARS) {
    if (!process.env[key]) {
      errors.push(`缺少必需的环境变量: ${key}`);
    }
  }

  // Check recommended vars
  for (const key of OPTIONAL_BUT_RECOMMENDED) {
    if (!process.env[key]) {
      warnings.push(`建议设置环境变量: ${key} (生产环境)`);
    }
  }

  // Check AI provider configuration
  const provider = process.env.LLM_PROVIDER || 'ollama';
  if (provider !== 'ollama' && !process.env.LLM_API_KEY) {
    errors.push(`使用 ${provider} 提供商时需要设置 LLM_API_KEY`);
  }

  // Check email configuration
  if (!process.env.QQ_EMAIL || !process.env.QQ_EMAIL_AUTH_CODE) {
    warnings.push('未配置邮件服务 (QQ_EMAIL, QQ_EMAIL_AUTH_CODE)，邮件推送功能将不可用');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// Run validation on module load (server-side only)
if (typeof window === 'undefined') {
  const result = validateEnv();

  if (result.errors.length > 0) {
    console.error('❌ 环境变量验证失败:');
    result.errors.forEach(e => console.error(`  - ${e}`));
  }

  if (result.warnings.length > 0) {
    console.warn('⚠️ 环境变量警告:');
    result.warnings.forEach(w => console.warn(`  - ${w}`));
  }

  if (result.valid && result.warnings.length === 0) {
    console.log('✅ 环境变量验证通过');
  }
}
