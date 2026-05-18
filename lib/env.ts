/**
 * Environment variable validation
 * Run this at app startup to catch missing configuration early
 */

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const;

const OPTIONAL_BUT_RECOMMENDED = [
  'API_SECRET',
  'CRON_SECRET',
  'SUPABASE_SERVICE_ROLE_KEY',
] as const;

export function validateEnv(): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const key of REQUIRED_ENV_VARS) {
    if (!process.env[key]) {
      errors.push(`Missing required env var: ${key}`);
    }
  }

  for (const key of OPTIONAL_BUT_RECOMMENDED) {
    if (!process.env[key]) {
      warnings.push(`Recommended env var not set: ${key}`);
    }
  }

  const provider = process.env.LLM_PROVIDER || 'ollama';
  if (provider !== 'ollama' && !process.env.LLM_API_KEY) {
    errors.push(`LLM_API_KEY required when using ${provider} provider`);
  }

  if (!process.env.QQ_EMAIL || !process.env.QQ_EMAIL_AUTH_CODE) {
    warnings.push('Email not configured (QQ_EMAIL, QQ_EMAIL_AUTH_CODE), email delivery disabled');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

if (typeof window === 'undefined') {
  const result = validateEnv();

  if (result.errors.length > 0) {
    console.error('Env validation failed:');
    result.errors.forEach(e => console.error(`  - ${e}`));
  }

  if (result.warnings.length > 0) {
    console.warn('Env warnings:');
    result.warnings.forEach(w => console.warn(`  - ${w}`));
  }

  if (result.valid && result.warnings.length === 0) {
    console.log('Env validation passed');
  }
}
