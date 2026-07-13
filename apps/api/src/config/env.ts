import { z } from 'zod'
import { DEFAULT_APP_ENCRYPTION_KEY } from '@ai-war-room/schemas'

const optionalEnvStringSchema = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().trim().min(1).optional(),
)

const booleanEnvSchema = z.preprocess((value) => {
  if (typeof value !== 'string') {
    return value
  }

  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase())
}, z.boolean())

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().int().positive().default(3000),
  WEB_ORIGIN: z.url().default('http://127.0.0.1:5173'),
  DATABASE_URL: z
    .url()
    .default('postgres://ai_war_room:ai_war_room@127.0.0.1:5432/ai_war_room'),
  REDIS_URL: z.url().default('redis://127.0.0.1:6379'),
  APP_ENCRYPTION_KEY: z
    .string()
    .trim()
    .min(16)
    .default('local-development-encryption-key-change-me'),
  IDEMPOTENCY_TTL_SECONDS: z.coerce.number().int().positive().default(86_400),
  /** Enterprise (business tier) optional unredacted Shield secrets/PII retain window. */
  SHIELD_FULL_SCAN_RETAIN_ENABLED: booleanEnvSchema.default(false),
  SHIELD_FULL_SCAN_RETAIN_HOURS: z.coerce.number().int().positive().max(168).default(72),
  /** Layer 2 LLM escalation after deterministic Shield hits / high-risk domain cues. */
  SHIELD_LLM_ESCALATION_ENABLED: booleanEnvSchema.default(true),
  /** Optional LLM compression before Moderator when agent payloads are large. */
  CHUNK_SUMMARY_LLM_ENABLED: booleanEnvSchema.default(false),
  CHUNK_SUMMARY_LLM_MIN_CHARS: z.coerce.number().int().positive().default(4_000),
  LLM_PRIMARY_PROVIDER: z.enum(['mock', 'anthropic', 'openai']).default('mock'),
  LLM_FALLBACK_PROVIDER: z.enum(['mock', 'anthropic', 'openai']).default('mock'),
  LLM_PRIMARY_MODEL: z.string().trim().min(1).default('mock-json-v1'),
  LLM_FALLBACK_MODEL: z.string().trim().min(1).default('mock-json-v1'),
  LLM_MAX_ATTEMPTS: z.coerce.number().int().positive().max(5).default(3),
  LLM_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),
  /** Outside production, non-mock LLM providers require this explicit opt-in. */
  LLM_ALLOW_REAL_PROVIDERS: booleanEnvSchema.default(false),
  ANTHROPIC_API_KEY: optionalEnvStringSchema,
  ANTHROPIC_API_URL: z.url().default('https://api.anthropic.com/v1/messages'),
  OPENAI_API_KEY: optionalEnvStringSchema,
  OPENAI_API_URL: z
    .url()
    .default('https://api.openai.com/v1/chat/completions'),
  RESEARCH_PROVIDER: z.enum(['mock', 'tavily']).default('mock'),
  RESEARCH_SECONDARY_PROVIDER: z.enum(['none', 'serper']).default('none'),
  TAVILY_API_KEY: optionalEnvStringSchema,
  TAVILY_API_URL: z.url().default('https://api.tavily.com/search'),
  TAVILY_MAX_RESULTS: z.coerce.number().int().positive().max(10).default(5),
  SERPER_API_KEY: optionalEnvStringSchema,
  SERPER_API_URL: z.url().default('https://google.serper.dev/search'),
  SERPER_MAX_RESULTS: z.coerce.number().int().positive().max(10).default(5),
  TEMPORAL_ENABLED: booleanEnvSchema.default(false),
  TEMPORAL_ADDRESS: z.string().trim().min(1).default('127.0.0.1:7233'),
  TEMPORAL_NAMESPACE: z.string().trim().min(1).default('default'),
  TEMPORAL_TASK_QUEUE: z.string().trim().min(1).default('ai-war-room-runs'),
  TEMPORAL_WORKFLOW_STREAM_POLL_MS: z.coerce.number().int().positive().default(1_000),
  TEMPORAL_WORKFLOW_STREAM_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(300_000),
  AUTH_PROVIDER: z
    .enum(['headers', 'bearer', 'session', 'external'])
    .default('headers'),
  AUTH_BEARER_TOKEN: optionalEnvStringSchema,
  AUTH_SESSION_TTL_SECONDS: z.coerce.number().int().positive().default(86_400),
  AUTH_EXTERNAL_VENDOR: z.enum(['clerk', 'auth0']).default('clerk'),
  AUTH_EXTERNAL_ADAPTER: z.enum(['mock', 'jwks']).default('mock'),
  AUTH_EXTERNAL_JWT_SECRET: optionalEnvStringSchema,
  AUTH_EXTERNAL_JWKS_URL: optionalEnvStringSchema,
  AUTH_EXTERNAL_ISSUER: z
    .string()
    .trim()
    .min(1)
    .default('ai-war-room-external-auth'),
  AUTH_EXTERNAL_AUDIENCE: z.string().trim().min(1).default('ai-war-room-api'),
  AUTH_EXTERNAL_USER_ID_CLAIM: z.string().trim().min(1).default('sub'),
  AUTH_EXTERNAL_WORKSPACE_ID_CLAIM: optionalEnvStringSchema,
  AUTH_EXTERNAL_AUTO_PROVISION: booleanEnvSchema.default(true),
  STRIPE_ENABLED: booleanEnvSchema.default(false),
  STRIPE_BILLING_ADAPTER: z.enum(['mock', 'stripe']).default('mock'),
  STRIPE_SECRET_KEY: optionalEnvStringSchema,
  STRIPE_WEBHOOK_SECRET: optionalEnvStringSchema,
  STRIPE_PRICE_ID_PRO: optionalEnvStringSchema,
  STRIPE_PRICE_ID_BUSINESS: optionalEnvStringSchema,
  STRIPE_SUCCESS_URL: z.url().default('http://127.0.0.1:5173/billing/success'),
  STRIPE_CANCEL_URL: z.url().default('http://127.0.0.1:5173/billing/cancel'),
  STRIPE_PORTAL_RETURN_URL: z
    .url()
    .default('http://127.0.0.1:5173/billing/portal'),
  STRIPE_METERED_USAGE_ENABLED: booleanEnvSchema.default(false),
  STRIPE_METER_EVENT_NAME: optionalEnvStringSchema,
  BILLING_NOTIFICATION_ADAPTER: z.enum(['mock', 'email']).default('mock'),
  BILLING_NOTIFICATION_RECIPIENT: optionalEnvStringSchema,
  INVITE_EMAIL_ADAPTER: z.enum(['mock', 'email']).default('mock'),
  INVITE_EMAIL_FROM: optionalEnvStringSchema,
})

export type ApiEnv = z.infer<typeof envSchema>

export function validateEnv(config: Record<string, unknown>): ApiEnv {
  const env = envSchema.parse(config)

  if (env.AUTH_PROVIDER === 'bearer' && !env.AUTH_BEARER_TOKEN) {
    throw new Error('AUTH_BEARER_TOKEN is required when AUTH_PROVIDER=bearer.')
  }

  if (env.AUTH_PROVIDER === 'external') {
    if (env.AUTH_EXTERNAL_ADAPTER === 'mock' && !env.AUTH_EXTERNAL_JWT_SECRET) {
      throw new Error(
        'AUTH_EXTERNAL_JWT_SECRET is required when AUTH_PROVIDER=external and AUTH_EXTERNAL_ADAPTER=mock.',
      )
    }

    if (env.AUTH_EXTERNAL_ADAPTER === 'jwks' && !env.AUTH_EXTERNAL_JWKS_URL) {
      throw new Error(
        'AUTH_EXTERNAL_JWKS_URL is required when AUTH_PROVIDER=external and AUTH_EXTERNAL_ADAPTER=jwks.',
      )
    }
  }

  if (env.STRIPE_ENABLED && env.STRIPE_BILLING_ADAPTER === 'stripe') {
    if (!env.STRIPE_SECRET_KEY) {
      throw new Error(
        'STRIPE_SECRET_KEY is required when STRIPE_ENABLED=true and STRIPE_BILLING_ADAPTER=stripe.',
      )
    }

    if (!env.STRIPE_WEBHOOK_SECRET) {
      throw new Error(
        'STRIPE_WEBHOOK_SECRET is required when STRIPE_ENABLED=true and STRIPE_BILLING_ADAPTER=stripe.',
      )
    }

    if (!env.STRIPE_PRICE_ID_PRO || !env.STRIPE_PRICE_ID_BUSINESS) {
      throw new Error(
        'STRIPE_PRICE_ID_PRO and STRIPE_PRICE_ID_BUSINESS are required when STRIPE_ENABLED=true and STRIPE_BILLING_ADAPTER=stripe.',
      )
    }

    if (env.STRIPE_METERED_USAGE_ENABLED && !env.STRIPE_METER_EVENT_NAME) {
      throw new Error(
        'STRIPE_METER_EVENT_NAME is required when STRIPE_METERED_USAGE_ENABLED=true and STRIPE_BILLING_ADAPTER=stripe.',
      )
    }

    if (
      env.BILLING_NOTIFICATION_ADAPTER === 'email' &&
      !env.BILLING_NOTIFICATION_RECIPIENT
    ) {
      throw new Error(
        'BILLING_NOTIFICATION_RECIPIENT is required when BILLING_NOTIFICATION_ADAPTER=email.',
      )
    }

    if (env.INVITE_EMAIL_ADAPTER === 'email' && !env.INVITE_EMAIL_FROM) {
      throw new Error(
        'INVITE_EMAIL_FROM is required when INVITE_EMAIL_ADAPTER=email.',
      )
    }
  }

  if (
    env.NODE_ENV === 'production' &&
    env.STRIPE_ENABLED &&
    env.STRIPE_BILLING_ADAPTER === 'mock'
  ) {
    throw new Error(
      'STRIPE_BILLING_ADAPTER=mock cannot be used in production when STRIPE_ENABLED=true.',
    )
  }

  if (env.NODE_ENV === 'production' && env.AUTH_PROVIDER === 'headers') {
    throw new Error('AUTH_PROVIDER=headers cannot be used in production.')
  }

  if (
    env.NODE_ENV === 'production' &&
    env.AUTH_PROVIDER === 'external' &&
    env.AUTH_EXTERNAL_ADAPTER === 'mock'
  ) {
    throw new Error(
      'AUTH_EXTERNAL_ADAPTER=mock cannot be used in production when AUTH_PROVIDER=external.',
    )
  }

  if (
    env.NODE_ENV === 'production' &&
    (env.AUTH_PROVIDER === 'bearer' || env.AUTH_PROVIDER === 'session') &&
    !env.AUTH_BEARER_TOKEN
  ) {
    throw new Error(
      'AUTH_BEARER_TOKEN is required in production when AUTH_PROVIDER=bearer or AUTH_PROVIDER=session.',
    )
  }

  if (env.NODE_ENV === 'production' && env.LLM_PRIMARY_PROVIDER === 'mock') {
    throw new Error('LLM_PRIMARY_PROVIDER=mock cannot be used in production.')
  }

  const usesRealLlmProvider =
    env.LLM_PRIMARY_PROVIDER !== 'mock' || env.LLM_FALLBACK_PROVIDER !== 'mock'

  if (
    usesRealLlmProvider &&
    env.NODE_ENV !== 'production' &&
    !env.LLM_ALLOW_REAL_PROVIDERS
  ) {
    throw new Error(
      'Non-mock LLM providers require LLM_ALLOW_REAL_PROVIDERS=true outside production. Keep LLM_*_PROVIDER=mock for local/default runs, or opt in explicitly.',
    )
  }

  if (env.LLM_PRIMARY_PROVIDER === 'anthropic' && !env.ANTHROPIC_API_KEY) {
    throw new Error(
      'ANTHROPIC_API_KEY is required when LLM_PRIMARY_PROVIDER=anthropic.',
    )
  }

  if (env.LLM_FALLBACK_PROVIDER === 'anthropic' && !env.ANTHROPIC_API_KEY) {
    throw new Error(
      'ANTHROPIC_API_KEY is required when LLM_FALLBACK_PROVIDER=anthropic.',
    )
  }

  if (env.LLM_PRIMARY_PROVIDER === 'openai' && !env.OPENAI_API_KEY) {
    throw new Error(
      'OPENAI_API_KEY is required when LLM_PRIMARY_PROVIDER=openai.',
    )
  }

  if (env.LLM_FALLBACK_PROVIDER === 'openai' && !env.OPENAI_API_KEY) {
    throw new Error(
      'OPENAI_API_KEY is required when LLM_FALLBACK_PROVIDER=openai.',
    )
  }

  if (env.NODE_ENV === 'production' && env.RESEARCH_PROVIDER === 'mock') {
    throw new Error('RESEARCH_PROVIDER=mock cannot be used in production.')
  }

  if (
    env.NODE_ENV === 'production' &&
    env.APP_ENCRYPTION_KEY === DEFAULT_APP_ENCRYPTION_KEY
  ) {
    throw new Error(
      'APP_ENCRYPTION_KEY must be changed from the default value in production.',
    )
  }

  if (
    env.NODE_ENV === 'production' &&
    env.TEMPORAL_ENABLED &&
    (env.TEMPORAL_ADDRESS.includes('127.0.0.1') ||
      env.TEMPORAL_ADDRESS.includes('localhost') ||
      env.TEMPORAL_ADDRESS.startsWith('0.0.0.0'))
  ) {
    throw new Error(
      'Production Temporal rollout requires a non-local TEMPORAL_ADDRESS when TEMPORAL_ENABLED=true.',
    )
  }

  return env
}
